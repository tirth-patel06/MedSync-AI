# Contributing to MedSync AI

> **Labels:** `documentation`, `help wanted`

Thank you for your interest in contributing to MedSync AI! This guide provides an overview of the contribution process. For detailed setup instructions, see the specific guides for [Frontend](./client/CONTRIBUTING.md) and [Backend](./server/CONTRIBUTING.md).

---

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Development Setup](#development-setup)
  - [Frontend Setup](#frontend-setup)
  - [Backend Setup](#backend-setup)
- [Environment Variables & Security](#environment-variables--security)
- [Branch & Pull Request Workflow](#branch--pull-request-workflow)
- [Testing & Linting](#testing--linting)
- [Code Style Guidelines](#code-style-guidelines)
- [Getting Help](#getting-help)

---

## 🚀 Quick Start

**Prerequisites:**
- Node.js 18+ (LTS recommended)
- npm (comes with Node.js)
- MongoDB (local installation or MongoDB Atlas account)
- Git

**Quick Setup (Two Terminals):**

```bash
# Terminal 1: Backend
cd server
npm install
# Create .env file (see Environment Variables section)
npm run dev  # Runs on http://localhost:8080

# Terminal 2: Frontend
cd client
npm install
# Create .env file if needed (see Environment Variables section)
npm run dev  # Runs on http://localhost:5173
```

---

## 📁 Project Structure

MedSync AI is a monorepo with separate frontend and backend applications:

```
MedSync-AI/
├── client/                    # React frontend application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── context/           # React Context providers
│   │   ├── pages/             # Page components (routes)
│   │   ├── services/          # External service integrations
│   │   └── ...
│   ├── CONTRIBUTING.md        # Frontend-specific contributing guide
│   └── package.json
│
├── server/                    # Express.js backend API
│   ├── src/
│   │   ├── api/              # Controller functions
│   │   ├── routes/           # Express route definitions
│   │   ├── models/           # Mongoose schemas
│   │   ├── middlewares/      # Express middleware
│   │   ├── services/         # Service modules
│   │   ├── utils/            # Utilities & AI handlers
│   │   └── index.js         # Application entry point
│   ├── CONTRIBUTING.md       # Backend-specific contributing guide
│   └── package.json
│
├── ARCHITECTURE.md           # System architecture documentation
├── CONTRIBUTING.md           # This file (general contributing guide)
├── README.md                 # Project overview
└── SECURITY.md              # Security guidelines
```

**For detailed folder structure explanations:**
- Frontend: See [client/CONTRIBUTING.md](./client/CONTRIBUTING.md#folder-structure)
- Backend: See [server/CONTRIBUTING.md](./server/CONTRIBUTING.md#folder-structure)

---

## 💻 Development Setup

### Frontend Setup

The frontend is a React application built with Vite and Tailwind CSS.

**Location:** `client/`

**Quick Setup:**
```bash
cd client
npm install
npm run dev  # Starts at http://localhost:5173
```

**📖 For detailed frontend setup, folder structure, and guidelines, see:**
**[client/CONTRIBUTING.md](./client/CONTRIBUTING.md)**

**Key Tech Stack:**
- React 19.2.0 + Vite 7.1.7
- Tailwind CSS 4.1.14
- React Router DOM 7.9.3
- Socket.IO Client 4.8.1
- Axios 1.12.2

---

### Backend Setup

The backend is an Express.js API server with Socket.IO for real-time notifications.

**Location:** `server/`

**Quick Setup:**
```bash
cd server
npm install
# Create .env file (see Environment Variables section)
npm run dev  # Starts at http://localhost:8080
```

**📖 For detailed backend setup, folder structure, and guidelines, see:**
**[server/CONTRIBUTING.md](./server/CONTRIBUTING.md)**

**Key Tech Stack:**
- Express.js 5.1.0
- MongoDB 6.20.0 + Mongoose 8.19.0
- Socket.IO 4.8.1
- LangChain 0.3.35 (Groq/Gemini)
- JWT, bcryptjs, Google APIs

---

## 🔐 Environment Variables & Security

### ⚠️ Critical Security Rules

1. **Never commit `.env` files** - They are already in `.gitignore`
2. **Never commit API keys, secrets, or tokens** - Always use environment variables
3. **Use separate `.env` files** for `client/` and `server/`
4. **If a secret is exposed:**
   - Rotate it immediately
   - Scrub it from git history
   - Document the rotation in your PR

### Required Environment Variables

**Backend (`server/.env`):**
- `PORT` - Server port (default: 8080)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT token signing
- `GROQ_API_KEY` - API key for Groq LLM (required for AI agents)
- `GEMINI_API_KEY` - API key for Google Gemini (optional, for AI agents)
- `HUGGINGFACEHUB_API_KEY` - Hugging Face API key (optional)
- `GOOGLE_CLIENT_ID` - Google OAuth2 client ID (for Calendar sync)
- `GOOGLE_CLIENT_SECRET` - Google OAuth2 client secret
- `GOOGLE_REDIRECT_URI` - OAuth callback URL

**Frontend (`client/.env`):**
- `VITE_API_BASE_URL` - Backend API base URL (default: http://localhost:8080)
- `VITE_SOCKET_URL` - Socket.IO server URL (default: http://localhost:8080)
- `VITE_GOOGLE_OAUTH_LOGIN` - Google OAuth login endpoint

### Getting API Keys

- **MongoDB:** Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier available)
- **Groq:** Sign up at [Groq](https://console.groq.com/) for LLM API access
- **Google Gemini:** Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Google OAuth:** Create OAuth2 credentials in [Google Cloud Console](https://console.cloud.google.com/)

For detailed security guidelines, see `SECURITY.md`.

---

## 🌿 Branch & Pull Request Workflow

### 1. Fork & Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/MedSync-AI.git
cd MedSync-AI
git remote add upstream https://github.com/tirth-patel06/MedSync-AI.git
```

### 2. Create a Branch

Use descriptive branch names with prefixes:

```bash
git checkout -b feature/short-description
# Examples:
# - feature/add-dark-mode
# - fix/notification-bug
# - docs/update-readme
# - refactor/auth-middleware
```

**Branch Naming Conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Maintenance tasks

### 3. Make Changes

- Write clean, readable code
- Follow the code style guidelines (see below)
- Test your changes locally
- Run linters before committing

### 4. Commit Your Changes

Use conventional commit messages:

```bash
git commit -m "type: short description"
```

**Commit Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

**Examples:**
```bash
git commit -m "feat: add dark mode toggle"
git commit -m "fix: resolve notification timing issue"
git commit -m "docs: update contributing guide"
```

### 5. Stay Up to Date

Before pushing, sync with upstream:

```bash
git fetch upstream
git rebase upstream/main
# Resolve any conflicts if they occur
```

### 6. Push & Create Pull Request

```bash
git push origin feature/your-branch-name
```

Then create a Pull Request on GitHub:

1. **Link to an issue** - Comment on the issue to get assigned, then reference it in your PR (`Closes #123` or `Fixes #123`)
2. **Add labels** - For onboarding-friendly PRs, add `documentation` and `help wanted` labels
3. **Write a clear description:**
   - What changed and why
   - How to test the changes
   - Screenshots/GIFs for UI changes
   - Any breaking changes

### 7. PR Checklist

Before submitting, ensure:

- [ ] Code follows style guidelines
- [ ] Linter passes (`npm run lint` in client)
- [ ] No secrets or `.env` files committed
- [ ] Tests pass (if applicable)
- [ ] Documentation updated (if needed)
- [ ] PR description is clear and complete
- [ ] Screenshots/GIFs included for UI changes
- [ ] Issue referenced in PR description

---

## 🧪 Testing & Linting

### Frontend Testing & Linting

**Linting:**
```bash
cd client
npm run lint
```

**Build Check:**
```bash
npm run build
npm run preview  # Verify production build works
```

**Manual Testing:**
- Test authentication flow (signup/login)
- Test medication CRUD operations
- Test notifications (Socket.IO)
- Test AI agent chat
- Test report upload and analysis
- Test Google Calendar sync (if configured)

**Note:** Frontend tests are not yet set up. Contributions adding React Testing Library tests are welcome!

### Backend Testing & Linting

**Manual Testing:**
- Test API endpoints with Postman, cURL, or similar tools
- Verify Socket.IO connections
- Test authentication middleware
- Test AI agent endpoints
- Test file uploads (PDF parsing)

**Example cURL Test:**
```bash
# Test health endpoint
curl http://localhost:8080/

# Test protected endpoint (requires JWT token)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:8080/api/medicine
```

**Note:** Backend tests are not yet configured. Contributions adding Jest + Supertest are welcome!

### End-to-End Testing

1. Start backend: `cd server && npm run dev`
2. Start frontend: `cd client && npm run dev`
3. Test complete user flows:
   - Sign up → Login → Add medication → Receive notifications
   - Upload report → Analyze → Chat with report
   - Connect Google Calendar → Sync medication schedule

---

## 📝 Code Style Guidelines

### React/Frontend

- **Components:** Use functional components with hooks
- **Naming:** PascalCase for components, camelCase for variables/functions
- **Structure:** Keep components small and composable
- **Context:** Use React Context API for global state (medication, notifications, socket)
- **Styling:** Use Tailwind CSS utility classes
- **Imports:** Group imports (React, third-party, local)

**Example:**
```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSocket } from '../context/socketContext';

export const MedicationCard = ({ medication }) => {
  const [loading, setLoading] = useState(false);
  // ...
};
```

### Node.js/Express/Backend

- **Naming:** camelCase for functions/variables, PascalCase for models/classes
- **Error Handling:** Always use try/catch blocks with structured error responses
- **Async/Await:** Prefer async/await over callbacks
- **Routes:** Keep route handlers thin, move logic to controllers
- **Models:** Use Mongoose schemas for data validation

**Example:**
```javascript
export const getMedications = async (req, res) => {
  try {
    const medications = await Medication.find({ userId: req.user.id });
    res.json({ medications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

### General

- **Comments:** Add minimal, meaningful comments only where intent isn't obvious
- **DRY:** Don't repeat yourself - extract reusable functions/components
- **Small PRs:** Prefer small, focused PRs over large ones
- **Consistency:** Follow existing code patterns in the codebase

---

## 🆘 Getting Help

- **Questions:** Open a GitHub Discussion
- **Bugs:** Open an Issue with:
  - Clear description
  - Steps to reproduce
  - Expected vs actual behavior
  - Environment details
- **Feature Requests:** Open an Issue with:
  - Use case description
  - Proposed solution (if any)
- **PR Blockers:** Mention blockers in your PR comments - maintainers will help!
- **Good First Issues:** Look for issues tagged `good first issue` or `help wanted`

---

## 🎯 Contribution Ideas

Looking for ways to contribute? Here are some ideas:

- **Documentation:** Improve docs, add examples, create tutorials
- **Testing:** Add frontend tests (React Testing Library) or backend tests (Jest + Supertest)
- **Error Handling:** Improve error messages and validation
- **UX/UI:** Enhance accessibility, responsiveness, or user experience
- **AI Agents:** Improve prompts, add safety guardrails, expand agent capabilities
- **Performance:** Optimize queries, add caching, improve bundle size
- **CI/CD:** Add GitHub Actions for automated testing and linting
- **Docker:** Create Docker setup for easier development

---

Thank you for making MedSync AI better! 🚀

If you have questions or need clarification, don't hesitate to ask. We're here to help!
