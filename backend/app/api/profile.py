from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..api.deps import get_current_user
from ..database import get_db
from ..models import User, UserProfile
from ..schemas.profile import UserProfileRead, UserProfileUpdate


router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("/me", response_model=UserProfileRead)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserProfileRead:
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    return profile


@router.put("/me", response_model=UserProfileRead)
def update_my_profile(
    profile_in: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserProfileRead:
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if profile is None:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)
        db.flush()

    for field, value in profile_in.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile

