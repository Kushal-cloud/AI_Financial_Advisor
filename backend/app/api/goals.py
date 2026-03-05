from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..api.deps import get_current_user
from ..database import get_db
from ..models import FinancialGoal, User
from ..schemas.goal import FinancialGoalCreate, FinancialGoalRead, FinancialGoalUpdate


router = APIRouter(prefix="/goals", tags=["goals"])


@router.get("/", response_model=List[FinancialGoalRead])
def list_goals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[FinancialGoalRead]:
    goals = db.query(FinancialGoal).filter(FinancialGoal.user_id == current_user.id).order_by(FinancialGoal.created_at.desc()).all()
    return goals


@router.post("/", response_model=FinancialGoalRead, status_code=status.HTTP_201_CREATED)
def create_goal(
    goal_in: FinancialGoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> FinancialGoalRead:
    goal = FinancialGoal(user_id=current_user.id, **goal_in.model_dump())
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


@router.put("/{goal_id}", response_model=FinancialGoalRead)
def update_goal(
    goal_id: int,
    goal_in: FinancialGoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> FinancialGoalRead:
    goal = (
        db.query(FinancialGoal)
        .filter(FinancialGoal.id == goal_id, FinancialGoal.user_id == current_user.id)
        .first()
    )
    if goal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")

    for field, value in goal_in.model_dump(exclude_unset=True).items():
        setattr(goal, field, value)

    db.commit()
    db.refresh(goal)
    return goal


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    goal = (
        db.query(FinancialGoal)
        .filter(FinancialGoal.id == goal_id, FinancialGoal.user_id == current_user.id)
        .first()
    )
    if goal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
    db.delete(goal)
    db.commit()

