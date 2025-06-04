from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from db.database import get_db
from db.firebase import verify_firebase_token
from models import User

router = APIRouter()



    