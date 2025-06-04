from fastapi import FastAPI
from routes import profile, workout, user
from db.database import engine,Base
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind = engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(profile.router)
app.include_router(user.router)
app.include_router(workout.router)

@app.get("/")
def read_root():
    return{"message": "Welcome to the fitness backend API"}
