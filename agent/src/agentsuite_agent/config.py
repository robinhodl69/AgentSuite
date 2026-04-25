from __future__ import annotations

from dataclasses import dataclass
from os import getenv

from dotenv import load_dotenv


@dataclass(slots=True)
class Settings:
    llm_provider: str = "openai"
    openai_api_key: str | None = None
    openai_model_fast: str = "gpt-4.1-mini"
    openai_model_reasoning: str = "gpt-4.1"
    openai_temperature: float = 0.1
    cors_origins: tuple[str, ...] = ()
    cors_origin_regex: str | None = None
    monad_chain_id: int = 10143
    monad_rpc_url: str = "https://testnet-rpc.monad.xyz"
    monad_explorer_url: str = "https://testnet.monadexplorer.com"
    monad_faucet_url: str = "https://faucet.monad.xyz"
    monad_deployer_private_key: str | None = None
    monad_payment_contract_address: str | None = None

    @classmethod
    def from_env(cls) -> "Settings":
        load_dotenv()
        cors_origins = tuple(
            origin.strip()
            for origin in getenv("AGENT_CORS_ORIGINS", "").split(",")
            if origin.strip()
        )
        return cls(
            llm_provider=getenv("LLM_PROVIDER", "openai"),
            openai_api_key=getenv("OPENAI_API_KEY"),
            openai_model_fast=getenv("OPENAI_MODEL_FAST", "gpt-4.1-mini"),
            openai_model_reasoning=getenv("OPENAI_MODEL_REASONING", "gpt-4.1"),
            openai_temperature=float(getenv("OPENAI_TEMPERATURE", "0.1")),
            cors_origins=cors_origins,
            cors_origin_regex=getenv("AGENT_CORS_ORIGIN_REGEX") or None,
            monad_chain_id=int(getenv("MONAD_CHAIN_ID", "10143")),
            monad_rpc_url=getenv("MONAD_RPC_URL", "https://testnet-rpc.monad.xyz"),
            monad_explorer_url=getenv(
                "MONAD_EXPLORER_URL", "https://testnet.monadexplorer.com"
            ),
            monad_faucet_url=getenv("MONAD_FAUCET_URL", "https://faucet.monad.xyz"),
            monad_deployer_private_key=getenv("MONAD_DEPLOYER_PRIVATE_KEY"),
            monad_payment_contract_address=getenv("MONAD_PAYMENT_CONTRACT_ADDRESS"),
        )
