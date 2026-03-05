from .base import AIProvider
from .dummy import DummyAIProvider
from ..config import get_settings


def get_ai_provider() -> AIProvider:
    settings = get_settings()
    provider_name = settings.llm_provider.lower()

    if provider_name == "dummy":
        return DummyAIProvider()

    # Fallback to dummy provider if unknown provider is configured
    return DummyAIProvider()

