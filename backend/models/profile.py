from sqlalchemy import Column, Integer,Float, Text
from db.database import Base


class Profile(Base):
    __tablename__="profile"

    age = Column(Integer,nullable=False)
    gender = Column(Text, nullable=False)
    height = Column(Float, nullable=False)
    weight = Column(Float, nullable=False)
    activity_level= Column(Integer, nullable=False)
    profile_image = Column(Text, nullable=True)
    user_id = Column(Text, primary_key=True, nullable=False)
