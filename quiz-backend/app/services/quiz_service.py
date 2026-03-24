from app.config.database import quiz_collection, question_collection
from app.utils.serializer import serialize
from bson import ObjectId


def get_quizzes(page: int = 1, limit: int = 10):
    skip = (page - 1) * limit

    quizzes = list(
        quiz_collection.find({}, {"title": 1, "duration": 1})
        .skip(skip)
        .limit(limit)
    )

    return [serialize(q) for q in quizzes]


def get_quiz_by_id(quiz_id: str):
    quiz = quiz_collection.find_one({"_id": ObjectId(quiz_id)})

    if not quiz:
        return {"error": "Quiz not found"}

    return serialize(quiz)


def get_quiz_questions(quiz_id: str):
    questions = list(
        question_collection.find(
            {"quizId": ObjectId(quiz_id)},
            {
                "questionText": 1,
                "options": 1
                # ❌ DO NOT SEND correctAnswer
            }
        )
    )

    return [serialize(q) for q in questions]