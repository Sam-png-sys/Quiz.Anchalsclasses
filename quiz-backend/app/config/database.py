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
course_collection = db["courses"]
quiz_collection = db["quizzes"]
question_collection = db["questions"]
attempt_collection = db["attempts"]

# Indexes
users_collection.create_index("email", unique=True)
users_collection.create_index(
    "phone",
    unique=True,
    sparse=True   
)
question_collection.create_index("quizId")
attempt_collection.create_index([("userId", 1), ("quizId", 1)])
attempt_collection.create_index("submittedAt")

activity_collection = db["activities"]
otp_collection = db["otp_store"]
temp_user_collection = db["temp_users"]
login_session_collection = db["login_sessions"]
