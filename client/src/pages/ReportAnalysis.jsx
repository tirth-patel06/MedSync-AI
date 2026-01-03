import React, { useState } from "react";
import { FileUp, Loader, AlertCircle, Sparkles, Globe, Eye, EyeOff } from "lucide-react";
import { useLanguage } from "../hooks/useTranslation";
import { ReadabilityIndicator } from "../components/ReadabilityIndicator";
import { TranslationBadge } from "../components/TranslationBadge";
import axios from "axios";

const ReportAnalysis = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [translatedAnalysis, setTranslatedAnalysis] = useState(null);
  const [readabilityScore, setReadabilityScore] = useState(null);
  const [error, setError] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [showTranslated, setShowTranslated] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [reportId, setReportId] = useState(null);
  const { supportedLanguages } = useLanguage();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleGenerateAnalysis = async () => {
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setLoading(true);
    setAnalysis(null);
    setTranslatedAnalysis(null);
    setReadabilityScore(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const user = JSON.parse(localStorage.getItem("user"));
      formData.append("user", JSON.stringify(user));

      const res = await fetch("http://localhost:8080/api/report/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setAnalysis(data.analysis);
        setReadabilityScore(data.readabilityScore);
        setReportId(data.reportId);
        
        // Auto-translate if language != en
        if (selectedLanguage !== "en" && data.analysis) {
          await translateAnalysis(data.analysis, selectedLanguage, data.reportId);
        }
      } else {
        setError(data.error || "Failed to analyze report");
      }
    } catch (err) {
      console.error(err);
      setError("Server error while analyzing report");
    } finally {
      setLoading(false);
    }
  };

  const translateAnalysis = async (text, targetLang, id) => {
    if (!text || targetLang === "en") {
      return;
    }

    setTranslating(true);
    try {
      const response = await axios.get(
        `http://localhost:8080/api/report/${id}/translate/${targetLang}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setTranslatedAnalysis(response.data.translatedAnalysis);
      setShowTranslated(true);
    } catch (err) {
      console.error("Translation failed:", err.message);
      setError("Failed to translate analysis");
    } finally {
      setTranslating(false);
    }
  };

  const handleLanguageChange = async (newLang) => {
    setSelectedLanguage(newLang);
    if (analysis && reportId && newLang !== "en") {
      await translateAnalysis(analysis, newLang, reportId);
    } else {
      setTranslatedAnalysis(null);
      setShowTranslated(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-slate-950 text-gray-100">
      <h2 className="text-3xl font-extrabold text-center text-orange-400 mb-8">
        🩺 Health Report Analysis
      </h2>

      <div className="max-w-2xl mx-auto bg-slate-900 p-6 rounded-3xl shadow-xl border border-slate-800">
        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700 rounded-2xl mb-6 hover:border-orange-400 transition-all">
          <FileUp className="w-16 h-16 text-slate-500 mb-4" />
          <input
            type="file"
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-500/10 file:text-orange-400 hover:file:bg-orange-500/20"
          />
          {file && <p className="mt-4 text-slate-300">Selected: {file.name}</p>}
        </div>

        {/* Language selector */}
        <div className="mb-4 flex items-center gap-2">
          <Globe size={18} className="text-orange-400" />
          <select
            value={selectedLanguage}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="flex-1 p-2 rounded-md bg-slate-800 border border-slate-700 text-gray-100 text-sm"
          >
            {supportedLanguages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.nativeName} ({lang.name})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleGenerateAnalysis}
          className="w-full bg-orange-400 hover:bg-orange-500 text-slate-900 font-bold py-3 px-4 rounded-md transition disabled:bg-slate-600"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <Loader className="animate-spin mr-2" />
              <span>Analyzing...</span>
            </div>
          ) : (
            "Analyze Report"
          )}
        </button>

        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center space-x-3">
            <AlertCircle className="text-red-400" />
            <p className="text-red-400 font-medium">{error}</p>
          </div>
        )}

        {analysis && (
          <div className="mt-8 p-6 bg-slate-800/50 rounded-2xl border border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-green-400 flex items-center space-x-2">
                <Sparkles />
                <span>Analysis Results</span>
              </h3>
              
              {/* Readability badge */}
              {readabilityScore && (
                <ReadabilityIndicator
                  score={readabilityScore.fleschKincaid}
                  readingLevel={readabilityScore.readingLevel}
                  showDetails={true}
                />
              )}
            </div>

            {/* Translation badge and toggle */}
            <div className="flex items-center justify-between">
              {translatedAnalysis && (
                <TranslationBadge
                  originalLanguage="en"
                  currentLanguage={selectedLanguage}
                  onShowOriginal={() => setShowTranslated(!showTranslated)}
                />
              )}
              
              {translatedAnalysis && (
                <button
                  onClick={() => setShowTranslated(!showTranslated)}
                  className="flex items-center gap-2 px-3 py-1 text-sm rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition"
                >
                  {showTranslated ? (
                    <>
                      <Eye size={16} />
                      View Original
                    </>
                  ) : (
                    <>
                      <EyeOff size={16} />
                      View Translation
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Translation loading state */}
            {translating && (
              <div className="flex items-center gap-2 text-blue-400">
                <Loader className="animate-spin" size={16} />
                <span className="text-sm">Translating...</span>
              </div>
            )}

            {/* Analysis text */}
            <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">
              {showTranslated && translatedAnalysis ? translatedAnalysis : analysis}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportAnalysis;