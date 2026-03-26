from pymongo import MongoClient
import os
import certifi
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

client = MongoClient(
    MONGO_URI,
    tlsCAFile=certifi.where()
)

db = client[DB_NAME]

users_collection = db["users"]
quiz_collection = db["quizzes"]
question_collection = db["questions"]
attempt_collection = db["attempts"]

# Indexes
users_collection.create_index(
    "phone",
    unique=True,
    sparse=True   
)
question_collection.create_index("quizId")
attempt_collection.create_index([("userId", 1), ("quizId", 1)])
attempt_collection.create_index("submittedAt")