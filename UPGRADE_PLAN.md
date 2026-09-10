# 🚀 AI-IGOT PRODUCTION UPGRADE PLAN

## ✅ Completed Phases

### Phase 1: Backend Infrastructure ✓
- [x] FastAPI application structure
- [x] PostgreSQL database models (26 tables)
- [x] Pydantic schemas for validation
- [x] Environment configuration (.env.example)
- [x] Database connection & ORM setup
- [x] Authentication & JWT system
- [x] OTP Service (Twilio, MSG91, Firebase, Demo mode)

### Phase 2: API Routes (IN PROGRESS)
- [x] Auth routes (OTP, registration, token refresh)
- [ ] User profile routes
- [ ] Skill assessment routes
- [ ] Quiz routes
- [ ] Learning path routes
- [ ] Competency analysis routes
- [ ] File upload routes
- [ ] Report generation routes
- [ ] Certificate routes
- [ ] Dashboard routes
- [ ] Contact routes
- [ ] iGOT integration routes

### Phase 3: Frontend Integration (PENDING)
- [ ] Remove mock data from React
- [ ] Connect to backend APIs
- [ ] Implement real-time state sync
- [ ] Add error handling
- [ ] Loading states & notifications
- [ ] Session management

### Phase 4: Advanced Features (PENDING)
- [ ] AI Quiz Generation (LLM integration)
- [ ] Document processing (PDF text extraction)
- [ ] Certificate PDF generation
- [ ] Competency calculation engine
- [ ] Notification system
- [ ] Learning recommendations engine

### Phase 5: Testing & Deployment (PENDING)
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Database migrations
- [ ] Production deployment

---

## 📋 Technology Stack

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- React Router
- Recharts (visualization)
- Vite (build tool)

### Backend
- FastAPI (Python 3.10+)
- SQLAlchemy ORM
- Pydantic validation
- Python-jose (JWT)

### Database
- PostgreSQL (production)
- SQLite (development/demo)

### External Services
- Twilio (SMS OTP)
- MSG91 (SMS OTP alternative)
- Firebase (Phone auth alternative)
- OpenAI/Claude (AI quiz generation)
- AWS S3 (optional file storage)

---

## 🔧 Local Development Setup

### 1. Clone Repository
```bash
cd ~/projects/AI-IGOT
```

### 2. Create Python Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Backend Dependencies
```bash
pip install -r backend/requirements.txt
```

### 4. Configure Environment Variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

For development/demo mode (minimal config):
```bash
DEMO_MODE=true
OTP_PROVIDER=development
AI_PROVIDER=fallback
DATABASE_URL=sqlite:///./ai_igot_demo.db
```

### 5. Initialize Database
```bash
cd backend
python -c "from database import create_database; create_database()"
cd ..
```

### 6. Start Backend Server
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend API docs: http://localhost:8000/api/docs

### 7. Install Frontend Dependencies (in new terminal)
```bash
npm install
```

### 8. Start Frontend
```bash
npm run dev
```

Frontend: http://localhost:5173

---

## 🔐 Configuration Guide

### .env Configuration

#### Essential Variables (Required)
```bash
# Backend
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173

# JWT Secret (generate with: python -c "import secrets; print(secrets.token_urlsafe(32))")
JWT_SECRET_KEY=your_super_secret_key_here

# Database (demo mode uses SQLite)
DATABASE_URL=sqlite:///./ai_igot_demo.db
# Or for PostgreSQL production:
DATABASE_URL=postgresql://user:password@localhost:5432/ai_igot_db
```

#### OTP Configuration

**Option 1: Development Mode (Recommended for Initial Testing)**
```bash
DEMO_MODE=true
OTP_PROVIDER=development
# OTP will be logged to console
```

**Option 2: Twilio (Production)**
1. Sign up at https://www.twilio.com/
2. Create a Verify Service
3. Configure:
```bash
DEMO_MODE=false
OTP_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_VERIFY_SERVICE_SID=your_service_sid
```

**Option 3: MSG91 (Production)**
1. Sign up at https://www.msg91.com/
2. Get API key
3. Configure:
```bash
DEMO_MODE=false
OTP_PROVIDER=msg91
MSG91_API_KEY=your_api_key
MSG91_SENDER_ID=your_sender_id
```

