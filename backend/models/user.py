from sqlalchemy import Column, BigInteger, String,Float, Text,Double, Date
from backend.db.database import Base

class User(Base):
    __tablename__="users"

    id=Column(BigInteger, primary_key=True, autoincrement=True)
    first_name = Column(String(250), nullable=False)
    last_name = Column(String(250), nullable=False)
    email =Column(String(250), nullable=False)
    password = Column(String(250), nullable=False)
    gender = Column(String(50))
    age=Column(BigInteger, nullable=False)
    weight= Column(Double)
    created_at=Column(Date)
    updated_at = Column(Date)
    bmi = Column(Double)
    height=Column(BigInteger)
    activity_level= Column(BigInteger)
    profile_url=Column(Text)
