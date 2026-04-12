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

# ✅ LOAD ENV
load_dotenv()

router = APIRouter(prefix="/admin", tags=["Admin"])

# ─────────────────────────────────────────
# ✅ CLOUDINARY CONFIG
# ─────────────────────────────────────────
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)

# ─────────────────────────────────────────
# ✅ IMAGE VALIDATION
# ─────────────────────────────────────────
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_TYPES = ["jpeg", "png", "jpg", "webp"]

def validate_image(contents):
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")

    file_type = imghdr.what(None, contents)
    if file_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Invalid image type")

# ─────────────────────────────────────────
# ✅ HELPER
# ─────────────────────────────────────────
def get_user_from_token(admin: dict):
    user_id = admin.get("user_id")

    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = users_collection.find_one({"_id": ObjectId(user_id)})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


# ═════════════════ PROFILE ═════════════════

@router.get("/profile")
def get_profile(admin=Depends(admin_only)):
    user = get_user_from_token(admin)

    return {
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "phone": user.get("phone", ""),
        "bio": user.get("bio", ""),
        "avatarUrl": user.get("avatarUrl"),
        "role": user.get("role", "admin"),
    }


@router.put("/profile")
def update_profile(data: dict, admin=Depends(admin_only)):
    user = get_user_from_token(admin)

    update_fields = {}

    for field in ["name", "email", "phone", "bio", "avatarUrl"]:
        if field in data:
            update_fields[field] = data[field]

    if not update_fields:
        raise HTTPException(status_code=400, detail="No data to update")

    users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": update_fields}
    )

    return {"message": "Profile updated"}


# ═════════════════ IMAGE UPLOAD ═════════════════

@router.post("/upload-avatar")
async def upload_avatar(file: UploadFile = File(...), admin=Depends(admin_only)):
    try:
        contents = await file.read()

        validate_image(contents)

        result = cloudinary.uploader.upload(
            contents,
            folder="quiz_app/avatars",
            resource_type="image"
        )

        return {"url": result["secure_url"]}

    except Exception as e:
        print("AVATAR ERROR:", str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload-question-image")
async def upload_question_image(file: UploadFile = File(...), admin=Depends(admin_only)):
    try:
        contents = await file.read()

        validate_image(contents)

        result = cloudinary.uploader.upload(
            contents,
            folder="quiz_app/questions",
            resource_type="image"
        )

        return {"url": result["secure_url"]}

    except Exception as e:
        print("UPLOAD ERROR:", str(e))
        raise HTTPException(status_code=500, detail=str(e))


# ═════════════════ PASSWORD ═════════════════

@router.post("/change-password")
def change_password(data: dict, admin=Depends(admin_only)):
    user = get_user_from_token(admin)

    if not verify_password(data.get("currentPassword"), user["password"]):
        raise HTTPException(status_code=400, detail="Wrong password")

    users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"password": hash_password(data.get("newPassword"))}}
    )

    return {"message": "Password updated"}


# ═════════════════ QUIZ ═════════════════

@router.post("/quiz")
def create_quiz(data: QuizCreate, admin=Depends(admin_only)):
    quiz = data.dict()

    quiz["isOpen"] = True
    quiz["attempts"] = 0
    quiz["createdAt"] = datetime.utcnow()

    res = quiz_collection.insert_one(quiz)

    #  Activity log
    activity_collection.insert_one({
        "type": "quiz_created",
        "message": f"Quiz '{quiz['title']}' created",
        "createdAt": datetime.utcnow()
    })

    return {"quiz_id": str(res.inserted_id)}


@router.post("/question")
def add_question(data: dict, admin=Depends(admin_only)):
    data["quizId"] = ObjectId(data["quizId"])
    data["imageUrl"] = data.get("imageUrl", None)

    question_collection.insert_one(data)

    return {"message": "Question added"}


@router.delete("/course/{id}")
def delete_course(id: str, admin=Depends(admin_only)):
    quiz = quiz_collection.find_one({"_id": ObjectId(id)})

    quiz_collection.delete_one({"_id": ObjectId(id)})

    if quiz:
        activity_collection.insert_one({
            "type": "quiz_deleted",
            "message": f"Quiz '{quiz.get('title')}' deleted",
            "createdAt": datetime.utcnow()
        })

    return {"message": "Deleted"}


@router.get("/courses")
def get_courses(admin=Depends(admin_only)):
    quizzes = list(quiz_collection.find())

    for q in quizzes:
        q["_id"] = str(q["_id"])

    return quizzes


# ═════════════════ ANALYTICS ═════════════════

@router.get("/analytics/{quiz_id}")
def analytics(quiz_id: str, admin=Depends(admin_only)):
    attempts = list(
        attempt_collection.find({"quizId": ObjectId(quiz_id)})
    )

    total = len(attempts)
    avg = sum(a["score"] for a in attempts) / total if total else 0

    return {
        "total_attempts": total,
        "average_score": avg
    }


@router.get("/stats")
def get_stats(user=Depends(get_current_user)):
    return {
        "total_quizzes": quiz_collection.count_documents({}),
        "total_students": users_collection.count_documents({"role": "student"}),
        "total_attempts": attempt_collection.count_documents({})
    }


# ═════════════════ TOP STUDENTS ═════════════════

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
            "name": user.get("name", "Student") if user else "Student",
            "score": a.get("score", 0),
            "quiz": quiz.get("title", "Quiz") if quiz else "Quiz",
            "submittedAt": a.get("submittedAt")
        })

    return result