import React, { useState, useEffect, useRef } from 'react';
import { Settings, Check } from 'lucide-react';
import { useLanguage } from '../hooks/useTranslation.js';
import axios from 'axios';

export default function LanguageSettings() {
  const { supportedLanguages, language: currentLanguage, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = async (langCode) => {
    if (langCode === currentLanguage) {
      setIsOpen(false);
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      // Update backend
      if (token) {
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/api/languages/user`,
          { preferredLanguage: langCode },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // Update frontend state
      setLanguage(langCode);

      // Update localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.preferredLanguage = langCode;
        localStorage.setItem('user', JSON.stringify(user));
      }

      setIsOpen(false);
    } catch (error) {
      console.error('Error updating language preference:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const currentLanguageName = supportedLanguages.find(l => l.code === currentLanguage);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-slate-800/50 rounded-lg transition-all flex items-center gap-2"
        title="Language settings"
      >
        <Settings className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-xl rounded-xl border border-slate-700 shadow-xl z-50">
          <div className="p-3 border-b border-slate-700">
            <p className="text-xs font-semibold text-slate-400 uppercase">Language</p>
          </div>
          
          <div className="py-2">
            {supportedLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                disabled={isSaving}
                className={`w-full px-4 py-3 text-left text-sm flex items-center justify-between hover:bg-slate-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  currentLanguage === lang.code ? 'bg-slate-800/50 text-cyan-400' : 'text-slate-300'
                }`}
              >
                <div>
                  <div className="font-medium">{lang.nativeName}</div>
                  <div className="text-xs text-slate-500">{lang.name}</div>
                </div>
                {currentLanguage === lang.code && (
                  <Check className="w-4 h-4 text-cyan-400" />
                )}
              </button>
            ))}
          </div>

          <div className="px-4 py-3 border-t border-slate-700 text-xs text-slate-400">
            Current: {currentLanguageName?.nativeName}
          </div>
        </div>
      )}
    </div>
  );
}

