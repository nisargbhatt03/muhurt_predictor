from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from auth_routes import get_current_user

router = APIRouter(prefix="/api/profile", tags=["User Profile"])


@router.get("", response_model=schemas.ProfileResponse)
def get_profile(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves current user's birth details profile."""
    profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = models.UserProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.put("", response_model=schemas.ProfileResponse)
def update_profile(
    profile_in: schemas.ProfileUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Updates user profile details (DOB, Time, Place of Birth, Gotra, etc.) in PostgreSQL."""
    profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = models.UserProfile(user_id=current_user.id)
        db.add(profile)

    update_data = profile_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile
