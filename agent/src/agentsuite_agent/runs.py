from __future__ import annotations

from threading import Lock

from .models import AuditEvent, RunRecord


class InMemoryRunRepository:
    def __init__(self) -> None:
        self._lock = Lock()
        self._runs: dict[str, RunRecord] = {}

    def save(self, run: RunRecord) -> RunRecord:
        with self._lock:
            self._runs[run.run_id] = run
        return run

    def get(self, run_id: str) -> RunRecord | None:
        return self._runs.get(run_id)

    def audit(self, run_id: str) -> list[AuditEvent] | None:
        record = self.get(run_id)
        return record.audit_log if record else None

