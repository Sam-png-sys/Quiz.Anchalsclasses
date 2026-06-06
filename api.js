import { API_BASE } from "./config";

export async function apiRequest(endpoint, method = "GET", body = null) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: body ? JSON.stringify(body) : null,
  });

  //  AUTO LOGOUT ON 401
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

const token =
  localStorage.getItem("token") ||
  sessionStorage.getItem("token");
// ==========================
// ADMIN APIs
// ==========================

//  Get Students
export const getStudents = () => {
  return apiRequest("/admin/students");
};

//  Get Courses
export const getCourses = () => {
  return apiRequest("/admin/courses");
};

//  Create Quiz
export const createQuiz = (data) => {
  return apiRequest("/admin/quiz", "POST", data);
};

//  Add Question
export const addQuestion = (data) => {
  return apiRequest("/admin/question", "POST", data);
};

// ==========================
// SUBJECT APIs
// ==========================

//  Get subjects for a course
export const getSubjects = (courseId) => {
  return apiRequest(`/admin/course/${courseId}/subjects`);
};

//  Create subject in a course
export const createSubject = (courseId, data) => {
  return apiRequest(`/admin/course/${courseId}/subject`, "POST", data);
};

//  Update subject
export const updateSubject = (subjectId, data) => {
  return apiRequest(`/admin/subject/${subjectId}`, "PUT", data);
};

//  Delete subject
export const deleteSubject = (subjectId) => {
  return apiRequest(`/admin/subject/${subjectId}`, "DELETE");
};


// ==========================
// QUIZ APIs (APP)
// ==========================

//  Get quizzes (paginated)
export const fetchQuizzes = () => {
  return apiRequest("/quiz");
};

//  Get quiz questions
export const fetchQuizQuestions = (quizId) => {
  return apiRequest(`/quiz/${quizId}/questions`);
};
