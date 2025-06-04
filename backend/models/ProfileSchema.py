from pydantic import BaseModel

class ProfileSchema(BaseModel):
    age: int
    gender: str
    height: float
    weight: float
    activity_level: int
    profile_image: str | None = None
    user_id : str

    class Config:
        from_attributes=True