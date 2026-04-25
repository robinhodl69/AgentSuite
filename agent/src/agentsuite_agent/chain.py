from __future__ import annotations

import hashlib
from abc import ABC, abstractmethod

from .config import Settings
from .errors import ConfigurationError, ExecutionError
from .models import ChainExecutionResult, PaymentDecision


class BaseChainExecutor(ABC):
    @abstractmethod
    def simulate_supplier_payment(self, decision: PaymentDecision) -> ChainExecutionResult:
        raise NotImplementedError

    @abstractmethod
    def execute_supplier_payment(self, decision: PaymentDecision) -> ChainExecutionResult:
        raise NotImplementedError


class MonadChainExecutor(BaseChainExecutor):
    def __init__(self, settings: Settings):
        self.settings = settings

    def _make_tx_hash(self, seed: str) -> str:
        digest = hashlib.sha256(seed.encode("utf-8")).hexdigest()
        return f"0x{digest}"

    def simulate_supplier_payment(self, decision: PaymentDecision) -> ChainExecutionResult:
        tx_hash = self._make_tx_hash(
            f"simulate:{decision.invoice_id}:{decision.discounted_amount}"
        )
        return ChainExecutionResult(
            status="simulated",
            tx_hash=tx_hash,
            explorer_url=f"{self.settings.monad_explorer_url}/tx/{tx_hash}",
        )

    def execute_supplier_payment(self, decision: PaymentDecision) -> ChainExecutionResult:
        if not self.settings.monad_payment_contract_address:
            raise ConfigurationError(
                "MONAD_PAYMENT_CONTRACT_ADDRESS is required for execution_mode=execute."
            )
        if not self.settings.monad_deployer_private_key:
            raise ConfigurationError(
                "MONAD_DEPLOYER_PRIVATE_KEY is required for execution_mode=execute."
            )
        raise ExecutionError(
            "Real Monad payment broadcasting requires the project payment contract adapter."
        )

