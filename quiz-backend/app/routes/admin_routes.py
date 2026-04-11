from fastapi import APIRouter, Depends, HTTPException
from app.dependencies.auth_dependency import admin_only, get_current_user
from app.config.database import (
    quiz_collection,
    question_collection,
    attempt_collection,
    users_collection,
    activity_collection
)
from app.schemas.quiz_schema import QuizCreate
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/admin", tags=["Admin"])


# ── CREATE QUIZ ───────────────────────────────────────────────────────────────

@router.post("/quiz")
def create_quiz(data: QuizCreate, admin=Depends(admin_only)):
    quiz = data.dict()
    quiz["isOpen"] = quiz.get("isOpen", True)
    quiz["attempts"] = 0
    quiz["createdAt"] = datetime.utcnow()

    res = quiz_collection.insert_one(quiz)

    activity_collection.insert_one({
        "type": "quiz_created",
        "message": f"Quiz '{quiz['title']}' created",
        "createdAt": datetime.utcnow()
    })

    return {"quiz_id": str(res.inserted_id)}


# ── ADD SINGLE QUESTION ───────────────────────────────────────────────────────

@router.post("/question")
def add_question(data: dict, admin=Depends(admin_only)):
    data["quizId"] = ObjectId(data["quizId"])

    # Save with normalized field names so quiz_service reads them consistently
    data["question"]       = data.get("question") or data.get("questionText", "")
    data["options"]        = data.get("options", [])
    data["correct_answer"] = data.get("correct_answer") or data.get("correctAnswer", "")
    data["explanation"]    = data.get("explanation", "")
    data["imageUrl"]       = data.get("imageUrl", None)  # ✅ image support

    question_collection.insert_one(data)
    return {"message": "Question added"}


# ── GET ALL COURSES ───────────────────────────────────────────────────────────

@router.get("/courses")
def get_courses(admin=Depends(admin_only)):
    quizzes = list(quiz_collection.find())
    for q in quizzes:
        q["_id"]        = str(q["_id"])
        q["isOpen"]     = q.get("isOpen", True)
        q["attempts"]   = q.get("attempts", 0)
        q["difficulty"] = q.get("difficulty", "Medium")
        q["totalQuestions"] = question_collection.count_documents({
            "quizId": ObjectId(q["_id"])
        })
    return quizzes


# ── DELETE COURSE ─────────────────────────────────────────────────────────────

@router.delete("/course/{id}")
def delete_course(id: str, admin=Depends(admin_only)):
    quiz = quiz_collection.find_one({"_id": ObjectId(id)})
    quiz_collection.delete_one({"_id": ObjectId(id)})

    if quiz:
        activity_collection.insert_one({
            "type": "quiz_deleted",
            "message": f"Quiz '{quiz.get('title', 'Unknown')}' deleted",
            "createdAt": datetime.utcnow()
        })

    return {"message": "Deleted"}


# ── TOGGLE QUIZ STATUS ────────────────────────────────────────────────────────

@router.patch("/quiz/{quiz_id}/toggle")
def toggle_quiz(quiz_id: str, admin=Depends(admin_only)):
    quiz = quiz_collection.find_one({"_id": ObjectId(quiz_id)})

    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    new_status = not quiz.get("isOpen", True)
    quiz_collection.update_one(
        {"_id": ObjectId(quiz_id)},
        {"$set": {"isOpen": new_status}}
    )

    activity_collection.insert_one({
        "type": "quiz_status",
        "message": f"Quiz '{quiz.get('title')}' {'opened' if new_status else 'closed'}",
        "createdAt": datetime.utcnow()
    })

    return {"isOpen": new_status}


# ── STUDENTS ──────────────────────────────────────────────────────────────────

@router.get("/students")
def get_students(admin=Depends(admin_only)):
    students = list(users_collection.find({"role": "student"}, {"password": 0}))
    for s in students:
        s["_id"] = str(s["_id"])
    return students


# ── ANALYTICS ─────────────────────────────────────────────────────────────────

