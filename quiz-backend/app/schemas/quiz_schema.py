from pydantic import BaseModel

class QuizCreate(BaseModel):
    title: str
    description: str
    duration: int