import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { useLanguage } from '../hooks/useTranslation';

export const LanguageSwitcher = ({ className = '' }) => {
  const { language, supportedLanguages, setLanguage, loading } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);


  const getNativeLanguageName = (code) => {
    const lang = supportedLanguages.find(l => l.code === code);
    return lang?.nativeName || code.toUpperCase();
  };

  const handleLanguageSelect = (newLanguage) => {
    setLanguage(newLanguage);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (loading) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 ${className}`}>
        <Globe size={18} className="text-gray-400" />
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      {/* Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-gray-800 font-medium text-sm transition-all duration-200 border border-blue-200 shadow-sm hover:shadow-md"
        aria-label="Change language"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe size={18} className="text-blue-600" />
        <span>{getNativeLanguageName(language)}</span>
        <ChevronDown
          size={16}
          className={`text-gray-600 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
          role="listbox"
        >
          <div className="p-2">
            {supportedLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-150 ${
                  language === lang.code
                    ? 'bg-blue-100 text-blue-800 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                role="option"
                aria-selected={language === lang.code}
              >
                <div className="flex items-center justify-between">
                  <span>{lang.nativeName}</span>
                  {language === lang.code && (
                    <span className="text-blue-600 font-bold">✓</span>
                  )}
                </div>
                <div className="text-xs text-gray-500">{lang.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
