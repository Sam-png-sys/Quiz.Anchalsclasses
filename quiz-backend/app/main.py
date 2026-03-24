from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.auth_routes import router as auth_router
from app.routes.quiz_routes import router as quiz_router
from app.routes.attempt_routes import router as attempt_router
from app.routes.admin_routes import router as admin_router

app = FastAPI(
    title="Quiz Platform API",
    description="Backend for Dr. Anchal’s Classes",
    version="1.0.0"
)

#  CORS 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#  Routes
app.include_router(auth_router)
app.include_router(quiz_router)
app.include_router(attempt_router)
app.include_router(admin_router)


@app.get("/")
def root():
    return {
        "message": "Quiz Backend Running 🚀",
        "status": "healthy"
    }