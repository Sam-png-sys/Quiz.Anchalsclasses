from fastapi import APIRouter, Depends, Query
from app.dependencies.auth_dependency import get_current_user
from app.services.quiz_service import get_quizzes, get_quiz_questions, get_quiz_by_id

router = APIRouter(prefix="/quiz", tags=["Quiz"])


@router.get("/")
def fetch_quizzes(
    page: int = Query(1, ge=1),
    limit: int = Query(10, le=50),
    user=Depends(get_current_user)
):
    return get_quizzes(page, limit)


@router.get("/{quiz_id}")
def fetch_quiz_details(quiz_id: str, user=Depends(get_current_user)):
    return get_quiz_by_id(quiz_id)


@router.get("/{quiz_id}/questions")
def fetch_questions(quiz_id: str, user=Depends(get_current_user)):
    return get_quiz_questions(quiz_id)