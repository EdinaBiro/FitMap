from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.models.user import User
from datetime import datetime
from backend.services.bmi_calculator import calculate_bmi
from backend.models.userSchema import UserSchema

router = APIRouter()

@router.post("/profile", status_code = status.HTTP_201_CREATED, response_model=UserSchema)
def create_profile(user: UserSchema, db: Session = Depends(get_db)):
    db_user=User(**user.dict())
    db_user.created_at = datetime.now()
    db_user.updated_at = datetime.now()
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/profile/{user_id}", response_model=UserSchema)
def get_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.bmi = calculate_bmi(user.height, user.weight)
    user_schema = UserSchema.from_orm(user)
    return user_schema

@router.put("/profile/{user_id}")
def update_profile(user_id: int, user: UserSchema, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    for key,value in user.dict(exclude_unset=True).items():
        setattr(db_user,key,value)
    db_user.updated_at = datetime.now()

    db.commit()
    db.refresh(db_user)
    return db_user
