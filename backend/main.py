from fastapi import FastAPI
from backend.routes import profile
from backend.db.database import engine,Base

Base.metadata.create_all(bind = engine)

app = FastAPI()

app.include_router(profile.router)

@app.get("/")
def read_root():
    return{"message": "Welcome to the fitness backend API"}
