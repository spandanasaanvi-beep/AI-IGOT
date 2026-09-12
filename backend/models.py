"""
SQLAlchemy database models for AI-IGOT Platform
"""
from datetime import datetime
from enum import Enum
from sqlalchemy import (
    Column, Integer, String, Float, Text, DateTime, Boolean,
    ForeignKey, JSON, Enum as SQLEnum, UniqueConstraint, Index
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


# ============================================
# ENUMS
# ============================================

class GenderEnum(str, Enum):
    """Gender options."""
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"


class ExperienceLevelEnum(str, Enum):
    """Experience levels."""
    ENTRY_LEVEL = "0-2"
    MID_LEVEL = "2-5"
    SENIOR_LEVEL = "5-10"
    EXPERT_LEVEL = "10+"


class CompetencyStatusEnum(str, Enum):
    """Competency achievement status."""
    ACHIEVED = "achieved"
    MEDIUM = "medium"
    HIGH_PRIORITY = "high_priority"


class LearningStatusEnum(str, Enum):
    """Learning module status."""
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class DifficultyLevelEnum(str, Enum):
    """Quiz difficulty levels."""
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class FileTypeEnum(str, Enum):
    """Allowed file types."""
    PDF = "pdf"
    DOCX = "docx"
    PPTX = "pptx"
    TXT = "txt"


# ============================================
# USER & AUTHENTICATION
# ============================================

class User(Base):
    """User account."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String(20), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=True, index=True)
    password_hash = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    assessments = relationship("Assessment", back_populates="user", cascade="all, delete-orphan")
    quiz_attempts = relationship("QuizAttempt", back_populates="user", cascade="all, delete-orphan")
    competency_scores = relationship("CompetencyScore", back_populates="user", cascade="all, delete-orphan")
    learning_progress = relationship("LearningProgress", back_populates="user", cascade="all, delete-orphan")
    uploaded_materials = relationship("UploadedMaterial", back_populates="user", cascade="all, delete-orphan")
    certificates = relationship("Certificate", back_populates="user", cascade="all, delete-orphan")
    contact_messages = relationship("ContactMessage", back_populates="user", cascade="all, delete-orphan")
    otp_logs = relationship("OTPLog", back_populates="user", cascade="all, delete-orphan")

    __table_args__ = (Index("idx_user_phone_active", "phone_number", "is_active"),)


class OTPLog(Base):
    """OTP request log for rate limiting and verification."""
    __tablename__ = "otp_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    phone_number = Column(String(20), nullable=False, index=True)
    otp_code = Column(String(10), nullable=False)
    attempt_count = Column(Integer, default=0)
    is_verified = Column(Boolean, default=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    user = relationship("User", back_populates="otp_logs")

    __table_args__ = (Index("idx_otp_phone_verified", "phone_number", "is_verified"),)


class UserProfile(Base):
    """User profile information."""
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    gender = Column(SQLEnum(GenderEnum), nullable=True)
    organization = Column(String(255), nullable=True)
    department = Column(String(255), nullable=True)
    current_role_id = Column(Integer, ForeignKey("roles.id"), nullable=True)
    experience_level = Column(SQLEnum(ExperienceLevelEnum), nullable=True)
    existing_skills = Column(JSON, default=list)  # List of skill names
    profile_complete = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="profile")
    current_role = relationship("Role", backref="user_profiles")


# ============================================
# ROLES & COMPETENCIES
# ============================================

class Role(Base):
    """Job roles."""
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    organization = Column(String(255), default="Government of India")
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    competencies = relationship("RoleCompetency", back_populates="role", cascade="all, delete-orphan")


class Competency(Base):
    """Competency definitions."""
    __tablename__ = "competencies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    category = Column(String(255), nullable=True)  # e.g., "Technical", "Soft Skills"
    is_mandatory = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    role_competencies = relationship("RoleCompetency", back_populates="competency")
    assessment_questions = relationship("AssessmentQuestion", back_populates="competency")


class RoleCompetency(Base):
    """Mapping of roles to required competencies."""
    __tablename__ = "role_competencies"

    id = Column(Integer, primary_key=True, index=True)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False, index=True)
    competency_id = Column(Integer, ForeignKey("competencies.id"), nullable=False, index=True)
    required_threshold = Column(Float, default=75.0)  # Percentage
    weightage = Column(Float, default=1.0)  # For weighted calculations
    is_mandatory = Column(Boolean, default=True)
    priority_level = Column(String(50), default="medium")  # low, medium, high
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    role = relationship("Role", back_populates="competencies")
    competency = relationship("Competency", back_populates="role_competencies")

    __table_args__ = (
        UniqueConstraint("role_id", "competency_id", name="unique_role_competency"),
    )


# ============================================
# ASSESSMENTS
# ============================================

class Assessment(Base):
    """Initial skill assessment."""
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    total_questions = Column(Integer, default=10)
    correct_answers = Column(Integer, default=0)
    score = Column(Float, default=0.0)  # Percentage
    status = Column(String(50), default="completed")  # started, in_progress, completed
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="assessments")
    answers = relationship("AssessmentAnswer", back_populates="assessment", cascade="all, delete-orphan")


class AssessmentQuestion(Base):
    """Assessment question bank."""
    __tablename__ = "assessment_questions"

    id = Column(Integer, primary_key=True, index=True)
    competency_id = Column(Integer, ForeignKey("competencies.id"), nullable=False, index=True)
    question_text = Column(Text, nullable=False)
    option_a = Column(String(500), nullable=False)
    option_b = Column(String(500), nullable=False)
    option_c = Column(String(500), nullable=False)
    option_d = Column(String(500), nullable=False)
    correct_answer = Column(String(1), nullable=False)  # A, B, C, D
    explanation = Column(Text, nullable=True)
    difficulty = Column(SQLEnum(DifficultyLevelEnum), default=DifficultyLevelEnum.MEDIUM)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    competency = relationship("Competency", back_populates="assessment_questions")


class AssessmentAnswer(Base):
    """User answers to assessment questions."""
    __tablename__ = "assessment_answers"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("assessment_questions.id"), nullable=False)
    user_answer = Column(String(1), nullable=False)  # A, B, C, D
    is_correct = Column(Boolean, default=False)
    time_spent_seconds = Column(Integer, default=0)

    # Relationships
    assessment = relationship("Assessment", back_populates="answers")


# ============================================
# COMPETENCY SCORES
# ============================================

class CompetencyScore(Base):
    """User's competency scores."""
    __tablename__ = "competency_scores"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    competency_id = Column(Integer, ForeignKey("competencies.id"), nullable=False, index=True)
    current_score = Column(Float, default=0.0)  # Percentage
    previous_score = Column(Float, default=0.0)  # For tracking improvement
    required_score = Column(Float, default=75.0)  # From role_competencies
    status = Column(String(50), default="not_started")  # Derived: achieved, medium, high_priority
    assessment_count = Column(Integer, default=0)
    last_assessment_date = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="competency_scores")

    __table_args__ = (
        UniqueConstraint("user_id", "competency_id", name="unique_user_competency"),
        Index("idx_user_competency_score", "user_id", "current_score"),
    )


