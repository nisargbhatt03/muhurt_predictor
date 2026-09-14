from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime

from database import get_db
import models
import schemas
from auth_routes import get_current_user

router = APIRouter(prefix="/api/admin", tags=["Admin Panel"])


class AdminUserItem(schemas.BaseModel):
    id: int
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    role: str
    is_active: bool
    is_verified: bool
    created_at: Optional[datetime] = None
    # Profile info
    date_of_birth: Optional[str] = None
    gotra: Optional[str] = None
    rashi: Optional[str] = None
    nakshatra: Optional[str] = None
    # Credits info
    credits_remaining: Optional[int] = 3
    subscription_tier: Optional[str] = "free"

    class Config:
        from_attributes = True


@router.get("/users", response_model=List[AdminUserItem])
def get_all_users(
    search: Optional[str] = Query(None, description="Filter by name, email, or phone"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=500, description="Max number of records to return"),
    db: Session = Depends(get_db)
):
    """Retrieves registered user accounts with detailed profiles, credits, and pagination support for Admin Panel."""
    query = db.query(models.User)
    
    if search:
        s = f"%{search.strip().lower()}%"
        query = query.filter(
            (models.User.name.ilike(s)) |
            (models.User.email.ilike(s)) |
            (models.User.phone.ilike(s))
        )
    
    users = query.order_by(models.User.created_at.desc()).offset(skip).limit(limit).all()
    
    result = []
    for u in users:
        profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == u.id).first()
        user_credit = db.query(models.UserCredit).filter(models.UserCredit.user_id == u.id).first()

        c_rem = user_credit.credits_remaining if user_credit is not None else 3
        sub_tier = user_credit.subscription_tier if user_credit is not None else "free"

        result.append(AdminUserItem(
            id=u.id,
            name=u.name,
            email=u.email,
            phone=u.phone,
            role=u.role or "user",
            is_active=u.is_active,
            is_verified=u.is_verified,
            created_at=u.created_at,
            date_of_birth=profile.date_of_birth if profile else None,
            gotra=profile.gotra if profile else None,
            rashi=profile.rashi if profile else None,
            nakshatra=profile.nakshatra if profile else None,
            credits_remaining=c_rem,
            subscription_tier=sub_tier
        ))
    
    return result


@router.put("/users/{user_id}/toggle-status")
def toggle_user_status(user_id: int, db: Session = Depends(get_db)):
    """Toggles active/inactive status of a user."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return {"message": "Status updated successfully", "is_active": user.is_active}


@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    """Deletes a user account."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}
