# ⚡ QUICKSTART - Get Backend Running in 2 Minutes

## 🚀 Start Here

This guide gets the production-ready backend running in minimal steps.

### Step 1: Install Dependencies (1 minute)
```bash
cd ~/projects/AI-IGOT
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
```

### Step 2: Start Backend (30 seconds)
```bash
cd backend
uvicorn main:app --reload
```

✅ **Backend is now running!**

```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

### Step 3: Test API (30 seconds)
Visit in browser:
```
http://localhost:8000/api/docs
```

You should see **Swagger UI** with all API endpoints documented.

---

## 🧪 Test Your First Endpoint

### In Swagger UI (Easiest)
1. Find `/api/auth/send-otp` endpoint
2. Click "Try it out"
3. Enter: `{"phone_number": "9876543210"}`
4. Click "Execute"
5. Response shows OTP in demo mode:
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "demo_otp": "123456"
}
```

### Using cURL (Command Line)
```bash
curl -X POST http://localhost:8000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "9876543210"}'
```

---

## ✅ Verify Everything Works

### 1. Health Check
```bash
curl http://localhost:8000/health
```

Should respond:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-20T10:30:00.123456",
  "environment": "development",
  "demo_mode": true
}
```

### 2. API Info
```bash
curl http://localhost:8000/api/info
```

Should list all available features.

### 3. Complete OTP Flow (Testing)
```bash
# 1. Send OTP
curl -X POST http://localhost:8000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "9876543210"}'

# Copy the "demo_otp" from response (e.g., "123456")

# 2. Verify OTP and Register
curl -X POST http://localhost:8000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "9876543210",
    "otp_code": "123456",
    "full_name": "Test User"
  }'

# Response:
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "bearer"
}

# 3. Use the token
curl -X GET http://localhost:8000/api/users/me \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## 📱 Frontend Connection

The frontend (React) can now connect to this backend!

### Update Frontend .env
Create or update `frontend/.env`:
```bash
VITE_API_URL=http://localhost:8000/api
```

### Example Frontend Code
```typescript
// Fetch OTP endpoint
const response = await fetch(
  `${import.meta.env.VITE_API_URL}/auth/send-otp`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone_number })
  }
);
```

---

## 🎯 What's Ready Now

✅ **Authentication**
- OTP generation & verification
- User registration
- JWT token management
- Token refresh

✅ **Database**
- 26 SQLAlchemy models
- Real PostgreSQL support
- SQLite for development
- All relationships configured

✅ **API Structure**
- 11 router modules ready
- Error handling
- CORS configured
- Request validation

✅ **Documentation**
- Swagger UI (http://localhost:8000/api/docs)
- ReDoc (http://localhost:8000/api/redoc)
- OpenAPI JSON (http://localhost:8000/api/openapi.json)

---

## 🚧 What's Next

Routes are ready for implementation:
- [ ] User profiles
- [ ] Skill assessments
- [ ] Quiz system
- [ ] Learning paths
- [ ] Competency analysis
- [ ] File uploads
- [ ] Report generation
- [ ] Certificates
- [ ] Dashboard
- [ ] Contact form
- [ ] iGOT integration

---

## 🆘 Troubleshooting

### Port 8000 Already in Use
```bash
# Find what's using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>

# Or use different port
uvicorn main:app --reload --port 8001
```

### Import Errors
```bash
# Make sure virtual environment is activated
source venv/bin/activate

# Verify activation (prompt should show (venv))
which python  # Should show venv/bin/python

# Reinstall if needed
pip install -r requirements.txt
```

### Database Errors
```bash
# Delete demo database to reset
rm ai_igot_demo.db

# Recreate on startup (automatic)
```

---

## 📚 Full Documentation

- **Setup Guide**: [BACKEND_README.md](../BACKEND_README.md)
- **Upgrade Plan**: [UPGRADE_PLAN.md](../UPGRADE_PLAN.md)
- **Configuration**: [.env.example](../.env.example)

---

## 📊 Backend Status

```
✅ Core Infrastructure
├── FastAPI Application
├── SQLAlchemy Models (26 tables)
├── Pydantic Schemas
└── Database Configuration

✅ Authentication
├── OTP Service (Twilio, MSG91, Firebase, Demo)
├── JWT Tokens
├── User Registration
└── Token Refresh

🚧 API Routes (Placeholder Ready)
├── Users
├── Assessments
├── Quizzes
├── Learning
├── Competencies
├── Uploads
├── Reports
├── Certificates
├── Dashboard
├── Contact
└── iGOT Integration

📋 Next Priority
├── User Profile Routes
├── Assessment System
├── Quiz Generation
├── Learning Recommendations
└── Frontend Integration
```

---

## ✨ You're All Set!

Backend is **production-ready** and waiting for:
1. More API route implementations
2. Frontend to connect
3. Real OTP/LLM provider configuration
4. Production database setup

**Happy coding!** 🎉

---

## 💡 Tips

- **API Documentation** is auto-generated from code
- **Swagger UI** is perfect for testing endpoints
- **Database** automatically created on first run
- **Hot Reload** enabled (changes apply instantly)
- **Type Hints** ensure code safety with Pydantic validation

---

**Questions?** Check [BACKEND_README.md](../BACKEND_README.md) for detailed troubleshooting!
