from __future__ import annotations

import hashlib
import json
from abc import ABC, abstractmethod
from decimal import Decimal, InvalidOperation
from pathlib import Path

from web3 import Web3
from web3.exceptions import TimeExhausted

from .config import Settings
from .errors import ConfigurationError, ExecutionError
from .models import ChainExecutionResult, PaymentDecision


class BaseChainExecutor(ABC):
    @abstractmethod
    def simulate_supplier_payment(
        self,
        decision: PaymentDecision,
        *,
        beneficiary_address: str | None = None,
        run_id: str | None = None,
        currency: str | None = None,
    ) -> ChainExecutionResult:
        raise NotImplementedError

    @abstractmethod
    def execute_supplier_payment(
        self,
        decision: PaymentDecision,
        *,
        beneficiary_address: str | None,
        run_id: str,
        currency: str,
    ) -> ChainExecutionResult:
        raise NotImplementedError


class MonadChainExecutor(BaseChainExecutor):
    _ARTIFACT_PATH = (
        Path(__file__).resolve().parents[3]
        / "contracts/out/SupplierPaymentExecutor.sol/SupplierPaymentExecutor.json"
    )

    def __init__(self, settings: Settings):
        self.settings = settings
        self._contract_abi: list[dict] | None = None

    def _make_tx_hash(self, seed: str) -> str:
        digest = hashlib.sha256(seed.encode("utf-8")).hexdigest()
        return f"0x{digest}"

    def _explorer_url(self, tx_hash: str) -> str:
        return f"{self.settings.monad_explorer_url}/tx/{tx_hash}"

    def _load_contract_abi(self) -> list[dict]:
        if self._contract_abi is None:
            if not self._ARTIFACT_PATH.exists():
                raise ConfigurationError(
                    f"Contract artifact not found at {self._ARTIFACT_PATH}."
                )
            artifact = json.loads(self._ARTIFACT_PATH.read_text(encoding="utf-8"))
            self._contract_abi = artifact["abi"]
        return self._contract_abi

    def _build_web3(self) -> Web3:
        return Web3(Web3.HTTPProvider(self.settings.monad_rpc_url))

    def _require_execution_config(self) -> str:
        if not self.settings.monad_payment_contract_address:
            raise ConfigurationError(
                "MONAD_PAYMENT_CONTRACT_ADDRESS is required for execution_mode=execute."
            )
        if not self.settings.monad_deployer_private_key:
            raise ConfigurationError(
                "MONAD_DEPLOYER_PRIVATE_KEY is required for execution_mode=execute."
            )
        return self.settings.monad_deployer_private_key

    def _normalize_currency(self, currency: str) -> str:
        normalized = currency.strip().upper()
        if normalized != "MON":
            raise ExecutionError(
                "execution_mode=execute requires cash_position.currency=MON because the Monad contract pays native MON."
            )
        return normalized

    def _to_checksum_address(self, beneficiary_address: str | None) -> str:
        if not beneficiary_address:
            raise ExecutionError(
                "beneficiary_address is required for execution_mode=execute."
            )
        try:
            return Web3.to_checksum_address(beneficiary_address)
        except ValueError as exc:
            raise ExecutionError(
                f"Invalid beneficiary_address: {beneficiary_address}."
            ) from exc

    def _amount_to_wei(self, amount: float) -> int:
        try:
            normalized_amount = Decimal(str(amount))
        except InvalidOperation as exc:
            raise ExecutionError(f"Invalid payment amount: {amount}.") from exc
        if normalized_amount <= 0:
            raise ExecutionError(f"Invalid payment amount: {amount}.")
        return int(normalized_amount * Decimal(10**18))

    def simulate_supplier_payment(
        self,
        decision: PaymentDecision,
        *,
        beneficiary_address: str | None = None,
        run_id: str | None = None,
        currency: str | None = None,
    ) -> ChainExecutionResult:
        tx_hash = self._make_tx_hash(
            f"simulate:{decision.invoice_id}:{decision.discounted_amount}"
        )
        return ChainExecutionResult(
            status="simulated",
            tx_hash=tx_hash,
            explorer_url=self._explorer_url(tx_hash),
        )

    def execute_supplier_payment(
        self,
        decision: PaymentDecision,
        *,
        beneficiary_address: str | None,
        run_id: str,
        currency: str,
    ) -> ChainExecutionResult:
        private_key = self._require_execution_config()
        self._normalize_currency(currency)
        checksum_beneficiary = self._to_checksum_address(beneficiary_address)
        amount_wei = self._amount_to_wei(decision.discounted_amount)
        run_id_hash = Web3.keccak(text=run_id)

        web3_client = self._build_web3()
        sender = web3_client.eth.account.from_key(private_key)
        contract = web3_client.eth.contract(
            address=Web3.to_checksum_address(
                self.settings.monad_payment_contract_address
            ),
            abi=self._load_contract_abi(),
        )

        contract_owner = contract.functions.owner().call()
        if Web3.to_checksum_address(contract_owner) != Web3.to_checksum_address(
            sender.address
        ):
            raise ExecutionError(
                "Configured Monad signer is not the owner of SupplierPaymentExecutor."
            )
        if contract.functions.isInvoicePaid(decision.invoice_id).call():
            raise ExecutionError(
                f"Invoice {decision.invoice_id} has already been paid onchain."
            )

        treasury_balance = contract.functions.treasuryBalance().call()
        if treasury_balance < amount_wei:
            raise ExecutionError(
                f"Contract treasury balance is insufficient for invoice {decision.invoice_id}."
            )

        transaction = contract.functions.executePayment(
            decision.invoice_id,
            checksum_beneficiary,
            amount_wei,
            run_id_hash,
        ).build_transaction(
            {
                "from": sender.address,
                "nonce": web3_client.eth.get_transaction_count(sender.address),
                "chainId": self.settings.monad_chain_id,
                "gasPrice": web3_client.eth.gas_price,
            }
        )
        transaction["gas"] = int(web3_client.eth.estimate_gas(transaction) * 1.2)

        signed_transaction = web3_client.eth.account.sign_transaction(
            transaction, private_key=private_key
        )
        tx_hash = web3_client.eth.send_raw_transaction(
            signed_transaction.raw_transaction
        )
        tx_hash_hex = Web3.to_hex(tx_hash)

        try:
            receipt = web3_client.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
        except TimeExhausted as exc:
            raise ExecutionError(
                f"Monad payment transaction is still pending: {tx_hash_hex}."
            ) from exc

        if receipt.status != 1:
            raise ExecutionError(
                f"Monad payment transaction failed onchain: {tx_hash_hex}."
            )

        return ChainExecutionResult(
            status="executed",
            tx_hash=tx_hash_hex,
            explorer_url=self._explorer_url(tx_hash_hex),
        )
