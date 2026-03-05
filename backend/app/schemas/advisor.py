from datetime import datetime
from typing import List

from pydantic import BaseModel


class AdvisorMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    created_at: datetime | None = None


class AdvisorChatRequest(BaseModel):
    message: str
    history: List[AdvisorMessage] | None = None


class AdvisorChatResponse(BaseModel):
    reply: str
    messages: List[AdvisorMessage]

