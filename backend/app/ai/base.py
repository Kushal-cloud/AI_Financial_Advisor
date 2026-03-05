from abc import ABC, abstractmethod
from typing import Iterable


class AIProvider(ABC):
    @abstractmethod
    async def generate_reply(self, *, prompt: str, history: Iterable[dict]) -> str:
        """
        Generate a reply given the latest user prompt and conversation history.

        History is a sequence of {\"role\": \"user\"|\"assistant\", \"content\": str}.
        """

