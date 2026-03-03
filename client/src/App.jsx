import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSocket } from "./context/socketContext.jsx";
import { LanguageProvider } from "./context/languageContext.jsx";
import { CalendarSyncProvider } from "./context/calendarSyncContext.jsx";

// Pages
import LandingPage from "./pages/LandingPage.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import HealthProfile from "./pages/HealthProfile.jsx";
import MedicationEntryForm from "./pages/addMedication.jsx";
import MultiAgentChat from "./pages/Agents.jsx";
import NotificationsPage from "./pages/Notifications.jsx";
import OAuthCallback from "./pages/OAuthCallback.jsx";
import Analytics from "./pages/Analytics.jsx";
import Reports from "./pages/Reports.jsx";
import ReportChat from "./pages/ReportChat.jsx";
import ReportAnalysis from "./pages/ReportAnalysis.jsx";
import Settings from "./pages/Settings.jsx";

// Components
import NotificationContainer from "./components/NotificationToast.jsx";
//import OfflineBanner from "./components/OfflineBanner.jsx";

function App() {
  const { notifications, removeNotification } = useSocket();

  return (
    <LanguageProvider>
      <CalendarSyncProvider>

        {/* Global offline indicator */}
        {/*<OfflineBanner />*/}

        <Routes>
          <Route path="/" element={<Navigate to="/landing" />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/agents" element={<MultiAgentChat />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/health" element={<HealthProfile />} />
          <Route path="/addMedication" element={<MedicationEntryForm />} />
          <Route path="/oauth2callback" element={<OAuthCallback />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reportChat" element={<ReportChat />} />
          <Route path="/report-analysis" element={<ReportAnalysis />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>

        {/* Global notification toasts */}
        <NotificationContainer
          notifications={notifications}
          onRemoveNotification={removeNotification}
        />

      </CalendarSyncProvider>
    </LanguageProvider>
  );
}

export default App;