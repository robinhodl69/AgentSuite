from __future__ import annotations

from typing import Protocol
from threading import Lock

from fastapi.encoders import jsonable_encoder
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from .database import DatabaseManager
from .finance_persistence import FinanceRunSnapshotWriter
from .models import AuditEvent, RunRecord
from .models import ProcessType, RunStatus
from .persistence_models import AgentRunModel, AuditEventModel, CompanyModel


class RunRepository(Protocol):
    def save(self, run: RunRecord) -> RunRecord: ...
    def get(self, run_id: str, company_id: str | None = None) -> RunRecord | None: ...
    def list(self, company_id: str | None = None) -> list[RunRecord]: ...
    def audit(self, run_id: str, company_id: str | None = None) -> list[AuditEvent] | None: ...


class InMemoryRunRepository:
    def __init__(self) -> None:
        self._lock = Lock()
        self._runs: dict[str, RunRecord] = {}

    def save(self, run: RunRecord) -> RunRecord:
        with self._lock:
            self._runs[run.run_id] = run
        return run

    def get(self, run_id: str, company_id: str | None = None) -> RunRecord | None:
        run = self._runs.get(run_id)
        if run is None:
            return None
        if company_id is not None and run.company_id != company_id:
            return None
        return run

    def list(self, company_id: str | None = None) -> list[RunRecord]:
        runs = self._runs.values()
        if company_id is not None:
            runs = [run for run in runs if run.company_id == company_id]
        return sorted(
            runs,
            key=lambda run: run.created_at,
            reverse=True,
        )

    def audit(self, run_id: str, company_id: str | None = None) -> list[AuditEvent] | None:
        record = self.get(run_id, company_id=company_id)
        return record.audit_log if record else None


class SqlAlchemyRunRepository:
    def __init__(self, database_manager: DatabaseManager) -> None:
        self.database_manager = database_manager
        self.finance_snapshot_writer = FinanceRunSnapshotWriter()

    def _ensure_company(self, company_id: str) -> None:
        with self.database_manager.create_session() as session:
            company = session.get(CompanyModel, company_id)
            if company is None:
                session.add(CompanyModel(company_id=company_id))
                session.commit()

    def _to_record(self, record: AgentRunModel) -> RunRecord:
        audit_log = [
            AuditEvent(
                timestamp=item.timestamp,
                stage=item.stage,
                message=item.message,
                details=item.details or {},
            )
            for item in sorted(record.audit_events, key=lambda event: event.event_index)
        ]
        return RunRecord(
            run_id=record.run_id,
            process_type=ProcessType(record.process_type),
            status=RunStatus(record.status),
            created_at=record.created_at,
            company_id=record.company_id,
            actor_role=record.actor_role,
            input_payload=record.input_payload or None,
            final_output=record.final_output or {},
            audit_log=audit_log,
        )

    def save(self, run: RunRecord) -> RunRecord:
        self._ensure_company(run.company_id)
        with self.database_manager.create_session() as session:
            record = session.get(
                AgentRunModel,
                run.run_id,
                options=(selectinload(AgentRunModel.audit_events),),
            )
            if record is None:
                record = AgentRunModel(
                    run_id=run.run_id,
                    company_id=run.company_id,
                    actor_role=run.actor_role,
                    process_type=run.process_type.value,
                    status=run.status.value,
                    input_payload=jsonable_encoder(run.input_payload)
                    if run.input_payload is not None
                    else None,
                    final_output=jsonable_encoder(run.final_output),
                    created_at=run.created_at,
                )
                session.add(record)
            else:
                record.company_id = run.company_id
                record.actor_role = run.actor_role
                record.process_type = run.process_type.value
                record.status = run.status.value
                record.input_payload = (
                    jsonable_encoder(run.input_payload)
                    if run.input_payload is not None
                    else None
                )
                record.final_output = jsonable_encoder(run.final_output)
                record.created_at = run.created_at
                record.audit_events.clear()

            for index, event in enumerate(run.audit_log):
                record.audit_events.append(
                    AuditEventModel(
                        event_index=index,
                        timestamp=event.timestamp,
                        stage=event.stage,
                        message=event.message,
                        details=jsonable_encoder(event.details),
                    )
                )

            self.finance_snapshot_writer.persist(session, run)
            session.commit()

        saved = self.get(run.run_id)
        if saved is None:
            raise RuntimeError("Failed to reload persisted run.")
        return saved

    def get(self, run_id: str, company_id: str | None = None) -> RunRecord | None:
        with self.database_manager.create_session() as session:
            statement = (
                select(AgentRunModel)
                .options(selectinload(AgentRunModel.audit_events))
                .where(AgentRunModel.run_id == run_id)
            )
            if company_id is not None:
                statement = statement.where(AgentRunModel.company_id == company_id)
            record = session.execute(statement).scalar_one_or_none()
            return self._to_record(record) if record else None

    def list(self, company_id: str | None = None) -> list[RunRecord]:
        with self.database_manager.create_session() as session:
            statement = (
                select(AgentRunModel)
                .options(selectinload(AgentRunModel.audit_events))
                .order_by(AgentRunModel.created_at.desc())
            )
            if company_id is not None:
                statement = statement.where(AgentRunModel.company_id == company_id)
            records = session.execute(statement).scalars().all()
            return [self._to_record(record) for record in records]

    def audit(self, run_id: str, company_id: str | None = None) -> list[AuditEvent] | None:
        record = self.get(run_id, company_id=company_id)
        return record.audit_log if record else None
