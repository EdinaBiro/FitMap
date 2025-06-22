from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db.database import get_db
from models.workout import Workout
from models.workoutSchema import WorkoutSchema, WorkoutCreate, WorkoutUpdate
from typing import List
from datetime import datetime
from sqlalchemy import desc

router = APIRouter(prefix="/workout", tags=["workouts"])

@router.post("/add_workout", status_code=status.HTTP_201_CREATED, response_model=WorkoutSchema)
def add_workout(workout_data: WorkoutCreate, db: Session= Depends(get_db)):
    try:

        def parse_time(time_str):
            if isinstance(time_str, str):
                return datetime.strptime(time_str, '%H:%M:%S').time()
            return time_str

        new_workout = Workout(
            user_id=workout_data.user_id,
            distance = workout_data.distance,
            calories_burned = workout_data.calories_burned,
            pace = workout_data.pace,
            duration = workout_data.duration,
            workout_name = workout_data.workout_name,
            workout_date=workout_data.workout_date,
            start_time=parse_time(workout_data.start_time),
            end_time=parse_time(workout_data.end_time),
            is_completed= workout_data.is_completed,
            has_reminder=workout_data.has_reminder
        )

        db.add(new_workout)
        db.commit()
        db.refresh(new_workout)
        return new_workout
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to create workout: {str(e)}")

@router.get("/get_user_workout/{user_id}", response_model=List[WorkoutSchema])
def get_user_workout(user_id: str, db: Session= Depends(get_db)):
    workouts = db.query(Workout)\
            .filter(Workout.user_id == user_id)\
            .order_by(desc(Workout.workout_date))\
            .all()
    if not workouts:
        return []
    return workouts

@router.get("/get_user_workout_by_date/{user_id}/{date}", response_model=List[WorkoutSchema])
def get_user_workout_by_date(user_id: str, date: str, db: Session=Depends(get_db)):
    try:
        date_obj = datetime.strptime(date, "%Y-%m-%d").date()

        workouts = db.query(Workout)\
                    .filter(Workout.user_id == user_id)\
                    .filter(Workout.workout_date == date_obj)\
                    .all()
        return workouts
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format."
        )

@router.get("/get_workout/{workout_id}", response_model=WorkoutSchema)
def get_workout(workout_id: int, db: Session = Depends(get_db)):
    workout = db.query(Workout).filter(Workout.workout_id == workout_id).first()
    if not workout:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Workout with id {workout_id} not found")
    return workout

@router.put("/update_workout/{workout_id}", response_model=WorkoutSchema)
def update_workout(workout_id: int, workout_data: WorkoutUpdate, db: Session = Depends(get_db)):
    workout = db.query(Workout).filter(Workout.workout_id == workout_id).first()
    if not workout:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND, detail=f"Workout with id {workout_id} not found")
    
    for key, value in workout_data.dict(exclude_unset=True).items():
        setattr(workout,key,value)

    try:
        db.commit()
        db.refresh(workout)
        return workout
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to update workout: {str(e)}")
    
@router.delete("/delete_workout/{workout_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workout(workout_id: int, db: Session = Depends(get_db)):
    workout = db.query(Workout).filter(Workout.workout_id == workout_id).first()
    print(workout.workout_id,workout.workout_name)
    if not workout:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND, detail=f"Workout with id {workout_id} not found")
    try:
        db.delete(workout)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Filed to delete workout: {str(e)}")
    
@router.put("/update_planned_workout/{workout_id}", response_model=WorkoutSchema)
def update_planned_workout(workout_id: int,workout_data: WorkoutSchema,db: Session = Depends(get_db)):
    workout = db.query(Workout).filter(Workout.workout_id == workout_id, Workout.is_completed == False).first()
    if not workout:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workout not found or already completed")
    
    allowed_fileds = ['workout_name', 'start_time', 'end_time', 'workout_date']

    for field, value in workout_data.dict(exclude_unset=True).items():
        if field in allowed_fileds:
            setattr(workout, field, value)
    try:
        db.commit()
        db.refresh(workout)
        return workout
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Filed to update workout: {str(e)}")
    