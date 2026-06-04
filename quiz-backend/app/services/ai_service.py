import base64
import json
import os

from fastapi import HTTPException
from openai import OpenAI


AI_MODEL = os.getenv("OPENAI_MODEL", "gpt-5-mini")


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
    if not text:
        raise HTTPException(status_code=502, detail="AI returned an empty response")
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

    question_count = max(1, min(int(quiz_meta.get("questionCount", 10)), 30))
    difficulty = quiz_meta.get("difficulty") or "medium"
    duration = max(1, int(quiz_meta.get("duration") or 30))

    prompt = f"""
Create a student quiz only from the attached PDF.

Quiz settings:
- title: {quiz_meta.get("title") or "AI Generated Quiz"}
- description: {quiz_meta.get("description") or ""}
- course/topic: {quiz_meta.get("course") or ""}
- difficulty: {difficulty}
- number of questions: {question_count}
- duration in minutes: {duration}

Rules:
- Use only facts supported by the PDF.
- Do not invent facts outside the PDF.
- If the PDF already contains explicit multiple-choice questions, answers, answer keys, model papers, solved papers, or question banks, EXTRACT those questions and answers first instead of rewriting them.
- If the PDF contains an answer key separate from the questions, match the answers carefully.
- Preserve original question wording as closely as possible when extracting existing questions from the PDF.
- Only generate new questions when the PDF does not already contain enough usable questions.
- Every question must have exactly 4 options.
- correct_answer must exactly match one option string.
- explanation must teach why the answer is correct in 2-4 clear sentences and must stay grounded in the PDF content.
- Ignore headers, footers, page numbers, watermarks, duplicate questions, and incomplete fragments.
- Prefer the most complete and clearly supported questions from the PDF.
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
                        "file_data": file_data,
                    },
                    {"type": "input_text", "text": prompt},
                ],
            }
        ],
        text={"format": {"type": "json_object"}},
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
        "duration": int(data.get("duration") or duration),
        "questions": clean_questions,
    }


def explain_like_teacher(topic_context, question_context, user_message):
    client = get_openai_client()

    prompt = f"""
You are a strict AI teacher inside a quiz app.

Allowed topic context:
{topic_context}

Current question context:
{question_context}

Student message:
{user_message}

Rules:
- You must answer ONLY when the student message is directly related to the current quiz question, its answer, its explanation, or the exact course/topic context above.
- If the student message asks about anything outside this question or outside this quiz topic/course, refuse.
- Refusal response must be exactly:
  "I can only help with this quiz question and its topic."
- Do not answer broader study questions, career questions, personal advice, general knowledge, medical advice, legal advice, or anything unrelated to the current question/topic.
- Do not guess beyond the provided topic context and question context.
- Keep the explanation tightly focused on the current question.
- Explain simply, like a teacher, with short examples only when they are directly relevant to this question.
- Keep the answer under 180 words.
"""

    response = client.responses.create(
        model=AI_MODEL,
        input=[{"role": "user", "content": [{"type": "input_text", "text": prompt}]}],
    )
    return get_response_text(response)
