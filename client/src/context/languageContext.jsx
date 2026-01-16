import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState('en');
  const [supportedLanguages, setSupportedLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

  // Fetch user's preferred language on mount
  useEffect(() => {
    const fetchUserLanguage = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/languages/user`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setLanguageState(response.data.preferredLanguage || 'en');
        setSupportedLanguages(response.data.supportedLanguages || []);
      } catch (err) {
        // Fallback to default if fetch fails
        console.warn('Could not fetch user language preference:', err.message);
        setLanguageState('en');
        // Try to fetch just the supported languages list
        try {
          const langResponse = await axios.get(`${API_BASE_URL}/api/languages/supported`);
          setSupportedLanguages(langResponse.data.languages || []);
        } catch (langErr) {
          console.warn('Could not fetch supported languages:', langErr.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserLanguage();
  }, []);

  // Update language preference
  const updateLanguage = useCallback(async (newLanguage) => {
    try {
      setLanguageState(newLanguage);
      await axios.put(
        `${API_BASE_URL}/api/languages/user`,
        { language: newLanguage },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
    } catch (err) {
      console.error('Failed to update language preference:', err.message);
      setError(err.message);
      // Still keep the local state updated
    }
  }, []);

  // Translate text
  const translateText = useCallback(async (text, targetLanguage = null, context = 'medical') => {
    const targetLang = targetLanguage || language;
    if (!text || text.trim().length === 0) {
      return text;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/translate`,
        {
          text,
          targetLanguage: targetLang,
          context,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return response.data.translatedText || text;
    } catch (err) {
      console.error('Translation failed:', err.message);
      return text; // Fallback to original text
    }
  }, [language]);

  // Batch translate texts
  const translateBatch = useCallback(async (texts = [], targetLanguage = null, context = 'medical') => {
    const targetLang = targetLanguage || language;
    if (!Array.isArray(texts) || texts.length === 0) {
      return [];
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/translate/batch`,
        {
          texts,
          targetLanguage: targetLang,
          context,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return response.data.translatedTexts || texts;
    } catch (err) {
      console.error('Batch translation failed:', err.message);
      return texts; // Fallback to original texts
    }
  }, [language]);

  const value = {
    language,
    setLanguage: updateLanguage,
    supportedLanguages,
    loading,
    error,
    translateText,
    translateBatch,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
