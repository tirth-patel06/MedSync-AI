import React, { useState } from "react";

const Reports = () => {
  const [period, setPeriod] = useState(30); // default 30 days
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerateReport = async () => {
    setLoading(true);
    setDownloadUrl(null);
    setError(null);

    try {
      const token = localStorage.getItem("token"); // auth token
      const res = await fetch("http://localhost:8080/api/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ periodInDays: period }),
      });

      const data = await res.json();

      if (data.success) {
        setDownloadUrl(data.downloadUrl);
      } else {
        setError(data.message || "Failed to generate report");
      }
    } catch (err) {
      console.error(err);
      setError("Server error while generating report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-slate-950 text-gray-100">
      <h2 className="text-3xl font-extrabold text-center text-orange-400 mb-8">
        📝 Generate Medication Report
      </h2>

      <div className="max-w-md mx-auto bg-slate-900 p-6 rounded-3xl shadow-xl border border-slate-800">
        <label className="block mb-2 text-slate-200 font-medium">
          Select period (days):
        </label>
        <input
          type="number"
          min={1}
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="w-full p-2 rounded-md bg-slate-800 border border-slate-700 text-gray-100 mb-4"
        />

        <button
          onClick={handleGenerateReport}
          className="w-full bg-orange-400 hover:bg-orange-500 text-slate-900 font-bold py-2 px-4 rounded-md transition"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Report"}
        </button>

        {downloadUrl && (
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block w-full text-center bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md transition"
          >
            Download PDF
          </a>
        )}

        {error && (
          <p className="mt-4 text-red-400 font-medium text-center">{error}</p>
        )}
      </div>
    </div>
  );
};

export default Reports;