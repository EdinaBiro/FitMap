from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from models.onBoradingSchema import OnBoardingData
from datetime import datetime
from typing import Dict,Any
import json
import os
import httpx
from db.firebase import verify_firebase_token
from db.database import get_db
from sqlalchemy.orm import Session
from sqlalchemy import text

router = APIRouter(prefix="/plan", tags=["plan"])
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
                detail="Invalid authentication token"
            )
        return decoded_token['uid']
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentification failed"
        )

@router.post("/onboarding")
async def save_onboarding_data(
    data: OnBoardingData,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    if data.userId != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User ID mismatch"
        )

    try:
        answers = {
            "fitness_level": data.fitnessLevel,
            "fitness_goal": data.fitnessGoal,
            "workout_frequency": data.workoutFrequency,
            "workout_duration": data.workoutDuration,
            "preferred_workout_type": json.dumps(data.preferredWorkoutType),
            "medical_conditions": data.medicalConditions,
            "medical_details": data.medicalDetails,
            "age": data.age,
            "height": data.height,
            "weight": data.weight,
            "gender": data.gender
        }
        db.begin()
        for question_key, answer_value in answers.items():
            db.execute(text("""
                INSERT INTO questionnaire_answers(user_id, question_key, answer_value, updated_at)
                VALUES (:user_id, :question_key, :answer_value, :updated_at)
                ON CONFLICT (user_id, question_key)
                DO UPDATE SET 
                    answer_value = EXCLUDED.answer_value, 
                    updated_at = EXCLUDED.updated_at
                """),
                {
                    "user_id": current_user_id,
                    "question_key": question_key,
                    "answer_value": str(answer_value),
                    "updated_at": datetime.utcnow()
                })
        
        db.execute(text("""
            INSERT INTO user_questionnaire_status(
                user_id, questionnaire_completed, completed_at, created_at
            )
            VALUES (
                :user_id, :completed, :completed_at, :created_at
            )
            ON CONFLICT (user_id)
            DO UPDATE SET 
                questionnaire_completed = EXCLUDED.questionnaire_completed,
                completed_at = EXCLUDED.completed_at,
                updated_at = EXCLUDED.completed_at
            """),
            {
                "user_id": current_user_id,
                "completed": True,
                "completed_at": datetime.utcnow(),
                "created_at": datetime.utcnow()
            })
        
        db.commit()
        return {"status": "success", "message": "Data saved successfully"}

    except Exception as e:
        db.rollback()
        print(f"Database error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save onboarding data"
        )
        
@router.get("/questionnaire-status")
async def get_questionnaire_status(db: Session=Depends(get_db),user_id: str=Depends(get_current_user)):
    try:
      
        result = db.execute("""
              SELECT questionnaire_completed, completed_at
              FROM user_questionnaire_status
              WHERE user_id = :user_id                      
        """, {"user_id": user_id}).fetchone()

        if result:
            return {
                "completed": result[0],
                "completed_at": result[1]
            }
        else:
            return {"completed": False, "completed_at": None}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check questionnaire status: {str(e)}"
        )
    
