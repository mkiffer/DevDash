from sqlalchemy import Column, Integer, String, Text, JSON
from app.models.base import Base

class CodingProblem(Base):
    __tablename__ = "coding_problems"

    id = Column(Integer, primary_key = True)
    title = Column(String, nullable=False)
    slug = Column(String, nullable=False, unique=True)
    difficulty = Column(Text, nullable=False)
    description = Column(Text, nullable=False)
    example_cases = Column(JSON, nullable=False) #store visible examples
    test_cases = Column(JSON, nullable=False)
    starter_code = Column(JSON, nullable=False) #store different languages
    example_input = Column(Text)