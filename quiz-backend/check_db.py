from pymongo import MongoClient
import os

client = MongoClient("mongodb://localhost:27017")
db = client.QuizDB # the connection string in .env says what db to use. I'll check it later if this fails.
try:
    print(db.list_collection_names())
    questions = list(db.questions.find({"imageUrl": {"$ne": None}}))
    print(f"Questions with image: {len(questions)}")
    for q in questions:
        print(q)
except Exception as e:
    print(e)
