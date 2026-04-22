from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from dotenv import load_dotenv
import cloudinary
import cloudinary.uploader
import os
import imghdr

from app.dependencies.auth_dependency import admin_only, get_current_user
from app.config.database import (
    quiz_collection,
    question_collection,
    attempt_collection,
    users_collection,
    activity_collection
)
from app.schemas.quiz_schema import QuizCreate
from app.utils.hash import hash_password, verify_password
from bson import ObjectId
from datetime import datetime

load_dotenv()

router = APIRouter(prefix="/admin", tags=["Admin"])

# ── Cloudinary ────────────────────────────────────────────────────────────────
cloudinary.config(
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key    = os.getenv("CLOUDINARY_API_KEY"),
    api_secret = os.getenv("CLOUDINARY_API_SECRET"),
)

# ── Image validation ──────────────────────────────────────────────────────────
MAX_FILE_SIZE  = 5 * 1024 * 1024   # 5 MB
ALLOWED_TYPES  = ["jpeg", "png", "jpg", "webp"]

def validate_image(contents):
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")
    file_type = imghdr.what(None, contents)
    if file_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid image type: {file_type}")

# ── Helper ────────────────────────────────────────────────────────────────────
def get_user_from_token(admin: dict):
    user_id = admin.get("user_id")   # matches create_token({"user_id": ...})
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def serialize_value(value):
    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, list):
        return [serialize_value(item) for item in value]
    if isinstance(value, dict):
        return {key: serialize_value(item) for key, item in value.items()}
    return value


def build_student_record(student):
    student_id = str(student["_id"])
    submitted_attempts = list(attempt_collection.find({
        "userId": student_id,
        "submittedAt": {"$ne": None}
    }))

    scored_attempts = []
    for attempt in submitted_attempts:
        total_questions = len(attempt.get("questions", []))
        score = attempt.get("score", 0)
        percent = round((score / total_questions) * 100) if total_questions else 0
        scored_attempts.append({
            "_id": attempt.get("_id"),
            "quizId": attempt.get("quizId"),
            "score": score,
            "totalQuestions": total_questions,
            "percentage": percent,
            "submittedAt": attempt.get("submittedAt"),
        })

    avg_score = (
        round(sum(a["percentage"] for a in scored_attempts) / len(scored_attempts))
        if scored_attempts else 0
    )

    record = {k: v for k, v in student.items() if k != "password"}
    record["_id"] = student_id
    record["isActive"] = student.get("isActive", True)
    record["avgScore"] = avg_score
    record["totalAttempts"] = len(scored_attempts)
    record["attempts"] = scored_attempts
    return serialize_value(record)


def get_student_records():
    students = list(users_collection.find({"role": "student"}))
    return [build_student_record(student) for student in students]


# ══════════════════════════════════════════════════════════════════════════════
# PROFILE
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/profile")
def get_profile(admin=Depends(admin_only)):
    user = get_user_from_token(admin)
    return {
        "name":      user.get("name", ""),
        "email":     user.get("email", ""),
        "phone":     user.get("phone", ""),
        "bio":       user.get("bio", ""),
        "avatarUrl": user.get("avatarUrl"),
        "role":      user.get("role", "admin"),
    }


@router.put("/profile")
def update_profile(data: dict, admin=Depends(admin_only)):
    user = get_user_from_token(admin)
    update_fields = {
        field: data[field]
        for field in ["name", "email", "phone", "bio", "avatarUrl"]
        if field in data
    }
    if not update_fields:
        raise HTTPException(status_code=400, detail="No data to update")
    users_collection.update_one({"_id": user["_id"]}, {"$set": update_fields})
    return {"message": "Profile updated"}


# ══════════════════════════════════════════════════════════════════════════════
# IMAGE UPLOAD
# ══════════════════════════════════════════════════════════════════════════════

@router.post("/upload-avatar")
async def upload_avatar(file: UploadFile = File(...), admin=Depends(admin_only)):
    try:
        contents = await file.read()
        validate_image(contents)
        result = cloudinary.uploader.upload(
            contents,
            folder="quiz_app/avatars",
            resource_type="image",
            transformation=[
                {"width": 400, "height": 400, "crop": "fill", "gravity": "face"},
                {"quality": "auto", "fetch_format": "auto"}
            ]
        )
        return {"url": result["secure_url"]}
    except HTTPException:
        raise
    except Exception as e:
        print("AVATAR UPLOAD ERROR:", str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload-question-image")
async def upload_question_image(file: UploadFile = File(...), admin=Depends(admin_only)):
    try:
        contents = await file.read()
        validate_image(contents)
        result = cloudinary.uploader.upload(
            contents,
            folder="quiz_app/questions",
            resource_type="image",
            transformation=[
                {"width": 1200, "quality": "auto", "fetch_format": "auto"}
            ]
        )
        return {"url": result["secure_url"]}
    except HTTPException:
        raise
    except Exception as e:
        print("QUESTION IMAGE UPLOAD ERROR:", str(e))
        raise HTTPException(status_code=500, detail=str(e))


# ══════════════════════════════════════════════════════════════════════════════
# PASSWORD
# ══════════════════════════════════════════════════════════════════════════════

@router.post("/change-password")
def change_password(data: dict, admin=Depends(admin_only)):
    user = get_user_from_token(admin)
    if not verify_password(data.get("currentPassword", ""), user["password"]):
        raise HTTPException(status_code=400, detail="Wrong current password")
    new_pw = data.get("newPassword", "")
    if len(new_pw) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"password": hash_password(new_pw)}}
    )
    return {"message": "Password updated"}