@router.get("/analytics/{quiz_id}")
def analytics(quiz_id: str, admin=Depends(admin_only)):
    attempts = list(attempt_collection.find({
        "quizId": ObjectId(quiz_id),
        "submittedAt": {"$ne": None}
    }))
    total = len(attempts)
    avg_score = sum(a["score"] for a in attempts) / total if total else 0
    return {"total_attempts": total, "average_score": avg_score}


# ── STATS ─────────────────────────────────────────────────────────────────────

@router.get("/stats")
def get_stats(current_user=Depends(get_current_user)):
    return {
        "total_quizzes":  quiz_collection.count_documents({}),
        "total_students": users_collection.count_documents({"role": "student"}),
        "total_attempts": attempt_collection.count_documents({})
    }


# ── GET SINGLE QUIZ FOR EDIT ──────────────────────────────────────────────────

@router.get("/quiz-details/{quiz_id}")
def get_quiz(quiz_id: str, admin=Depends(admin_only)):
    quiz = quiz_collection.find_one({"_id": ObjectId(quiz_id)})

    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    questions = list(question_collection.find({"quizId": ObjectId(quiz_id)}))

    quiz["_id"] = str(quiz["_id"])
    for q in questions:
        q["_id"]    = str(q["_id"])
        q["quizId"] = str(q["quizId"])

    quiz["questions"] = questions
    return quiz


# ── UPDATE QUIZ ───────────────────────────────────────────────────────────────

@router.put("/quiz-update/{quiz_id}")
def update_quiz(quiz_id: str, data: dict, admin=Depends(admin_only)):
    quiz = quiz_collection.find_one({"_id": ObjectId(quiz_id)})

    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    quiz_collection.update_one(
        {"_id": ObjectId(quiz_id)},
        {"$set": {
            "title":       data.get("title"),
            "description": data.get("description"),
            "duration":    data.get("duration"),
            "difficulty":  data.get("difficulty", "medium"),
            "course":      data.get("course", "")
        }}
    )

    # ✅ FIX: Single delete + insert (old code had a duplicate block —
    #    first insert was missing options/correctAnswer, second overwrote it).
    question_collection.delete_many({"quizId": ObjectId(quiz_id)})

    for q in data.get("questions", []):
        question_collection.insert_one({
            "quizId":        ObjectId(quiz_id),
            "question":      q.get("question") or q.get("questionText", ""),
            "options":       q.get("options", []),
            "correct_answer": q.get("correct_answer") or q.get("correctAnswer", ""),
            "explanation":   q.get("explanation", ""),
            "imageUrl":      q.get("imageUrl", None),  # ✅ image support
        })

    activity_collection.insert_one({
        "type": "quiz_updated",
        "message": f"Quiz '{data.get('title', 'Unknown')}' updated",
        "createdAt": datetime.utcnow()
    })

    return {"message": "Quiz updated successfully"}


# ── ACTIVITY ──────────────────────────────────────────────────────────────────

@router.get("/activity")
def get_activity(admin=Depends(admin_only)):
    data = list(
        activity_collection.find()
        .sort("createdAt", -1)
        .limit(10)
    )
    for d in data:
        d["_id"] = str(d["_id"])
    return data


# ── TOP STUDENTS ──────────────────────────────────────────────────────────────

@router.get("/top-students")
def get_top_students(admin=Depends(admin_only)):
    attempts = list(
        attempt_collection.find({"submittedAt": {"$ne": None}})
        .sort("score", -1)
        .limit(5)
    )

    result = []
    for a in attempts:
        user = users_collection.find_one({"_id": ObjectId(a["userId"])})
        quiz = quiz_collection.find_one({"_id": ObjectId(a["quizId"])})
        result.append({
            "name":        user.get("name", "Student") if user else "Student",
            "score":       a.get("score", 0),
            "quiz":        quiz.get("title", "Quiz") if quiz else "Quiz",
            "submittedAt": a.get("submittedAt")
        })

    return result