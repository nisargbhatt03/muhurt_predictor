import os
import urllib.parse
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    user = urllib.parse.quote_plus(os.getenv("POSTGRES_USER", "postgres").strip("'\""))
    password = urllib.parse.quote_plus(os.getenv("POSTGRES_PASSWORD", "postgres").strip("'\""))
    host = os.getenv("POSTGRES_HOST", "localhost").strip("'\"")
    port = os.getenv("POSTGRES_PORT", "5432").strip("'\"")
    db_name = os.getenv("POSTGRES_DB", "muhurt_prediction").strip("'\"")
    DATABASE_URL = f"postgresql://{user}:{password}@{host}:{port}/{db_name}"

try:
    engine = create_engine(
        DATABASE_URL,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,
    )
except Exception:
    # Fallback to local SQLite if PostgreSQL is not reachable during setup
    DATABASE_URL = "sqlite:///./muhurt_local_fallback.db"
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
