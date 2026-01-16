import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Calendar, Clock, Pill, AlertCircle,
  CheckCircle, XCircle, BarChart3, PieChart, Activity, Target,
  Award, Zap, ChevronDown, Filter, Download, Info, ArrowUp, ArrowDown, ArrowLeft
} from 'lucide-react';
import { 
  LineChart, Line, BarChart as ReBarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { useNavigate } from 'react-router-dom';

// Move StatCard outside component to prevent recreation on every render
const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = 'orange' }) => {
  const colorMap = {
    orange: 'from-orange-500/30 to-rose-500/30 border-orange-400/40 text-orange-400',
    green: 'from-emerald-500/30 to-green-500/30 border-emerald-400/40 text-emerald-400',
    blue: 'from-cyan-500/30 to-blue-500/30 border-cyan-400/40 text-cyan-400',
    purple: 'from-purple-500/30 to-violet-500/30 border-purple-400/40 text-purple-400',
    red: 'from-red-500/30 to-rose-500/30 border-red-400/40 text-red-400',
    amber: 'from-amber-500/30 to-orange-500/30 border-amber-400/40 text-amber-400'
  };

  return (
    <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 hover:border-opacity-70 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${colorMap[color]} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg ${trend.isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
            {trend.isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            <span className="text-xs font-bold">{Math.abs(trend.change)}%</span>
          </div>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-3xl font-bold text-white">{value}</h3>
        <p className="text-slate-300 text-sm font-semibold">{title}</p>
        {subtitle && <p className="text-xs text-slate-400 font-medium">{subtitle}</p>}
      </div>
    </div>
  );
};

// Move CustomTooltip outside component and fix CSS
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800/95 px-3 py-2 rounded-md border border-slate-700 shadow-lg text-xs text-slate-100 space-y-1">
        <p className="font-semibold">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('30days');
  const [selectedMedicine, setSelectedMedicine] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let uid = null;
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        uid = JSON.parse(storedUser)?.id;
      } catch (err) {
        console.error("Failed to parse stored user", err);
      }
    }

    if (!uid) {
      console.warn("No user ID found");
      setLoading(false);
      return;
    }

    fetch(`http://localhost:8080/api/analytics/${uid}`)
      .then((res) => res.json())
      .then((apiData) => {
        setData(apiData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <p className="text-white text-lg font-medium">No analytics data available</p>
        </div>
      </div>
    );
  }

  const totalDoses = data.taken + data.missed + data.delayed + data.pending;
  const adherenceRate = totalDoses > 0 ? ((data.taken / totalDoses) * 100).toFixed(1) : 0;

  const statusDistribution = [
    { name: 'Taken', value: data.taken, color: '#34d399' },
    { name: 'Missed', value: data.missed, color: '#f87171' },
    { name: 'Delayed', value: data.delayed, color: '#fbbf24' },
    { name: 'Pending', value: data.pending, color: '#60a5fa' }
  ];

  const barData = Object.entries(data.byDay || {}).map(([date, counts]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    taken: counts?.taken || 0,
    missed: counts?.missed || 0,
    delayed: counts?.delayed || 0,
    pending: counts?.pending || 0
  }));

  // Enhanced insights logic with better feedback for all adherence levels
  const insights = [];
  
  if (data.taken > 0 && totalDoses > 0) {
    const takenPercentage = ((data.taken / totalDoses) * 100).toFixed(0);
    if (takenPercentage >= 90) {
      insights.push({
        type: 'success',
        icon: Award,
        title: 'Excellent Adherence!',
        description: `You've taken ${takenPercentage}% of your medications. Outstanding commitment to your health!`,
        action: 'Keep it up'
      });
    } else if (takenPercentage >= 70) {
      insights.push({
        type: 'success',
        icon: Target,
        title: 'Good Progress!',
        description: `You've taken ${takenPercentage}% of your medications. You're doing well - keep building this habit!`,
        action: 'Improve consistency'
      });
    } else if (takenPercentage >= 50) {
      insights.push({
        type: 'info',
        icon: Activity,
        title: 'Room for Improvement',
        description: `You've taken ${takenPercentage}% of your medications. Setting reminders can help you stay on track.`,
        action: 'Set reminders'
      });
    } else {
      insights.push({
        type: 'warning',
        icon: AlertCircle,
        title: 'Needs Attention',
        description: `You've taken ${takenPercentage}% of your medications. Let's work on improving your adherence.`,
        action: 'Create schedule'
      });
    }
  }

  if (data.missed > 0) {
    insights.push({
      type: 'warning',
      icon: AlertCircle,
      title: 'Missed Doses Detected',
      description: `You've missed ${data.missed} dose${data.missed > 1 ? 's' : ''}. Consider setting additional reminders.`,
      action: 'Add reminders'
    });
  }

  if (data.delayed > 0) {
    insights.push({
      type: 'info',
      icon: Clock,
      title: 'Delayed Medications',
      description: `${data.delayed} dose${data.delayed > 1 ? 's were' : ' was'} taken late. Try to maintain consistent timing.`,
      action: 'Adjust schedule'
    });
  }

  if (insights.length === 0) {
    insights.push({
      type: 'info',
      icon: Zap,
      title: 'Getting Started',
      description: 'Keep tracking your medications to see personalized insights here.',
      action: 'Add medication'
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-3 hover:bg-slate-800/50 rounded-xl transition-all group"
          >
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
              Analytics Dashboard
            </h1>
            <p className="text-slate-300 mt-2 font-medium">Comprehensive insights into your medication adherence</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/70 hover:bg-slate-800 rounded-xl border border-slate-700/50 transition-all font-semibold text-slate-200"
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 rounded-xl transition-all font-semibold shadow-lg">
            <Download className="w-5 h-5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 space-y-4">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Filter className="w-5 h-5 text-orange-400" />
            Filter Options
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Date Range</label>
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full bg-slate-800/70 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-medium focus:border-orange-400 focus:outline-none transition-all"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Medication</label>
              <select 
                value={selectedMedicine}
                onChange={(e) => setSelectedMedicine(e.target.value)}
                className="w-full bg-slate-800/70 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-medium focus:border-orange-400 focus:outline-none transition-all"
              >
                <option value="all">All Medications</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Overall Adherence"
          value={`${adherenceRate}%`}
          subtitle={`${data.taken} of ${totalDoses} doses`}
          icon={Target}
          color="green"
        />
        <StatCard
          title="Doses Taken"
          value={data.taken}
          subtitle="Successfully completed"
          icon={CheckCircle}
          color="blue"
        />
        <StatCard
          title="Missed Doses"
          value={data.missed}
          subtitle="Needs attention"
          icon={XCircle}
          color="red"
        />
        <StatCard
          title="Delayed Doses"
          value={data.delayed}
          subtitle="Taken late"
          icon={Clock}
          color="amber"
        />
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Status Distribution Pie Chart */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-white text-lg">Overall Adherence</h3>
              <p className="text-sm text-slate-400 font-medium mt-0.5">Status distribution breakdown</p>
            </div>
            <PieChart className="w-6 h-6 text-purple-400" />
          </div>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value, percent }) => {
                    if (value === 0) return null;
                    return `${name}: ${value} (${(percent * 100).toFixed(0)}%)`;
                  }}
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.value === 0 ? '#64748b' : entry.color}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ color: '#cbd5e1', fontWeight: 600 }}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Trend Bar Chart */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-white text-lg">Weekly Medication Trend</h3>
              <p className="text-sm text-slate-400 font-medium mt-0.5">Daily breakdown over time</p>
            </div>
            <Activity className="w-6 h-6 text-cyan-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ReBarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="date" 
                stroke="#94a3b8" 
                style={{ fontSize: '12px', fontWeight: 600 }}
              />
              <YAxis 
                stroke="#94a3b8" 
                style={{ fontSize: '12px', fontWeight: 600 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#cbd5e1', fontWeight: 600 }} />
              <Bar dataKey="taken" fill="#34d399" radius={[6, 6, 0, 0]} minPointSize={5} />
              <Bar dataKey="missed" fill="#f87171" radius={[6, 6, 0, 0]} minPointSize={5} />
              <Bar dataKey="delayed" fill="#fbbf24" radius={[6, 6, 0, 0]} minPointSize={5} />
              <Bar dataKey="pending" fill="#60a5fa" radius={[6, 6, 0, 0]} minPointSize={5} />
            </ReBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/30 to-green-500/30 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="font-bold text-white">Taken</h3>
          </div>
          <p className="text-3xl font-bold text-white mb-2">{data.taken}</p>
          <div className="w-full bg-slate-700/50 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full transition-all"
              style={{ width: `${totalDoses > 0 ? (data.taken / totalDoses * 100) : 0}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500/30 to-rose-500/30 rounded-xl flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="font-bold text-white">Missed</h3>
          </div>
          <p className="text-3xl font-bold text-white mb-2">{data.missed}</p>
          <div className="w-full bg-slate-700/50 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-red-500 to-rose-500 h-2 rounded-full transition-all"
              style={{ width: `${totalDoses > 0 ? (data.missed / totalDoses * 100) : 0}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500/30 to-orange-500/30 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="font-bold text-white">Delayed</h3>
          </div>
          <p className="text-3xl font-bold text-white mb-2">{data.delayed}</p>
          <div className="w-full bg-slate-700/50 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all"
              style={{ width: `${totalDoses > 0 ? (data.delayed / totalDoses * 100) : 0}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="font-bold text-white">Pending</h3>
          </div>
          <p className="text-3xl font-bold text-white mb-2">{data.pending}</p>
          <div className="w-full bg-slate-700/50 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all"
              style={{ width: `${totalDoses > 0 ? (data.pending / totalDoses * 100) : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Insights & Recommendations */}
      <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500/30 to-violet-500/30 rounded-xl flex items-center justify-center">
            <Activity className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">AI-Powered Insights</h3>
            <p className="text-sm text-slate-400 font-medium">Personalized recommendations based on your patterns</p>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {insights.map((insight, idx) => (
            <div 
              key={idx}
              className={`bg-slate-800/60 rounded-xl p-5 border transition-all ${
                insight.type === 'success' ? 'border-emerald-400/40 hover:border-emerald-400/60' :
                insight.type === 'warning' ? 'border-amber-400/40 hover:border-amber-400/60' :
                'border-cyan-400/40 hover:border-cyan-400/60'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                insight.type === 'success' ? 'bg-emerald-500/20' :
                insight.type === 'warning' ? 'bg-amber-500/20' :
                'bg-cyan-500/20'
              }`}>
                {React.createElement(insight.icon, { className: `w-5 h-5 ${
                  insight.type === 'success' ? 'text-emerald-400' :
                  insight.type === 'warning' ? 'text-amber-400' :
                  'text-cyan-400'
                }` })}
              </div>
              <h4 className="font-bold text-white mb-2">{insight.title}</h4>
              <p className="text-sm text-slate-300 mb-3 font-medium">{insight.description}</p>
              <button className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                insight.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' :
                insight.type === 'warning' ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' :
                'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
              }`}>
                {insight.action}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}