async def generate_workout_plan_with_ai(user_answers: Dict[str, Any]) -> Dict[str, Any]:
    try:
        fitness_level_map = {1: "Just starting out", 2: "Occasional exerciser", 3:"Regular exerciser", 4: "Fitness enthisiast", 5:"Advanced athlete"}

        preferred_types = user_answers.get('preferred_workout_type','[]')
        if isinstance(preferred_types,str):
            try:
                preferred_types = json.loads(preferred_types)
            except:
                preferred_types = []

        prompt = f"""
        Create a personalized workout plan for  auser with the following profile:
        -Fitness Level: {fitness_level_map.get(int(user_answers.get('fitness_level',2)), 'Beginner')}
        -Primary Goal: {user_answers.get('fitness_goal', 'general_fitness')}
        -Workout Frequency: {user_answers.get('workout_frequency',3)} days per week
        -Preffered Duration: {user_answers.get('workout_duration', 45)} minutes per session
        -Preffered Workout Types: {json.loads(user_answers.get('preffered_workout_type', '[]'))}
        -Medical Conditions: {'Yes - ' + user_answers.get('medical_details', '') if user_answers.get('medical_conditions') == 'True' else 'None'}
        -Age : {user_answers.get('age', 'Not specified')}
        -Gender: {user_answers.get('gender', 'Not speficied')}

        Return the response in this exact JSON format:
        {{
            "plan_name" : "Your custom Fitness Plan",
            "difficulty_level": "beginner/intermediate/advanced",
            "sessions" : [
            {{
                "day_of_week": 1,
                "session_name": "Session Name",
                "description": "Brief description of the session focus",
                "estimated_duration": 45,
                "exercises":[
                    {{
                        "exercise_name" : "Exercise Name",
                        "sets": 3,
                        "reps": "12-15",
                        "rest_seconds": 60,
                        "instructions": "Detailed instructions for proper form",
                        "exercise_order": 1
                    }}
                ]
            }}
            ]
        }}

        Make sure to:
        1. Include exactly {user_answers.get('workout_frequency', 3)} sessions
        2. Each session should have 5-8 exercises
        3. Consider the user's fitness level and goals
        4. Include proper rest periods and form instructions
        5. Make sessions progressive and balanced

        """

        api_key = os.getenv("DEEPSEK_API_KEY")
        if not api_key:
            return generate_basic_plan(user_answers)
        

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.deepseek.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type" : "application/json"
                },
                json={
                    "model": "deepseek_chat",
                    "messages": [
                        {"role": "system", "content": "You are a proffesional fitness trainer creating personalized workout plans. Always respond with a valid JSON only"},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.7,
                    "max_tokens": 2000
                }

            )

            if response.status_code == 200:
                ai_response = response.json()
                plan_content = ai_response['choices'][0]['message']['content']

                try:
                    return json.loads(plan_content)
                except json.JSONDecodeError:
                    return generate_basic_plan(user_answers)
            else:
                return generate_basic_plan(user_answers)
                
    except Exception as e:
        print(f"AI generation error: {e}")
        return generate_basic_plan(user_answers)
    
