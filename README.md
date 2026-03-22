# Quiz Platform — Frontend

React + Tailwind frontend for the Quiz Platform.

## Project Structure

```
src/
├── api/
│   ├── axios.js          # Axios instance with JWT interceptors
│   └── services.js       # All API functions
├── components/
│   ├── layout/
│   │   ├── AppLayout.jsx     # Main layout wrapper
│   │   ├── Navbar.jsx        # Sidebar + mobile nav
│   │   └── ProtectedRoute.jsx
│   └── ui/
│       ├── Badge.jsx
│       ├── Button.jsx
│       ├── Card.jsx
│       ├── Input.jsx
│       └── Spinner.jsx
├── context/
│   ├── AuthContext.jsx   # User auth state
│   └── ThemeContext.jsx  # Dark/light mode
├── hooks/
│   └── useTimer.js       # Quiz countdown timer
├── pages/
│   ├── Login.jsx
│   ├── student/
│   │   ├── Home.jsx
│   │   ├── QuizSession.jsx
│   │   ├── Result.jsx
│   │   ├── Analytics.jsx
│   │   └── Leaderboard.jsx
│   └── admin/
│       ├── AdminDashboard.jsx
│       ├── AdminQuestions.jsx
│       ├── QuestionForm.jsx
│       ├── QuizForm.jsx
│       └── AdminStudents.jsx
├── styles/
│   └── index.css
├── utils/
│   └── helpers.js
├── App.jsx
└── main.jsx
```

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy env file
cp .env.example .env

# 3. Set your backend URL in .env
VITE_API_URL=http://localhost:5000/api

# 4. Run dev server
npm run dev
```

## Build for Production

```bash
npm run build
```

Deploy the `dist/` folder to Vercel.

## Routes

| Route | Access | Page |
|-------|--------|------|
| /login | Public | Login with OTP |
| /home | Student | Quiz listing |
| /quiz/:id | Student | Take quiz |
| /result/:id | Student | Quiz result |
| /analytics | Student | Performance analytics |
| /leaderboard | Student | Rankings |
| /admin | Admin | Dashboard |
| /admin/questions | Admin | Question bank |
| /admin/questions/new | Admin | Add question |
| /admin/quizzes/new | Admin | Create quiz |
| /admin/students | Admin | Manage access |

## Notes

- JWT token stored in localStorage
- Dark mode stored in localStorage
- All API calls go through `src/api/axios.js`
- 401 responses auto-redirect to /login
