from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class PortfolioSnapshot(Base):
    __tablename__ = "portfolio_snapshots"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)

    risk_level: Mapped[str] = mapped_column(String(32), nullable=False)  # conservative/moderate/aggressive
    stocks_allocation: Mapped[float] = mapped_column(Float, nullable=False)
    bonds_allocation: Mapped[float] = mapped_column(Float, nullable=False)
    cash_allocation: Mapped[float] = mapped_column(Float, nullable=False)
    expected_return: Mapped[float] = mapped_column(Float, nullable=False)  # annualized %
    expected_volatility: Mapped[float] = mapped_column(Float, nullable=False)  # annualized %

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="portfolio_snapshots")

