import React, { useState } from "react";
import { FileUp, Loader, AlertCircle, Sparkles } from "lucide-react";

const ReportAnalysis = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

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
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const user = JSON.parse(localStorage.getItem("user"));
      formData.append("user", JSON.stringify(user));

      const res = await fetch("http://localhost:8080/api/agents/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setAnalysis(data.analysis);
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
          <div className="mt-8 p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
            <h3 className="text-2xl font-bold text-green-400 mb-4 flex items-center space-x-2">
              <Sparkles />
              <span>Analysis Results</span>
            </h3>
            <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">
              {analysis}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportAnalysis;