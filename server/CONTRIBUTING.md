# Contributing to MedSync AI - Backend

> **Labels:** `documentation`, `help wanted`

This guide covers backend-specific setup, folder structure, and contribution guidelines for the Express.js API server.

---

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Folder Structure](#folder-structure)
- [Development Setup](#development-setup)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Code Style Guidelines](#code-style-guidelines)
- [API Structure](#api-structure)
- [Testing](#testing)
- [Common Tasks](#common-tasks)

---

## 🚀 Quick Start

**Prerequisites:**
- Node.js 18+ (LTS recommended)
- npm (comes with Node.js)
- MongoDB (local or MongoDB Atlas)

**Setup:**
```bash
cd server
npm install
# Create .env file (see Environment Variables section)
npm run dev  # Starts server at http://localhost:8080
```

---

## 📁 Folder Structure

```
server/
├── src/                       # Source code
│   ├── api/                  # Controller functions (business logic)
│   │   ├── addMedicineController.js      # Add medication logic
│   │   ├── analyticsController.js        # Analytics calculations
│   │   ├── calendarSyncController.js     # Calendar sync operations
│   │   ├── googleAuth.js                 # Google OAuth helpers
│   │   ├── notificationController.js     # Notification scheduling & delivery
│   │   ├── reportController.js           # Report handling
│   │   ├── statusMedicineController.js   # Medication status updates
│   │   ├── streakController.js           # Streak calculations
│   │   └── todaysMedicineController.js   # Today's medications logic
│   │
│   ├── middlewares/          # Express middleware
│   │   └── authMiddleware.js  # JWT authentication middleware
│   │
│   ├── models/               # Mongoose schemas (database models)
│   │   ├── ConversationModel.js   # AI conversation history
│   │   ├── HealthProfile.js       # User health profile schema
│   │   ├── medicineModel.js       # Medication schema
│   │   ├── ReportModel.js         # Medical report schema
│   │   ├── todayMedicine.js       # Daily medication tracking
│   │   ├── todayNotifications.js  # Notification schema
│   │   └── User.js                # User schema (auth, tokens)
│   │
│   ├── routes/               # Express route definitions
│   │   ├── agentsRoutes.js         # AI agent endpoints
│   │   ├── analytics.js           # Analytics endpoints
│   │   ├── auth.js                # Authentication routes
│   │   ├── calendarSyncRoutes.js  # Calendar sync routes
│   │   ├── healthRoutes.js        # Health profile routes
│   │   ├── medicineRoutes.js      # Medication CRUD routes
│   │   ├── notificationRoutes.js  # Notification routes
│   │   ├── oauth.js               # OAuth callback routes
│   │   └── reportRoutes.js        # Report routes
│   │
│   ├── services/             # Service modules
│   │   └── sendNotification.js    # Notification delivery service
│   │
│   ├── utils/                # Utility functions & AI handlers
│   │   ├── emergency_model.js     # Emergency triage AI agent
│   │   ├── googleCalendar.js      # Google Calendar API integration
│   │   ├── medical_model.js       # Medical AI agent (LangChain)
│   │   ├── medicine_model.js      # Medication-specific AI agent
│   │   ├── personal_health_model.js  # Personal health advisor
│   │   └── reportAnalysis.js      # PDF parsing & report analysis
│   │
│   └── index.js              # Application entry point
│
├── test/                     # Test files
│   └── data/                 # Test data files
│       └── 05-versions-space.pdf
│
├── uploads/                  # Uploaded files (PDFs, etc.)
│
├── .env                      # Environment variables (not committed)
├── package.json             # Dependencies and scripts
└── README.md                # Backend-specific README
```

### 📂 Directory Details

#### `src/api/` (Controllers)
Controller functions contain the business logic for handling requests. They interact with models and utilities.

- **addMedicineController.js** - Handles medication creation, validation, and Google Calendar sync
- **statusMedicineController.js** - Updates medication status (taken/missed)
- **todaysMedicineController.js** - Retrieves and formats today's medications for a user
- **notificationController.js** - Notification scheduler, delivery via Socket.IO, timer management
- **analyticsController.js** - Calculates adherence stats, streaks, and analytics
- **calendarSyncController.js** - Google Calendar sync operations (add/remove events)
- **reportController.js** - Handles report upload, retrieval, and management
- **streakController.js** - Calculates medication adherence streaks
- **googleAuth.js** - Google OAuth2 helper functions

#### `src/routes/`
Route definitions map HTTP endpoints to controller functions. Routes handle request/response and delegate to controllers.

- **auth.js** - `/api/auth/*` - Signup, login, token refresh
- **medicineRoutes.js** - `/api/medicine/*` - Medication CRUD operations
- **notificationRoutes.js** - `/api/notification/*` - Notification management
- **agentsRoutes.js** - `/api/agents/*` - AI agent endpoints (medical, emergency, medicine, personal-health)
- **reportRoutes.js** - `/api/report/*` - Report upload, analysis, chat
- **healthRoutes.js** - `/api/health/*` - Health profile management
- **calendarSyncRoutes.js** - `/api/calendar/*` - Calendar sync operations
- **oauth.js** - `/api/oauth/*` - OAuth callback handling
- **analytics.js** - `/api/analytics/*` - Analytics endpoints

#### `src/models/` (Mongoose Schemas)
Database models define the structure and validation for MongoDB documents.

- **User.js** - User authentication, profile, Google OAuth tokens
- **medicineModel.js** - Medication details, schedule, dosage times
- **todayMedicine.js** - Daily medication tracking (taken/missed status)
- **todayNotifications.js** - Notification records (title, message, timestamp)
- **HealthProfile.js** - User health information, medical history, allergies
- **ReportModel.js** - Uploaded PDF reports, extracted text, AI analysis
- **ConversationModel.js** - AI conversation history (messages, agent type, timestamps)

#### `src/middlewares/`
Express middleware functions that run before route handlers.

- **authMiddleware.js** - Validates JWT tokens, extracts user info, protects routes

#### `src/services/`
Service modules for external integrations and reusable business logic.

- **sendNotification.js** - Notification delivery service (Socket.IO, email, etc.)

#### `src/utils/`
Utility functions and AI agent handlers using LangChain.

- **medical_model.js** - Medical AI agent using LangChain + Groq (general health questions)
- **emergency_model.js** - Emergency triage agent (urgent health situations)
- **medicine_model.js** - Medication-specific AI agent (drug interactions, side effects)
- **personal_health_model.js** - Personal health advisor (personalized recommendations)
- **reportAnalysis.js** - PDF parsing (pdf-parse) and AI analysis of medical reports
- **googleCalendar.js** - Google Calendar API integration (OAuth2, event creation)

#### `src/index.js`
Application entry point that:
- Initializes Express app
- Sets up Socket.IO server
- Connects to MongoDB
- Registers routes
- Starts HTTP server

---

## 💻 Development Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Environment Variables

Create `server/.env` file:

```bash
# Server Configuration
PORT=8080

# Database
MONGO_URI=mongodb://localhost:27017/medsync-ai
# Or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/medsync-ai

# Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# AI/LLM API Keys
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
HUGGINGFACEHUB_API_KEY=your_huggingface_api_key

# Google OAuth2 (for Calendar Sync)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8080/api/oauth/callback

# Report Analysis (optional)
REPORT_API=your_report_service_api_key
REPORT_TEMPLATE_ID=5b077b23e86a4726
```

**⚠️ Security:** Never commit `.env` files. They are already in `.gitignore`.

### 3. Start Development Server

```bash
npm run dev  # Uses nodemon for auto-reload
```

The server will run on `http://localhost:8080`

---

## 🔧 Available Scripts

### `npm run dev`
Starts the development server with nodemon (auto-reload on file changes).
- **Port:** 8080 (or PORT from .env)
- **Features:** Auto-restart on code changes, detailed error messages

### `npm start`
Starts the production server (plain Node.js, no auto-reload).
- **Use:** Production deployments
- **Note:** Run `npm run build` first if using TypeScript/compilation

### `npm test`
Runs tests (currently not configured).
- **Future:** Add Jest + Supertest for API testing

---

## 📝 Code Style Guidelines

### File Structure

```javascript
// Import order: Node modules, then local imports
import express from 'express';
import mongoose from 'mongoose';
import { someUtil } from '../utils/someUtil.js';
import SomeModel from '../models/SomeModel.js';

// Route handler
export const handlerName = async (req, res) => {
  try {
    // Logic here
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

### Naming Conventions

- **Files:** camelCase (`addMedicineController.js`)
- **Functions:** camelCase (`getMedications`, `createUser`)
- **Models:** PascalCase (`User`, `MedicineModel`)
- **Constants:** UPPER_SNAKE_CASE (`JWT_SECRET`, `API_BASE_URL`)
- **Routes:** camelCase (`medicineRoutes.js`)

### Express Best Practices

1. **Error Handling** - Always use try/catch in async handlers
2. **Status Codes** - Use appropriate HTTP status codes
3. **Response Format** - Consistent JSON response structure
4. **Validation** - Validate input using express-validator
5. **Middleware** - Use middleware for cross-cutting concerns (auth, logging)

**Example Controller:**
```javascript
export const getMedications = async (req, res) => {
  try {
    const { id } = req.user; // From authMiddleware
    const medications = await Medicine.find({ userId: id });
    res.json({ medications });
  } catch (error) {
    console.error('Error fetching medications:', error);
    res.status(500).json({ message: 'Failed to fetch medications' });
  }
};
```

**Example Route:**
```javascript
import express from 'express';
import { getMedications, addMedication } from '../api/medicineController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getMedications);
router.post('/', authMiddleware, addMedication);

export default router;
```

---

## 🔌 API Structure

### Authentication Flow

```
POST /api/auth/signup
POST /api/auth/login
→ Returns JWT token
→ Store token in localStorage (frontend)
→ Include in Authorization header: Bearer <token>
```

### Protected Routes

All routes except `/api/auth/*` require authentication:

```javascript
// Middleware validates token and adds user to req.user
router.get('/protected', authMiddleware, handler);
```

### API Endpoints Overview

**Authentication:**
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login and get token

**Medications:**
- `GET /api/medicine` - Get user's medications
- `POST /api/medicine` - Add new medication
- `PUT /api/medicine/:id` - Update medication
- `DELETE /api/medicine/:id` - Delete medication
- `GET /api/medicine/today` - Get today's medications
- `PUT /api/medicine/:id/status` - Update medication status

**Notifications:**
- `GET /api/notification` - Get user's notifications
- `POST /api/notification/mark-read` - Mark as read

**AI Agents:**
- `POST /api/agents/medical` - Medical AI agent
- `POST /api/agents/emergency` - Emergency triage agent
- `POST /api/agents/medicine` - Medication AI agent
- `POST /api/agents/personal-health` - Personal health advisor
- `POST /api/agents/upload` - Upload report for analysis
- `POST /api/agents/chat` - Chat with analyzed report

**Reports:**
- `GET /api/report` - Get user's reports
- `POST /api/report/upload` - Upload PDF report

**Calendar:**
- `GET /api/calendar/sync` - Sync medications to Google Calendar
- `DELETE /api/calendar/sync/:id` - Remove calendar event

**Analytics:**
- `GET /api/analytics` - Get adherence analytics

---

## 🧪 Testing

### Current State
Backend tests are not yet configured. Contributions adding tests are welcome!

### Recommended Testing Setup

**Jest + Supertest:**
```bash
npm install --save-dev jest supertest @types/jest
```

**Example Test:**
```javascript
import request from 'supertest';
import app from '../src/index.js';

describe('GET /api/medicine', () => {
  it('should return medications for authenticated user', async () => {
    const token = 'valid_jwt_token';
    const response = await request(app)
      .get('/api/medicine')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('medications');
  });
});
```

### Manual Testing

Use Postman, cURL, or similar tools:

```bash
# Test health endpoint
curl http://localhost:8080/

# Test protected endpoint
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8080/api/medicine

# Test POST request
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"pillName":"Aspirin","dosageTimes":[{"time":"09:00"}]}' \
  http://localhost:8080/api/medicine
```

---

## 🔨 Common Tasks

### Adding a New Route

1. Create controller in `src/api/`:
   ```javascript
   // src/api/newController.js
   export const getNewData = async (req, res) => {
     try {
       const data = await NewModel.find();
       res.json({ data });
     } catch (error) {
       res.status(500).json({ message: error.message });
     }
   };
   ```

2. Create route file in `src/routes/`:
   ```javascript
   // src/routes/newRoutes.js
   import express from 'express';
   import { getNewData } from '../api/newController.js';
   import authMiddleware from '../middlewares/authMiddleware.js';

   const router = express.Router();
   router.get('/', authMiddleware, getNewData);
   export default router;
   ```

3. Register route in `src/index.js`:
   ```javascript
   import newRoutes from './routes/newRoutes.js';
   app.use('/api/new', newRoutes);
   ```

### Adding a New Model

1. Create model in `src/models/`:
   ```javascript
   // src/models/NewModel.js
   import mongoose from 'mongoose';

   const newSchema = new mongoose.Schema({
     name: { type: String, required: true },
     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
     // ... other fields
   }, { timestamps: true });

   export default mongoose.model('New', newSchema);
   ```

2. Use in controllers:
   ```javascript
   import NewModel from '../models/NewModel.js';
   ```

### Adding a New AI Agent

1. Create utility in `src/utils/`:
   ```javascript
   // src/utils/new_agent.js
   import { ChatGroq } from '@langchain/groq';
   import { PromptTemplate } from '@langchain/core/prompts';

   export const newAgentCall = async (req, res) => {
     try {
       const model = new ChatGroq({ apiKey: process.env.GROQ_API_KEY });
       // Agent logic
       res.json({ response });
     } catch (error) {
       res.status(500).json({ message: error.message });
     }
   };
   ```

2. Add route in `src/routes/agentsRoutes.js`:
   ```javascript
   import { newAgentCall } from '../utils/new_agent.js';
   router.post('/new-agent', authMiddleware, newAgentCall);
   ```

### Socket.IO Events

Socket.IO is initialized in `src/index.js`. To emit events:

```javascript
import { io } from '../index.js'; // Or use global.io

// Emit to user room
io.to(`user-${userId}`).emit('notification', {
  title: 'Medication Reminder',
  message: 'Time to take your medication'
});
```

---

## 🐛 Debugging

### Common Issues

**MongoDB Connection Error:**
- Check `MONGO_URI` in `.env`
- Verify MongoDB is running
- Check network/firewall settings

**Port Already in Use:**
```bash
# Kill process on port 8080
lsof -ti:8080 | xargs kill -9
```

**JWT Token Errors:**
- Verify `JWT_SECRET` is set
- Check token format in Authorization header
- Verify token hasn't expired

**Socket.IO Connection Issues:**
- Check CORS settings in `src/index.js`
- Verify frontend Socket.IO URL matches backend
- Check browser console for connection errors

### Logging

Add console.log for debugging:
```javascript
console.log('Debug info:', { userId, data });
```

For production, consider using a logging library like Winston or Pino.

---

## 📚 Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [LangChain Documentation](https://js.langchain.com/)
- [JWT Best Practices](https://jwt.io/introduction)

---

## 🤝 Contributing

See the main [CONTRIBUTING.md](../CONTRIBUTING.md) for:
- Branch and PR workflow
- Commit message conventions
- Code review process
- Getting help

---

**Last Updated:** 2024

For backend-specific questions, open a GitHub Discussion or Issue with the `backend` label.
