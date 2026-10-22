from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.app.config import settings
from backend.app.database import init_db
from backend.app.seed import seed_database
from backend.app.routers import (
    auth,
    guidelines,
    submissions,
    analysis,
    reviews,
    analytics,
    audit,
    visual
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables are created and demo data is seeded
    await init_db()
    await seed_database()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="PLUMB: Pre-Publication Brand Governance & Content Compliance Platform. Sits between Draft and Review.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for frontend Vite dev server and production deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(auth.router)
app.include_router(guidelines.router)
app.include_router(submissions.router)
app.include_router(analysis.router)
app.include_router(reviews.router)
app.include_router(analytics.router)
app.include_router(audit.router)
app.include_router(visual.router)

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "app": "PLUMB",
        "tagline": "Every Detail. On Brand.",
        "demo_mode": settings.DEMO_MODE,
        "version": settings.VERSION
    }
