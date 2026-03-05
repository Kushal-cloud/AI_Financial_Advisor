from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..ai import get_ai_provider
from ..api.deps import get_current_user
from ..database import get_db
from ..models import ConversationMessage, User
from ..schemas.advisor import AdvisorChatRequest, AdvisorChatResponse, AdvisorMessage


router = APIRouter(prefix="/advisor", tags=["advisor"])


@router.post("/chat", response_model=AdvisorChatResponse)
async def chat_with_advisor(
    payload: AdvisorChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AdvisorChatResponse:
    provider = get_ai_provider()

    history_qs = (
        db.query(ConversationMessage)
        .filter(ConversationMessage.user_id == current_user.id)
        .order_by(ConversationMessage.created_at.desc())
        .limit(20)
        .all()
    )
    history_qs.reverse()

    history_dicts: List[dict] = [
        {"role": m.role, "content": m.content} for m in history_qs
    ]

    if payload.history:
        for m in payload.history:
            history_dicts.append({"role": m.role, "content": m.content})

    history_dicts.append({"role": "user", "content": payload.message})

    reply = await provider.generate_reply(prompt=payload.message, history=history_dicts)

    user_msg = ConversationMessage(user_id=current_user.id, role="user", content=payload.message)
    assistant_msg = ConversationMessage(user_id=current_user.id, role="assistant", content=reply)
    db.add(user_msg)
    db.add(assistant_msg)
    db.commit()

    messages: List[AdvisorMessage] = [
        AdvisorMessage(role="user", content=payload.message),
        AdvisorMessage(role="assistant", content=reply),
    ]

    return AdvisorChatResponse(reply=reply, messages=messages)

