import base64
import json
import os

from fastapi import HTTPException
from openai import OpenAI


AI_MODEL = os.getenv("OPENAI_MODEL", "gpt-5.4-mini")


def get_openai_client():
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY is not configured")
    return OpenAI()


def get_response_text(response):
    text = getattr(response, "output_text", None)
    if text:
        return text

    chunks = []
    for item in getattr(response, "output", []) or []:
        for content in getattr(item, "content", []) or []:
            content_text = getattr(content, "text", None)
            if content_text:
                chunks.append(content_text)
    return "\n".join(chunks).strip()


def parse_json_response(response):
    text = get_response_text(response)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            return json.loads(text[start:end + 1])
        raise HTTPException(status_code=502, detail="AI returned invalid JSON")


def generate_quiz_from_pdf(pdf_bytes, filename, quiz_meta):
    client = get_openai_client()
    file_data = base64.b64encode(pdf_bytes).decode("utf-8")

    question_count = int(quiz_meta.get("questionCount", 10))
    difficulty = quiz_meta.get("difficulty") or "medium"

    prompt = f"""
Create a student quiz only from the attached PDF.

Quiz settings:
- title: {quiz_meta.get("title") or "AI Generated Quiz"}
- description: {quiz_meta.get("description") or ""}
- course/topic: {quiz_meta.get("course") or ""}
- difficulty: {difficulty}
- number of questions: {question_count}

Rules:
- Use only facts supported by the PDF.
- Do not invent facts outside the PDF.
- Every question must have exactly 4 options.
- correct_answer must exactly match one option string.
- explanation must teach why the answer is correct in 2-4 clear sentences.
- Return JSON only. No markdown.

JSON shape:
{{
  "title": "string",
  "description": "string",
  "course": "string",
  "difficulty": "easy|medium|hard",
  "duration": 30,
  "questions": [
    {{
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correct_answer": "string",
      "explanation": "string"
    }}
  ]
}}
"""

    response = client.responses.create(
        model=AI_MODEL,
        input=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "input_file",
                        "filename": filename,
                        "file_data": f"data:application/pdf;base64,{file_data}",
                    },
                    {"type": "input_text", "text": prompt},
                ],
            }
        ],
    )

    data = parse_json_response(response)
    questions = data.get("questions", [])
    if not questions:
        raise HTTPException(status_code=502, detail="AI did not generate questions")

    clean_questions = []
    for item in questions[:question_count]:
        options = [str(option).strip() for option in item.get("options", []) if str(option).strip()]
        if len(options) != 4:
            continue
        correct_answer = str(item.get("correct_answer", "")).strip()
        if correct_answer not in options:
            correct_answer = options[0]
        clean_questions.append({
            "question": str(item.get("question", "")).strip(),
            "options": options,
            "correct_answer": correct_answer,
            "explanation": str(item.get("explanation", "")).strip(),
        })

    if not clean_questions:
        raise HTTPException(status_code=502, detail="AI generated unusable questions")

    return {
        "title": data.get("title") or quiz_meta.get("title") or "AI Generated Quiz",
        "description": data.get("description") or quiz_meta.get("description") or "",
        "course": data.get("course") or quiz_meta.get("course") or "",
        "difficulty": data.get("difficulty") or difficulty,
        "duration": int(data.get("duration") or quiz_meta.get("duration") or 30),
        "questions": clean_questions,
    }


def explain_like_teacher(topic_context, question_context, user_message):
    client = get_openai_client()

    prompt = f"""
You are a helpful teacher inside a quiz app.

Allowed topic context:
{topic_context}

Current question context:
{question_context}

Student message:
{user_message}

Rules:
- Answer only if the student message is related to the allowed topic or current question.
- If the message is outside the topic, politely say you can only help with this quiz topic.
- Explain simply, like a teacher, with short examples when useful.
- Do not give unrelated medical, legal, personal, or general advice.
- Keep the answer under 180 words.
"""

    response = client.responses.create(
        model=AI_MODEL,
        input=[{"role": "user", "content": [{"type": "input_text", "text": prompt}]}],
    )
    return get_response_text(response)
