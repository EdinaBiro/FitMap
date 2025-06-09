from pydantic import BaseModel

class WorkoutPlan(BaseModel):
    plan_name: str
    workout_days_per_week: int
    difficulty_level: str