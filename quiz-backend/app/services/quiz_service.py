from bson import ObjectId
from app.config.database import quiz_collection, question_collection


def get_quizzes(page: int = 1, limit: int = 10):
    skip = (page - 1) * limit
    quizzes = list(quiz_collection.find({"isOpen": True}).skip(skip).limit(limit))

    result = []
    for q in quizzes:
        result.append({
            "id": str(q["_id"]),
            "_id": str(q["_id"]),
            "title": q.get("title", "Untitled Quiz"),
            "description": q.get("description", ""),
            "duration": q.get("duration"),
            "difficulty": q.get("difficulty", "Medium"),
            "question_count": question_collection.count_documents({
                "quizId": ObjectId(str(q["_id"]))
            }),
        })

    return result


def get_quiz_by_id(quiz_id: str):
    quiz = quiz_collection.find_one({"_id": ObjectId(quiz_id)})
    if not quiz:
        return None

    quiz["_id"] = str(quiz["_id"])
    quiz["id"] = quiz["_id"]
    return quiz


def get_quiz_questions(quiz_id: str):
    """
    Returns questions with normalized field names the frontend expects:
      - question       (was: questionText)
      - options        (array of strings — unchanged)
      - correct_answer (was: correctAnswer)
      - explanation    (unchanged)
    """
    questions = list(question_collection.find({"quizId": ObjectId(quiz_id)}))

    result = []
    for q in questions:
        # Support both old field names (questionText/correctAnswer) and
        # new field names (question/correct_answer) in the database.
        result.append({
            "_id": str(q["_id"]),
            "quizId": str(q["quizId"]),

            # ✅ Normalized to what the frontend expects
            "question": q.get("question") or q.get("questionText", ""),
            "options": q.get("options", []),
            "correct_answer": q.get("correct_answer") or q.get("correctAnswer", ""),
            "explanation": q.get("explanation", ""),
        })

    return result