**Option 4: Firebase (Production)**
1. Create Firebase project
2. Enable Phone Authentication
3. Configure:
```bash
DEMO_MODE=false
OTP_PROVIDER=firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
```

#### AI/LLM Configuration

**Option 1: Fallback Mode (No API Key Needed)**
```bash
AI_PROVIDER=fallback
# Uses predefined question bank
```

**Option 2: OpenAI**
```bash
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4
```

**Option 3: Anthropic (Claude)**
```bash
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-sonnet
```

**Option 4: Google Gemini**
```bash
AI_PROVIDER=google
GOOGLE_AI_API_KEY=your_api_key
```

#### Database Setup (PostgreSQL Production)

```bash
# Create PostgreSQL database
createdb ai_igot_db

# Configure in .env
DATABASE_URL=postgresql://postgres:password@localhost:5432/ai_igot_db
```

---

## 📊 Database Schema Overview

### Core Tables
- **users**: User accounts
- **user_profiles**: Profile information
- **otp_logs**: OTP verification logs
- **roles**: Job roles (Statistical Officer, Data Analyst, etc.)
- **competencies**: Skill definitions
- **role_competencies**: Mapping roles to required competencies

### Assessment Tables
- **assessments**: Initial skill assessments
- **assessment_questions**: Question bank
- **assessment_answers**: User responses

### Quiz Tables
- **quizzes**: Quiz definitions
- **quiz_questions**: Quiz questions
- **quiz_attempts**: User quiz attempts
- **user_quiz_answers**: User responses

### Competency Tables
- **competency_scores**: User's competency scores
- **recommendations**: Learning recommendations

### Learning Tables
- **learning_modules**: Courses/materials
- **learning_progress**: User progress tracking

### Certificate Tables
- **certificates**: Issued certificates

### Support Tables
- **uploaded_materials**: User-uploaded files
- **contact_messages**: Contact form submissions
- **notifications**: User notifications

---

## 🔌 API Structure

### Authentication
```
POST   /api/auth/send-otp          Send OTP to phone
POST   /api/auth/verify-otp        Verify OTP & register
POST   /api/auth/logout            Logout user
POST   /api/auth/refresh-token     Refresh JWT token
```

### User Profile
```
GET    /api/users/me               Get current user
PUT    /api/users/profile          Update profile
GET    /api/users/profile          Get profile
```

### Assessment
```
POST   /api/assessment/start       Start assessment
GET    /api/assessment/questions   Get questions
POST   /api/assessment/submit      Submit answers
GET    /api/assessment/result      Get results
```

### Competencies
```
GET    /api/competencies/gaps      Competency gap analysis
GET    /api/competencies/scores    Current scores
```

### Learning
```
GET    /api/learning               Get recommended learning
POST   /api/learning/{id}/start    Start learning module
POST   /api/learning/{id}/complete Mark as complete
GET    /api/learning/progress      Get progress
```

### Quiz
```
POST   /api/quiz/generate          Generate quiz
POST   /api/quiz/{id}/start        Start quiz
POST   /api/quiz/{id}/submit       Submit quiz
GET    /api/quiz/{id}/result       Get results
```

### Materials Upload
```
POST   /api/materials/upload       Upload learning material
GET    /api/materials              List uploaded materials
GET    /api/materials/{id}/status  Check processing status
```

### Reports
```
GET    /api/reports/quiz/{id}      Get quiz result
GET    /api/reports/full           Get complete report
GET    /api/reports/download       Download PDF
```

### Certificates
```
GET    /api/certificate            Get certificate
GET    /api/certificate/download   Download certificate PDF
GET    /api/verify-certificate/{id} Verify certificate
```

### Dashboard
```
GET    /api/dashboard              Dashboard data
GET    /api/dashboard/stats        Statistics
```

### Contact
```
POST   /api/contact                Submit contact form
GET    /api/contact/team           Get team info
```

### iGOT Integration
```
GET    /api/igot/resources         Get iGOT resources
```

---

## 🧪 Testing the Complete Flow

### Step 1: User Registration
```bash
curl -X POST http://localhost:8000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "9876543210"}'

# Response includes OTP in demo mode
# Copy the OTP code
```

