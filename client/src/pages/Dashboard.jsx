import React, { useState, useEffect } from 'react';
import {
  Pill, Calendar, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle,
  Flame, Sparkles, MessageSquare, Brain, Heart, Activity, FileText,
  Settings, LogOut, Plus, ChevronRight, Bell, Menu, RefreshCw, CheckCircle2,
  Languages
} from 'lucide-react';
import { useMedicine } from '../context/medicationContext.jsx';
import { useNotification } from '../context/notificationContext.jsx';
import { useLanguage } from '../hooks/useTranslation.js';
import { useCalendarSync } from '../context/calendarSyncContext.jsx';

import Analytics from "./Analytics";


import Loader from '../components/Loader';
import Button from '../components/Button';

export default function Dashboard() {

  const { todayMedication, medicineStatus, getStreakDays } = useMedicine();

  const { notifications, sendNotification, fetchTodayNotifications } = useNotification();

  const { syncStatus, checkSyncStatus, syncToCalendar, connectCalendar } = useCalendarSync();

  const { language: currentLanguage } = useLanguage();

  const [medications, setMedications] = useState([]);
  const [filteredMeds, setFilteredMeds] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [processingMeds, setProcessingMeds] = useState({}); // Track loading state for each med action
  const [streak, setStreak] = useState(12);  //  will add it for afterwards(streak = number of days for 100% adherence)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [linked, setLinked] = useState(false);
  const [account, setAccount] = useState('');
  const [syncToast, setSyncToast] = useState(null); // Toast notification state

  const [currentUser, setCurrentUser] = useState(null);
  const [showOriginal, setShowOriginal] = useState({});


  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    console.log("storedUser: ", storedUser);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("Loaded currentUser:", parsedUser);
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error("Error parsing stored user:", error);
      }
    } else {
      console.warn("No user found in localStorage");
    }
  }, []);

  useEffect(() => {
    fetchTodayMedications();
    getStreakDays().then(setStreak);
    checkSyncStatus(); // Check calendar sync status on load
  }, [checkSyncStatus]);

  useEffect(() => {
    filterMedications();
  }, [medications, activeFilter]);

  const fetchTodayMedications = async () => {
    setLoading(true);
    try {
      const data = await todayMedication();
      console.log('Fetched today\'s medications:', data);
      setMedications(Array.isArray(data) ? data : data?.data || []);
      console.log("medications", medications)
    } catch (error) {
      console.error('Error fetching medications:', error);
    } finally {
      setLoading(false);
    }
  };


  const filterMedications = () => {
    if (activeFilter === 'all') {
      setFilteredMeds(medications);
    } else {
      const filtered = medications.filter(med =>
        med.dosageTimes.some(dt => dt.status === activeFilter)
      );
      console.log("filtered medicine ", filtered)
      setFilteredMeds(filtered);
    }
  };

  const handleStatusToggle = async (medId) => {
    setProcessingMeds(prev => ({ ...prev, [medId]: true }));
    try {
      await medicineStatus(medId);
      await fetchTodayMedications();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setProcessingMeds(prev => ({ ...prev, [medId]: false }));
    }
  };
 const handleStatusChange = async (medId, status) => {
  try {
    await medicineStatus(medId, status);
    await fetchTodayMedications();
  } catch (err) {
    console.error(err);
  }
};


  const getStatusColor = (status) => {
    switch (status) {
      case 'taken': return 'from-emerald-500 to-green-500';
      case 'missed': return 'from-red-500 to-rose-500';
      case 'delayed': return 'from-amber-500 to-orange-500';
      default: return 'from-slate-600 to-slate-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'taken': return <CheckCircle className="w-5 h-5" />;
      case 'missed': return <XCircle className="w-5 h-5" />;
      case 'delayed': return <AlertCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const getTodayStats = () => {
    const allDoses = Array.isArray(medications)
      ? medications.flatMap(m => Array.isArray(m.dosageTimes) ? m.dosageTimes : [])
      : [];
    return {
      total: allDoses.length,
      taken: allDoses.filter(d => d.status === 'taken').length,
      missed: allDoses.filter(d => d.status === 'missed').length,
      delayed: allDoses.filter(d => d.status === 'delayed').length,
      pending: allDoses.filter(d => d.status === 'pending').length
    };
  };

  const stats = getTodayStats();
  const adherenceRate = stats.total > 0 ? Math.round((stats.taken / stats.total) * 100) : 0;

  const aiAgents = [
    { icon: Brain, title: 'Medical Knowledge', color: 'from-purple-500 to-violet-500', desc: 'Ask about diseases & symptoms' },
    { icon: Heart, title: 'Personal Health', color: 'from-rose-500 to-pink-500', desc: 'Track your health journey' },
    { icon: Pill, title: 'Medication Specialist', color: 'from-cyan-500 to-blue-500', desc: 'Drug info & interactions' },
    { icon: Activity, title: 'Emergency Triage', color: 'from-orange-500 to-red-500', desc: 'Urgent symptom assessment' }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const handleConnectCalendar = async () => {
    try {
      connectCalendar();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSyncCalendar = async () => {
    console.log("[Dashboard] Sync button clicked");
    setSyncToast({ type: 'loading', message: 'Syncing medications to Google Calendar...' });

    try {
      console.log("[Dashboard] Starting sync...");
      const result = await syncToCalendar();
      console.log(`[Dashboard] Sync successful:`, result);

      setSyncToast({
        type: 'success',
        message: `Success! Synced ${result.syncedEvents} medication events to Google Calendar.`,
        details: `${result.syncedMedications} medications processed`
      });

      // Auto-hide success toast after 5 seconds
      setTimeout(() => setSyncToast(null), 5000);

      // Refresh sync status
      await checkSyncStatus();
    } catch (error) {
      console.error('[Dashboard] Sync error:', error);
      setSyncToast({
        type: 'error',
        message: `Sync failed: ${error.message || 'Unknown error'}`,
        details: 'Check your Google Calendar connection and try again.'
      });

      // Auto-hide error toast after 7 seconds
      setTimeout(() => setSyncToast(null), 7000);
    }
  };



  // Removed old calendar status logic - now using CalendarSyncContext

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 z-50 transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-6 space-y-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
              <Pill className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">
              INSIGHT-X
            </span>
          </div>

          <nav className="space-y-2">
            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500/20 to-rose-500/20 border border-orange-500/30 text-orange-400">
              <Calendar className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
            <button onClick={() => window.location.href = '/addmedication'} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-800/50 text-slate-400 hover:text-white transition-all">
              <Pill className="w-5 h-5" />
              <span>Medications</span>
            </button>
            <button onClick={() => window.location.href = '/analytics'} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-800/50 text-slate-400 hover:text-white transition-all">
              <TrendingUp className="w-5 h-5" />
              <span>Analytics</span>
            </button>
            <button onClick={() => window.location.href = '/agents'} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-800/50 text-slate-400 hover:text-white transition-all">
              <MessageSquare className="w-5 h-5" />
              <span>AI Assistant</span>
            </button>
            <button onClick={() => window.location.href = '/health'} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-800/50 text-slate-400 hover:text-white transition-all">
              <Settings className="w-5 h-5" />
              <span>Health Profile</span>
            </button>

            {/* Calendar Sync Section */}
            <div className="pt-4 border-t border-slate-700">
              <p className="text-slate-500 text-xs font-medium mb-2 px-4">CALENDAR SYNC</p>

              {syncStatus.isLinked ? (
                <div className="space-y-2">
                  <div className="px-4 py-2 text-emerald-400 text-sm flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Google Calendar Connected</span>
                  </div>

                  <button
                    onClick={handleSyncCalendar}
                    disabled={syncStatus.isSyncing}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30 text-emerald-400 hover:from-emerald-500/30 hover:to-green-500/30 transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-5 h-5 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
                    <span>{syncStatus.isSyncing ? 'Syncing...' : 'Sync Medications'}</span>
                  </button>

                  {syncStatus.lastSync && (
                    <p className="text-slate-500 text-xs px-4">
                      Last sync: {new Date(syncStatus.lastSync).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleConnectCalendar}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-800/50 text-slate-400 hover:text-white transition-all"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Connect Google Calendar</span>
                </button>
              )}
            </div>
          </nav>

          <div className="absolute bottom-6 left-6 right-6">
            <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all">
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64 px-4 sm:px-6 py-6 space-y-6 overflow-x-hidden">

        {/* Header */}
        <header className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-slate-800/50 rounded-lg">
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">Welcome Back!</h1>
              <p className="text-slate-400">Here's your health overview for today</p>
            </div>
          </div>
          <button onClick={() => window.location.href = '/notifications'} className="relative p-3 hover:bg-slate-800/50 rounded-xl transition-all">
            <Bell className="w-6 h-6" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          </button>
        </header>

        {/* Hero Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800 hover:border-orange-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-rose-500/20 rounded-xl flex items-center justify-center">
                <Flame className="w-6 h-6 text-orange-400" />
              </div>
              <span className="text-3xl font-bold text-orange-400">{streak}</span>
            </div>
            <h3 className="text-slate-400 text-sm">Day Streak</h3>
            <p className="text-xs text-slate-500 mt-1">Keep it going! 🔥</p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800 hover:border-emerald-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="text-3xl font-bold text-emerald-400">{adherenceRate}%</span>
            </div>
            <h3 className="text-slate-400 text-sm">Today's Adherence</h3>
            <p className="text-xs text-slate-500 mt-1">{stats.taken} of {stats.total} taken</p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800 hover:border-cyan-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center">
                <Pill className="w-6 h-6 text-cyan-400" />
              </div>
              <span className="text-3xl font-bold text-cyan-400">{stats.total}</span>
            </div>
            <h3 className="text-slate-400 text-sm">Total Doses Today</h3>
            <p className="text-xs text-slate-500 mt-1">{stats.pending} pending</p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800 hover:border-purple-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-3xl font-bold text-purple-400">89%</span>
            </div>
            <h3 className="text-slate-400 text-sm">This Month</h3>
            <p className="text-xs text-slate-500 mt-1">Great progress!</p>
          </div>
        </div>

        {/* Analytics Section */}
        {currentUser && (
          <div className="mt-8">
            <Analytics userId={currentUser?.id || currentUser?._id} />
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Today's Medications */}
          <div className="col-span-1 lg:col-span-2 space-y-6 w-full">

            {/* Filter Tabs */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-2 border border-slate-800 flex space-x-2 overflow-x-auto">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 sm:px-6 py-2 sm:py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeFilter === 'all' ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setActiveFilter('taken')}
                className={`px-3 sm:px-6 py-2 sm:py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeFilter === 'taken' ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                Taken ({stats.taken})
              </button>
              <button
                onClick={() => setActiveFilter('pending')}
                className={`px-3 sm:px-6 py-2 sm:py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeFilter === 'pending' ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                Pending ({stats.pending})
              </button>
              <button
                onClick={() => setActiveFilter('delayed')}
                className={`px-3 sm:px-6 py-2 sm:py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeFilter === 'delayed' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                Delayed ({stats.delayed})
              </button>
              <button
                onClick={() => setActiveFilter('missed')}
                className={`px-3 sm:px-6 py-2 sm:py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeFilter === 'missed' ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                Missed ({stats.missed})
              </button>
            </div>

            {/* Medications List */}
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader size="lg" color="orange" />
                </div>
              ) : filteredMeds.length === 0 ? (
                  <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 sm:p-12 border border-slate-800 text-center">
                  <Sparkles className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No medications to show</p>
                </div>
              ) : (
                (Array.isArray(filteredMeds) ? filteredMeds : []).map((med, idx) => {
                  // Determine which instructions to display
                  const isTranslated = med.userLanguage && med.userLanguage !== 'en';
                  const displayInstructions = showOriginal[med._id]
                    ? (med.originalInstructions || med.pillDescription)
                    : (med.displayInstructions || med.pillDescription);

                  return (
                    <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-2 border border-slate-800 flex flex-wrap gap-2 overflow-x-hidden">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className={`w-14 h-14 bg-gradient-to-br ${getStatusColor(med.dosageTimes[0]?.status)} rounded-xl flex items-center justify-center shadow-lg`}>
                            {getStatusIcon(med.dosageTimes[0]?.status)}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">{med.pillName}</h3>
                            <p className="text-slate-400 text-sm">{med.dosageAmount} • {med.frequency}</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleStatusToggle(med._id)}
                          isLoading={processingMeds[med._id]}
                          variant="primary"
                          className="px-4 py-2 text-sm shadow-lg"
                        >
                          Mark Taken
                        </Button>
                      </div>

                      {
                        displayInstructions && (
                          <div className="mb-4">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-slate-400 text-sm flex-1">{displayInstructions}</p>
                              {isTranslated && (
                                <button
                                  onClick={() => setShowOriginal(prev => ({ ...prev, [med._id]: !prev[med._id] }))}
                                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs transition-all"
                                  title={showOriginal[med._id] ? "Show translated version" : "Show original English"}
                                >
                                  <Languages className="w-3 h-3" />
                                  {showOriginal[med._id] ? 'EN' : currentLanguage.toUpperCase()}
                                </button>
                              )}
                            </div>
                            {isTranslated && !showOriginal[med._id] && (
                              <p className="text-cyan-400/60 text-xs mt-1 flex items-center gap-1">
                                <Languages className="w-3 h-3" />
                                Translated from English
                              </p>
                            )}
                          </div>
                        )
                      }

                      <div className="flex flex-wrap gap-2">
                        {med.dosageTimes.map((dt, i) => (
                          <div key={i} className={`px-3 py-1 rounded-lg bg-gradient-to-r ${getStatusColor(dt.status)}/20 border ${dt.status === 'taken' ? 'border-emerald-500/30' : dt.status === 'missed' ? 'border-red-500/30' : dt.status === 'delayed' ? 'border-amber-500/30' : 'border-slate-500/30'} flex items-center space-x-2`}>
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">{dt.time}</span>
                            <span className="text-xs opacity-75 capitalize">({dt.status})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Add New Medication */}
            <button onClick={() => window.location.href = '/addMedication'} className="w-full bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border-2 border-dashed border-slate-700 hover:border-orange-500/50 transition-all flex items-center justify-center space-x-3 group">
              <Plus className="w-6 h-6 text-slate-400 group-hover:text-orange-400 transition-colors" />
              <span className="text-slate-400 group-hover:text-white transition-colors">Add New Medication</span>
            </button>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6 w-full">

            {/* AI Assistant */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-bold">AI Health Assistant</h3>
                  <p className="text-xs text-slate-400">24/7 support</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {aiAgents.map((agent, idx) => (
                  <button
                    key={idx}
                    onClick={() => window.location.href = '/agents'}
                    className="bg-slate-800/50 hover:bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-orange-500/50 transition-all group text-left"
                  >
                    <div className={`w-10 h-10 bg-gradient-to-br ${agent.color}/20 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <agent.icon className="w-5 h-5" style={{ color: agent.color.includes('purple') ? '#a78bfa' : agent.color.includes('rose') ? '#fb7185' : agent.color.includes('cyan') ? '#22d3ee' : '#fb923c' }} />
                    </div>
                    <h4 className="text-sm font-medium mb-1">{agent.title}</h4>
                    <p className="text-xs text-slate-500">{agent.desc}</p>
                  </button>
                ))}
              </div>

              <button onClick={() => window.location.href = '/agents'} className="w-full mt-4 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white font-medium py-3 rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2 group">
                <span>Start Conversation</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800">
              <h3 className="font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button onClick={() => window.location.href = '/reports'} className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-all group">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    <span className="text-sm">Generate Report</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" />
                </button>
                <button onClick={() => window.location.href = '/reportChat'} className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-all group">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-pink-400" />
                    <span className="text-sm">Chat With Report</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" />
                </button>
                <button onClick={() => window.location.href = '/report-analysis'} className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-all group">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-green-400" />
                    <span className="text-sm">Analyse Health Report</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" />
                </button>
                <button onClick={() => window.location.href = '/calendar-sync'} className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-all group">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-orange-400" />
                    <span className="text-sm">Sync Calendar</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" />
                </button>
              </div>
            </div>

            {/* Motivation Card */}
            <div className="bg-gradient-to-br from-orange-500/20 to-rose-500/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
              <Sparkles className="w-8 h-8 text-orange-400 mb-3" />
              <h3 className="font-bold text-lg mb-2">Keep Going!</h3>
              <p className="text-sm text-slate-300">You're on a {streak}-day streak. Stay consistent and reach your health goals! 🎯</p>
            </div>
          </div>
        </div>
      </div>

      {
        syncToast && (
          <div className={`fixed bottom-6 right-6 max-w-sm rounded-2xl p-4 backdrop-blur-xl border shadow-2xl animate-slideIn z-40 ${syncToast.type === 'success'
            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-100'
            : syncToast.type === 'error'
              ? 'bg-red-500/20 border-red-500/50 text-red-100'
              : 'bg-blue-500/20 border-blue-500/50 text-blue-100'
            }`}>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {syncToast.type === 'loading' && (
                  <Loader size="sm" color="blue" />
                )}
                {syncToast.type === 'success' && (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                )}
                {syncToast.type === 'error' && (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">{syncToast.message}</p>
                {syncToast.details && (
                  <p className="text-sm opacity-75 mt-1">{syncToast.details}</p>
                )}
              </div>
              {syncToast.type !== 'loading' && (
                <button
                  onClick={() => setSyncToast(null)}
                  className="flex-shrink-0 opacity-75 hover:opacity-100 transition"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )
      }
    </div>
  );
}
