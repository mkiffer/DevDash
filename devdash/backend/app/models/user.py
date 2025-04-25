from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.models.base import Base
from sqlalchemy.orm import relationship

import datetime

class User(Base):
    __tablename__ = "user"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String, nullable = False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default = datetime.datetime.now)
    sessions = relationship("ChatSession", back_populates = "user")

