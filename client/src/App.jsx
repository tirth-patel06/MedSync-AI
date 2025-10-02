import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MedicationEntryForm from './pages/addMedication.jsx'
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import HealthProfile from "./pages/HealthProfile";

function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="/health" element={<HealthProfile />} />
      <Route path="/addMedication" element={<MedicationEntryForm />} />
    </Routes>
    </BrowserRouter>
  )
}

export default App