def generate_basic_plan(user_answers: Dict[str, Any]) -> Dict[str,Any]:
    workout_frequency = int(user_answers.get('workout_frequency',3))
    fitness_level = int(user_answers.get('fitness_level',2))

    if fitness_level <=2:
        difficulty = "beginner"
        sets=2
        reps="8-12"
        rest=90
    elif fitness_level <=4:
        difficulty = "intermediate"
        sets=3
        reps="10-15"
        rest=75
    else:
        difficulty="advanced"
        sets=4
        reps="12-20"
        rest=60

    session_templates=[
        {
            "session_name": "Upper Body Strength",
            "description": "Focus on chest, shoulders, arms and back",
            "exercises": [
                {"exercise_name": "Push-ups", "instructions": "Keep body straight, lower chest to ground"},
                {"exercise_name": "Dumbbell Rows", "instructions": "Pull weight to chest, squeeze shoulder blades"},
                {"exercise_name": "Shoulder Press", "instructions": "Press weights overhead, control the movement"},
                {"exercise_name": "Bicep Curls", "instructions": "Curl weights to shoulders, slow and controlled"},
                {"exercise_name": "Tricep Dips", "instructions": "Lower body using arms, push back up"},
                {"exercise_name": "Plank", "instructions": "Hold straight body position, engage core"},
             ]
        },
        {
           "session_name": "Lower Body Power",
            "description": "Strengthen legs, glutes, and core",
            "exercises": [
                {"exercise_name": "Squats", "instructions": "Lower hips back, keep knees behind toes"},
                {"exercise_name": "Lunges", "instructions": "Step forward, lower back knee toward ground"},
                {"exercise_name": "Deadlifts", "instructions": "Hinge at hips, keep back straight"},
                {"exercise_name": "Calf Raises", "instructions": "Rise up on toes, squeeze calves"},
                {"exercise_name": "Glute Bridges", "instructions": "Lift hips up, squeeze glutes at top"},
                {"exercise_name": "Wall Sit", "instructions": "Hold squat position against wall"}
            ] 
        },
         {
            "session_name": "Cardio & Core",
            "description": "Improve cardiovascular fitness and core strength",
            "exercises": [
                {"exercise_name": "Jumping Jacks", "instructions": "Jump while spreading legs and raising arms"},
                {"exercise_name": "Mountain Climbers", "instructions": "Alternate bringing knees to chest in plank"},
                {"exercise_name": "Burpees", "instructions": "Drop down, jump back, push-up, jump up"},
                {"exercise_name": "Russian Twists", "instructions": "Rotate torso side to side while seated"},
                {"exercise_name": "High Knees", "instructions": "Run in place bringing knees to chest"},
                {"exercise_name": "Bicycle Crunches", "instructions": "Alternate elbow to opposite knee"}
            ]
        },
        {
            "session_name": "Full Body Circuit",
            "description": "Total body workout with minimal rest",
            "exercises": [
                {"exercise_name": "Squat to Press", "instructions": "Squat then press weights overhead"},
                {"exercise_name": "Renegade Rows", "instructions": "Plank position while rowing weights"},
                {"exercise_name": "Jump Squats", "instructions": "Explode up from squat position"},
                {"exercise_name": "Push-up to Side Plank", "instructions": "Push-up then rotate to side plank"},
                {"exercise_name": "Superman Holds", "instructions": "Lie face down, lift arms and legs"},
                {"exercise_name": "Jump Rope", "instructions": "Simulate jump rope motion"}
            ]
        },
        {
            "session_name": "Flexibility & Recovery",
            "description": "Stretching and mobility work for recovery",
            "exercises": [
                {"exercise_name": "Cat-Cow Stretch", "instructions": "Alternate between arching and rounding your spine"},
                {"exercise_name": "Downward Dog", "instructions": "Form inverted V shape, stretch hamstrings and shoulders"},
                {"exercise_name": "Pigeon Pose", "instructions": "Hip opener stretch, hold each side"},
                {"exercise_name": "Spinal Twist", "instructions": "Seated spinal rotation stretch"},
                {"exercise_name": "Child's Pose", "instructions": "Kneel and stretch arms forward, relax"},
                {"exercise_name": "Foam Rolling", "instructions": "Roll out tight muscles slowly"}
            ]
        },
        {
            "session_name": "HIIT Power",
            "description": "High intensity interval training for fat burning",
            "exercises": [
                {"exercise_name": "Sprint Intervals", "instructions": "30 seconds high intensity, 30 seconds rest"},
                {"exercise_name": "Box Jumps", "instructions": "Jump onto stable surface, step down"},
                {"exercise_name": "Battle Ropes", "instructions": "Alternate arm waves with heavy ropes"},
                {"exercise_name": "Kettlebell Swings", "instructions": "Hip hinge movement, swing to chest level"},
                {"exercise_name": "Tuck Jumps", "instructions": "Jump bringing knees to chest"},
                {"exercise_name": "Plank Jacks", "instructions": "Jump feet in and out while in plank"}
            ]
        },
        {
            "session_name": "Functional Movement",
            "description": "Real-world movement patterns and stability",
            "exercises": [
                {"exercise_name": "Turkish Get-ups", "instructions": "Complex movement from lying to standing"},
                {"exercise_name": "Single Leg Deadlifts", "instructions": "Balance challenge with hip hinge"},
                {"exercise_name": "Bear Crawls", "instructions": "Crawl forward keeping knees off ground"},
                {"exercise_name": "Lateral Lunges", "instructions": "Step wide to side, sit back into hip"},
                {"exercise_name": "Farmer's Walk", "instructions": "Walk carrying heavy weights at sides"},
                {"exercise_name": "Single Arm Row", "instructions": "Row one arm while stabilizing core"}
            ]
        }
    ]

    sessions = []
    selected_templates = []
    
    if workout_frequency <= len(session_templates):
        selected_templates = session_templates[:workout_frequency]
    else:
        selected_templates = session_templates[:] 
        remaining_days = workout_frequency - len(session_templates)
        for i in range(remaining_days):
            selected_templates.append(session_templates[i % len(session_templates)])
    
    for i in range(workout_frequency):
        template = selected_templates[i]
        
        exercises = []
        for j, ex in enumerate(template["exercises"]):
            reps_value = reps
            if any(keyword in ex["exercise_name"] for keyword in ["Plank", "Wall Sit", "Hold", "Pose"]):
                reps_value = "30-60 seconds"
            elif "Sprint Intervals" in ex["exercise_name"]:
                reps_value = "8 intervals"
            elif "Foam Rolling" in ex["exercise_name"]:
                reps_value = "2-3 minutes"
                
            exercises.append({
                "exercise_name": ex["exercise_name"],
                "sets": sets,
                "reps": reps_value,
                "rest_seconds": rest,
                "instructions": ex["instructions"],
                "exercise_order": j+1
            })

        sessions.append({
            "day_of_week": i+1,
            "session_name": template["session_name"],
            "description": template["description"],
            "estimated_duration": int(user_answers.get('workout_duration', 45)),
            "exercises": exercises
        })

    return {
        "plan_name": f"Your {difficulty.title()} Fitness Plan",
        "difficulty_level": difficulty,
        "sessions": sessions
    }

