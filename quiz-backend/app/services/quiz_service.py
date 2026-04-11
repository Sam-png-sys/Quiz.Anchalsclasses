from bson import ObjectId
from app.config.database import quiz_collection, question_collection


def get_quizzes(page: int = 1, limit: int = 10):
    skip = (page - 1) * limit
    quizzes = list(quiz_collection.find({"isOpen": True}).skip(skip).limit(limit))

    result = []
    for q in quizzes:
        result.append({
            "id":             str(q["_id"]),
            "_id":            str(q["_id"]),
            "title":          q.get("title", "Untitled Quiz"),
            "description":    q.get("description", ""),
            "duration":       q.get("duration"),
            "difficulty":     q.get("difficulty", "Medium"),
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
    quiz["id"]  = quiz["_id"]
    return quiz


def get_quiz_questions(quiz_id: str):
    """
    Returns questions with normalized field names the frontend expects:
      question       — the question text  (was: questionText)
      options        — array of option strings (unchanged)
      correct_answer — the correct option text (was: correctAnswer)
      explanation    — optional explanation (unchanged)
      imageUrl       — optional image URL for image-based questions 
    Supports both old field names (questionText/correctAnswer) and
    new normalized names (question/correct_answer) already in the DB.
    """
    questions = list(question_collection.find({"quizId": ObjectId(quiz_id)}))

    result = []
    for q in questions:
        result.append({
            "_id":           str(q["_id"]),
            "quizId":        str(q["quizId"]),
            "question":      q.get("question") or q.get("questionText", ""),
            "options":       q.get("options", []),
            "correct_answer": q.get("correct_answer") or q.get("correctAnswer", ""),
            "explanation":   q.get("explanation", ""),
            "imageUrl":      q.get("imageUrl", None),  # ✅ image support
        })

    return result