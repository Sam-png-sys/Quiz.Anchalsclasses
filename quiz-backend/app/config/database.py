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