"""
AI-IGOT Platform Configuration
"""
from functools import lru_cache
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings from environment variables."""

    # Database
    database_url: str
    database_host: str
    database_port: int
    database_name: str
    database_user: str
    database_password: str

    # Backend
    backend_url: str
    backend_port: int = 8000
    backend_host: str = "0.0.0.0"

    # Frontend
    frontend_url: str
    vite_api_url: str

    # OTP Configuration
    otp_provider: str = "development"  # twilio, msg91, firebase, development
    otp_expiry_minutes: int = 5
    otp_max_attempts: int = 3
    otp_length: int = 6
    otp_resend_delay_seconds: int = 30

    # Twilio
    twilio_account_sid: Optional[str] = None
    twilio_auth_token: Optional[str] = None
    twilio_phone_number: Optional[str] = None
    twilio_verify_service_sid: Optional[str] = None

    # MSG91
    msg91_api_key: Optional[str] = None
    msg91_sender_id: Optional[str] = None

    # Firebase
    firebase_project_id: Optional[str] = None
    firebase_private_key: Optional[str] = None
    firebase_client_email: Optional[str] = None

    # JWT & Authentication
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expiry_hours: int = 24
    refresh_token_expiry_days: int = 7

    # AI/LLM
    ai_provider: str = "fallback"  # openai, anthropic, google, fallback
    openai_api_key: Optional[str] = None
    openai_model: str = "gpt-4"
    openai_temperature: float = 0.7
    anthropic_api_key: Optional[str] = None
    anthropic_model: str = "claude-3-sonnet"
    google_ai_api_key: Optional[str] = None

    # File Upload
    max_file_size_mb: int = 50
    upload_dir: str = "uploads/materials"
    allowed_file_types: str = "pdf,docx,pptx,txt"
    pdf_extraction_service: str = "pdfplumber"

    # iGOT Integration
    igot_api_enabled: bool = False
    igot_api_key: Optional[str] = None
    igot_api_url: Optional[str] = None

    # Email Configuration
    smtp_server: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_username: Optional[str] = None
    smtp_password: Optional[str] = None
    smtp_from_email: str = "noreply@ai-igot.in"
    smtp_from_name: str = "AI-IGOT Platform"

    # Application Settings
    demo_mode: bool = True
    log_level: str = "INFO"
    environment: str = "development"  # development, staging, production

    # Security
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    rate_limit_requests: int = 100
    rate_limit_window_minutes: int = 1

    # Certificate Generation
    certificate_issuer_name: str = "Ministry of Statistics & Programme Implementation"
    certificate_organization: str = "Government of India"
    certificate_validity_years: int = 2

    # Notifications
    enable_email_notifications: bool = True
    enable_sms_notifications: bool = False
    notification_queue_type: str = "in_memory"  # in_memory, redis, celery

    # Feature Flags
    feature_otp_enabled: bool = True
    feature_ai_quiz: bool = True
    feature_file_upload: bool = True
    feature_certificates: bool = True
    feature_igot_integration: bool = False

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


# Create a settings instance
settings = get_settings()
