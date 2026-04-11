import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.routes.auth_routes import router as auth_router
from app.routes.quiz_routes import router as quiz_router
from app.routes.attempt_routes import router as attempt_router
from app.routes.admin_routes import router as admin_router

load_dotenv()

app = FastAPI(
    title="Quiz Platform API",
    description="Backend for Dr. Anchal's Classes",
    version="1.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# Set ALLOWED_ORIGINS in your host environment variables.
# Example: ALLOWED_ORIGINS=https://yourapp.com,https://admin.yourapp.com
# Falls back to "*" only if not set (development only).

_origins_env = os.getenv("ALLOWED_ORIGINS", "")
ALLOWED_ORIGINS = (
    [o.strip() for o in _origins_env.split(",") if o.strip()]
    if _origins_env
    else ["*"]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────

app.include_router(auth_router)
app.include_router(quiz_router)
app.include_router(attempt_router)
app.include_router(admin_router)


# ── Health check ──────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {
        "message": "Quiz Backend Running",
        "status": "healthy",
    }