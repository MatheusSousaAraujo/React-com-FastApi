import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from pathlib import Path


current_dir = Path(__file__).resolve().parent
env_file_path = current_dir / "app_config.env" 

if env_file_path.exists():
    load_dotenv(dotenv_path=env_file_path)

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./blog.db" 


engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def create_tables():
    """Cria todas as tabelas no banco de dados se elas não existirem."""
    Base.metadata.create_all(bind=engine)