import jwt
from datetime import datetime, timedelta, timezone
import bcrypt
from fastapi import HTTPException, Security, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import os
from typing import Optional
from dotenv import load_dotenv
from pathlib import Path
from . import models
from .database import SessionLocal


current_dir = Path(__file__).resolve().parent
env_file_path = current_dir / "app_config.env"

if env_file_path.exists():
    load_dotenv(dotenv_path=env_file_path)

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_HOURS_STR = os.getenv("ACCESS_TOKEN_EXPIRE_HOURS", "2")
try:
    ACCESS_TOKEN_EXPIRE_HOURS = int(ACCESS_TOKEN_EXPIRE_HOURS_STR)
except ValueError:
    ACCESS_TOKEN_EXPIRE_HOURS = 2

if not SECRET_KEY:
    raise ValueError("Nenhuma SECRET_KEY configurada. A aplicação não pode iniciar de forma segura.")


oauth2_scheme = HTTPBearer()

def get_db_session_for_auth():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return token

def verify_token(token: str, credentials_exception: HTTPException) -> str:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: Optional[str] = payload.get("sub")
        if username is None:
            raise credentials_exception
        return username
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expirado, faça login novamente", headers={"WWW-Authenticate": "Bearer"})
    except jwt.InvalidTokenError:
        raise credentials_exception

def get_current_active_user(
    credentials: HTTPAuthorizationCredentials = Security(oauth2_scheme),
    db: Session = Depends(get_db_session_for_auth)
) -> models.Author:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais",
        headers={"WWW-Authenticate": "Bearer"},
    )
    username = verify_token(credentials.credentials, credentials_exception)
    user = db.query(models.Author).filter(models.Author.username == username).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário associado ao token não encontrado")
    return user

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not hashed_password or not isinstance(hashed_password, str):
        return False
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))