# ============================================
# LEARNING
# ============================================

class LearningModule(Base):
    """Learning modules/courses."""
    __tablename__ = "learning_modules"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    competency_id = Column(Integer, ForeignKey("competencies.id"), nullable=False, index=True)
    content = Column(Text, nullable=True)  # URL or embedded content
    difficulty = Column(SQLEnum(DifficultyLevelEnum), default=DifficultyLevelEnum.MEDIUM)
    priority = Column(String(50), default="medium")  # low, medium, high
    estimated_duration_hours = Column(Float, default=1.0)
    learning_type = Column(String(50), default="course")  # course, video, article, interactive
    is_active = Column(Boolean, default=True, index=True)
    order = Column(Integer, default=0)  # For sorting
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    progress = relationship("LearningProgress", back_populates="module", cascade="all, delete-orphan")


class LearningProgress(Base):
    """User's learning progress."""
    __tablename__ = "learning_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    module_id = Column(Integer, ForeignKey("learning_modules.id"), nullable=False, index=True)
    status = Column(SQLEnum(LearningStatusEnum), default=LearningStatusEnum.NOT_STARTED)
    progress_percentage = Column(Float, default=0.0)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    time_spent_minutes = Column(Integer, default=0)
    is_recommended = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="learning_progress")
    module = relationship("LearningModule", back_populates="progress")

    __table_args__ = (
        UniqueConstraint("user_id", "module_id", name="unique_user_module"),
    )


# ============================================
# QUIZZES
# ============================================

class Quiz(Base):
    """Quiz definitions."""
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    generated_from_material_id = Column(Integer, ForeignKey("uploaded_materials.id"), nullable=True)
    difficulty = Column(SQLEnum(DifficultyLevelEnum), default=DifficultyLevelEnum.MEDIUM)
    passing_score = Column(Float, default=60.0)  # Percentage
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    questions = relationship("QuizQuestion", back_populates="quiz", cascade="all, delete-orphan")
    attempts = relationship("QuizAttempt", back_populates="quiz", cascade="all, delete-orphan")


