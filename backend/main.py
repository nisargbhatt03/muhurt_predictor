import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from dotenv import load_dotenv

from database import engine, Base
import models
import auth_routes
import profile_routes
import prediction_routes
import admin_routes
from security import limiter

load_dotenv()

# Initialize Database Tables automatically on startup
try:
    models.Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Database initialization warning: {e}")

app = FastAPI(
    title="Muhurt Predictor API",
    description="Security-hardened backend API for Muhurt Predictor (FastAPI + PostgreSQL)",
    version="1.0.0",
)

# Register Slowapi Rate Limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Configuration
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173")
origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response


# Include Routers
app.include_router(auth_routes.router)
app.include_router(profile_routes.router)
app.include_router(prediction_routes.router)
app.include_router(admin_routes.router)



@app.get("/")
def root():
    return {
        "app": "Muhurt Predictor Backend",
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
