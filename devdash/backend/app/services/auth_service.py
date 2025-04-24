from datetime import datetime, timedelta
from typing import Optional
from jose import jwt
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes = ["bcrypt"], deprecated="auto")

#JWT settings
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES =30

def verify_password(plain_password:str, hashed_password:str)->bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password:str)->str:
    return pwd_context.hash(password)

def create_access_token(data:dict, expires_delta: Optional[timedelta]=None)->str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now()+expires_delta
    else:
        expire = datetime.now() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp":expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt