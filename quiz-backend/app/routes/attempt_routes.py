from fastapi import APIRouter, Depends
from app.services.attempt_service import complete_quiz, get_attempt_summary, save_quiz_progress, start_quiz, submit_quiz
from app.dependencies.auth_dependency import get_current_user

router = APIRouter(prefix="/attempt", tags=["Attempt"])

@router.post("/start/{quiz_id}")
def start(quiz_id: str, user=Depends(get_current_user)):
    return start_quiz(user["user_id"], quiz_id)


@router.post("/submit/{quiz_id}")
def submit(quiz_id: str, data: dict, user=Depends(get_current_user)):
    return submit_quiz(user["user_id"], quiz_id, data["answers"])


@router.post("/progress/{quiz_id}")
def progress(quiz_id: str, data: dict, user=Depends(get_current_user)):
    return save_quiz_progress(user["user_id"], quiz_id, data.get("answers", {}))


@router.post("/complete/{quiz_id}")
def complete(quiz_id: str, data: dict, user=Depends(get_current_user)):
    return complete_quiz(user["user_id"], quiz_id, data.get("answers", {}))


@router.get("/summary")
def summary(user=Depends(get_current_user)):
    return get_attempt_summary(user["user_id"])
