from pydantic import BaseModel, Field
from typing import Optional, List


class QuizSection(BaseModel):
    title: str
    questionCount: int = Field(..., ge=1)
    durationMinutes: Optional[int] = Field(default=None, ge=1)


class QuizCreate(BaseModel):
    title: str
    description: str
    duration: int = 0
    course: Optional[str] = ""
    subject: Optional[str] = ""
    difficulty: Optional[str] = "medium"
    studyMaterialUrl: Optional[str] = None
    studyMaterialName: Optional[str] = None
    examType: Optional[str] = "no_section_no_timer"
    requireAnswer: bool = True
    sections: List[QuizSection] = []
    isOpen: bool = True
