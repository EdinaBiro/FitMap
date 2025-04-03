from sqlalchemy import Column, Integer,Float, Text, Date, ForeignKey,Time, Boolean
from backend.db.database import Base


class Workout(Base):
    __tablename__ = "workouts"

    user_id = Column(Text, ForeignKey("profile.user_id"),nullable=False)
    workout_id = Column(Integer, nullable= False, autoincrement= True, primary_key=True)
    distance = Column(Float,nullable=True)
    calories_burned = Column(Float, nullable=True)
    pace = Column(Float, nullable=True)
    duration=Column(Float, nullable=True)
    workout_name = Column(Text, nullable=False)
    workout_date = Column(Date, nullable=True)
    start_time = Column(Time,nullable=True)
    end_time = Column(Time,nullable=True)
    is_completed = Column(Boolean, default=False)
    has_reminder = Column(Boolean, default=False)

