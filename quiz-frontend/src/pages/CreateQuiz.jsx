import { useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Trash2 } from "lucide-react";

export default function CreateQuiz() {

  const token = localStorage.getItem("token");

  const [quiz, setQuiz] = useState({
    title: "",
    description: "",
    duration: "",
  });

  const [questions, setQuestions] = useState([
    {
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
    },
  ]);

  const [loading, setLoading] = useState(false);

  // 🔥 HANDLE INPUT CHANGE
  const handleQuizChange = (field, value) => {
    setQuiz({ ...quiz, [field]: value });
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  // 🔥 ADD / REMOVE QUESTION
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        explanation: "",
      },
    ]);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  // 🔥 VALIDATION
  const validate = () => {
    if (!quiz.title || !quiz.duration) {
      alert("Title and duration required");
      return false;
    }

    for (let q of questions) {
      if (!q.questionText) return false;
      if (q.options.some((o) => !o)) return false;
    }

    return true;
  };

  // 🔥 SUBMIT
  const handleSubmit = async () => {
    if (!validate()) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ CREATE QUIZ
      const quizRes = await fetch("http://127.0.0.1:8000/admin/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: quiz.title,
          description: quiz.description,
          duration: Number(quiz.duration),
          totalQuestions: questions.length,
        }),
      });

      const quizData = await quizRes.json();

      if (!quizRes.ok) {
        alert(quizData.detail || "Quiz creation failed");
        return;
      }

      const quizId = quizData.quiz_id;

      // 2️⃣ ADD QUESTIONS
      for (let q of questions) {
        await fetch("http://127.0.0.1:8000/admin/question", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            quizId,
            questionText: q.questionText,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
          }),
        });
      }

      alert("Quiz created successfully 🚀");

      // RESET FORM
      setQuiz({ title: "", description: "", duration: "" });
      setQuestions([
        {
          questionText: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
          explanation: "",
        },
      ]);

    } catch (err) {
      console.error(err);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 text-white bg-[#0B0F1A] min-h-screen">

      <h1 className="text-3xl font-semibold mb-6">Create Quiz</h1>

      {/* QUIZ DETAILS */}
      <div className="bg-[#111827] p-6 rounded-xl border border-gray-800 mb-8">

        <input
          placeholder="Quiz Title"
          value={quiz.title}
          onChange={(e) => handleQuizChange("title", e.target.value)}
          className="w-full p-3 mb-4 bg-[#0B0F1A] border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400"
        />

        <textarea
          placeholder="Description"
          value={quiz.description}
          onChange={(e) => handleQuizChange("description", e.target.value)}
          className="w-full p-3 mb-4 bg-[#0B0F1A] border border-gray-700 rounded-lg"
        />

        <input
          placeholder="Duration (minutes)"
          type="number"
          value={quiz.duration}
          onChange={(e) => handleQuizChange("duration", e.target.value)}
          className="w-full p-3 bg-[#0B0F1A] border border-gray-700 rounded-lg"
        />
      </div>

      {/* QUESTIONS */}
      {questions.map((q, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111827] p-6 rounded-xl border border-gray-800 mb-6"
        >
          <div className="flex justify-between mb-4">
            <h2>Question {index + 1}</h2>

            {questions.length > 1 && (
              <Trash2
                className="cursor-pointer text-red-400"
                onClick={() => removeQuestion(index)}
              />
            )}
          </div>

          <input
            placeholder="Question Text"
            value={q.questionText}
            onChange={(e) =>
              handleQuestionChange(index, "questionText", e.target.value)
            }
            className="w-full p-3 mb-4 bg-[#0B0F1A] border border-gray-700 rounded-lg"
          />

          {q.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-3 mb-3">
              <input
                type="radio"
                checked={q.correctAnswer === i}
                onChange={() =>
                  handleQuestionChange(index, "correctAnswer", i)
                }
              />

              <input
                placeholder={`Option ${i + 1}`}
                value={opt}
                onChange={(e) =>
                  handleOptionChange(index, i, e.target.value)
                }
                className="w-full p-2 bg-[#0B0F1A] border border-gray-700 rounded-lg"
              />
            </div>
          ))}

          <textarea
            placeholder="Explanation"
            value={q.explanation}
            onChange={(e) =>
              handleQuestionChange(index, "explanation", e.target.value)
            }
            className="w-full p-3 mt-3 bg-[#0B0F1A] border border-gray-700 rounded-lg"
          />
        </motion.div>
      ))}

      {/* ADD QUESTION */}
      <button
        onClick={addQuestion}
        className="flex items-center gap-2 px-4 py-2 bg-cyan-500 rounded-lg mb-6 hover:bg-cyan-600"
      >
        <PlusCircle size={18} />
        Add Question
      </button>

      {/* SUBMIT */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:opacity-90"
      >
        {loading ? "Creating..." : "Create Quiz"}
      </button>

    </div>
  );
}