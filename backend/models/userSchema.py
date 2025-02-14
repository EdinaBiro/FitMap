from pydantic import BaseModel
from datetime import datetime 
from typing import Optional

class UserSchema(BaseModel):
    first_name: str
    last_name: str
    email: str  
    password: str
    gender: Optional[str] = None
    age: int
    weight: Optional[float] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    bmi: Optional[float] = None
    height: Optional[int] = None
    activity_level: Optional[int] = None
    profile_url: Optional[str] = None

    class Config:
        orm_mode = True
        from_attributes = True