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
from app.utils.hash import hash_password
from app.services.otp_service import generate_otp, verify_otp
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/admin", tags=["Admin"])



# CREATE QUIZ

@router.post("/quiz")
def create_quiz(data: QuizCreate, admin=Depends(admin_only)):

    quiz = data.dict()

    quiz["isOpen"] = quiz.get("isOpen", True)
    quiz["attempts"] = 0
    quiz["createdAt"] = datetime.utcnow()   #  FIXED

    res = quiz_collection.insert_one(quiz)

    #  ACTIVITY LOG
    activity_collection.insert_one({
        "type": "quiz_created",
        "message": f"Quiz '{quiz['title']}' created",
        "createdAt": datetime.utcnow()
    })

    return {"quiz_id": str(res.inserted_id)}



# ADD QUESTION

@router.post("/question")
def add_question(data: dict, admin=Depends(admin_only)):

    data["quizId"] = ObjectId(data["quizId"])
    question_collection.insert_one(data)

    return {"message": "Question added"}



# GET COURSES (QUIZZES)

@router.get("/courses")
def get_courses(admin=Depends(admin_only)):

    quizzes = list(quiz_collection.find())

    for q in quizzes:
        q["_id"] = str(q["_id"])
        q["isOpen"] = q.get("isOpen", True)
        q["attempts"] = q.get("attempts", 0)
        q["difficulty"] = q.get("difficulty", "Medium")

        q["totalQuestions"] = question_collection.count_documents({
            "quizId": ObjectId(q["_id"])
        })

    return quizzes



# DELETE COURSE

@router.delete("/course/{id}")
def delete_course(id: str, admin=Depends(admin_only)):

    quiz = quiz_collection.find_one({"_id": ObjectId(id)})

    quiz_collection.delete_one({"_id": ObjectId(id)})

    # 🔥 ACTIVITY
    if quiz:
        activity_collection.insert_one({
            "type": "quiz_deleted",
            "message": f"Quiz '{quiz.get('title', 'Unknown')}' deleted",
            "createdAt": datetime.utcnow()
        })

    return {"message": "Deleted"}



# TOGGLE QUIZ STATUS

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

    # 🔥 ACTIVITY
    activity_collection.insert_one({
        "type": "quiz_status",
        "message": f"Quiz '{quiz.get('title')}' {'opened' if new_status else 'closed'}",
        "createdAt": datetime.utcnow()
    })

    return {"isOpen": new_status}



# STUDENTS

@router.get("/students")
def get_students(admin=Depends(admin_only)):

    students = list(users_collection.find(
        {"role": "student"},
        {"password": 0}
    ))

    for s in students:
        s["_id"] = str(s["_id"])

    return students



# ANALYTICS

@router.get("/analytics/{quiz_id}")
def analytics(quiz_id: str, admin=Depends(admin_only)):

    attempts = list(attempt_collection.find({
        "quizId": ObjectId(quiz_id),
        "submittedAt": {"$ne": None}
    }))

    total = len(attempts)
    avg_score = sum(a["score"] for a in attempts) / total if total else 0

    return {
        "total_attempts": total,
        "average_score": avg_score
    }



# STATS

@router.get("/stats")
def get_stats(current_user=Depends(get_current_user)):

    total_quizzes = quiz_collection.count_documents({})
    total_students = users_collection.count_documents({"role": "student"})
    total_attempts = attempt_collection.count_documents({})

    return {
        "total_quizzes": total_quizzes,
        "total_students": total_students,
        "total_attempts": total_attempts
    }



#  ACTIVITY ROUTE (IMPORTANT)

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


#  TOP STUDENTS 

@router.get("/top-students")
def get_top_students(admin=Depends(admin_only)):

    # Get top 5 highest scoring attempts
    attempts = list(
        attempt_collection.find({
            "submittedAt": {"$ne": None}
        })
        .sort("score", -1)
        .limit(5)
    )

    result = []

    for a in attempts:
        user = users_collection.find_one({"_id": ObjectId(a["userId"])})
        quiz = quiz_collection.find_one({"_id": ObjectId(a["quizId"])})

        result.append({
            "name": user.get("name", "Student") if user else "Student",
            "score": a.get("score", 0),
            "quiz": quiz.get("title", "Quiz") if quiz else "Quiz",
            "submittedAt": a.get("submittedAt")
        })

    return result