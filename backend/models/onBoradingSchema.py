from pydantic import BaseModel
from typing import List

class OnBoardingData(BaseModel):
    fitnessLevel: int
    fitnessGoal: str
    workoutFrequency: int
    workoutDuration: int
    preferredWorkoutType: List[str]
    medicalConditions: bool
    medicalDetails: str
    age: str
    height: str
    weight: str
    gender: str
    userId: str
