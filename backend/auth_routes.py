from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from security import (
    get_password_hash,
    verify_password,
    create_access_token,
    decode_access_token,
    limiter,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/signin")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    """Dependency for validating JWT token and resolving current logged in user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or token expired",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.id == int(user_id)).first()
    if user is None or not user.is_active:
        raise credentials_exception
    return user


@router.post("/signup", response_model=schemas.TokenResponse)
@limiter.limit("5/minute")
def signup(request: Request, user_in: schemas.UserSignUp, db: Session = Depends(get_db)):
    """Registers a new user into PostgreSQL with bcrypt password hashing."""
    if not user_in.email and not user_in.phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either email address or phone number must be provided.",
        )

    # Check for existing email
    if user_in.email:
        existing_email = db.query(models.User).filter(models.User.email == user_in.email.lower()).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email address already exists.",
            )

    # Check for existing phone
    if user_in.phone:
        clean_phone = user_in.phone.strip()
        existing_phone = db.query(models.User).filter(models.User.phone == clean_phone).first()
        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this mobile number already exists.",
            )

    # Hash Password
    hashed_pwd = get_password_hash(user_in.password)

    # Create User Record
    db_user = models.User(
        name=user_in.name.strip(),
        email=user_in.email.lower() if user_in.email else None,
        phone=user_in.phone.strip() if user_in.phone else None,
        hashed_password=hashed_pwd,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Create associated default User Profile and Credits (3 Free Trial Credits for testing)
    db_profile = models.UserProfile(user_id=db_user.id)
    db_credits = models.UserCredit(user_id=db_user.id, credits_remaining=3, subscription_tier="free")
    db.add(db_profile)
    db.add(db_credits)
    db.commit()
    db.refresh(db_user)

    # Generate JWT Token
    access_token = create_access_token(data={"sub": str(db_user.id)})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": db_user,
    }


@router.post("/signin", response_model=schemas.TokenResponse)
@limiter.limit("10/minute")
def signin(request: Request, user_in: schemas.UserSignIn, db: Session = Depends(get_db)):
    """Authenticates user by email or phone and issues a secure JWT token."""
    login_val = user_in.login_input.strip()

    # Query by email or phone (parameterized query protects against SQL injection)
    user = (
        db.query(models.User)
        .filter((models.User.email == login_val.lower()) | (models.User.phone == login_val))
        .first()
    )

    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Please check your login input and password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact support.",
        )

    access_token = create_access_token(data={"sub": str(user.id)})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    """Returns profile information for the authenticated user session."""
    return current_user
