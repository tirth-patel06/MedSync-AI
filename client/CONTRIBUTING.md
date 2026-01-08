# Contributing to MedSync AI - Frontend

> **Labels:** `documentation`, `help wanted`

This guide covers frontend-specific setup, folder structure, and contribution guidelines for the React client application.

---

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Folder Structure](#folder-structure)
- [Development Setup](#development-setup)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing](#testing)
- [Common Tasks](#common-tasks)

---

## 🚀 Quick Start

**Prerequisites:**
- Node.js 18+ (LTS recommended)
- npm (comes with Node.js)

**Setup:**
```bash
cd client
npm install
npm run dev  # Starts dev server at http://localhost:5173
```

---

## 📁 Folder Structure

```
client/
├── public/                    # Static assets
│   └── vite.svg              # Vite logo
│
├── src/                       # Source code
│   ├── assets/               # Images, icons, fonts
│   │   └── react.svg
│   │
│   ├── components/           # Reusable React components
│   │   ├── Navbar.jsx       # Navigation bar component
│   │   ├── NotificationToast.jsx  # Toast notification component
│   │   └── ProtectedRoute.jsx     # Route protection wrapper
│   │
│   ├── context/              # React Context providers
│   │   ├── calendarSyncContext.jsx    # Google Calendar sync state
│   │   ├── medicationContext.jsx      # Medication state management
│   │   ├── notificationContext.jsx    # Notification state
│   │   └── socketContext.jsx          # Socket.IO connection state
│   │
│   ├── pages/                # Page components (routes)
│   │   ├── addMedication.jsx         # Add/edit medication form
│   │   ├── agents.jsx                # AI agents chat interface
│   │   ├── Analytics.jsx              # Analytics dashboard
│   │   ├── ConnectCalendar.jsx       # Google Calendar connection
│   │   ├── Dashboard.jsx             # Main dashboard
│   │   ├── HealthProfile.jsx         # User health profile
│   │   ├── landingPage.jsx           # Landing/home page
│   │   ├── Login.jsx                 # Login page
│   │   ├── notifications.jsx         # Notifications page
│   │   ├── OAuthCallback.jsx         # OAuth callback handler
│   │   ├── ReportAnalysis.jsx        # Report analysis view
│   │   ├── ReportChat.jsx            # Chat with report
│   │   ├── Reports.jsx                # Reports listing
│   │   └── Signup.jsx                # Signup page
│   │
│   ├── services/             # External service integrations
│   │   └── socketService.js  # Socket.IO client wrapper
│   │
│   ├── App.jsx               # Main app component with routing
│   ├── main.jsx              # React app entry point
│   └── global.css            # Global styles (Tailwind imports)
│
├── index.html                # HTML template
├── package.json              # Dependencies and scripts
├── vite.config.js           # Vite configuration
├── eslint.config.js         # ESLint configuration
└── README.md                # Frontend-specific README
```

### 📂 Directory Details

#### `src/components/`
Reusable UI components used across multiple pages.

- **Navbar.jsx** - Main navigation bar with user menu and links
- **NotificationToast.jsx** - Toast notification component for displaying alerts
- **ProtectedRoute.jsx** - Higher-order component that protects routes requiring authentication

#### `src/context/`
React Context API providers for global state management.

- **medicationContext.jsx** - Manages medication list, CRUD operations, and medication state
- **notificationContext.jsx** - Handles notification state and unread counts
- **socketContext.jsx** - Manages Socket.IO connection, real-time notifications, and WebSocket events
- **calendarSyncContext.jsx** - Manages Google Calendar sync status and operations

#### `src/pages/`
Page-level components that correspond to routes in the application.

- **Dashboard.jsx** - Main dashboard showing today's medications, streaks, and stats
- **Login.jsx** / **Signup.jsx** - Authentication pages
- **addMedication.jsx** - Form for adding/editing medications
- **agents.jsx** - AI agent chat interface (Medical, Emergency, Medicine, Personal Health agents)
- **Reports.jsx** - List of uploaded medical reports
- **ReportAnalysis.jsx** - View AI analysis of uploaded reports
- **ReportChat.jsx** - Chat interface for asking questions about reports
- **Analytics.jsx** - Analytics and statistics dashboard
- **HealthProfile.jsx** - User health profile management
- **ConnectCalendar.jsx** - Google Calendar OAuth connection flow
- **OAuthCallback.jsx** - Handles OAuth callback from Google
- **notifications.jsx** - Notifications page showing all notifications
- **landingPage.jsx** - Landing/home page

#### `src/services/`
Service modules for external API integrations.

- **socketService.js** - Socket.IO client service that wraps socket.io-client, handles connection, events, and notification management

#### Root Files
- **App.jsx** - Main app component that sets up React Router and route definitions
- **main.jsx** - Entry point that renders the React app, wraps providers (Context, Router)
- **global.css** - Global stylesheet with Tailwind CSS imports and custom styles

---

## 💻 Development Setup

### 1. Install Dependencies

```bash
cd client
npm install
```

### 2. Environment Variables (Optional)

Create `client/.env` if you need to customize API endpoints:

```bash
# client/.env
VITE_API_BASE_URL=http://localhost:8080
VITE_SOCKET_URL=http://localhost:8080
VITE_GOOGLE_OAUTH_LOGIN=http://localhost:8080/api/oauth/login
```

**Note:** These are optional. The app will use default values if not set.

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` with hot module replacement (HMR).

---

## 🔧 Available Scripts

### `npm run dev`
Starts the Vite development server with hot module replacement.
- **URL:** http://localhost:5173
- **Features:** Fast refresh, instant updates, source maps

### `npm run build`
Creates an optimized production build.
- **Output:** `dist/` directory
- **Features:** Minification, tree-shaking, code splitting

### `npm run preview`
Serves the production build locally for testing.
- **Use:** Test production build before deployment
- **Requires:** Run `npm run build` first

### `npm run lint`
Runs ESLint to check code quality and style.
- **Config:** `eslint.config.js`
- **Fixes:** Run with `--fix` flag to auto-fix issues

---

## 📝 Code Style Guidelines

### Component Structure

```jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/socketContext';
import axios from 'axios';

export const ComponentName = ({ prop1, prop2 }) => {
  // Hooks
  const [state, setState] = useState(null);
  const navigate = useNavigate();
  const { socketService } = useSocket();

  // Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);

  // Handlers
  const handleClick = () => {
    // Handler logic
  };

  // Render
  return (
    <div className="container">
      {/* JSX */}
    </div>
  );
};
```

### Naming Conventions

- **Components:** PascalCase (`MedicationCard.jsx`)
- **Files:** Match component name (`MedicationCard.jsx`)
- **Variables/Functions:** camelCase (`getMedications`, `userData`)
- **Constants:** UPPER_SNAKE_CASE (`API_BASE_URL`)
- **CSS Classes:** Use Tailwind utility classes

### React Best Practices

1. **Use Functional Components** - Prefer function components with hooks
2. **Extract Custom Hooks** - Reusable logic should be in custom hooks
3. **Context for Global State** - Use Context API for shared state
4. **Props Validation** - Consider PropTypes or TypeScript for prop validation
5. **Conditional Rendering** - Use ternary or logical operators
6. **Key Props** - Always provide keys for list items

### Tailwind CSS Guidelines

- Use utility classes directly in JSX
- Group related utilities together
- Use responsive prefixes (`sm:`, `md:`, `lg:`)
- Extract repeated patterns into components

**Example:**
```jsx
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
  {/* Content */}
</div>
```

---

## 🧪 Testing

### Current State
Frontend tests are not yet set up. Contributions adding tests are welcome!

### Recommended Testing Setup

**React Testing Library:**
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

**Example Test:**
```jsx
import { render, screen } from '@testing-library/react';
import { MedicationCard } from './MedicationCard';

test('renders medication name', () => {
  render(<MedicationCard medication={{ name: 'Aspirin' }} />);
  expect(screen.getByText('Aspirin')).toBeInTheDocument();
});
```

### Manual Testing Checklist

Before submitting a PR, test:
- [ ] Component renders correctly
- [ ] User interactions work (clicks, form submissions)
- [ ] API calls succeed/fail gracefully
- [ ] Error states display properly
- [ ] Loading states show appropriately
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Accessibility (keyboard navigation, screen readers)

---

## 🔨 Common Tasks

### Adding a New Page

1. Create component in `src/pages/`:
   ```jsx
   // src/pages/NewPage.jsx
   import React from 'react';

   export const NewPage = () => {
     return <div>New Page Content</div>;
   };
   ```

2. Add route in `src/App.jsx`:
   ```jsx
   import { NewPage } from './pages/NewPage';
   
   <Route path="/new-page" element={<ProtectedRoute><NewPage /></ProtectedRoute>} />
   ```

3. Add navigation link in `Navbar.jsx` if needed

### Adding a New Context

1. Create context file in `src/context/`:
   ```jsx
   // src/context/newContext.jsx
   import React, { createContext, useContext, useState } from 'react';

   const NewContext = createContext();

   export const useNewContext = () => {
     const context = useContext(NewContext);
     if (!context) {
       throw new Error('useNewContext must be used within NewProvider');
     }
     return context;
   };

   export const NewProvider = ({ children }) => {
     const [state, setState] = useState(null);
     
     const value = { state, setState };
     
     return (
       <NewContext.Provider value={value}>
         {children}
       </NewContext.Provider>
     );
   };
   ```

2. Wrap app in `src/main.jsx`:
   ```jsx
   import { NewProvider } from './context/newContext';
   
   <NewProvider>
     {/* Other providers */}
   </NewProvider>
   ```

### Adding a New Component

1. Create component in `src/components/`:
   ```jsx
   // src/components/NewComponent.jsx
   import React from 'react';

   export const NewComponent = ({ prop1 }) => {
     return <div>{prop1}</div>;
   };
   ```

2. Import and use in pages:
   ```jsx
   import { NewComponent } from '../components/NewComponent';
   ```

### Making API Calls

Use Axios for API calls:

```jsx
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// GET request
const fetchData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/endpoint`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// POST request
const postData = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/endpoint`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
```

---

## 🐛 Debugging

### Browser DevTools
- **React DevTools** - Inspect component tree and props
- **Network Tab** - Monitor API calls and responses
- **Console** - Check for errors and warnings

### Common Issues

**Port Already in Use:**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

**Module Not Found:**
- Check import paths (use relative paths)
- Verify file exists
- Restart dev server

**Styling Issues:**
- Check Tailwind classes are correct
- Verify `global.css` imports Tailwind
- Check for CSS specificity conflicts

---

## 📚 Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [React Router Documentation](https://reactrouter.com/)
- [Socket.IO Client Documentation](https://socket.io/docs/v4/client-api/)

---

## 🤝 Contributing

See the main [CONTRIBUTING.md](../CONTRIBUTING.md) for:
- Branch and PR workflow
- Commit message conventions
- Code review process
- Getting help

---

**Last Updated:** 2024

For frontend-specific questions, open a GitHub Discussion or Issue with the `frontend` label.
