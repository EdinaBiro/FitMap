from pydantic import BaseModel


class WorkoutExercise(BaseModel):
    exercise_name: str
    sets: int
    reps: str
    rest_seconds: int
    instructions: str
    exercise_order: int
