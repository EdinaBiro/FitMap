from pydantic import BaseModel
from typing import Optional

class WorkoutSession(BaseModel):
    day_of_week: int
    session_name: str
    description: Optional[str] = None
    estimated_duration: int

    