from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import auth, profile, goals, advisor
from .config import get_settings
from .database import init_db


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="AI Financial Advisor",
        version="0.1.0",
    )

    origins = settings.backend_cors_origins
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth.router)
    app.include_router(profile.router)
    app.include_router(goals.router)
    app.include_router(advisor.router)

    @app.on_event("startup")
    def on_startup() -> None:
        init_db()

    @app.get("/health")
    def health_check() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()

