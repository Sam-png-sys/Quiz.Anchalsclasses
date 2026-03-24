from pydantic import BaseModel
from typing import Dict

class SubmitQuiz(BaseModel):
    answers: Dict[str, int]