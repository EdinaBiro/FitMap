from pydantic import BaseModel
from datetime import datetime 
from typing import Optional
from uuid import UUID

class UserSchema(BaseModel):
    uuid: UUID
    email: str  
    

    class Config:
        orm_mode = True
        from_attributes = True