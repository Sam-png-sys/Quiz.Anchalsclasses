from fastapi import APIRouter, Depends
from app.dependencies.auth_dependency import admin_only, get_current_user
from app.config.database import quiz_collection, question_collection, attempt_collection, users_collection
from bson import ObjectId

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.post("/quiz")
def create_quiz(data: dict, admin=Depends(admin_only)):
    res = quiz_collection.insert_one(data)
    return {"quiz_id": str(res.inserted_id)}


@router.post("/question")
def add_question(data: dict, admin=Depends(admin_only)):
    data["quizId"] = ObjectId(data["quizId"])
    question_collection.insert_one(data)
    return {"message": "Question added"}


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
    
@router.get("/students")
def get_students(admin=Depends(admin_only)):

    students = list(users_collection.find(
        {"role": "student"},
        {"password": 0}
    ))

    for s in students:
        s["_id"] = str(s["_id"])

    return students

@router.get("/courses")
def get_courses(admin=Depends(admin_only)):

    quizzes = list(quiz_collection.find())

    for q in quizzes:
        q["_id"] = str(q["_id"])

    return quizzes

@router.put("/course/{id}")
def update_course(id: str, data: dict, admin=Depends(admin_only)):
    quiz_collection.update_one(
        {"_id": ObjectId(id)},
        {"$set": data}
    )
    return {"message": "Updated"}


@router.delete("/course/{id}")
def delete_course(id: str, admin=Depends(admin_only)):
    quiz_collection.delete_one({"_id": ObjectId(id)})
    return {"message": "Deleted"}