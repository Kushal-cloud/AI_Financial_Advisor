from datetime import datetime

from pydantic import BaseModel


class FinancialGoalBase(BaseModel):
    name: str
    goal_type: str = "custom"
    target_amount: float
    current_amount: float = 0.0
    target_year: int


class FinancialGoalCreate(FinancialGoalBase):
    pass


class FinancialGoalUpdate(BaseModel):
    name: str | None = None
    goal_type: str | None = None
    target_amount: float | None = None
    current_amount: float | None = None
    target_year: int | None = None


class FinancialGoalRead(FinancialGoalBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

