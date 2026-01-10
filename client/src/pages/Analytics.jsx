import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Loader from '../components/Loader';

const COLORS = ["#22c55e", "#ef4444", "#f59e0b", "#3b82f6"];
const ZERO_COLOR = "#64748b"; // muted color for zero values

const Analytics = ({ userId }) => {
  const [data, setData] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    let uid = userId;
    if (!uid) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          uid = JSON.parse(storedUser).id;
        } catch (err) {
          console.error("Failed to parse stored user", err);
        }
      }
    }

    if (!uid) {
      console.warn("No user ID found");
      return;
    }

    fetch(`http://localhost:8080/api/analytics/${uid}`)
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error(err));
  }, [userId]);

  if (!data)
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400 text-lg animate-pulse">
        <Loader size="xl" color="orange" className="mb-4" />
        Loading analytics...
      </div>
    );

  const pieData = [
    { name: "Taken", value: data.taken },
    { name: "Missed", value: data.missed },
    { name: "Delayed", value: data.delayed },
    { name: "Pending", value: data.pending },
  ];

  const barData = Object.entries(data.byDay).map(([date, counts]) => ({
    date,
    ...counts,
  }));

  return (

    <div className="min-h-screen bg-slate-950 text-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-8">


        {/* Header with back navigation */}
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-3 hover:bg-slate-800/50 rounded-xl transition-all group"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </button>

            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">
                Medication Analytics
              </h1>
              <p className="text-slate-400">
                View adherence and medication trends
              </p>
            </div>
          </div>
        </header>


        <div className="flex flex-row flex-wrap gap-10 justify-center items-start">
          {/* Pie Chart */}
          <div className="flex-1 min-w-[320px] max-w-[500px] flex flex-col items-center bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-800 hover:shadow-orange-400/40 transition transform hover:-translate-y-1 hover:scale-105">
            <h3 className="text-xl font-semibold mb-4 text-slate-200">
              Overall Adherence
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  innerRadius={60}
                  paddingAngle={4}
                  label={({ name, value, percent }) => {
                    if (value === 0) return null; // hide label for 0
                    return `${name}: ${value} (${(percent * 100).toFixed(0)}%)`;
                  }}
                  labelLine={true} // optional: show lines connecting labels
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.value === 0 ? ZERO_COLOR : COLORS[index]}
                      style={{ cursor: "pointer", transition: "all 0.2s" }}
                    />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ color: "#cbd5e1" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fdf6e3", // dark slate-blue, matches your card border
                    color: "#f1f5f9",           // light text for contrast
                    borderRadius: "12px",
                    border: "1px solid #334155", // slightly lighter border than background
                    fontWeight: "500",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="flex-1 min-w-[320px] max-w-[500px] flex flex-col items-center bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-800 hover:shadow-blue-400/40 transition transform hover:-translate-y-1 hover:scale-105">
            <h3 className="text-xl font-semibold mb-4 text-slate-200">
              Weekly Medication Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={barData}
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              >
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "12px",
                    border: "1px solid #1e293b",
                  }}
                />
                <Legend wrapperStyle={{ color: "#cbd5e1" }} />
                <Bar
                  dataKey="taken"
                  fill="#22c55e"
                  radius={[6, 6, 0, 0]}
                  minPointSize={5}
                />
                <Bar
                  dataKey="missed"
                  fill="#ef4444"
                  radius={[6, 6, 0, 0]}
                  minPointSize={5}
                />
                <Bar
                  dataKey="delayed"
                  fill="#f59e0b"
                  radius={[6, 6, 0, 0]}
                  minPointSize={5}
                />
                <Bar
                  dataKey="pending"
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                  minPointSize={5}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;