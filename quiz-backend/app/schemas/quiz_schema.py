from pydantic import BaseModel
from typing import Optional

class QuizCreate(BaseModel):
    title: str
    description: str
    duration: int
    course: Optional[str] = ""
    difficulty: Optional[str] = "medium"
    studyMaterialUrl: Optional[str] = None
    studyMaterialName: Optional[str] = None
    isOpen: bool = True
