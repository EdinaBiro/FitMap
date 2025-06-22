from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta
from typing import Dict, Any, List
import json
from db.firebase import verify_firebase_token
from db.database import get_db
from sqlalchemy.orm import Session
from sqlalchemy import text, func
from collections import defaultdict


router = APIRouter(prefix='/stats',tags=['statistics'])
security = HTTPBearer()

async def get_current_user(
        credentials: HTTPAuthorizationCredentials = Depends(security),
        db: Session = Depends(get_db)
    
) -> str:
    try:
        token = credentials.credentials
        decoded_token = verify_firebase_token(token)
        if not decoded_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentification token"
            )
        return decoded_token['uid']
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentification token"
        )
    
def get_date_range(time_range: str) -> tuple:
    end_date = datetime.now().date()

    if time_range == 'week':
        start_date = end_date - timedelta(days=7)
    elif time_range == 'month':
        start_date = end_date - timedelta(days=30)
    elif time_range == 'year':
        start_date = end_date - timedelta(days=365)
    else:
        start_date = end_date - timedelta(days=30)

    return start_date, end_date

@router.get("/workouts")
async def get_workout_stats(
    range: str = Query("month", description="Time range: week, month, or year"),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    try:
        start_date, end_date = get_date_range(range)

        workouts_query = """
            SELECT workout_id, workout_name, workout_date, duration, calories_burned, 
                   distance, pace, is_completed, start_time, end_time
            FROM workouts 
            WHERE user_id = :user_id 
            AND workout_date BETWEEN :start_date AND :end_date
            ORDER BY workout_date DESC
        """

        workouts_result = db.execute(text(workouts_query), {
            "user_id" : user_id,
            "start_date": start_date,
            "end_date" : end_date
        }).fetchall()

        if not workouts_result:
            return {
                "totalWorkouts": 0,
                "avgWorkoutsPerWeek": 0,
                "completionRate": 0,
                "totalCalories": 0,
                "avgCaloriesPerWorkout": 0,
                "avgDuration": 0,
                "longestWorkout": 0,
                "shortestWorkout": 0,
                "workoutFrequency": {"labels": [], "data": []},
                "workoutTypes": [],
                "caloriesOverTime": {"labels": [], "data": []},
                "durationOverTime": {"labels": [], "data": []},
                "topExercises": {"labels": [], "data": []}
            }
        
        total_workouts = len(workouts_result)
        completed_workouts = sum(1 for w in workouts_result if w[7])
        completion_rate = round((completed_workouts / total_workouts) * 100,1) if total_workouts > 0 else 0

        total_calories = sum(w[4] or 0 for w in workouts_result)
        avg_calories = round(total_calories / total_workouts, 0) if total_workouts > 0 else 0

        durations = [w[3] or 0 for w in workouts_result if w[3]]
        avg_duration = round(sum(durations) / len(durations),0) if len(durations) > 0 else 0
        longest_workout = max(durations) if durations else 0
        shortest_workout = min(durations) if durations else 0

        days_in_range = (end_date - start_date).days
        weeks_in_range = days_in_range / 7
        avg_workouts_per_week = round(total_workouts / weeks_in_range,1) if weeks_in_range > 0 else 0

        workout_frequency = generate_workout_frequency(workouts_result, range, start_date, end_date)

        workout_types = generate_workout_types(workouts_result)

        calories_over_time = generate_calories_over_time(workouts_result, range)

        duration_over_time = generate_duration_over_time(workouts_result, range)

        top_exercises = await get_top_exercises(db, user_id, start_date, end_date)

        return {
            "totalWorkouts": total_workouts,
            "avgWorkoutsPerWeek": avg_workouts_per_week,
            "completionRate": completion_rate,
            "totalCalories": int(total_calories),
            "avgCaloriesPerWorkout": int(avg_calories),
            "avgDuration": int(avg_duration),
            "longestWorkout": int(longest_workout),
            "shortestWorkout": int(shortest_workout),
            "workoutFrequency": workout_frequency,
            "workoutTypes": workout_types,
            "caloriesOverTime": calories_over_time,
            "durationOverTime": duration_over_time,
            "topExercises": top_exercises
        }
        
    except Exception as e:
        print(f"Error getting workout stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get workout statistics: {str(e)}"
        )
    
def generate_workout_frequency(workouts, time_range, start_date, end_date):
    frequency_data = defaultdict(int)
    
    if time_range == 'week':
        for workout in workouts:
            workout_date = workout[2] 
            if isinstance(workout_date, str):
                workout_date = datetime.strptime(workout_date, '%Y-%m-%d').date()
            day_name = workout_date.strftime('%a')
            frequency_data[day_name] += 1
        
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        data = [frequency_data.get(label, 0) for label in labels]
        
    elif time_range == 'month':
        for workout in workouts:
            workout_date = workout[2]
            if isinstance(workout_date, str):
                workout_date = datetime.strptime(workout_date, '%Y-%m-%d').date()
            
            week_start = workout_date - timedelta(days=workout_date.weekday())
            week_label = f"Week {week_start.strftime('%m/%d')}"
            frequency_data[week_label] += 1
        
        labels = list(frequency_data.keys())[-4:] if len(frequency_data) > 4 else list(frequency_data.keys())
        data = [frequency_data.get(label, 0) for label in labels]
        
    else: 
        for workout in workouts:
            workout_date = workout[2]
            if isinstance(workout_date, str):
                workout_date = datetime.strptime(workout_date, '%Y-%m-%d').date()
            month_label = workout_date.strftime('%b')
            frequency_data[month_label] += 1
            
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        labels = months
        data = [frequency_data.get(month, 0) for month in months]
    
    return {"labels": labels, "data": data}

def generate_workout_types(workouts):
    type_counts = defaultdict(int)
    colors = ['#6200ee', '#03dac6', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b']
    
    for workout in workouts:
        workout_name = workout[1] or "General Workout"  
        type_counts[workout_name] += 1
    
    workout_types = []
    for i, (name, count) in enumerate(type_counts.items()):
        workout_types.append({
            "name": name,
            "count": count,
            "color": colors[i % len(colors)],
            "legendFontColor": "#7F7F7F",
            "legendFontSize": 15
        })
    
    return workout_types

def generate_calories_over_time(workouts, time_range):
    calories_data = defaultdict(int)
    
    for workout in workouts:
        workout_date = workout[2]  
        calories = workout[4] or 0  
        
        if isinstance(workout_date, str):
            workout_date = datetime.strptime(workout_date, '%Y-%m-%d').date()
        
        if time_range == 'week':
            date_label = workout_date.strftime('%a')
        elif time_range == 'month':
            date_label = workout_date.strftime('%m/%d')
        else:  
            date_label = workout_date.strftime('%b')
            
        calories_data[date_label] += calories
    
    
    if time_range == 'week':
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    elif time_range == 'month':
        labels = list(calories_data.keys())[-7:] if len(calories_data) > 7 else list(calories_data.keys())
    else:
        labels = list(calories_data.keys())[-12:] if len(calories_data) > 12 else list(calories_data.keys())
    
    data = [calories_data.get(label, 0) for label in labels]
    
    return {"labels": labels, "data": data}

def generate_duration_over_time(workouts, time_range):
    duration_data = defaultdict(list)
    
    for workout in workouts:
        workout_date = workout[2] 
        duration = workout[3] or 0 
        
        if isinstance(workout_date, str):
            workout_date = datetime.strptime(workout_date, '%Y-%m-%d').date()
        
        if time_range == 'week':
            date_label = workout_date.strftime('%a')
        elif time_range == 'month':
            date_label = workout_date.strftime('%m/%d')
        else:  
            date_label = workout_date.strftime('%b')
            
        duration_data[date_label].append(duration)
    
    avg_duration_data = {}
    for label, durations in duration_data.items():
        avg_duration_data[label] = round(sum(durations) / len(durations), 0) if durations else 0
    
    if time_range == 'week':
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    elif time_range == 'month':
        labels = list(avg_duration_data.keys())[-7:] if len(avg_duration_data) > 7 else list(avg_duration_data.keys())
    else:
        labels = list(avg_duration_data.keys())[-12:] if len(avg_duration_data) > 12 else list(avg_duration_data.keys())
    
    data = [avg_duration_data.get(label, 0) for label in labels]
    
    return {"labels": labels, "data": data}

async def get_top_exercises(db: Session, user_id: str, start_date, end_date):
    try:
        
        query = """
            SELECT we.exercise_name, COUNT(*) as frequency
            FROM workout_exercises we
            JOIN workout_sessions ws ON we.workout_session_id = ws.id
            JOIN workout_plans wp ON ws.workout_plan_id = wp.id
            WHERE wp.user_id = :user_id 
            AND wp.created_at BETWEEN :start_date AND :end_date
            GROUP BY we.exercise_name
            ORDER BY frequency DESC
            LIMIT 5
        """
        
        result = db.execute(text(query), {
            "user_id": user_id,
            "start_date": start_date,
            "end_date": end_date
        }).fetchall()
        
        if not result:
            return {"labels": ["No Data"], "data": [0]}
        
        labels = [row[0] for row in result]
        data = [row[1] for row in result]
        
        return {"labels": labels, "data": data}
        
    except Exception as e:
        print(f"Error getting top exercises: {str(e)}")
        return {"labels": ["No Data"], "data": [0]}