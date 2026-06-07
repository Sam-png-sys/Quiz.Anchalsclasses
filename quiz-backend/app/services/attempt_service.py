from app.config.database import attempt_collection, question_collection, quiz_collection
from bson import ObjectId
from datetime import datetime

def start_quiz(user_id, quiz_id):

    existing = attempt_collection.find_one({
        "userId": user_id,
        "quizId": ObjectId(quiz_id),
        "submittedAt": None
    })

    if existing:
        return {
            "message": "Quiz already started",
            "attempt_id": str(existing["_id"]),
            "answers": existing.get("answers", {}),
        }

    questions = list(question_collection.find({"quizId": ObjectId(quiz_id)}))

    snapshot = [
        {
            "questionId": str(q["_id"]),
            "correctAnswer": q.get("correct_answer") or q.get("correctAnswer", "")
        }
        for q in questions
    ]

    attempt = {
        "userId": user_id,
        "quizId": ObjectId(quiz_id),
        "questions": snapshot,
        "answers": {},
        "score": 0,
        "startTime": datetime.utcnow(),
        "submittedAt": None
    }

    result = attempt_collection.insert_one(attempt)

    return {"message": "Quiz started", "attempt_id": str(result.inserted_id), "answers": {}}


def save_quiz_progress(user_id, quiz_id, answers):
    questions = list(question_collection.find({"quizId": ObjectId(quiz_id)}))
    if not questions:
        return {"error": "No questions found"}

    normalized_answers = {}
    for index, question in enumerate(questions):
        question_id = str(question["_id"])
        user_answer = (
            answers.get(question_id)
            or answers.get(str(index))
            or answers.get(index)
        )
        if user_answer is not None:
            normalized_answers[question_id] = user_answer

    attempt = attempt_collection.find_one({
        "userId": user_id,
        "quizId": ObjectId(quiz_id),
        "submittedAt": None
    })

    if not attempt:
        snapshot = [
            {
                "questionId": str(q["_id"]),
                "correctAnswer": q.get("correct_answer") or q.get("correctAnswer", "")
            }
            for q in questions
        ]
        result = attempt_collection.insert_one({
            "userId": user_id,
            "quizId": ObjectId(quiz_id),
            "questions": snapshot,
            "answers": normalized_answers,
            "score": 0,
            "startTime": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
            "submittedAt": None
        })
        return {
            "message": "Progress saved",
            "attempt_id": str(result.inserted_id),
            "savedAnswers": len(normalized_answers),
        }

    merged_answers = {**attempt.get("answers", {}), **normalized_answers}
    attempt_collection.update_one(
        {"_id": attempt["_id"]},
        {"$set": {
            "answers": merged_answers,
            "updatedAt": datetime.utcnow(),
        }}
    )
    return {
        "message": "Progress saved",
        "attempt_id": str(attempt["_id"]),
        "savedAnswers": len(merged_answers),
    }


def submit_quiz(user_id, quiz_id, answers):
    # Backward-compatible progress save. Older app builds used this endpoint
    # after each question, so it must not finalize the attempt.
    return save_quiz_progress(user_id, quiz_id, answers)


def complete_quiz(user_id, quiz_id, answers):
    questions = list(question_collection.find({"quizId": ObjectId(quiz_id)}))
    if not questions:
        return {"error": "No questions found"}

    score = 0
    snapshot = []
    normalized_answers = {}

    for index, question in enumerate(questions):
        question_id = str(question["_id"])
        correct_answer = question.get("correct_answer") or question.get("correctAnswer", "")
        user_answer = (
            answers.get(question_id)
            or answers.get(str(index))
            or answers.get(index)
        )

        snapshot.append({
            "questionId": question_id,
            "correctAnswer": correct_answer,
        })
        normalized_answers[question_id] = user_answer

        if user_answer and correct_answer and str(user_answer).strip() == str(correct_answer).strip():
            score += 1

    existing_attempt = attempt_collection.find_one({
        "userId": user_id,
        "quizId": ObjectId(quiz_id),
        "submittedAt": None
    })

    if existing_attempt:
        attempt_collection.update_one(
            {"_id": existing_attempt["_id"]},
            {"$set": {
                "questions": snapshot,
                "answers": normalized_answers,
                "score": score,
                "submittedAt": datetime.utcnow(),
            }}
        )
    else:
        attempt_collection.insert_one({
            "userId": user_id,
            "quizId": ObjectId(quiz_id),
            "questions": snapshot,
            "answers": normalized_answers,
            "score": score,
            "startTime": datetime.utcnow(),
            "submittedAt": datetime.utcnow(),
        })

    return {
        "score": score,
        "totalQuestions": len(questions),
    }


def get_attempt_summary(user_id):
    submitted_attempts = list(attempt_collection.find({
        "userId": user_id,
        "submittedAt": {"$ne": None}
    }))

    completed_quiz_ids = sorted({
        str(attempt["quizId"])
        for attempt in submitted_attempts
        if attempt.get("quizId")
    })

    best_score = None
    for attempt in submitted_attempts:
        total_questions = len(attempt.get("questions", []))
        if not total_questions:
            continue
        percent = round((attempt.get("score", 0) / total_questions) * 100)
        best_score = percent if best_score is None else max(best_score, percent)

    return {
        "completedCount": len(completed_quiz_ids),
        "completedQuizIds": completed_quiz_ids,
        "totalAttempts": len(submitted_attempts),
        "bestScore": best_score,
    }
