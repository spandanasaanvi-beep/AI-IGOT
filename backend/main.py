"""
AI-IGOT Platform Backend
FastAPI Application
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime

from .config import settings
from .database import init_db

# Configure logging
logging.basicConfig(level=settings.log_level)
logger = logging.getLogger(__name__)


# ============================================
# LIFESPAN EVENTS
# ============================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # Startup
    logger.info("🚀 Starting AI-IGOT Platform Backend")
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"Demo Mode: {settings.demo_mode}")
    logger.info(f"OTP Provider: {settings.otp_provider}")
    logger.info(f"AI Provider: {settings.ai_provider}")
    
    # Initialize database
    try:
        init_db()
        logger.info("✓ Database initialized")
    except Exception as e:
        logger.error(f"✗ Database initialization failed: {e}")
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down AI-IGOT Platform Backend")


# ============================================
# CREATE FASTAPI APP
# ============================================

app = FastAPI(
    title="AI-IGOT Platform API",
    description="Production-ready AI-powered Competency & Learning Platform for India's Official Statistical System",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)


# ============================================
# MIDDLEWARE
# ============================================

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trusted Host
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "*.gov.in"],
)


# ============================================
# ROUTES
# ============================================

# Health check
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "environment": settings.environment,
        "demo_mode": settings.demo_mode,
    }


@app.get("/api/info", tags=["Info"])
async def api_info():
    """API information."""
    return {
        "name": "AI-IGOT Platform API",
        "version": "1.0.0",
        "environment": settings.environment,
        "features": {
            "otp": settings.feature_otp_enabled,
            "ai_quiz": settings.feature_ai_quiz,
            "file_upload": settings.feature_file_upload,
            "certificates": settings.feature_certificates,
            "igot_integration": settings.feature_igot_integration,
        },
    }


# ============================================
# ERROR HANDLERS
# ============================================

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions."""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "detail": str(exc) if settings.environment == "development" else "An error occurred",
        },
    )


# ============================================
# API ROUTERS (TO BE CREATED)
# ============================================

# Auth routes
from .routers import auth
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])

# User routes
from .routers import users
app.include_router(users.router, prefix="/api/users", tags=["Users"])

# Assessment routes
from .routers import assessments
app.include_router(assessments.router, prefix="/api/assessment", tags=["Assessment"])

# Quiz routes
from .routers import quizzes
app.include_router(quizzes.router, prefix="/api/quiz", tags=["Quiz"])

# Learning routes
from .routers import learning
app.include_router(learning.router, prefix="/api/learning", tags=["Learning"])

# Competency routes
from .routers import competencies
app.include_router(competencies.router, prefix="/api/competencies", tags=["Competencies"])

# File upload routes
from .routers import uploads
app.include_router(uploads.router, prefix="/api/materials", tags=["Materials"])

# Report routes
from .routers import reports
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])

# Certificate routes
from .routers import certificates
app.include_router(certificates.router, prefix="/api/certificate", tags=["Certificates"])

# Contact routes
from .routers import contact
app.include_router(contact.router, prefix="/api/contact", tags=["Contact"])

# Dashboard routes
from .routers import dashboard
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])

# iGOT integration routes
from .routers import igot
app.include_router(igot.router, prefix="/api/igot", tags=["iGOT Integration"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.backend_host,
        port=settings.backend_port,
        reload=settings.environment == "development",
        log_level=settings.log_level.lower(),
    )
