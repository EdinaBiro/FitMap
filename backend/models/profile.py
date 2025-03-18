from sqlalchemy import Column, Integer,Float, Text
from backend.db.database import Base


class Profile(Base):
    __tablename__="profile"

    #id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    age = Column(Integer,nullable=False)
    gender = Column(Text, nullable=False)
    height = Column(Float, nullable=False)
    weight = Column(Float, nullable=False)
    activity_level= Column(Integer, nullable=False)
    profile_image = Column(Text, nullable=True)
    user_id = Column(Text, primary_key=True, nullable=False)
