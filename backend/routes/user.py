from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.db.firebase import verify_firebase_token
from backend.models import User

router = APIRouter()



    