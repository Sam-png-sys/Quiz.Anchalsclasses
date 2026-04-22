from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from app.config.database import question_collection, quiz_collection
from app.dependencies.auth_dependency import admin_only, get_current_user
from app.services.ai_service import explain_like_teacher, generate_quiz_from_pdf


router = APIRouter(prefix="/ai", tags=["AI"])

MAX_PDF_SIZE = 50 * 1024 * 1024


@router.post("/admin/generate-quiz")
async def generate_quiz(
    file: UploadFile = File(...),
    title: str = Form("AI Generated Quiz"),
    description: str = Form(""),
    course: str = Form(""),
    difficulty: str = Form("medium"),
    duration: int = Form(30),
    questionCount: int = Form(10),
    admin=Depends(admin_only),
):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Please upload a PDF file")

    pdf_bytes = await file.read()
    if len(pdf_bytes) > MAX_PDF_SIZE:
        raise HTTPException(status_code=400, detail="PDF must be 50MB or smaller")

    quiz_data = generate_quiz_from_pdf(
        pdf_bytes,
        file.filename or "context.pdf",
        {
            "title": title,
            "description": description,
            "course": course,
            "difficulty": difficulty,
            "duration": duration,
            "questionCount": questionCount,
        },
    )

    quiz_doc = {
        "title": quiz_data["title"],
        "description": quiz_data["description"],
        "duration": quiz_data["duration"],
        "course": quiz_data["course"],
        "difficulty": quiz_data["difficulty"],
        "totalQuestions": len(quiz_data["questions"]),
        "isOpen": True,
        "attempts": 0,
        "createdAt": datetime.utcnow(),
        "createdBy": "ai",
    }
    quiz_result = quiz_collection.insert_one(quiz_doc)
    quiz_id = quiz_result.inserted_id

    for item in quiz_data["questions"]:
        question_collection.insert_one({
            "quizId": quiz_id,
            "question": item["question"],
            "options": item["options"],
            "correct_answer": item["correct_answer"],
            "correctAnswer": item["correct_answer"],
            "explanation": item["explanation"],
            "imageUrl": None,
            "createdBy": "ai",
        })

    return {
        "message": "AI quiz created successfully",
        "quiz_id": str(quiz_id),
        "totalQuestions": len(quiz_data["questions"]),
    }


@router.post("/teacher/explain")
def teacher_explain(data: dict, user=Depends(get_current_user)):
    quiz_id = data.get("quizId")
    question_id = data.get("questionId")
    message = (data.get("message") or "").strip()

    if not quiz_id or not message:
        raise HTTPException(status_code=400, detail="quizId and message are required")

    quiz = quiz_collection.find_one({"_id": ObjectId(quiz_id)})
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    question = None
    if question_id:
        question = question_collection.find_one({"_id": ObjectId(question_id)})

    topic_context = "\n".join([
        f"Quiz title: {quiz.get('title', '')}",
        f"Course/topic: {quiz.get('course', '')}",
        f"Description: {quiz.get('description', '')}",
        f"Difficulty: {quiz.get('difficulty', '')}",
    ])

    question_context = ""
    if question:
        question_context = "\n".join([
            f"Question: {question.get('question', '')}",
            f"Options: {', '.join(question.get('options', []))}",
            f"Correct answer: {question.get('correct_answer') or question.get('correctAnswer', '')}",
            f"Stored explanation: {question.get('explanation', '')}",
        ])

    answer = explain_like_teacher(topic_context, question_context, message)
    return {"answer": answer}
