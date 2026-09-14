import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=True)
    phone = Column(String(50), unique=True, index=True, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    role = Column(String(20), default="user")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    credits = relationship("UserCredit", back_populates="user", uselist=False, cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    date_of_birth = Column(String(20), nullable=True)
    time_of_birth = Column(String(20), nullable=True)
    place_of_birth = Column(String(150), nullable=True)
    gotra = Column(String(100), nullable=True)
    rashi = Column(String(50), nullable=True)
    nakshatra = Column(String(50), nullable=True)

    user = relationship("User", back_populates="profile")


class UserCredit(Base):
    __tablename__ = "user_credits"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    credits_remaining = Column(Integer, default=3)  # 3 Free trial credits for testing website
    subscription_tier = Column(String(50), default="free")  # free, premium, pro
    valid_until = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="credits")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    payment_gateway = Column(String(50), nullable=False)  # razorpay, stripe
    payment_id = Column(String(150), unique=True, nullable=False)
    order_id = Column(String(150), nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    status = Column(String(30), default="pending")  # pending, completed, failed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="transactions")