@router.post("/generate-workout-plan")
async def generate_workout_plan(db: Session = Depends(get_db), user_id: str = Depends(get_current_user)):
    try:
        answers_rows = db.execute(text("""
                SELECT question_key, answer_value
                FROM questionnaire_answers
                WHERE user_id = :user_id   
            """), {"user_id": user_id}).fetchall()
        
        if not answers_rows:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No questionnaire data found. Please complete onboarding first"
            )
        user_answers = {row[0]: row[1] for row in answers_rows}

        ai_plan = await generate_workout_plan_with_ai(user_answers)

        db.execute(text("""
              UPDATE workout_plans SET is_active = False 
              WHERE user_id = :user_id          
            """), {"user_id": user_id})
        
        plan_result = db.execute(text("""
                INSERT INTO workout_plans(user_id, plan_name, workout_days_per_week, difficulty_level, generated_by)
                VALUES (:user_id, :plan_name, :workout_days, :difficulty_level, :generated_by)
                RETURNING id
            """), {
                "user_id": user_id, 
                "plan_name": ai_plan["plan_name"], 
                "workout_days": len(ai_plan["sessions"]), 
                "difficulty_level": ai_plan["difficulty_level"], 
                "generated_by": "deepseek_ai"
            })
        
        plan_id = plan_result.fetchone()[0]

        for session_data in ai_plan["sessions"]:
            session_result = db.execute(text("""
                INSERT INTO workout_sessions(workout_plan_id, day_of_week, session_name, description, estimated_duration)
                VALUES (:plan_id, :day_of_week, :session_name, :description, :duration)
                RETURNING id
            """), {
                "plan_id": plan_id, 
                "day_of_week": session_data["day_of_week"],
                "session_name": session_data["session_name"], 
                "description": session_data.get("description"), 
                "duration": session_data["estimated_duration"]
            })
            session_id = session_result.fetchone()[0]                     
                                           
            for exercise in session_data["exercises"]:
                db.execute(text("""
                    INSERT INTO workout_exercises(workout_session_id, exercise_name, sets, reps, rest_seconds, instructions, exercise_order)
                    VALUES (:session_id, :exercise_name, :sets, :reps, :rest_seconds, :instructions, :exercise_order)
                """), {
                    "session_id": session_id, 
                    "exercise_name": exercise["exercise_name"], 
                    "sets": exercise["sets"], 
                    "reps": exercise["reps"], 
                    "rest_seconds": exercise["rest_seconds"], 
                    "instructions": exercise["instructions"], 
                    "exercise_order": exercise["exercise_order"]
                })

        db.commit()

        return {
            "message": "Workout plan generated successfully",
            "plan_id": plan_id,
            "status": "success"
        }     
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate workout plan: {str(e)}"
        )      

