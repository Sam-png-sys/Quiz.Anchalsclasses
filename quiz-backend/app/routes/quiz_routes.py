from fastapi import APIRouter, Depends, Query, HTTPException
from app.dependencies.auth_dependency import get_current_user
from app.services.quiz_service import (
    get_quizzes,
    get_quiz_questions,
    get_quiz_by_id,
)

router = APIRouter(prefix="/quiz", tags=["Quiz"])


# ── GET ALL QUIZZES ───────────────────────────────────────────────────────────

@router.get("/")
def fetch_quizzes(
    page: int = Query(1, ge=1),
    limit: int = Query(10, le=50),
    user=Depends(get_current_user),
):
    return get_quizzes(page, limit)


# ── GET QUIZ DETAILS ──────────────────────────────────────────────────────────

@router.get("/{quiz_id}")
def fetch_quiz_details(quiz_id: str, user=Depends(get_current_user)):
    quiz = get_quiz_by_id(quiz_id)

    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    return quiz


# ── GET QUIZ QUESTIONS ────────────────────────────────────────────────────────

@router.get("/{quiz_id}/questions")
def fetch_questions(quiz_id: str, user=Depends(get_current_user)):
    questions = get_quiz_questions(quiz_id)

    if not questions:
        raise HTTPException(status_code=404, detail="No questions found for this quiz")

    return questions
