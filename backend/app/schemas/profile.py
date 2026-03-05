from pydantic import BaseModel


class UserProfileBase(BaseModel):
    age: int | None = None
    annual_income: float | None = None
    savings_rate: float | None = None
    risk_tolerance: str | None = None
    investment_horizon_years: int | None = None


class UserProfileUpdate(UserProfileBase):
    pass


class UserProfileRead(UserProfileBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

