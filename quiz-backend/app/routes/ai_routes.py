from datetime import datetime
import json

from bson import ObjectId
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from app.config.database import question_collection, quiz_collection
from app.dependencies.auth_dependency import admin_only, get_current_user
from app.services.ai_service import explain_like_teacher, generate_quiz_from_pdf


router = APIRouter(prefix="/ai", tags=["AI"])

MAX_PDF_SIZE = 50 * 1024 * 1024


def validate_pdf_upload(file: UploadFile, pdf_bytes: bytes):
    filename = (file.filename or "").lower()
    is_pdf_type = file.content_type in {"application/pdf", "application/octet-stream"}
    if not is_pdf_type or not filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Please upload a PDF file")
    if not pdf_bytes.startswith(b"%PDF"):
        raise HTTPException(status_code=400, detail="Uploaded file is not a valid PDF")
    if len(pdf_bytes) > MAX_PDF_SIZE:
        raise HTTPException(status_code=400, detail="PDF must be 50MB or smaller")


@router.post("/admin/generate-quiz")
async def generate_quiz(
    file: UploadFile = File(...),
    title: str = Form("AI Generated Quiz"),
    description: str = Form(""),
    course: str = Form(""),
    difficulty: str = Form("medium"),
    duration: int = Form(30),
    questionCount: int = Form(10),
    examType: str = Form("no_section_no_timer"),
    requireAnswer: bool = Form(True),
    sections: str = Form("[]"),
    studyMaterialUrl: str = Form(""),
    studyMaterialName: str = Form(""),
    admin=Depends(admin_only),
):
    if questionCount < 1 or questionCount > 30:
        raise HTTPException(status_code=400, detail="Question count must be between 1 and 30")
    if duration < 1:
        raise HTTPException(status_code=400, detail="Duration must be at least 1 minute")

    pdf_bytes = await file.read()
    validate_pdf_upload(file, pdf_bytes)

    try:
        parsed_sections = json.loads(sections or "[]")
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid sections payload")

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
        "examType": examType,
        "requireAnswer": requireAnswer,
        "sections": parsed_sections,
        "studyMaterialName": studyMaterialName or file.filename or "AI source PDF",
        "studyMaterialUrl": studyMaterialUrl or None,
        "totalQuestions": len(quiz_data["questions"]),
        "isOpen": True,
        "attempts": 0,
        "createdAt": datetime.utcnow(),
        "createdBy": admin.get("user_id") or "ai",
        "source": "ai_pdf",
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

    if not quiz_id or not question_id or not message:
        raise HTTPException(status_code=400, detail="quizId, questionId and message are required")

    quiz = quiz_collection.find_one({"_id": ObjectId(quiz_id)})
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    question = question_collection.find_one({"_id": ObjectId(question_id)})
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    topic_context = "\n".join([
        f"Quiz title: {quiz.get('title', '')}",
        f"Course/topic: {quiz.get('course', '')}",
        f"Description: {quiz.get('description', '')}",
        f"Difficulty: {quiz.get('difficulty', '')}",
    ])

    question_context = "\n".join([
        f"Question: {question.get('question', '')}",
        f"Options: {', '.join(question.get('options', []))}",
        f"Correct answer: {question.get('correct_answer') or question.get('correctAnswer', '')}",
        f"Stored explanation: {question.get('explanation', '')}",
    ])

    answer = explain_like_teacher(topic_context, question_context, message)
    return {"answer": answer}
