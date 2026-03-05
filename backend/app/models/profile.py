from sqlalchemy import Float, Integer, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)

    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    annual_income: Mapped[float | None] = mapped_column(Float, nullable=True)
    savings_rate: Mapped[float | None] = mapped_column(Float, nullable=True)  # 0-1 range
    risk_tolerance: Mapped[str | None] = mapped_column(String(32), nullable=True)  # e.g. "conservative", "moderate", "aggressive"
    investment_horizon_years: Mapped[int | None] = mapped_column(Integer, nullable=True)

    user: Mapped["User"] = relationship(back_populates="profile")