# ══════════════════════════════════════════════════════════════════════════════
# QUIZ
# ══════════════════════════════════════════════════════════════════════════════

@router.post("/quiz")
def create_quiz(data: QuizCreate, admin=Depends(admin_only)):
    quiz = data.dict()
    quiz["isOpen"]    = True
    quiz["attempts"]  = 0
    quiz["createdAt"] = datetime.utcnow()

    res = quiz_collection.insert_one(quiz)

    activity_collection.insert_one({
        "type":      "quiz_created",
        "message":   f"Quiz '{quiz['title']}' created",
        "createdAt": datetime.utcnow()
    })
    return {"quiz_id": str(res.inserted_id)}


@router.post("/question")
def add_question(data: dict, admin=Depends(admin_only)):
    data["quizId"] = ObjectId(data["quizId"])

    # Normalize field names so quiz_service.get_quiz_questions() can read them.
    # Frontend sends: question, options, correct_answer  (already normalized)
    # Old data in DB may have: questionText, correctAnswer — both handled by quiz_service.
    data["question"]       = data.get("question") or data.get("questionText", "")
    data["options"]        = data.get("options", [])
    data["correct_answer"] = data.get("correct_answer") or data.get("correctAnswer", "")
    data["explanation"]    = data.get("explanation", "")
    data["imageUrl"]       = data.get("imageUrl", None)

    question_collection.insert_one(data)
    return {"message": "Question added"}


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


@router.delete("/course/{id}")
def delete_course(id: str, admin=Depends(admin_only)):
    quiz = quiz_collection.find_one({"_id": ObjectId(id)})
    quiz_collection.delete_one({"_id": ObjectId(id)})
    if quiz:
        activity_collection.insert_one({
            "type":      "quiz_deleted",
            "message":   f"Quiz '{quiz.get('title')}' deleted",
            "createdAt": datetime.utcnow()
        })
    return {"message": "Deleted"}


@router.patch("/quiz/{quiz_id}/toggle")
def toggle_quiz(quiz_id: str, admin=Depends(admin_only)):
    quiz = quiz_collection.find_one({"_id": ObjectId(quiz_id)})
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    new_status = not quiz.get("isOpen", True)
    quiz_collection.update_one({"_id": ObjectId(quiz_id)}, {"$set": {"isOpen": new_status}})
    activity_collection.insert_one({
        "type":      "quiz_status",
        "message":   f"Quiz '{quiz.get('title')}' {'opened' if new_status else 'closed'}",
        "createdAt": datetime.utcnow()
    })
    return {"isOpen": new_status}


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

    question_collection.delete_many({"quizId": ObjectId(quiz_id)})

    for q in data.get("questions", []):
        question_collection.insert_one({
            "quizId":         ObjectId(quiz_id),
            "question":       q.get("question") or q.get("questionText", ""),
            "options":        q.get("options", []),
            "correct_answer": q.get("correct_answer") or q.get("correctAnswer", ""),
            "explanation":    q.get("explanation", ""),
            "imageUrl":       q.get("imageUrl", None),
        })

    activity_collection.insert_one({
        "type":      "quiz_updated",
        "message":   f"Quiz '{data.get('title', 'Unknown')}' updated",
        "createdAt": datetime.utcnow()
    })
    return {"message": "Quiz updated successfully"}


# ══════════════════════════════════════════════════════════════════════════════
# STUDENTS & ANALYTICS
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/students")
def get_students(admin=Depends(admin_only)):
    return get_student_records()


@router.get("/students/export")
def export_students(admin=Depends(admin_only)):
    students = get_student_records()
    return {
        "exportedAt": datetime.utcnow().isoformat(),
        "summary": {
            "totalStudents": len(students),
            "activeStudents": len([s for s in students if s.get("isActive", True)]),
            "inactiveStudents": len([s for s in students if not s.get("isActive", True)]),
            "totalAttempts": sum(s.get("totalAttempts", 0) for s in students),
        },
        "students": students
    }


@router.get("/analytics/{quiz_id}")
def analytics(quiz_id: str, admin=Depends(admin_only)):
    attempts = list(attempt_collection.find({
        "quizId": ObjectId(quiz_id),
        "submittedAt": {"$ne": None}
    }))
    total = len(attempts)
    avg   = sum(a["score"] for a in attempts) / total if total else 0
    return {"total_attempts": total, "average_score": avg}


@router.get("/stats")
def get_stats(user=Depends(get_current_user)):
    return {
        "total_quizzes":  quiz_collection.count_documents({}),
        "total_students": users_collection.count_documents({"role": "student"}),
        "total_attempts": attempt_collection.count_documents({})
    }


@router.get("/activity")
def get_activity(admin=Depends(admin_only)):
    data = list(activity_collection.find().sort("createdAt", -1).limit(10))
    for d in data:
        d["_id"] = str(d["_id"])
    return data


@router.get("/top-students")
def get_top_students(admin=Depends(admin_only)):
    attempts = list(
        attempt_collection.find({"submittedAt": {"$ne": None}})
        .sort("score", -1).limit(5)
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