@router.get("/workout-plan")
async def get_workout_plan(db: Session = Depends(get_db), user_id: str = Depends(get_current_user)):
    try:
        plan_result = db.execute(text("""
            SELECT id, plan_name, workout_days_per_week, difficulty_level, created_at
            FROM workout_plans
            WHERE user_id = :user_id AND is_active = TRUE
            ORDER BY created_at DESC
            LIMIT 1
        """), {"user_id": user_id}).fetchone()

        if not plan_result:
            return {
                "plan": None,
                "sessions": [],
                "user_info": None
            }

        plan_id = plan_result[0]

        sessions_result = db.execute(text("""
           SELECT 
                ws.id, 
                ws.day_of_week, 
                ws.session_name, 
                ws.description, 
                ws.estimated_duration,
                COUNT(we.id) as exercise_count
            FROM workout_sessions ws
            LEFT JOIN workout_exercises we ON ws.id = we.workout_session_id
            WHERE ws.workout_plan_id = :plan_id
            GROUP BY ws.id
            ORDER BY ws.day_of_week
        """), {"plan_id": plan_id}).fetchall()

        sessions_list = []
        for session in sessions_result:
            exercises_result = db.execute(text("""
                SELECT exercise_name, sets, reps, rest_seconds, instructions, exercise_order
                FROM workout_exercises
                WHERE workout_session_id = :session_id
                ORDER BY exercise_order
            """), {"session_id": session[0]}).fetchall()
            
            exercises = []
            for ex in exercises_result:
                exercises.append({
                    "exercise_name": ex[0],
                    "sets": ex[1],
                    "reps": ex[2],
                    "rest_seconds": ex[3],
                    "instructions": ex[4],
                    "exercise_order": ex[5]
                })
            
            sessions_list.append({
                "id": session[0],
                "day_of_week": session[1],
                "session_name": session[2],
                "description": session[3],
                "estimated_duration": session[4],
                "exercises": exercises[5],
                "exercise_count": len(exercises)
            })

        user_answers_result = db.execute(text("""
            SELECT question_key, answer_value
            FROM questionnaire_answers
            WHERE user_id = :user_id
        """), {"user_id": user_id}).fetchall()

        user_info = {row[0]: row[1] for row in user_answers_result}

        return {
            "plan": {
                "id": plan_result[0],
                "plan_name": plan_result[1],
                "workout_days_per_week": plan_result[2],
                "difficulty_level": plan_result[3],
                "created_at": plan_result[4]
            },
            "sessions": sessions_list,
            "user_info": user_info
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get workout plan: {str(e)}"
        )
        
@router.get("/workout-session/{session_id}")
async def get_workout_session_details(
    session_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    try:
        session_result = db.execute(text("""
            SELECT ws.id, ws.day_of_week, ws.session_name, ws.description, ws.estimated_duration
            FROM workout_sessions ws
            JOIN workout_plans wp ON ws.workout_plan_id = wp.id
            WHERE ws.id = :session_id AND wp.user_id = :user_id
        """), {"session_id": session_id, "user_id": user_id}).fetchone()
        
        if not session_result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workout session not found"
            )
        
        exercises_result = db.execute(text("""
            SELECT exercise_name, sets, reps, rest_seconds, instructions, exercise_order
            FROM workout_exercises
            WHERE workout_session_id = :session_id
            ORDER BY exercise_order
        """), {"session_id": session_id}).fetchall()
        
        exercises_list = []
        for exercise in exercises_result:
            exercises_list.append({
                "exercise_name": exercise[0],
                "sets": exercise[1],
                "reps": exercise[2],
                "rest_seconds": exercise[3],
                "instructions": exercise[4],
                "exercise_order": exercise[5]
            })
        
        return {
            "session": {
                "id": session_result[0],
                "session_name": session_result[2],
                "description": session_result[3],
                "estimated_duration": session_result[4],
                "day_of_week": session_result[1]
            },
            "exercises": exercises_list
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get workout session: {str(e)}"
        )