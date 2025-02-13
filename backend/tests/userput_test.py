from fastapi.testclient import TestClient
from backend.models import User
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.db.database import get_db, Base
import pytest
from backend.main import app
from datetime import datetime


SQLALCHEMY_DATABASE_URL = "postgresql://postgres:edina@localhost:5433/fitmap"

engine= create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit = False, autoflush=False, bind = engine)

Base.metadata.create_all(bind=engine)

@pytest.fixture()
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture()
def client():
    with TestClient(app) as c:
        yield c

def test_create_profile(client, db_session):
    user_data = {
        "first_name": "Anna",
        "last_name": "Kiss",
        "email" : "kissanna11@gmail.com",
        "password": "anna123",
        "gender": "Female",
        "age": 24,
        "weight": 66,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
        "height": 170,
        "activity_level": "5"

    }




    response = client.post("/profile", json = user_data)

    assert response.status_code == 201
    created_user = response.json()

    assert created_user["first_name"] == "Anna"
    assert created_user["last_name"] == "Kiss"
    assert created_user["email"] == "kissanna11@gmail.com"
    assert created_user["password"] == "anna123"
    assert created_user["gender"] == "Female"
    assert created_user["age"] == 24
    assert created_user["weight"] == 66
    assert created_user["height"] == 170
    assert created_user["activity_level"] == 5


    db_user = db_session.query(User).filter(User.first_name == "Anna").first()
    assert db_user is not None
    assert db_user.first_name == "Anna"
    assert db_user.last_name == "Kiss"
    assert db_user.email == "kissanna11@gmail.com"
    assert db_user.password == "anna123"
    assert db_user.gender == "Female"
    assert db_user.age == 24
    assert db_user.weight == 66
    assert db_user.height == 170
    assert db_user.activity_level ==5

    

