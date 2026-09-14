from typing import Optional
from pydantic import BaseModel, EmailStr, Field


# Registration Request
class UserSignUp(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    password: str = Field(..., min_length=6, max_length=128)


# Signin Request
class UserSignIn(BaseModel):
    login_input: str = Field(..., description="Email or Phone Number")
    password: str = Field(..., min_length=1)


# User Response
class UserResponse(BaseModel):
    id: int
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    role: str
    is_active: bool

    class Config:
        from_attributes = True


# JWT Token Response
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# User Profile Request & Response
class ProfileUpdate(BaseModel):
    date_of_birth: Optional[str] = None
    time_of_birth: Optional[str] = None
    place_of_birth: Optional[str] = None
    gotra: Optional[str] = None
    rashi: Optional[str] = None
    nakshatra: Optional[str] = None


class ProfileResponse(BaseModel):
    id: int
    user_id: int
    date_of_birth: Optional[str] = None
    time_of_birth: Optional[str] = None
    place_of_birth: Optional[str] = None
    gotra: Optional[str] = None
    rashi: Optional[str] = None
    nakshatra: Optional[str] = None

    class Config:
        from_attributes = True


# Prediction Request & Response Schemas
class ForecastRequest(BaseModel):
    start_date: str = Field(..., description="Start date YYYY-MM-DD")
    end_date: str = Field(..., description="End date YYYY-MM-DD")
    muhurt_type_id: int = Field(default=1)
    muhurt_name_en: str = Field(default="Griha Pravesha")
    muhurt_name_gu: str = Field(default="ગૃહપ્રવેશ")
    api_key: Optional[str] = None


class SingleDateRequest(BaseModel):
    target_date: str = Field(..., description="Target date YYYY-MM-DD")
    muhurt_type_id: int = Field(default=1)
    muhurt_name_en: str = Field(default="Griha Pravesha")
    muhurt_name_gu: str = Field(default="ગૃહપ્રવેશ")
    api_key: Optional[str] = None


class BestDayPredictionSchema(BaseModel):
    rank: int
    date: str
    dateISO: Optional[str] = None
    tithi: str
    nakshatra: str
    vaar: str
    yoga: str
    karan: str
    auspiciousnessScore: int
    verdict: str
    overallAnalysis: str
    tithiAnalysis: str
    nakshatraAnalysis: str
    vaarAnalysis: str
    yogaAnalysis: str
    karanAnalysis: str
    remedies: list[str] = []


class Best5DaysPredictionResultSchema(BaseModel):
    predictions: list[BestDayPredictionSchema]

