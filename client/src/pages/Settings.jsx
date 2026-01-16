import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Globe,
  Volume2,
  Eye,
  RotateCcw,
  Save,
  ArrowLeft,
  Check,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useTranslation';
import axios from 'axios';

const READING_LEVELS = [
  { value: 'all', label: 'All levels (Expert content)' },
  { value: 'college', label: 'College/University' },
  { value: 'highschool', label: 'High School' },
  { value: 'middle', label: 'Middle School' },
  { value: 'elementary', label: 'Elementary' }
];

export default function Settings() {
  const navigate = useNavigate();
  const { supportedLanguages } = useLanguage();
  
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const [settings, setSettings] = useState({
    preferredLanguage: 'en',
    autoTranslateAll: false,
    showReadabilityScores: true,
    targetReadingLevel: 'highschool'
  });

  const [originalSettings, setOriginalSettings] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Load user settings on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
        
        // Initialize settings from user profile
        setSettings(prev => ({
          ...prev,
          preferredLanguage: parsedUser.preferredLanguage || 'en'
        }));
        
        // Load additional settings from localStorage
        const savedSettings = localStorage.getItem('userSettings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setSettings(prev => ({ ...prev, ...parsed }));
          setOriginalSettings({ ...parsed });
        } else {
          setOriginalSettings({
            preferredLanguage: parsedUser.preferredLanguage || 'en',
            autoTranslateAll: false,
            showReadabilityScores: true,
            targetReadingLevel: 'highschool'
          });
        }
      } catch (error) {
        console.error('Error loading user:', error);
      }
    }
    setLoading(false);
  }, []);

  // Check if settings have changed
  useEffect(() => {
    const changed = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasChanges(changed);
  }, [settings, originalSettings]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      // Update language preference in backend
      if (settings.preferredLanguage !== originalSettings.preferredLanguage && currentUser) {
        const token = localStorage.getItem('token');
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/api/languages/user`,
          { preferredLanguage: settings.preferredLanguage },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // Save other settings to localStorage
      localStorage.setItem('userSettings', JSON.stringify({
        autoTranslateAll: settings.autoTranslateAll,
        showReadabilityScores: settings.showReadabilityScores,
        targetReadingLevel: settings.targetReadingLevel,
        preferredLanguage: settings.preferredLanguage
      }));

      // Update localStorage user if language changed
      if (currentUser && settings.preferredLanguage !== currentUser.preferredLanguage) {
        const updatedUser = { ...currentUser, preferredLanguage: settings.preferredLanguage };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
      }

      setOriginalSettings({ ...settings });
      setMessage('✅ Settings saved successfully!');
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('❌ Error saving settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    const defaults = {
      preferredLanguage: currentUser?.preferredLanguage || 'en',
      autoTranslateAll: false,
      showReadabilityScores: true,
      targetReadingLevel: 'highschool'
    };
    setSettings(defaults);
    setHasChanges(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        
        {/* Header */}
        <header className="flex items-center space-x-4">
          <button 
            onClick={() => navigate("/dashboard")}
            className="p-3 hover:bg-slate-800/50 rounded-xl transition-all group"
          >
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-slate-400">Customize your MedSync experience</p>
          </div>
        </header>

        {/* Message Alert */}
        {message && (
          <div className={`px-4 py-3 rounded-lg flex items-center gap-2 ${
            message.includes('✅') 
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
              : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}>
            {message.includes('✅') ? (
              <Check className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message}</span>
          </div>
        )}

        {/* Settings Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-800 space-y-8">
          
          {/* Language Preferences Section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-cyan-400" />
              </div>
              <h2 className="text-xl font-bold">Language Preferences</h2>
            </div>

            <div className="space-y-4">
              {/* Preferred Language */}
              <div>
                <label className="block text-purple-200 font-semibold mb-2">
                  Preferred Language
                </label>
                <select
                  value={settings.preferredLanguage}
                  onChange={(e) => handleSettingChange('preferredLanguage', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 bg-opacity-50 border border-cyan-500 border-opacity-30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                >
                  {supportedLanguages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.nativeName} ({lang.name})
                    </option>
                  ))}
                </select>
                <p className="text-slate-400 text-sm mt-2">
                  Display medication instructions and reports in this language
                </p>
              </div>

              {/* Auto-Translate Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-cyan-400" />
                  <div>
                    <p className="font-semibold">Auto-translate all content</p>
                    <p className="text-slate-400 text-sm">Automatically translate AI responses and analysis</p>
                  </div>
                </div>
                <button
                  onClick={() => handleSettingChange('autoTranslateAll', !settings.autoTranslateAll)}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    settings.autoTranslateAll 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500' 
                      : 'bg-slate-700'
                  }`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    settings.autoTranslateAll ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Readability Preferences Section */}
          <div className="pt-6 border-t border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-400" />
              </div>
              <h2 className="text-xl font-bold">Readability Settings</h2>
            </div>

            <div className="space-y-4">
              {/* Show Readability Scores Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="font-semibold">Show readability scores</p>
                    <p className="text-slate-400 text-sm">Display reading level badges on reports and analysis</p>
                  </div>
                </div>
                <button
                  onClick={() => handleSettingChange('showReadabilityScores', !settings.showReadabilityScores)}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    settings.showReadabilityScores
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                      : 'bg-slate-700'
                  }`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    settings.showReadabilityScores ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* Target Reading Level */}
              <div>
                <label className="block text-purple-200 font-semibold mb-2">
                  Target Reading Level
                </label>
                <select
                  value={settings.targetReadingLevel}
                  onChange={(e) => handleSettingChange('targetReadingLevel', e.target.value)}
                  disabled={!settings.showReadabilityScores}
                  className="w-full px-4 py-3 bg-gray-700 bg-opacity-50 border border-green-500 border-opacity-30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {READING_LEVELS.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
                <p className="text-slate-400 text-sm mt-2">
                  Adjust medical content complexity to match your comfort level
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-slate-700 flex gap-3">
            <button
              onClick={handleResetDefaults}
              className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Reset to Defaults
            </button>
            <button
              onClick={handleSaveSettings}
              disabled={!hasChanges || saving}
              className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                hasChanges && !saving
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Settings
                </>
              )}
            </button>
          </div>

          {/* Unsaved Changes Warning */}
          {hasChanges && (
            <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg flex items-center gap-2 text-orange-400">
              <AlertCircle className="w-5 h-5" />
              <span>You have unsaved changes</span>
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/30">
          <div className="flex gap-4">
            <SettingsIcon className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-2">About Your Settings</h3>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• <strong>Preferred Language:</strong> Used for medication instructions and report generation</li>
                <li>• <strong>Auto-translate:</strong> Automatically translates AI responses and analysis results</li>
                <li>• <strong>Readability Scores:</strong> Shows text complexity indicators on medical content</li>
                <li>• <strong>Reading Level:</strong> Helps tailor content to your comprehension preference</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
