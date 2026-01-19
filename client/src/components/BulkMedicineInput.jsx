import React, { useState } from "react";
import axios from "axios";
// 1. Import the same context your working form uses
import { useMedicine } from '../context/medicationContext'; 

export default function BulkMedicineInput() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // 2. Get the medication state from context (which contains user info)
  const { medication } = useMedicine();

  const handleSubmit = async () => {
    if (!text.trim()) {
      alert("Please enter at least one medicine");
      return;
    }

    setLoading(true);
    try {
      // 1. Change "localuser" to "user" to match your Login.jsx
      const userData = JSON.parse(localStorage.getItem("user"));

      if (!userData) {
        alert("User info missing. Please login again.");
        setLoading(false);
        return;
      }

      // 2. Ensure we send an object that has 'id' because your 
      // backend likely expects that specific key name
      const payloadUser = {
        ...userData,
        id: userData.id || userData._id // Use whichever one is available
      };

      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/medicine/bulk`,
        { 
          text, 
          localuser: payloadUser // Sending the corrected user object
        }
      );

      setResult(res.data);
      alert("Bulk add successful!");
    } catch (err) {
      console.error("Bulk Add Error:", err);
      alert(err.response?.data?.message || "Bulk add failed");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setText("");
    setResult(null);
  };

  return (
    <div className="space-y-4">
      <textarea
        rows={12}
        placeholder={`Paracetamol 500mg morning and night for 5 days
Aspirin 75mg once daily starting from 07-Jan-2026
Metformin 500mg twice daily from Monday to Friday until 14-Jan-2026
`}
        className="w-full px-4 py-3 bg-gray-700 bg-opacity-50 border border-purple-500 border-opacity-30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg rounded-lg flex items-center justify-center gap-2 hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/50"
        >
          {loading ? "Processing..." : "Create Medication Entries"}
        </button>

        <button
          onClick={resetForm}
          className="px-8 py-4 bg-gray-700 bg-opacity-50 text-purple-200 font-semibold rounded-lg hover:bg-opacity-70 transition"
        >
          Reset
        </button>
      </div>

      {/* Result / Preview */}
      {result && (
        <div className="mt-4 bg-gray-900 rounded-2xl p-6 border border-purple-500 border-opacity-20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-green-400">✨ Bulk Add Result</h3>
            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(result, null, 2));
                alert("Copied!");
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Copy JSON
            </button>
          </div>

          <pre className="text-green-300 text-sm overflow-x-auto bg-black bg-opacity-50 p-4 rounded-lg">
            {JSON.stringify(result, null, 2)}
          </pre>

          {result.failed && result.failed.length > 0 && (
            <div className="mt-4 p-4 bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded-lg text-red-300 text-sm">
              <strong>Errors:</strong>
              <ul className="list-disc ml-5 mt-2">
                {result.failed.map((err, idx) => (
                  <li key={idx}>
                    {err.line ? err.line : "Invalid entry"} — {err.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}