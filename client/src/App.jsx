import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

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



function App() {
  return (
    <>
    
    <Routes>
      <Route path="/" element={<Navigate to="/landing" />} />
      <Route path="/landing" element={<LandingPage />} />
        <Route path="/agents" element={<MultiAgentChat />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
         <Route path="/notifications" element={<NotificationsPage />} />
        <Route 
          path="/dashboard" 
          element={
            
              <Dashboard />
       
          } 
        />
        <Route path="/health" element={<HealthProfile />} />
      <Route path="/addMedication" element={<MedicationEntryForm />} />
      <Route path="/oauth2callback" element={<OAuthCallback />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/reports" element={<Reports />} />

    </Routes>
    </>
  )
}

export default App