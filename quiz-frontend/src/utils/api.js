const BASE_URL = "http://127.0.0.1:8000";

export async function apiRequest(endpoint, method = "GET", body = null) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: body ? JSON.stringify(body) : null,
  });

  // 🔥 AUTO LOGOUT ON 401
  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    return;
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Something went wrong");
  }

  return data;
}


// ==========================
// ADMIN APIs
// ==========================

// 🔥 Get Students
export const getStudents = () => {
  return apiRequest("/admin/students");
};

// 🔥 Get Courses
export const getCourses = () => {
  return apiRequest("/admin/courses");
};

// 🔥 Create Quiz
export const createQuiz = (data) => {
  return apiRequest("/admin/quiz", "POST", data);
};

// 🔥 Add Question
export const addQuestion = (data) => {
  return apiRequest("/admin/question", "POST", data);
};


// ==========================
// QUIZ APIs (APP)
// ==========================

// 🔥 Get quizzes (paginated)
export const fetchQuizzes = () => {
  return apiRequest("/quiz");
};

// 🔥 Get quiz questions
export const fetchQuizQuestions = (quizId) => {
  return apiRequest(`/quiz/${quizId}/questions`);
};