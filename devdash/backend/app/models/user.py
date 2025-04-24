from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.models.base import Base
import datetime

class User(Base):
    __tablename__ = "user"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String, nullable = False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default = datetime.datetime.now)

