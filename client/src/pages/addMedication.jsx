import React, { useState, useEffect } from 'react';
import {
  Plus, Trash2, Clock, Pill, Calendar, Check, ArrowLeft,
  Sparkles, AlertCircle, Save, RotateCcw, Copy, Languages
} from 'lucide-react';
import { useMedicine } from '../context/medicationContext';
import { useNotification } from '../context/notificationContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useTranslation.js';
import Button from '../components/Button';
import Loader from '../components/Loader';


export default function MedicationEntryForm() {
  const navigate = useNavigate();
  const { sendNotification } = useNotification();
  const { medication, setMedication, addMedication } = useMedicine();
  const { translateText, supportedLanguages } = useLanguage();

  const [currentTime, setCurrentTime] = useState({
    time: "",
    remindBefore: "15m",
    remindAfter: "30m"
  });
  const [showJson, setShowJson] = useState(false);
  const [translationPreviews, setTranslationPreviews] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const reminderOptions = ["5m", "10m", "15m", "30m", "1h"];

  // 🌐 Debounced translation preview
  useEffect(() => {
    if (!medication.pillDescription || medication.pillDescription.trim().length === 0) {
      setTranslationPreviews({});
      return;
    }

    const delayTimer = setTimeout(async () => {
      setIsTranslating(true);
      try {
        const previews = {};
        for (const lang of supportedLanguages.filter(l => l.code !== 'en')) {
          const translated = await translateText(medication.pillDescription, lang.code, 'medication');
          previews[lang.code] = translated;
        }
        setTranslationPreviews(previews);
      } catch (error) {
        console.error('Translation preview error:', error);
      } finally {
        setIsTranslating(false);
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(delayTimer);
  }, [medication.pillDescription]);

  const handleInputChange = (field, value) => {
    setMedication(prev => ({ ...prev, [field]: value }));
  };

  const handleDayToggle = (day) => {
    setMedication(prev => ({
      ...prev,
      dosageDays: prev.dosageDays.includes(day)
        ? prev.dosageDays.filter(d => d !== day)
        : [...prev.dosageDays, day]
    }));
  };

  const addDosageTime = () => {
    if (!currentTime.time) { alert("Please select a time"); return; }
    const newTime = { ...currentTime, status: "pending", takenAt: null };
    setMedication(prev => ({ ...prev, dosageTimes: [...prev.dosageTimes, newTime] }));
    setCurrentTime({ time: "", remindBefore: "15m", remindAfter: "30m" });
  };

  const removeDosageTime = (index) => {
    setMedication(prev => ({
      ...prev,
      dosageTimes: prev.dosageTimes.filter((_, i) => i !== index)
    }));
  };

  const getFinalObject = () => ({

    pillName: medication.pillName,
    pillDescription: medication.pillDescription,
    dosageDays: medication.dosageDays,
    dosageTimes: medication.dosageTimes,
    dosageAmount: medication.dosageAmount,
    frequency: medication.frequency,
    startDate: new Date(medication.startDate),
    endDate: medication.endDate ? new Date(medication.endDate) : null,
    adherenceHistory: []
  });

  const handleSubmit = async () => {
    if (!medication.pillName) {
      alert("Please enter pill name");
      return;
    }
    if (medication.dosageDays.length === 0) {
      alert("Please select at least one day");
      return;
    }
    if (medication.dosageTimes.length === 0) {
      alert("Please add at least one dosage time");
      return;
    }

    setIsSubmitting(true);
    try {
      await addMedication();
      setShowJson(true);
      // Navigate back to dashboard after successful submission
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error adding medication:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setMedication({
      pillName: "",
      pillDescription: "",
      dosageDays: [],
      dosageTimes: [],
      dosageAmount: "",
      frequency: "",
      startDate: new Date().toISOString().split('T')[0],
      endDate: ""
    });
    setShowJson(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-4xl mx-auto p-6 space-y-6">

        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-3 hover:bg-slate-800/50 rounded-xl transition-all group"
            >
              <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">
                Add New Medication
              </h1>
              <p className="text-slate-400">Create a new medication schedule</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-rose-500/20 rounded-xl flex items-center justify-center">
              <Pill className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </header>

        {/* Main Form Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-800 space-y-8">


          {/* Pill Name */}
          <div>
            <label className="flex items-center gap-2 text-purple-200 font-semibold mb-2">
              <Pill size={18} />
              Pill Name <span className="text-pink-400">*</span>
            </label>
            <input
              type="text"
              value={medication.pillName}
              onChange={e => handleInputChange('pillName', e.target.value)}
              placeholder="e.g., Aspirin, Metformin"
              className="w-full px-4 py-3 bg-gray-700 bg-opacity-50 border border-purple-500 border-opacity-30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-purple-200 font-semibold mb-2">
              Description
            </label>
            <textarea
              value={medication.pillDescription}
              onChange={e => handleInputChange('pillDescription', e.target.value)}
              rows={3}
              placeholder="Notes about this medication..."
              className="w-full px-4 py-3 bg-gray-700 bg-opacity-50 border border-purple-500 border-opacity-30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
            />

            {/* 🌐 Translation Preview */}
            {medication.pillDescription && medication.pillDescription.trim().length > 0 && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 text-sm">
                  <Languages className="w-4 h-4" />
                  <span className="font-medium">Translation Preview</span>
                  {isTranslating && (
                    <div className="flex items-center gap-1">
                      <Loader size="sm" color="blue" />
                      <span className="text-xs text-slate-400">translating...</span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {supportedLanguages.filter(l => l.code !== 'en').map(lang => (
                    <div
                      key={lang.code}
                      className="bg-slate-800/50 rounded-lg p-3 border border-cyan-500/20"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-cyan-400">{lang.nativeName}</span>
                        <span className="text-xs text-slate-500">({lang.code.toUpperCase()})</span>
                      </div>
                      <p className="text-sm text-slate-300">
                        {isTranslating ? (
                          <div className="h-4 w-24 bg-slate-700 rounded animate-pulse"></div>
                        ) : (
                          translationPreviews[lang.code] || medication.pillDescription
                        )}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500 italic">
                  ℹ️ Translations will be automatically saved when you create the medication
                </p>
              </div>
            )}
          </div>

          {/* Dosage Amount & Frequency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-purple-200 font-semibold mb-2">
                Dosage Amount
              </label>
              <input
                type="text"
                value={medication.dosageAmount}
                onChange={e => handleInputChange('dosageAmount', e.target.value)}
                placeholder="e.g., 500mg, 2 tablets"
                className="w-full px-4 py-3 bg-gray-700 bg-opacity-50 border border-purple-500 border-opacity-30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-purple-200 font-semibold mb-2">
                Frequency
              </label>
              <input
                type="text"
                value={medication.frequency}
                onChange={e => handleInputChange('frequency', e.target.value)}
                placeholder="e.g., 2 times a day"
                className="w-full px-4 py-3 bg-gray-700 bg-opacity-50 border border-purple-500 border-opacity-30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Days Selection */}
          <div>
            <label className="flex items-center gap-2 text-purple-200 font-semibold mb-3">
              <Calendar size={18} />
              Select Days <span className="text-pink-400">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {weekDays.map(day => (
                <button
                  key={day}
                  onClick={() => handleDayToggle(day)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${medication.dosageDays.includes(day)
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/50 scale-105'
                      : 'bg-gray-700 bg-opacity-50 text-purple-300 hover:bg-opacity-70'
                    }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Dosage Times */}
          <div>
            <label className="flex items-center gap-2 text-purple-200 font-semibold mb-3">
              <Clock size={18} />
              Dosage Times <span className="text-pink-400">*</span>
            </label>

            <div className="bg-gray-700 bg-opacity-30 rounded-lg p-4 mb-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-purple-200 text-sm mb-1">Time</label>
                  <input
                    type="time"
                    value={currentTime.time}
                    onChange={e => setCurrentTime(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-purple-500 border-opacity-30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-purple-200 text-sm mb-1">Remind Before</label>
                  <select
                    value={currentTime.remindBefore}
                    onChange={e => setCurrentTime(prev => ({ ...prev, remindBefore: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-purple-500 border-opacity-30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {reminderOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-purple-200 text-sm mb-1">Remind After</label>
                  <select
                    value={currentTime.remindAfter}
                    onChange={e => setCurrentTime(prev => ({ ...prev, remindAfter: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-purple-500 border-opacity-30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {reminderOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>

              <button
                onClick={addDosageTime}
                className="w-full py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2 hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg"
              >
                <Plus size={20} /> Add Time
              </button>
            </div>

            {medication.dosageTimes.length > 0 && (
              <div className="space-y-2">
                {medication.dosageTimes.map((time, index) => (
                  <div
                    key={index}
                    className="bg-gray-700 bg-opacity-40 rounded-lg p-4 flex items-center justify-between gap-4"
                  >
                    <div className="text-purple-200">
                      <span className="font-semibold text-white">{time.time}</span>
                      <span className="text-sm ml-3">Before: {time.remindBefore} | After: {time.remindAfter}</span>
                    </div>
                    <button
                      onClick={() => removeDosageTime(index)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500 hover:bg-opacity-20 p-2 rounded-lg transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Start & End Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-purple-200 font-semibold mb-2">
                Start Date <span className="text-pink-400">*</span>
              </label>
              <input
                type="date"
                value={medication.startDate}
                onChange={e => handleInputChange('startDate', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 bg-opacity-50 border border-purple-500 border-opacity-30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-purple-200 font-semibold mb-2">
                End Date (Optional)
              </label>
              <input
                type="date"
                value={medication.endDate}
                onChange={e => handleInputChange('endDate', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 bg-opacity-50 border border-purple-500 border-opacity-30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              isLoading={isSubmitting}
              className="flex-1 py-4 text-lg"
              variant="success"
            >
              <Check size={24} /> Create Medication Entry
            </Button>
            <Button
              onClick={resetForm}
              variant="secondary"
              className="px-8 py-4 bg-gray-700 bg-opacity-50"
            >
              Reset
            </Button>
          </div>
        </div>

        {/* JSON Preview */}
        {showJson && (
          <div className="mt-8 bg-gray-900 rounded-2xl p-6 border border-purple-500 border-opacity-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-green-400">✨ Final Medication Object</h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(getFinalObject(), null, 2));
                  alert("Copied!");
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                Copy JSON
              </button>
            </div>
            <pre className="text-green-300 text-sm overflow-x-auto bg-black bg-opacity-50 p-4 rounded-lg">
              {JSON.stringify(getFinalObject(), null, 2)}
            </pre>
            <div className="mt-4 p-4 bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-30 rounded-lg">
              <p className="text-yellow-300 text-sm">
                📝 <strong>Ready to use!</strong> Copy this object and send it to backend/context.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}