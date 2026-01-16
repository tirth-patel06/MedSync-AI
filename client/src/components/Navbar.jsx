import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { LanguageSwitcher } from "./LanguageSwitcher";
import LanguageSettings from "./LanguageSettings";
import { Settings } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // remove JWT
    navigate("/login"); 
  };

  return (
    <nav className="flex justify-between items-center bg-gray-800 text-white px-6 py-3 shadow-md">
      <div className="flex space-x-4">
        <Link to="/dashboard" className="hover:text-blue-400">Dashboard</Link>
        <Link to="/health" className="hover:text-blue-400">Health</Link>
      </div>
      <div className="flex items-center space-x-4">
        <LanguageSwitcher />
        <LanguageSettings />
        <button
          onClick={() => navigate("/settings")}
          className="p-2 hover:bg-slate-700 rounded-lg transition-all"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}