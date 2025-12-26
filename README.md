# MedSync AI

A full-stack, open-source medication adherence assistant that combines a modern React frontend with an Express.js backend, AI health agents, notifications, and report analysis. Built for real-world usability and ready for contributors through Social Winter of Code.

---

## 📢 Announcements & Updates

All important project updates, rules, and timelines are shared in the  
**GitHub Discussions → Announcements** section.

➡️ Please make sure to check it regularly.

---

## 🚀 Why this project & how to contribute

- **Open for contributors:** We welcome newcomers and experienced contributors alike. Good first issues, docs improvements, and feature work are all appreciated.
- **Real impact:** Medication non-adherence affects health outcomes globally. MedSync AI provides reminders, scheduling, AI guidance, and health report analysis to help users stay on track.
- **Modern stack:** React + Vite + Tailwind on the frontend; Node.js + Express + MongoDB + Socket.IO + LangChain integrations on the backend.
- **Clear pathways:** Pick an issue, discuss in comments, and submit a PR. If you’re unsure where to start, open a discussion or ask for guidance.

---

## 🧭 Project overview

MedSync AI is a monorepo with two main parts:

- **client/** — React app (Vite, Tailwind) for the user experience: auth, dashboard, medication management, notifications, AI agents, report upload/chat, Google Calendar sync.
- **server/** — Express.js API with JWT auth, medication CRUD, notification scheduling (with Socket.IO), AI agent endpoints (LangChain, Groq/Gemini), PDF parsing, and Google Calendar integration.

High-level flow:
1. User authenticates (JWT).
2. Frontend fetches schedule/adherence stats and displays a dashboard.
3. Users add/update medications; backend stores via MongoDB.
4. Scheduler/Socket.IO delivers reminders and notifications.
5. AI agents answer health/medication questions via LangChain + LLMs.
6. Users upload reports, get AI analysis, and chat with analyzed reports.
7. Optional Google Calendar sync for medication schedules.

---

## 🧩 Tech stack

**Frontend**
- React (Vite), Tailwind CSS, React Router
- Axios, React Context API
- Socket.IO Client, Recharts, Lucide React

**Backend**
- Node.js, Express.js
- MongoDB + Mongoose
- JWT auth, bcrypt
- LangChain with Groq/Gemini (LLMs)
- Socket.IO for real-time notifications
- Multer + pdf-parse for uploads and parsing
- Google Calendar API (OAuth2)
- dotenv for config

---

## 🗂️ Repository structure

```
MedSync-AI/
├─ client/                  # React app
│  ├─ src/pages             # Views (Dashboard, Login, addMedication, agents, etc.)
│  ├─ src/components        # Reusable components (ProtectedRoute, Navbar, etc.)
│  ├─ src/context           # Contexts (medication, notification, socket, calendarSync)
│  └─ src/App.jsx           # Routing setup
└─ server/                  # Express API
   ├─ src/routes            # Route definitions (e.g., medicineRoutes.js)
   ├─ src/api               # Controllers (e.g., addMedicineController.js)
   ├─ src/models            # Mongoose schemas (User, medicineModel, HealthProfile, ...)
   ├─ src/utils             # AI handlers, utilities (medical_model.js, emergency_model.js, ...)
   ├─ src/middlewares       # Middleware (authMiddleware.js)
   └─ src/index.js          # App + Socket.IO entry point
```

---

## 🏁 Getting started

### Prerequisites
- Node.js (LTS recommended)
- npm
- MongoDB connection URI
- API keys for Groq/Gemini (and any other LLM providers you use)
- Google OAuth2 credentials (if using Calendar sync)

### Quick dev (two terminals)
- Terminal A: `cd server && npm install && npm run dev` (starts API on 8080)
- Terminal B: `cd client && npm install && npm run dev` (starts web on 5173)

### Useful scripts
- Frontend: `npm run dev`, `npm run build`, `npm run lint`, `npm run preview`
- Backend: `npm run dev`, `npm start`

### 1) Clone
```bash
git clone https://github.com/tirth-patel06/MedSync-AI.git
cd MedSync-AI
```

### 2) Frontend setup
```bash
cd client
npm install
npm run dev
# App at http://localhost:5173
```

### 3) Backend setup
```bash
cd server
npm install
# Create .env (see below) with your own keys
npm run dev
# Server at http://localhost:8080
```

---

## 🔐 Environment variables (server)

Create `server/.env` with your own (do NOT commit secrets):
```
PORT=8080
MONGO_URI=your_mongo_uri
JWT_SECRET=your_jwt_secret

GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key
HUGGINGFACEHUB_API_KEY=your_hf_key

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=your_redirect_uri

REPORT_API=your_report_service_api_key
REPORT_TEMPLATE_ID=5b077b23e86a4726

# Multilingual & Translation (Phase 2)
GOOGLE_TRANSLATE_API_KEY=your_google_translate_api_key
TRANSLATION_CACHE_TTL=86400
DEFAULT_LANGUAGE=en
SUPPORTED_LANGUAGES=en,es,hi
TRANSLATION_PROVIDER=google
```
If you use report-generation/analysis services, add those keys/IDs here too.

**Security note:** Never commit real keys. If any were exposed, rotate them immediately and scrub from history.

**Translation setup:**
- Obtain a Google Translate API key from [Google Cloud Console](https://console.cloud.google.com/).
- Add `GOOGLE_TRANSLATE_API_KEY` to your `.env` file.
- `TRANSLATION_CACHE_TTL`: Cache duration in seconds (default 86400 = 24 hours).
- `TRANSLATION_PROVIDER`: Currently supports `google` (libretranslate support coming in Phase 2.2).

### Frontend `.env` (client)
Add a `client/.env` to point the React app at your backend and OAuth endpoints:
```
VITE_API_BASE_URL=http://localhost:8080
VITE_SOCKET_URL=http://localhost:8080
VITE_GOOGLE_OAUTH_LOGIN=http://localhost:8080/api/oauth/login
```
If you change backend ports/hosts, update these values. Align `VITE_SOCKET_URL` with your Socket.IO server.

---

## 🧪 Running the apps together

- Start backend first: `npm run dev` in `server/`.
- Start frontend: `npm run dev` in `client/`.
- Configure frontend `.env` (if applicable) to point to the backend API and Socket.IO endpoints.

---

## 🧠 Key features

- **Secure auth:** JWT-based signup/login with protected routes.
- **Medication management:** CRUD for meds, schedule tracking.
- **Notifications & reminders:** Scheduler + real-time alerts via Socket.IO.
- **AI agents:** Multi-agent chat for medication info, health guidance, triage (LangChain + LLMs).
- **Report analysis & chat:** Upload PDFs, get AI-driven insights, and chat with analyzed reports.
- **Google Calendar sync:** Optional calendar integration for medication schedules.
- **Dashboard:** Today’s meds, adherence stats, and streaks at a glance.

## Multilingual Phase 1 (schema & API updates)

- User schema now includes `preferredLanguage` (enum: `en`, `es`, `hi`; default: `en`). APIs that return user objects should surface this, and clients can send it during signup/update.
- Report schema stores `translatedAnalysis` (Map of language code → text), `originalLanguage` (default `en`), and `readabilityScore` ({ fleschKincaid, fleschReadingEase, readingLevel, grade }). These fields are optional and safe for existing documents.
- Medication schema adds `originalInstructions` and `translatedInstructions` (`es`, `hi`) to hold multilingual dosage directions; these are optional.
- Migration/backfill guidance: fields are non-breaking with defaults. If you want to backfill existing data, run a one-time script such as:

```js
// From a Mongo shell or script with Mongoose connected
db.reports.updateMany({ originalLanguage: { $exists: false } }, { $set: { originalLanguage: "en" } });
db.users.updateMany({ preferredLanguage: { $exists: false } }, { $set: { preferredLanguage: "en" } });
db.medications.updateMany(
   { originalInstructions: { $exists: false } },
   { $set: { originalInstructions: "" } }
);
```

These changes complete Phase 1 of the multilingual implementation plan and keep existing data intact.

## Multilingual Phase 2 (Translation Service Integration)

Phase 2 provides translation capabilities for multilingual content:

- **Translation Service** (`server/src/services/translationService.js`): Wraps Google Translate API with caching (via node-cache), batch translation, language detection, retry logic, and medical terminology preservation.
- **Language Configuration** (`server/src/utils/languageConfig.js`): Central configuration for supported languages (English, Spanish, Hindi) with utilities for validation and reading level mappings.
- **Medical Terminology Dictionary** (`server/src/utils/medicalTerminology.js`): Maps medical terms to accurate translations across languages (e.g., ibuprofen → ibuprofeno/इबुप्रोफेन), ensuring clinical accuracy.
- **Translation Service API**:
  - `translateText(text, targetLang, context)` — Translate a single text.
  - `translateBatch(texts[], targetLang)` — Batch translate multiple texts.
  - `detectLanguage(text)` — Detect the language of given text.
  - `getSupportedLanguages()` — List supported languages.
  - `invalidateCache(key)` — Clear cache for a specific key or all.

- **Caching**: Translations are cached with a TTL to reduce API calls (default 24 hours, configurable via `TRANSLATION_CACHE_TTL`).
- **Error handling**: Translation failures gracefully fall back to the original text; no crashes.
- **Medical Context**: When translating medical content, the service preserves medical terminology and can apply specialized dictionaries for accuracy.

Install dependencies with `npm install` in the `server/` directory after adding Phase 2 files.

---

## Multilingual Phase 3 (Readability Checker Implementation)

Phase 3 implements text readability analysis for medical content across multiple languages:

- **Readability Checker** (`server/src/utils/readabilityChecker.js`): Analyzes text readability using:
  - **Flesch-Kincaid Grade Level** — Estimates US grade level required to understand text (0-16+)
  - **Flesch Reading Ease** — Scores text on 0–100 scale (higher = easier to read)
  - **Language-specific adaptation** — Adjusted algorithms for English, Spanish, and Hindi
  - **Syllable counting** — Implements multi-language syllable detection
  - **Recommendations** — Generates actionable simplification suggestions

- **Readability Configuration** (`server/src/utils/readabilityConfig.js`): Defines:
  - Complexity thresholds for medical content (simple/moderate/complex)
  - Reading level categories with Flesch scores and grade mappings
  - Language-specific targets (e.g., optimal words per sentence)
  - Color coding for UI indicators (green/yellow/red)
  - Simplification suggestion templates

- **API Response Format**:
```javascript
{
  fleschKincaid: 8.5,        // Grade level
  fleschReadingEase: 65.2,   // 0-100 ease score
  readingLevel: 'high',      // Category key
  readingLevelLabel: 'High School',
  grade: 8,                  // Rounded grade
  isTooComplex: false,       // Above threshold?
  statistics: {
    wordCount: 150,
    sentenceCount: 8,
    syllableCount: 250,
    averageWordsPerSentence: 18.75,
    averageSyllablesPerWord: 1.67
  },
  recommendations: [
    "✓ Text is at appropriate reading level for medical content",
    "📌 Consider shorter sentences...",
    "💡 Medical terms are acceptable..."
  ]
}
```

- **Language support**: English (standard Flesch-Kincaid), Spanish (adapted coefficients), Hindi (Devanagari-aware syllable counting)
- **Accessibility**: Color-coded complexity assessment, detailed metrics, and specific improvement suggestions

Install dependencies with `npm install` in the `server/` directory (includes `syllable` package for enhanced syllable counting).

---

## Multilingual Phase 4 (Backend API Endpoints)

Phase 4 exposes translation, language preference, and report readability/translation APIs:

- **Translation API** (`/api/translate`):
  - `POST /api/translate` — Translate a single text (`text`, `targetLanguage`, `context` = medical/general).
  - `POST /api/translate/batch` — Batch translate array `texts[]` to `targetLanguage`.
  - `GET /api/translate/supported` — List supported languages.

- **Language Preference API** (`/api/languages`):
  - `GET /api/languages/user` — Fetch user preferred language + supported list.
  - `PUT /api/languages/user` — Update preferred language (body: `{ language }`).
  - `GET /api/languages/supported` — List supported languages.

- **Report Analysis & Readability** (`/api/report`):
  - `POST /api/report/analyze` — Analyze an uploaded report; saves analysis with readability + optional translation (uses `language` param or user preference).
  - `POST /api/report/chat` — Chat over a stored report (requires `reportId`, `question`).
  - `GET /api/report/:id/translate/:language` — On-demand translation of stored analysis with caching in the document.
  - `GET /api/report/:id/readability` — Returns readability metrics; backfills if missing.

- **Behavior**:
  - Auto-detects source language; auto-translates to requested language or user preference when provided.
  - Stores `translatedAnalysis`, `originalLanguage`, and `readabilityScore` in Report documents.
  - Graceful fallbacks: translation errors return original text; readability always returns a score.

Run `npm install` in `server/` if you haven’t added dependencies yet.

---
## Multilingual Phase 5 (Frontend UI Components)

Phase 5 provides React components, context, and hooks for multilingual UX on the client:

- **Language Context** (`client/src/context/languageContext.jsx`): Global state management
  - Fetches user's preferred language from the backend on mount
  - Methods: `setLanguage(code)`, `translateText(text, lang?, context?)`, `translateBatch(texts[], lang?)`
  - Gracefully handles API failures (fallback to defaults)

- **useTranslation Hook** (`client/src/hooks/useTranslation.js`): Custom hook to access:
  - `language` — Current language code
  - `setLanguage` — Update preference
  - `supportedLanguages` — List of available languages
  - `translateText` — Translate a single text
  - `translateBatch` — Batch translate multiple texts
  - `loading`, `error` — State and error tracking

- **LanguageSwitcher Component** (`client/src/components/LanguageSwitcher.jsx`):
  - Dropdown button in Navbar showing current language (native name, e.g., "Español")
  - Displays all supported languages with native names
  - Accessible (ARIA labels, keyboard navigation)
  - Updates backend user preference on selection
  - Styled with Tailwind (blue gradient, icons via lucide-react)

- **ReadabilityIndicator Component** (`client/src/components/ReadabilityIndicator.jsx`):
  - Badge showing Flesch-Kincaid grade level with color coding:
    - 🟢 Green: Grades 1–6 (easy)
    - 🟡 Yellow: Grades 7–12 (moderate)
    - 🔴 Red: Grade 13+ (complex)
  - Interactive tooltip with grade details on hover
  - Optional `showDetails` and `showRecommendations` props
  - Displays actionable suggestions for simplification

- **TranslationBadge Component** (`client/src/components/TranslationBadge.jsx`):
  - Shows "Originally [Language]" indicator when text is translated
  - Optional button to toggle back to original language
  - Subtle blue styling; hidden if not translated
  - Accessible labels for screen readers

- **Integration**:
  - `LanguageSwitcher` added to Navbar
  - `LanguageProvider` wraps app in App.jsx
  - All components use Tailwind CSS + lucide-react icons
  - Built-in loading states and error handling

---
## 🤝 How to contribute

1. **Pick an issue:** Start with “good first issue” or “help wanted,” or open a discussion if unsure.
2. **Discuss:** Comment to get assigned/confirm approach.
3. **Fork & branch:** `git checkout -b feature/your-feature`
4. **Code & test:** Add/adjust tests if applicable.
5. **Lint/format:** Match project conventions (React/Tailwind/Node).
6. **PR:** Submit with a clear description, screenshots (for UI), and testing notes.

Need ideas?
- Improve docs and onboarding.
- Add frontend tests (e.g., components/contexts) or backend tests (routes/controllers/utils).
- Enhance error handling, validations, or UX polish.
- Expand AI prompts/agents or add safety/guardrails.
- Improve accessibility or responsiveness.
- Add CI checks or Docker dev setup.

---

## 🧭 Project flow (conceptual)

1. Auth -> JWT -> protected routes.
2. Dashboard fetches schedule/adherence via API.
3. Medication CRUD updates MongoDB.
4. Scheduler + Socket.IO deliver reminders.
5. AI routes call LangChain handlers for health Q&A.
6. Reports are parsed and analyzed; chat endpoint uses the analyzed context.
7. Optional calendar sync pushes schedules to Google Calendar.

---

## 📜 License

Open-source. See `LICENSE` for details.

---

## 📣 Community & support

- Open an issue or discussion with questions or proposals.
- PRs welcome—please keep them focused and well-described.
- For security issues, privately disclose first; do not file public issues containing secrets.

---

## ✅ Submission notes for Social Winter of Code

- Clearly open to newcomers with mentored guidance.
- Labeled issues for ease of picking tasks.
- Realistic, full-stack project touching frontend, backend, and AI/LLM integrations.
- Active maintainers ready to review PRs and help contributors onboard.
