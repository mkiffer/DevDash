from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from pydantic import ValidationError, BaseModel
from app.core.config import settings
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.auth.utils import oauth2_scheme, SECRET_KEY, ALGORITHM

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/token"
)

class TokenPayload(BaseModel):
    sub: str | None = None

async def get_current_user(
        request: Request, db: Session = Depends(get_db)
        ):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not Authenticated"
        )
    
    try:
        _, token_data = token.split()

        payload = jwt.decode(token_data, SECRET_KEY, algorithms=[ALGORITHM])
        token_data = TokenPayload(**payload)
        username: str = payload.get("sub")
        
    except (JWTError, ValidationError) as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise HTTPException(status_code=404, detail= "User not found")
    return user

