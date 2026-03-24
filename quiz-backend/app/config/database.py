from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))
db = client[os.getenv("DB_NAME")]

users_collection = db["users"]
quiz_collection = db["quizzes"]
question_collection = db["questions"]
attempt_collection = db["attempts"]

# Indexes
users_collection.create_index("email", unique=True)
question_collection.create_index("quizId")
attempt_collection.create_index([("userId", 1), ("quizId", 1)])
attempt_collection.create_index("submittedAt")