import { useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { apiRequest } from "../utils/api";

export default function CreateQuiz() {
  const [quiz, setQuiz] = useState({
    title: "",
    description: "",
    duration: "",
    tag: "BDS",
  });

  const [questions, setQuestions] = useState([
    {
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
    },
  ]);

  const [loading, setLoading] = useState(false);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", options: ["", "", "", ""], correctAnswer: 0 },
    ]);
  };

  const removeQuestion = (index) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const updateOption = (qIndex, optIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const handleSave = async () => {
    if (!quiz.title.trim()) return alert("Title required");

    setLoading(true);

    try {
      const res = await apiRequest("/admin/quiz", "POST", quiz);
      const quizId = res.quiz_id;

      for (let q of questions) {
        await apiRequest("/admin/question", "POST", {
          quizId,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
        });
      }

      alert("Quiz Created Successfully 🔥");

      setQuiz({ title: "", description: "", duration: "", tag: "BDS" });
      setQuestions([
        { question: "", options: ["", "", "", ""], correctAnswer: 0 },
      ]);

    } catch (err) {
      console.error(err);
      alert("Error creating quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#080810] text-white">
      <div className="flex-1 overflow-y-auto w-full">
        <div className="max-w-4xl mx-auto p-6 w-full">

        <h1 className="text-2xl font-bold mb-6">Create Quiz</h1>

        {/* QUIZ DETAILS */}
        <div className="bg-[#0c0c18] p-5 rounded-xl mb-6 space-y-4">
          <input
            placeholder="Quiz Title"
            value={quiz.title}
            onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
            className="w-full p-3 rounded bg-black/30"
          />

          <textarea
            placeholder="Description"
            value={quiz.description}
            onChange={(e) =>
              setQuiz({ ...quiz, description: e.target.value })
            }
            className="w-full p-3 rounded bg-black/30"
          />

          <div className="flex gap-4">
            <input
              placeholder="Duration (mins)"
              value={quiz.duration}
              onChange={(e) =>
                setQuiz({ ...quiz, duration: e.target.value })
              }
              className="flex-1 p-3 rounded bg-black/30"
            />

            <select
              value={quiz.tag}
              onChange={(e) => setQuiz({ ...quiz, tag: e.target.value })}
              className="flex-1 p-3 rounded bg-black/30"
            >
              <option>BDS</option>
              <option>MDS</option>
            </select>
          </div>
        </div>

        {/* QUESTIONS */}
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="bg-[#0c0c18] p-5 rounded-xl mb-5">

            <div className="flex justify-between mb-3">
              <h2 className="font-semibold">Question {qIndex + 1}</h2>

              {questions.length > 1 && (
                <button
                  onClick={() => removeQuestion(qIndex)}
                  className="text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <input
              placeholder="Enter question"
              value={q.question}
              onChange={(e) =>
                updateQuestion(qIndex, "question", e.target.value)
              }
              className="w-full p-3 rounded bg-black/30 mb-3"
            />

            {q.options.map((opt, optIndex) => (
              <div key={optIndex} className="flex items-center gap-2 mb-2">
                <input
                  type="radio"
                  checked={q.correctAnswer === optIndex}
                  onChange={() =>
                    updateQuestion(qIndex, "correctAnswer", optIndex)
                  }
                />

                <input
                  placeholder={`Option ${optIndex + 1}`}
                  value={opt}
                  onChange={(e) =>
                    updateOption(qIndex, optIndex, e.target.value)
                  }
                  className="flex-1 p-2 rounded bg-black/30"
                />
              </div>
            ))}
          </div>
        ))}

        {/* ADD QUESTION */}
        <button
          onClick={addQuestion}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 rounded mb-6"
        >
          <Plus size={16} /> Add Question
        </button>

        </div>
      </div>

      {/* 🔥 STICKY SAVE BUTTON */}
      <div className="flex-shrink-0 bg-[#080810] border-t border-white/10 p-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-green-500 py-3 rounded font-semibold"
        >
          <Save size={16} />
          {loading ? "Saving..." : "Save Quiz"}
        </button>
      </div>
    </div>
  );
}
