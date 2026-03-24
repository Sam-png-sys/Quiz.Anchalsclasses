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
        return {"error": "Quiz already started"}

    questions = list(question_collection.find({"quizId": ObjectId(quiz_id)}))

    snapshot = [
        {
            "questionId": str(q["_id"]),
            "correctAnswer": q["correctAnswer"]
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

    attempt_collection.insert_one(attempt)

    return {"message": "Quiz started"}


def submit_quiz(user_id, quiz_id, answers):

    attempt = attempt_collection.find_one({
        "userId": user_id,
        "quizId": ObjectId(quiz_id),
        "submittedAt": None
    })

    if not attempt:
        return {"error": "No active attempt"}

    quiz = quiz_collection.find_one({"_id": ObjectId(quiz_id)})
    duration = quiz["duration"]

    elapsed = (datetime.utcnow() - attempt["startTime"]).total_seconds()

    if elapsed > duration * 60:
        return {"error": "Time exceeded"}

    score = 0

    for q in attempt["questions"]:
        qid = q["questionId"]

        if qid in answers and answers[qid] == q["correctAnswer"]:
            score += 1

    attempt_collection.update_one(
        {"_id": attempt["_id"]},
        {"$set": {
            "answers": answers,
            "score": score,
            "submittedAt": datetime.utcnow()
        }}
    )

    return {"score": score}