class QuizQuestion(Base):
    """Quiz questions."""
    __tablename__ = "quiz_questions"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False, index=True)
    competency_id = Column(Integer, ForeignKey("competencies.id"), nullable=True)
    question_text = Column(Text, nullable=False)
    option_a = Column(String(500), nullable=False)
    option_b = Column(String(500), nullable=False)
    option_c = Column(String(500), nullable=False)
    option_d = Column(String(500), nullable=False)
    correct_answer = Column(String(1), nullable=False)  # A, B, C, D
    explanation = Column(Text, nullable=True)
    order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    quiz = relationship("Quiz", back_populates="questions")


class QuizAttempt(Base):
    """User's quiz attempts."""
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False, index=True)
    total_questions = Column(Integer, default=0)
    correct_answers = Column(Integer, default=0)
    score = Column(Float, default=0.0)  # Percentage
    passed = Column(Boolean, default=False)
    started_at = Column(DateTime, default=datetime.utcnow)
    submitted_at = Column(DateTime, nullable=True)
    time_spent_minutes = Column(Integer, default=0)

    # Relationships
    user = relationship("User", back_populates="quiz_attempts")
    quiz = relationship("Quiz", back_populates="attempts")
    answers = relationship("UserQuizAnswer", back_populates="attempt", cascade="all, delete-orphan")


class UserQuizAnswer(Base):
    """User answers to quiz questions."""
    __tablename__ = "user_quiz_answers"

    id = Column(Integer, primary_key=True, index=True)
    quiz_attempt_id = Column(Integer, ForeignKey("quiz_attempts.id"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("quiz_questions.id"), nullable=False)
    selected_answer = Column(String(1), nullable=True)  # A, B, C, D, None if skipped
    is_correct = Column(Boolean, default=False)
    time_spent_seconds = Column(Integer, default=0)

    # Relationships
    attempt = relationship("QuizAttempt", back_populates="answers")


# ============================================
# FILE UPLOADS
# ============================================

class UploadedMaterial(Base):
    """User uploaded learning materials."""
    __tablename__ = "uploaded_materials"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    filename = Column(String(500), nullable=False)
    file_type = Column(SQLEnum(FileTypeEnum), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    file_path = Column(String(500), nullable=False)
    extracted_text = Column(Text, nullable=True)
    processing_status = Column(String(50), default="pending")  # pending, processing, completed, failed
    identified_topics = Column(JSON, default=list)  # List of topics
    generated_quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow, index=True)
    processed_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="uploaded_materials")


# ============================================
# CERTIFICATES
# ============================================

class Certificate(Base):
    """Issued certificates."""
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    certificate_id = Column(String(50), unique=True, nullable=False, index=True)  # ACP-2026-XXXXXX
    certificate_pdf_path = Column(String(500), nullable=True)
    issue_date = Column(DateTime, default=datetime.utcnow)
    expiry_date = Column(DateTime, nullable=True)
    status = Column(String(50), default="active")  # active, expired, revoked
    verified_at = Column(DateTime, nullable=True)
    verification_count = Column(Integer, default=0)
    overall_competency_score = Column(Float, default=0.0)

    # Relationships
    user = relationship("User", back_populates="certificates")

    __table_args__ = (Index("idx_certificate_id", "certificate_id"),)


# ============================================
# RECOMMENDATIONS
# ============================================

class Recommendation(Base):
    """Learning recommendations."""
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    learning_module_id = Column(Integer, ForeignKey("learning_modules.id"), nullable=False)
    reason = Column(Text, nullable=True)  # Why it's recommended
    priority = Column(String(50), default="medium")
    is_accepted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)


# ============================================
# NOTIFICATIONS
# ============================================

class Notification(Base):
    """User notifications."""
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    notification_type = Column(String(50), nullable=False)  # assessment_completed, learning_recommended, etc.
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    related_entity_id = Column(Integer, nullable=True)  # For linking to assessments, quizzes, etc.
    is_read = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)


# ============================================
# CONTACT MESSAGES
# ============================================

class ContactMessage(Base):
    """Contact form submissions."""
    __tablename__ = "contact_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    subject = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(50), default="open")  # open, in_progress, resolved, closed
    response = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    resolved_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="contact_messages")
