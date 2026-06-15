from bson import ObjectId
from app.config.database import quiz_collection, question_collection, users_collection


def get_quizzes(user_id: str = None, page: int = 1, limit: int = 10):
    skip = (page - 1) * limit

    query = {"isOpen": True}

    if user_id:
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if user and user.get("role") == "student":
            allowed_courses = user.get("allowedCourses", [])
            allowed_quizzes = user.get("allowedQuizzes", [])

            # If restrictions exist, filter the results:
            if allowed_courses or allowed_quizzes:
                or_conditions = []
                if allowed_courses:
                    or_conditions.append({"course": {"$in": allowed_courses}})
                if allowed_quizzes:
                    quiz_ids = []
                    for qid in allowed_quizzes:
                        try:
                            quiz_ids.append(ObjectId(qid))
                        except Exception:
                            pass
                    if quiz_ids:
                        or_conditions.append({"_id": {"$in": quiz_ids}})

                if or_conditions:
                    query["$or"] = or_conditions
                else:
                    # Restrictions are set but no valid IDs/courses, return empty list
                    return []

    quizzes = list(quiz_collection.find(query).skip(skip).limit(limit))

    result = []
    for q in quizzes:
        result.append({
            "id":             str(q["_id"]),
            "_id":            str(q["_id"]),
            "title":          q.get("title", "Untitled Quiz"),
            "description":    q.get("description", ""),
            "course":         q.get("course", ""),
            "subject":        q.get("subject", ""),
            "duration":       q.get("duration"),
            "difficulty":     q.get("difficulty", "Medium"),
            "examType":       q.get("examType", "no_section_no_timer"),
            "requireAnswer":  q.get("requireAnswer", True),
            "sections":       q.get("sections", []),
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
    actual_question_count = question_collection.count_documents({"quizId": ObjectId(quiz_id)})
    quiz["question_count"] = actual_question_count
    quiz["totalQuestions"] = actual_question_count
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
            "imageUrl":      q.get("imageUrl", None),
        })

    return result
