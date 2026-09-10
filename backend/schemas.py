"""
Pydantic schemas for request/response validation
"""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field


# ============================================
# AUTH & OTP SCHEMAS
# ============================================

class OTPRequestSchema(BaseModel):
    """Request OTP for phone number."""
    phone_number: str = Field(..., min_length=10, max_length=20)


class OTPVerifySchema(BaseModel):
    """Verify OTP and create account."""
    phone_number: str
    otp_code: str = Field(..., min_length=4, max_length=10)
    full_name: str


class TokenSchema(BaseModel):
    """JWT token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserLoginSchema(BaseModel):
    """User login (alternative to OTP)."""
    phone_number: str
    password: str


# ============================================
# USER & PROFILE SCHEMAS
# ============================================

class UserProfileCreateSchema(BaseModel):
    """Create user profile after OTP verification."""
    gender: Optional[str] = None
    organization: Optional[str] = None
    department: Optional[str] = None
    current_role_id: int
    experience_level: str
    existing_skills: List[str] = []


class UserProfileUpdateSchema(BaseModel):
    """Update user profile."""
    organization: Optional[str] = None
    department: Optional[str] = None
    current_role_id: Optional[int] = None
    experience_level: Optional[str] = None
    existing_skills: Optional[List[str]] = None


class UserProfileResponseSchema(BaseModel):
    """User profile response."""
    user_id: int
    full_name: str
    phone_number: str
    gender: Optional[str]
    organization: Optional[str]
    department: Optional[str]
    current_role_id: Optional[int]
    experience_level: Optional[str]
    existing_skills: List[str]
    profile_complete: bool

    class Config:
        from_attributes = True


# ============================================
# ROLE & COMPETENCY SCHEMAS
# ============================================

class CompetencySchema(BaseModel):
    """Competency information."""
    id: int
    name: str
    description: Optional[str]
    category: Optional[str]

    class Config:
        from_attributes = True


class RoleCompetencySchema(BaseModel):
    """Role competency mapping."""
    competency: CompetencySchema
    required_threshold: float
    priority_level: str

    class Config:
        from_attributes = True


class RoleSchema(BaseModel):
    """Role information."""
    id: int
    name: str
    description: Optional[str]
    competencies: List[RoleCompetencySchema] = []

    class Config:
        from_attributes = True


# ============================================
# ASSESSMENT SCHEMAS
# ============================================

class AssessmentQuestionSchema(BaseModel):
    """Assessment question."""
    id: int
    question_text: str
    options: List[str]
    competency: str

    class Config:
        from_attributes = True


class AssessmentSubmitAnswerSchema(BaseModel):
    """Submit answer to assessment question."""
    question_id: int
    selected_answer: str  # A, B, C, D


class AssessmentSubmitSchema(BaseModel):
    """Submit complete assessment."""
    role_id: int
    answers: List[AssessmentSubmitAnswerSchema]


class AssessmentResultSchema(BaseModel):
    """Assessment result."""
    assessment_id: int
    total_questions: int
    correct_answers: int
    score: float
    competency_scores: dict  # {"competency_name": percentage}
    completed_at: datetime

    class Config:
        from_attributes = True


# ============================================
# COMPETENCY SCORE SCHEMAS
# ============================================

class CompetencyScoreDetailSchema(BaseModel):
    """Detailed competency score."""
    competency_name: str
    current_score: float
    required_score: float
    previous_score: float
    gap: float
    status: str  # achieved, medium, high_priority
    last_assessment_date: Optional[datetime]

    class Config:
        from_attributes = True


class CompetencyGapResponseSchema(BaseModel):
    """Competency gap analysis."""
    role_name: str
    overall_readiness: float  # Percentage
    competencies: List[CompetencyScoreDetailSchema]
    highest_gap: Optional[CompetencyScoreDetailSchema]
    ai_insight: str  # AI-generated insight

    class Config:
        from_attributes = True


# ============================================
# LEARNING SCHEMAS
# ============================================

class LearningModuleSchema(BaseModel):
    """Learning module."""
    id: int
    title: str
    description: Optional[str]
    competency_id: int
    competency_name: str
    difficulty: str
    priority: str
    estimated_duration_hours: float
    learning_type: str
    progress_percentage: Optional[float] = 0
    status: Optional[str] = "not_started"

    class Config:
        from_attributes = True


class LearningPathResponseSchema(BaseModel):
    """Recommended learning path."""
    total_modules: int
    total_duration_hours: float
    modules: List[LearningModuleSchema]
    priority_modules: List[LearningModuleSchema]  # High priority first


# ============================================
# QUIZ SCHEMAS
# ============================================

class QuizQuestionResponseSchema(BaseModel):
    """Quiz question for answering."""
    id: int
    question_text: str
    options: List[str]
    question_number: int
    total_questions: int

    class Config:
        from_attributes = True


class QuizConfigSchema(BaseModel):
    """Quiz configuration."""
    number_of_questions: int = 10
    difficulty: str = "medium"


class QuizStartResponseSchema(BaseModel):
    """Start quiz response."""
    quiz_id: int
    quiz_attempt_id: int
    total_questions: int
    current_question: QuizQuestionResponseSchema


class SubmitQuizAnswerSchema(BaseModel):
    """Submit answer to quiz question."""
    question_id: int
    selected_answer: Optional[str]  # A, B, C, D, or None if skipped


class QuizSubmitSchema(BaseModel):
    """Submit complete quiz."""
    quiz_attempt_id: int
    answers: List[SubmitQuizAnswerSchema]


class QuizResultSchema(BaseModel):
    """Quiz result."""
    quiz_attempt_id: int
    quiz_title: str
    total_questions: int
    correct_answers: int
    score: float  # Percentage
    passed: bool
    time_spent_minutes: int
    competency_performance: dict  # {"competency": percentage}
    ai_insight: str  # AI analysis of performance
    submitted_at: datetime

    class Config:
        from_attributes = True


class QuizHistorySchema(BaseModel):
    """Quiz attempt history."""
    quiz_attempt_id: int
    quiz_title: str
    score: float
    percentage: float
    attempt_date: datetime
    passed: bool


# ============================================
# BEFORE/AFTER COMPARISON SCHEMAS
# ============================================

class CompetencyComparisonSchema(BaseModel):
    """Before/After competency comparison."""
    competency_name: str
    before_score: float
    after_score: float
    improvement: float
    improvement_percentage: float


class ProgressReportSchema(BaseModel):
    """Overall progress report."""
    role_name: str
    initial_assessment_score: float
    current_overall_readiness: float
    improvement: float
    competency_comparisons: List[CompetencyComparisonSchema]
    learning_completed_count: int
    quizzes_taken: int
    total_time_spent_hours: float


# ============================================
# FILE UPLOAD SCHEMAS
# ============================================

class FileUploadResponseSchema(BaseModel):
    """File upload response."""
    material_id: int
    filename: str
    file_type: str
    file_size_bytes: int
    processing_status: str
    uploaded_at: datetime


class MaterialProcessingStatusSchema(BaseModel):
    """Material processing status."""
    material_id: int
    processing_status: str  # pending, processing, completed, failed
    extracted_text: Optional[str]
    identified_topics: List[str]
    generated_quiz_id: Optional[int]
    completed_at: Optional[datetime]


# ============================================
# CERTIFICATE SCHEMAS
# ============================================

class CertificateResponseSchema(BaseModel):
    """Certificate response."""
    certificate_id: str
    user_name: str
    role: str
    organization: str
    issue_date: datetime
    overall_competency_score: float
    status: str
    pdf_url: Optional[str]

    class Config:
        from_attributes = True


class CertificateVerificationSchema(BaseModel):
    """Certificate verification."""
    certificate_id: str
    user_name: str
    role: str
    organization: str
    issue_date: datetime
    status: str
    is_valid: bool


# ============================================
# DASHBOARD SCHEMAS
# ============================================

class DashboardStatsSchema(BaseModel):
    """Dashboard statistics."""
    role_readiness: float  # 0-100%
    competencies_achieved: int
    competencies_total: int
    learning_resources_count: int
    assessments_taken: int
    quizzes_taken: int


class RecentActivitySchema(BaseModel):
    """Recent activity item."""
    activity_type: str  # assessment, quiz, learning, certificate
    title: str
    description: Optional[str]
    score: Optional[float]
    timestamp: datetime


class DashboardResponseSchema(BaseModel):
    """Complete dashboard response."""
    stats: DashboardStatsSchema
    competency_scores: List[CompetencyScoreDetailSchema]
    recent_activities: List[RecentActivitySchema]
    recommendations: List[LearningModuleSchema]
    role_readiness_message: str


# ============================================
# NOTIFICATION SCHEMAS
# ============================================

class NotificationSchema(BaseModel):
    """Notification."""
    id: int
    notification_type: str
    title: str
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================
# CONTACT SCHEMAS
# ============================================

class ContactMessageSchema(BaseModel):
    """Contact form submission."""
    name: str
    email: str
    subject: str
    message: str


class ContactTeamInfoSchema(BaseModel):
    """Contact team information."""
    name: str
    phone: str
    email: str
    address: str


# ============================================
# REPORT SCHEMAS
# ============================================

class QuizResultReportSchema(BaseModel):
    """Quiz result report for PDF download."""
    quiz_title: str
    user_name: str
    role: str
    quiz_date: datetime
    total_questions: int
    correct_answers: int
    score: float
    competency_performance: dict
    questions_with_answers: List[dict]
    learning_insights: str


class FullReportSchema(BaseModel):
    """Complete learning journey report."""
    user_name: str
    organization: str
    role: str
    report_generated_date: datetime
    initial_assessment_score: float
    initial_competency_scores: dict
    current_competency_scores: dict
    competency_gaps: List[CompetencyScoreDetailSchema]
    learning_completed: List[str]
    quiz_attempts: List[QuizResultSchema]
    before_after_comparison: List[CompetencyComparisonSchema]
    overall_role_readiness: float
    estimated_completion_date: Optional[datetime]


# ============================================
# iGOT INTEGRATION SCHEMAS
# ============================================

class IGOTResourceSchema(BaseModel):
    """iGOT Karmayogi resource."""
    id: str
    title: str
    organization: str
    competency: str
    duration_hours: float
    certificated: bool
    source: str = "iGOT Karmayogi"


# ============================================
# ERROR SCHEMAS
# ============================================

class ErrorResponseSchema(BaseModel):
    """Error response."""
    error: str
    detail: Optional[str]
    code: Optional[str]
