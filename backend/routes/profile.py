from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.services.bmi_calculator import calculate_bmi
from backend.models.userSchema import UserSchema
from backend.models.profile import Profile
from backend.models.ProfileSchema import ProfileSchema

router = APIRouter(prefix="/profile", tags=["profiles"])

@router.post("/create_profile")
def create_profile(profile_data: ProfileSchema, db: Session = Depends(get_db)):
    new_profile = Profile(**profile_data.dict())
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)
    return new_profile

@router.get("/user/{user_id}")
def get_user_profile(user_id: str, db: Session=Depends(get_db)):
    profile=db.query(Profile).filter(Profile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.put("/{user_id}")
def update_profile(user_id: str, profile_data: ProfileSchema, db: Session= Depends(get_db)):
    profile=db.query(Profile).filter(Profile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    for key, value in profile_data.dict().items():
        setattr(profile, key, value)
    
    db.commit()
    db.refresh(profile)
    return profile

