# ============================================================
# ADD THESE ROUTES TO: quiz-backend/app/routes/admin_routes.py
# ============================================================
#
# STEP 1: Add "subject_collection" to your imports at the top of admin_routes.py
#   from app.config.database import (
#       ...,
#       course_collection,
#       subject_collection,   # <-- ADD THIS
#   )
#
# STEP 2: Add "subject_collection" to your database.py file:
#   subject_collection = db["subjects"]
#
# STEP 3: Paste the routes below into admin_routes.py
# ============================================================

from bson import ObjectId
from datetime import datetime

# ---------- GET all subjects for a course ----------
@router.get("/course/{course_id}/subjects")
def get_subjects(course_id: str, admin=Depends(admin_only)):
    subjects = list(subject_collection.find({"courseId": course_id}).sort("createdAt", -1))
    result = []
    for s in subjects:
        s["_id"] = str(s["_id"])
        s["totalQuizzes"] = quiz_collection.count_documents({"subjectId": str(s["_id"])})
        result.append(s)
    return result


# ---------- CREATE a subject under a course ----------
@router.post("/course/{course_id}/subject")
def create_subject(course_id: str, data: dict, admin=Depends(admin_only)):
    name = (data.get("name") or "").strip()
    if not name:
        raise HTTPException(status_code=400, detail="Subject name is required")

    # Check course exists
    course = course_collection.find_one({"_id": ObjectId(course_id)})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    subject = {
        "name": name,
        "description": data.get("description", "").strip(),
        "courseId": course_id,
        "createdAt": datetime.utcnow(),
    }
    result = subject_collection.insert_one(subject)
    return {"subject_id": str(result.inserted_id)}


# ---------- UPDATE a subject ----------
@router.put("/subject/{subject_id}")
def update_subject(subject_id: str, data: dict, admin=Depends(admin_only)):
    subject = subject_collection.find_one({"_id": ObjectId(subject_id)})
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    name = (data.get("name") or subject.get("name", "")).strip()
    if not name:
        raise HTTPException(status_code=400, detail="Subject name is required")

    subject_collection.update_one(
        {"_id": ObjectId(subject_id)},
        {"$set": {
            "name": name,
            "description": data.get("description", "").strip(),
        }}
    )
    return {"message": "Subject updated"}


# ---------- DELETE a subject ----------
@router.delete("/subject/{subject_id}")
def delete_subject(subject_id: str, admin=Depends(admin_only)):
    subject = subject_collection.find_one({"_id": ObjectId(subject_id)})
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    subject_collection.delete_one({"_id": ObjectId(subject_id)})
    return {"message": "Subject deleted"}