### Step 2: Verify OTP
```bash
curl -X POST http://localhost:8000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "9876543210",
    "otp_code": "123456",
    "full_name": "Test User"
  }'

# Returns: access_token, refresh_token
```

### Step 3: Create Profile
```bash
curl -X POST http://localhost:8000/api/users/profile \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "gender": "male",
    "organization": "Ministry",
    "current_role_id": 1,
    "experience_level": "2-5",
    "existing_skills": ["Python", "SQL"]
  }'
```

### Step 4: Start Assessment
```bash
curl -X POST http://localhost:8000/api/assessment/start \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"role_id": 1}'
```

---

## 🚀 Production Deployment

### Prerequisites
- Python 3.10+
- PostgreSQL 13+
- Node.js 18+
- Gunicorn
- Nginx

### Backend Deployment
```bash
# Install gunicorn
pip install gunicorn

# Start production server
gunicorn -w 4 -b 0.0.0.0:8000 backend.main:app
```

### Frontend Deployment
```bash
# Build production bundle
npm run build

# Deploy dist/ folder to:
# - Vercel
# - Netlify
# - AWS S3 + CloudFront
# - Nginx static server
```

### Environment Variables for Production
```bash
ENVIRONMENT=production
DEMO_MODE=false
OTP_PROVIDER=twilio  # Use real provider
AI_PROVIDER=openai   # Use real LLM
DATABASE_URL=postgresql://user:password@db-server:5432/ai_igot_db
JWT_SECRET_KEY=<VERY_SECURE_RANDOM_KEY>
# ... other production configs
```

---

## 📋 Remaining Work (Phase 2 & Beyond)

### Immediate Priority
1. **Complete Auth Routes** ✓
2. **Create User Routes** (profile management)
3. **Create Assessment Routes** (skill evaluation)
4. **Create Quiz Routes** (quiz system)
5. **Create Learning Routes** (recommendations)
6. **Create Competency Routes** (gap analysis)
7. **Create Report Routes** (PDF generation)
8. **Create Certificate Routes** (issuance)

### High Priority
9. Implement competency calculation engine
10. Create LLM integration for quiz generation
11. Implement document upload & text extraction
12. Create PDF certificate generation
13. Create PDF report generation
14. Implement notification system
15. Create recommendation engine

### Medium Priority
16. Add admin dashboard
17. Create analytics
18. Implement audit logging
19. Create backup & recovery
20. Performance optimization

### Testing & Deployment
21. Unit tests
22. Integration tests
23. End-to-end tests
24. Performance testing
25. Security audit
26. Production deployment

---

## 🆘 Troubleshooting

### Backend Won't Start
```bash
# Check if port 8000 is in use
lsof -i :8000

# Check Python version
python --version  # Should be 3.10+

# Recreate virtual environment
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
```

### Database Connection Error
```bash
# Check PostgreSQL running
psql --version

# Test connection
psql -U postgres -d ai_igot_db -h localhost
```

### JWT Token Issues
```bash
# Regenerate secret key
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Update .env with new key
```

### OTP Not Working
- In demo mode: check terminal output for OTP
- With Twilio: verify Account SID, Auth Token, Service SID
- With MSG91: verify API key and sender ID

---

## 📚 Documentation

- Backend API docs: http://localhost:8000/api/docs (Swagger)
- Backend API redoc: http://localhost:8000/api/redoc
- Source code: `/backend` directory
- Frontend source: `/src` directory

---

## 🤝 Contributing

When adding new features:
1. Create database model in `backend/models.py`
2. Create Pydantic schema in `backend/schemas.py`
3. Create router in `backend/routers/<feature>.py`
4. Include in `backend/main.py`
5. Update this README
6. Test with Swagger UI

---

## ✅ Quality Checklist

Before considering production-ready:
- [ ] All OTP providers working
- [ ] User registration & login working
- [ ] Profile creation working
- [ ] Assessment system working
- [ ] Quiz generation working
- [ ] Competency calculations accurate
- [ ] Reports generating correctly
- [ ] Certificates issuing correctly
- [ ] All API endpoints tested
- [ ] Frontend connected to all APIs
- [ ] Security measures in place
- [ ] Documentation complete

---

**Status**: 🚧 IN DEVELOPMENT
**Current Phase**: Backend API development (Phase 1-2)
**Next Milestone**: Complete all API routes and connect frontend
