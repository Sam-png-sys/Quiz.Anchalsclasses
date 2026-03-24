from pydantic import BaseModel
from typing import List

class QuestionCreate(BaseModel):
    quizId: str
    questionText: str
    options: List[str]
    correctAnswer: int
    explanation: str