import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSocket } from './context/socketContext';
import { CalendarSyncProvider } from './context/calendarSyncContext.jsx';
import { LanguageProvider } from './context/languageContext.jsx';
import NotificationContainer from './components/NotificationToast';
import MedicationEntryForm from './pages/addMedication.jsx'
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import LandingPage from "./pages/landingPage.jsx";
import NotificationsPage from "./pages/notifications.jsx"
import MultiAgentChat from './pages/agents.jsx';
import HealthProfile from "./pages/HealthProfile";
import OAuthCallback from "./pages/OAuthCallback";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import ReportChat from "./pages/ReportChat";
import ReportAnalysis from "./pages/ReportAnalysis";
import Settings from "./pages/Settings";


function App() {
  const { notifications, removeNotification } = useSocket();

  return (

    <LanguageProvider>
      <CalendarSyncProvider>
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

   
    
   
  )
}

export default App