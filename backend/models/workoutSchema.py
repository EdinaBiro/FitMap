from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import Optional

class WorkoutBase(BaseModel):

    # workout_id: Optional[int] = None
    distance: Optional[float] = None
    calories_burned: Optional[float]  = None
    pace: Optional[float] = None
    duration: Optional[float] = None
    workout_name: str 
    user_id : str
    workout_date : Optional[date] = None 

class WorkoutCreate(WorkoutBase):
    # distance: Optional[float] = None
    # calories_burned: Optional[float]  = None
    # pace: Optional[float] = None
    # duration: Optional[float] = None
    # workout_name: str 
    # user_id : str
    # workout_date : Optional[date] = None 
    pass

class WorkoutSchema(WorkoutBase):
    workout_id: int

    # class Config:
    #     orm_mode=True
    #     from_attributes = True
    model_config = ConfigDict(from_attributes=True)