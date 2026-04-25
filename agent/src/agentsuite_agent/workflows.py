from __future__ import annotations

from pathlib import Path
from typing import Any, TypedDict
from uuid import uuid4

from langgraph.graph import END, START, StateGraph

from .chain import BaseChainExecutor
from .llm import BaseLLMClient
from .models import AuditEvent, ProcessType, RunRecord
from .runs import InMemoryRunRepository
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
        chain_executor: BaseChainExecutor,
        run_repository: InMemoryRunRepository,
    ) -> None:
        self.skill_repository = skill_repository
        self.llm_client = llm_client
        self.chain_executor = chain_executor
        self.run_repository = run_repository
        self.services: dict[ProcessType, ProcessService] = {
            ProcessType.RECONCILIATION: ReconciliationService(),
            ProcessType.SUPPLIER_PAYMENTS: SupplierPaymentService(),
            ProcessType.BUDGET_CONTROL: BudgetControlService(),
        }
        self._compiled_graphs: dict[ProcessType, Any] = {}

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
                self.chain_executor,
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

    def run(self, process_type: ProcessType, payload: Any) -> RunRecord:
        if process_type not in self._compiled_graphs:
            self._compiled_graphs[process_type] = self._build_graph(process_type)
        graph = self._compiled_graphs[process_type]
        final_state = graph.invoke(
            {
                "run_id": uuid4().hex,
                "process_type": process_type,
                "input_payload": payload,
                "audit_log": [],
            }
        )
        run = RunRecord(
            run_id=final_state["run_id"],
            process_type=process_type,
            status=final_state["status"],
            final_output=final_state["final_output"],
            audit_log=final_state["audit_log"],
        )
        return self.run_repository.save(run)


def build_runner(
    base_dir: Path,
    llm_client: BaseLLMClient,
    chain_executor: BaseChainExecutor,
) -> AgentWorkflowRunner:
    return AgentWorkflowRunner(
        skill_repository=SkillRepository(base_dir / "skills"),
        llm_client=llm_client,
        chain_executor=chain_executor,
        run_repository=InMemoryRunRepository(),
    )
