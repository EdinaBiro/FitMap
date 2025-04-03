from pydantic import BaseModel, ConfigDict
from datetime import date,time
from typing import Optional
from pydantic import validator

class WorkoutBase(BaseModel):

    distance: Optional[float] = None
    calories_burned: Optional[float]  = None
    pace: Optional[float] = None
    duration: Optional[float] = None
    workout_name: str 
    user_id : str
    workout_date : Optional[date] = None 
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    is_completed: bool = False
    has_reminder: bool = False

class WorkoutCreate(WorkoutBase): 
    @validator('end_time')
    def validate_times(cls,v,values):
        if 'start_time' in values and v and v < values['start_time']:
            raise ValueError('end_time must be after start_time')
        return v

class WorkoutSchema(WorkoutBase):
    workout_id: int

    # class Config:
    #     orm_mode=True
    #     from_attributes = True
    model_config = ConfigDict(from_attributes=True)

class WorkoutUpdate(BaseModel):
    workout_name: Optional[str] = None
    start_time: Optional[time] =None
    end_time: Optional[time] = None
    workout_date: Optional[date]= None
    has_reminder: Optional[bool] = None
    model_config = ConfigDict(from_attributes=True)
