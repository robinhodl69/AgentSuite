from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Sequence

from openai import OpenAI

from .config import Settings
from .errors import ConfigurationError
from .models import SkillDefinition


class BaseLLMClient(ABC):
    @abstractmethod
    def resolve_reconciliation_candidate(
        self,
        transaction_text: str,
        candidates: Sequence[tuple[str, str]],
        skills: Sequence[SkillDefinition],
    ) -> str | None:
        raise NotImplementedError

    @abstractmethod
    def categorize_expense(
        self,
        description: str,
        categories: Sequence[str],
        skills: Sequence[SkillDefinition],
    ) -> str | None:
        raise NotImplementedError


class RuleBasedLLMClient(BaseLLMClient):
    def resolve_reconciliation_candidate(
        self,
        transaction_text: str,
        candidates: Sequence[tuple[str, str]],
        skills: Sequence[SkillDefinition],
    ) -> str | None:
        text = transaction_text.lower()
        for candidate_id, candidate_text in candidates:
            if candidate_text.lower() in text:
                return candidate_id
        return candidates[0][0] if len(candidates) == 1 else None

    def categorize_expense(
        self,
        description: str,
        categories: Sequence[str],
        skills: Sequence[SkillDefinition],
    ) -> str | None:
        text = description.lower()
        for category in categories:
            if category.lower() in text:
                return category
        return categories[0] if len(categories) == 1 else None


class OpenAILLMClient(BaseLLMClient):
    def __init__(self, settings: Settings):
        if not settings.openai_api_key:
            raise ConfigurationError(
                "OPENAI_API_KEY is required when LLM_PROVIDER=openai."
            )
        self._client = OpenAI(api_key=settings.openai_api_key)
        self._fast_model = settings.openai_model_fast

    def _text_completion(self, instructions: str, prompt: str) -> str:
        response = self._client.responses.create(
            model=self._fast_model,
            instructions=instructions,
            input=prompt,
        )
        return (response.output_text or "").strip()

    def resolve_reconciliation_candidate(
        self,
        transaction_text: str,
        candidates: Sequence[tuple[str, str]],
        skills: Sequence[SkillDefinition],
    ) -> str | None:
        prompt = "\n".join(
            [
                f"Bank transaction text: {transaction_text}",
                "Candidates:",
                *[f"- {candidate_id}: {candidate_text}" for candidate_id, candidate_text in candidates],
                "Return only the single best candidate id or NONE.",
            ]
        )
        answer = self._text_completion(
            "Choose the closest ledger candidate using references, supplier names, invoice ids, and plain-language descriptions.",
            prompt,
        )
        if answer == "NONE":
            return None
        for candidate_id, _ in candidates:
            if candidate_id in answer:
                return candidate_id
        return None

    def categorize_expense(
        self,
        description: str,
        categories: Sequence[str],
        skills: Sequence[SkillDefinition],
    ) -> str | None:
        prompt = "\n".join(
            [
                f"Expense description: {description}",
                f"Available categories: {', '.join(categories)}",
                "Return only one category name.",
            ]
        )
        answer = self._text_completion(
            "Classify the expense into the best financial budget category.",
            prompt,
        )
        for category in categories:
            if category.lower() == answer.lower():
                return category
        return None


def build_llm_client(settings: Settings) -> BaseLLMClient:
    if settings.llm_provider == "openai":
        return OpenAILLMClient(settings)
    if settings.llm_provider == "rule-based":
        return RuleBasedLLMClient()
    raise ConfigurationError(f"Unsupported LLM provider: {settings.llm_provider}")

