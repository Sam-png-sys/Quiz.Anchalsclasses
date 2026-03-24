from fastapi import APIRouter, Depends
from app.services.attempt_service import start_quiz, submit_quiz
from app.dependencies.auth_dependency import get_current_user

router = APIRouter(prefix="/attempt", tags=["Attempt"])

@router.post("/start/{quiz_id}")
def start(quiz_id: str, user=Depends(get_current_user)):
    return start_quiz(user["user_id"], quiz_id)


@router.post("/submit/{quiz_id}")
def submit(quiz_id: str, data: dict, user=Depends(get_current_user)):
    return submit_quiz(user["user_id"], quiz_id, data["answers"])