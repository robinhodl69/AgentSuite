from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any, TypedDict
from uuid import uuid4

from fastapi.encoders import jsonable_encoder
from langgraph.graph import END, START, StateGraph

from .llm import BaseLLMClient
from .models import AuditEvent, ProcessType, RunRecord
from .runs import RunRepository
from .services import (
    BudgetControlService,
    ProcessService,
    ReconciliationService,
    SupplierPaymentService,
)
from .skills import SkillRepository


class WorkflowState(TypedDict, total=False):
    run_id: str
    process_type: ProcessType
    input_payload: Any
    normalized_inputs: dict[str, Any]
    selected_skills: list[Any]
    analysis: dict[str, Any]
    policy: dict[str, Any]
    actions: dict[str, Any]
    final_output: dict[str, Any]
    audit_log: list[AuditEvent]
    status: Any


class AgentWorkflowRunner:
    def __init__(
        self,
        skill_repository: SkillRepository,
        llm_client: BaseLLMClient,
        run_repository: RunRepository,
    ) -> None:
        self.skill_repository = skill_repository
        self.llm_client = llm_client
        self.run_repository = run_repository
        self.services: dict[ProcessType, ProcessService] = {
            ProcessType.RECONCILIATION: ReconciliationService(),
            ProcessType.SUPPLIER_PAYMENTS: SupplierPaymentService(),
            ProcessType.BUDGET_CONTROL: BudgetControlService(),
        }
        self._compiled_graphs: dict[ProcessType, Any] = {}
        self.logger = logging.getLogger("agentsuite.workflow")

    def _log_run_event(
        self,
        *,
        request_id: str | None,
        run_id: str,
        process_type: ProcessType,
        company_id: str,
        actor_role: str | None,
        status: str,
        message: str,
        error: str | None = None,
    ) -> None:
        payload: dict[str, Any] = {
            "event": "run_state_changed",
            "request_id": request_id,
            "run_id": run_id,
            "process_type": process_type.value,
            "company_id": company_id,
            "actor_role": actor_role,
            "status": status,
            "message": message,
        }
        if error is not None:
            payload["error"] = error
        self.logger.info(json.dumps(payload))

    def _append_audit(
        self,
        state: WorkflowState,
        stage: str,
        message: str,
        details: dict[str, Any] | None = None,
    ) -> list[AuditEvent]:
        return [
            *(state.get("audit_log", [])),
            AuditEvent(stage=stage, message=message, details=details or {}),
        ]

    def _build_graph(self, process_type: ProcessType):
        service = self.services[process_type]
        graph = StateGraph(WorkflowState)

        def intake_node(state: WorkflowState) -> dict[str, Any]:
            return {
                "audit_log": self._append_audit(
                    state,
                    "intake",
                    f"Started {process_type.value} run.",
                )
            }

        def normalize_node(state: WorkflowState) -> dict[str, Any]:
            normalized = service.normalize(state["input_payload"])
            return {
                "normalized_inputs": normalized,
                "audit_log": self._append_audit(
                    state,
                    "normalize",
                    "Normalized process inputs.",
                ),
            }

        def skill_selection_node(state: WorkflowState) -> dict[str, Any]:
            skills = self.skill_repository.by_process(process_type)
            return {
                "selected_skills": skills,
                "audit_log": self._append_audit(
                    state,
                    "skill_selection",
                    "Loaded process skills.",
                    {"skill_ids": [skill.skill_id for skill in skills]},
                ),
            }

        def analysis_node(state: WorkflowState) -> dict[str, Any]:
            analysis = service.analyze(
                state["normalized_inputs"], state["selected_skills"], self.llm_client
            )
            return {
                "analysis": analysis,
                "audit_log": self._append_audit(
                    state,
                    "analysis",
                    "Analyzed normalized inputs using process rules.",
                ),
            }

        def policy_node(state: WorkflowState) -> dict[str, Any]:
            policy, status = service.apply_policy(
                state["normalized_inputs"], state["analysis"]
            )
            return {
                "policy": policy,
                "status": status,
                "audit_log": self._append_audit(
                    state,
                    "policy",
                    "Applied decision policy.",
                    {"status": status.value},
                ),
            }

        def action_node(state: WorkflowState) -> dict[str, Any]:
            actions = service.execute_actions(
                state["normalized_inputs"],
                state["analysis"],
                state["policy"],
                state["run_id"],
            )
            return {
                "actions": actions,
                "audit_log": self._append_audit(
                    state,
                    "action",
                    "Executed process actions.",
                ),
            }

        def response_node(state: WorkflowState) -> dict[str, Any]:
            final_output = service.build_response(
                state["normalized_inputs"],
                state["analysis"],
                state["policy"],
                state["actions"],
            )
            return {
                "final_output": final_output,
                "audit_log": self._append_audit(
                    state,
                    "response",
                    "Built user-facing response.",
                ),
            }

        graph.add_node("intake", intake_node)
        graph.add_node("normalize", normalize_node)
        graph.add_node("skill_selection", skill_selection_node)
        graph.add_node("analysis", analysis_node)
        graph.add_node("policy", policy_node)
        graph.add_node("action", action_node)
        graph.add_node("response", response_node)
        graph.add_edge(START, "intake")
        graph.add_edge("intake", "normalize")
        graph.add_edge("normalize", "skill_selection")
        graph.add_edge("skill_selection", "analysis")
        graph.add_edge("analysis", "policy")
        graph.add_edge("policy", "action")
        graph.add_edge("action", "response")
        graph.add_edge("response", END)
        return graph.compile()

    def _extract_run_context(
        self, payload: Any
    ) -> tuple[str, str | None, dict[str, Any]]:
        encoded_payload = jsonable_encoder(payload)
        if not isinstance(encoded_payload, dict):
            return "demo-company", None, {"payload": encoded_payload}

        company_id = encoded_payload.get("company_id")
        actor_role = encoded_payload.get("actor_role")
        resolved_company_id = (
            company_id
            if isinstance(company_id, str) and company_id.strip()
            else "demo-company"
        )
        resolved_actor_role = actor_role if isinstance(actor_role, str) else None
        return resolved_company_id, resolved_actor_role, encoded_payload

    def _build_run_record(
        self,
        *,
        run_id: str,
        process_type: ProcessType,
        status: str,
        company_id: str,
        actor_role: str | None,
        input_payload: dict[str, Any],
        final_output: dict[str, Any],
        audit_log: list[AuditEvent],
    ) -> RunRecord:
        return RunRecord(
            run_id=run_id,
            process_type=process_type,
            status=status,
            final_output=final_output,
            audit_log=audit_log,
            company_id=company_id,
            actor_role=actor_role,
            input_payload=input_payload,
        )

    def run(
        self, process_type: ProcessType, payload: Any, *, request_id: str | None = None
    ) -> RunRecord:
        if process_type not in self._compiled_graphs:
            self._compiled_graphs[process_type] = self._build_graph(process_type)
        graph = self._compiled_graphs[process_type]
        run_id = uuid4().hex
        company_id, actor_role, encoded_payload = self._extract_run_context(payload)
        queued_audit = [
            AuditEvent(
                stage="system",
                message="Run queued for execution.",
                details={"status": "queued"},
            )
        ]
        self.run_repository.save(
            self._build_run_record(
                run_id=run_id,
                process_type=process_type,
                status="queued",
                company_id=company_id,
                actor_role=actor_role,
                input_payload=encoded_payload,
                final_output={},
                audit_log=queued_audit,
            )
        )
        self._log_run_event(
            request_id=request_id,
            run_id=run_id,
            process_type=process_type,
            company_id=company_id,
            actor_role=actor_role,
            status="queued",
            message="Run queued for execution.",
        )

        running_audit = [
            *queued_audit,
            AuditEvent(
                stage="system",
                message="Run started processing.",
                details={"status": "running"},
            ),
        ]
        self.run_repository.save(
            self._build_run_record(
                run_id=run_id,
                process_type=process_type,
                status="running",
                company_id=company_id,
                actor_role=actor_role,
                input_payload=encoded_payload,
                final_output={},
                audit_log=running_audit,
            )
        )
        self._log_run_event(
            request_id=request_id,
            run_id=run_id,
            process_type=process_type,
            company_id=company_id,
            actor_role=actor_role,
            status="running",
            message="Run started processing.",
        )

        try:
            final_state = graph.invoke(
                {
                    "run_id": run_id,
                    "process_type": process_type,
                    "input_payload": payload,
                    "audit_log": running_audit,
                }
            )
        except Exception as exc:
            failed_audit = [
                *running_audit,
                AuditEvent(
                    stage="system",
                    message="Run failed during processing.",
                    details={
                        "status": "failed",
                        "error_type": exc.__class__.__name__,
                        "error": str(exc),
                    },
                ),
            ]
            self.run_repository.save(
                self._build_run_record(
                    run_id=run_id,
                    process_type=process_type,
                    status="failed",
                    company_id=company_id,
                    actor_role=actor_role,
                    input_payload=encoded_payload,
                    final_output={"error": str(exc)},
                    audit_log=failed_audit,
                )
            )
            self._log_run_event(
                request_id=request_id,
                run_id=run_id,
                process_type=process_type,
                company_id=company_id,
                actor_role=actor_role,
                status="failed",
                message="Run failed during processing.",
                error=str(exc),
            )
            raise

        completed_run = self.run_repository.save(
            self._build_run_record(
                run_id=final_state["run_id"],
                process_type=process_type,
                status=final_state["status"],
                company_id=company_id,
                actor_role=actor_role,
                input_payload=encoded_payload,
                final_output=final_state["final_output"],
                audit_log=final_state["audit_log"],
            )
        )
        self._log_run_event(
            request_id=request_id,
            run_id=completed_run.run_id,
            process_type=process_type,
            company_id=company_id,
            actor_role=actor_role,
            status=completed_run.status.value,
            message="Run finished processing.",
        )
        return completed_run


def build_runner(
    base_dir: Path,
    llm_client: BaseLLMClient,
    run_repository: RunRepository,
) -> AgentWorkflowRunner:
    return AgentWorkflowRunner(
        skill_repository=SkillRepository(base_dir / "skills"),
        llm_client=llm_client,
        run_repository=run_repository,
    )
