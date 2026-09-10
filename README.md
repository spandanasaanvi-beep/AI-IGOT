# PragatiAI

**Personalized Competency & Learning Platform for iGOT Karmayogi**

A complete, functional prototype that helps employees of India's Official Statistical System
identify competency gaps, learn through iGOT Karmayogi resources, take proctored assessments,
and progress to verified role readiness.

**Core loop:**
ASSESS → IDENTIFY GAPS → RECOMMEND → LEARN → TEST → MEASURE → IMPROVE → REASSESS → CERTIFY

---

## Quick start

```bash
npm install
npm run dev        # → http://localhost:5173
```

Production build: `npm run build` (typecheck + Vite bundle).

An optional FastAPI backend skeleton lives in `backend/` (see `BACKEND_README.md`);
the prototype runs fully from the frontend with local persistence.

---

## The complete journey

1. **Create account** — name + mobile, prototype OTP (demo code shown on screen & console)
2. **Verify OTP** — 6-digit code, resend, expiry and attempt limits
3. **Professional profile** — personal + professional details, role selection
4. **Initial competency assessment** — role-specific questions, camera monitor,
   tab-switch integrity detection, timer, question navigation
5. **Competency analysis** — current vs required charts, gap table, dynamic AI insight
6. **Dashboard** — role-readiness donut, stat cards, activity feed, next-step guidance
7. **Personalized learning path** — gap-mapped resources with priority and progress
8. **iGOT Karmayogi** — recommendations grouped by gap, official portal links
9. **Upload learning material** — PDF/DOCX/PPTX/TXT, validation, simulated analysis pipeline
10. **AI quiz generator** — 5/10/15 questions, difficulty, source (gaps or material)
11. **Quiz result** — score, competency-wise performance, answer review, AI insight
12. **Before vs After** — honest initial→latest comparison (declines shown as declines)
13. **Adaptive recommendations** — recalculated next modules after every attempt
14. **Role ready** — celebration screen when all competencies reach required levels
15. **Report** — branded multi-page PDF competency record (jsPDF)
16. **Certificate** — locked sample → unlocked certificate with unique ID and PDF download

---

## Architecture

```
src/
├── services/              # Swap points for real production services
│   ├── storage.ts         # localStorage today → PostgreSQL-backed API later
│   ├── otpService.ts      # Demo OTP → replace with Twilio/MSG91/Firebase via backend
│   ├── competencyEngine.ts# All scoring maths (answers → competency scores)
│   ├── aiService.ts       # Demo quiz generation & document analysis → real LLM later
│   ├── igotService.ts     # Demo catalogue → real iGOT API later
│   └── reportService.ts   # jsPDF report builder
├── context/AppContext.tsx # Single source of truth, reducer + persistence
├── components/            # Sidebar, QuizRunner, CameraMonitor, Toast, UI primitives
└── pages/                 # One page per product stage (see journey above)
```

### Integration points (prototype honesty)

| Feature | Prototype behaviour | Production path |
|---|---|---|
| OTP | Demo code shown in UI/console | `otpService.deliverOtp` → `POST /api/auth/send-otp` (Twilio/MSG91/Firebase) |
| AI quiz generation | Curated local question bank | `aiService.generateQuiz` → LLM API, same interface |
| Document analysis | Simulated pipeline | `aiService.analyzeMaterial` → real parsing + topic model |
| iGOT resources | Demo catalogue, official portal links | `igotService.getRecommendedResources` → iGOT API |
| Camera monitoring | Real camera preview; attention events are labelled demo logic | Real CV service |
| Anti-cheat | Browser Page Visibility API tab-switch detection (technically valid) | Enterprise proctoring |
| Persistence | localStorage (`pragatiai_state_v1`) | `storage.ts` → PostgreSQL via FastAPI backend |

Scores are **never fabricated**: every competency score is computed from the user's
stored answers (`competencyEngine.ts`), and certificate/report content is derived from
that same state.

---

## Roles & competency model

Five statistical roles (Statistical Investigator, Statistical Officer, Assistant Director,
Junior Statistical Officer, Data Processing Assistant), each with six competencies and
required levels — e.g. Data Management, Statistical Analysis, Data Visualization,
Statistical Methods, Data Interpretation, Quality Assurance.

## Tech stack

React 18 · TypeScript · Vite · Tailwind CSS · Recharts · jsPDF · lucide-react

## Privacy notes

- All data stays in the browser (localStorage); no server calls store personal data.
- Camera preview is local-only; nothing is recorded or uploaded.
- Uploaded files are validated (type + size) and never leave the device.

---

*Prototype built for demonstration — not affiliated with any ministry. Not a production system.*
