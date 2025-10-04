import React, { useState, useEffect } from 'react';
import { useNotification } from '../context/notificationContext';
import { useMedicine } from '../context/medicationContext';
import { 
  Bell, Clock, CheckCircle, AlertCircle, Sparkles, Pill, 
  Calendar, ArrowLeft, Filter, Trash2, RefreshCw, Menu
} from 'lucide-react';

export default function NotificationsPage() {
  const { notifications, fetchTodayNotifications, sendNotification } = useNotification();
  const { todayMedication, medicineStatus } = useMedicine();
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);


  
  useEffect(() => {
    loadNotifications();
    console.log("notification message",notifications)
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [notifications, activeFilter]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      await fetchTodayNotifications();
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterNotifications = () => {
    if (activeFilter === 'all') {
      setFilteredNotifications(notifications);
    } else {
      const filtered = notifications.filter(notif => notif.type === activeFilter);
      setFilteredNotifications(filtered);
    }
  };

  const handleRefresh = async () => {
    await loadNotifications();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'before':
        return <Clock className="w-5 h-5 text-cyan-400" />;
      case 'onTime':
        return <Bell className="w-5 h-5 text-orange-400" />;
      case 'after':
        return <AlertCircle className="w-5 h-5 text-rose-400" />;
      case 'test':
        return <Sparkles className="w-5 h-5 text-purple-400" />;
      default:
        return <Bell className="w-5 h-5 text-slate-400" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'before':
        return 'from-cyan-500 to-blue-500';
      case 'onTime':
        return 'from-orange-500 to-rose-500';
      case 'after':
        return 'from-red-500 to-rose-500';
      case 'test':
        return 'from-purple-500 to-violet-500';
      default:
        return 'from-slate-600 to-slate-700';
    }
  };

  const getNotificationBadge = (type) => {
    switch (type) {
      case 'before':
        return { text: 'Upcoming', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' };
      case 'onTime':
        return { text: 'Take Now', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
      case 'after':
        return { text: 'Missed', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
      case 'test':
        return { text: 'Test', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
      default:
        return { text: 'Info', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' };
    }
  };

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (timeString) => {
    const date = new Date(timeString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getTypeStats = () => {
    return {
      all: notifications.length,
      before: notifications.filter(n => n.type === 'before').length,
      onTime: notifications.filter(n => n.type === 'onTime').length,
      after: notifications.filter(n => n.type === 'after').length,
      test: notifications.filter(n => n.type === 'test').length
    };
  };

  const stats = getTypeStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      
      {/* Animated gradient orbs */}
      <div className="absolute w-96 h-96 bg-gradient-to-br from-orange-500/10 to-rose-500/10 rounded-full blur-3xl top-0 right-0" />
      <div className="absolute w-96 h-96 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl bottom-0 left-0" />

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
            <button onClick={() => window.location.href = '/dashboard'} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-800/50 text-slate-400 hover:text-white transition-all">
              <Calendar className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
            <button onClick={() => window.location.href = '/medications'} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-800/50 text-slate-400 hover:text-white transition-all">
              <Pill className="w-5 h-5" />
              <span>Medications</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500/20 to-rose-500/20 border border-orange-500/30 text-orange-400">
              <Bell className="w-5 h-5" />
              <span>Notifications</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64 p-6 space-y-6 relative z-10">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-slate-800/50 rounded-lg">
              <Menu className="w-6 h-6" />
            </button>
            <button onClick={() => window.location.href = '/dashboard'} className="p-2 hover:bg-slate-800/50 rounded-lg transition-all">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold flex items-center space-x-3">
                <span>Notifications</span>
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500/20 to-rose-500/20 rounded-xl flex items-center justify-center">
                  <Bell className="w-5 h-5 text-orange-400" />
                </div>
              </h1>
              <p className="text-slate-400">Your medication reminders and alerts</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button onClick={handleRefresh} className="px-4 py-2 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-700 transition-all flex items-center space-x-2 group">
              <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              <span className="text-sm">Refresh</span>
            </button>
            <button onClick={sendNotification} className="px-4 py-2 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 rounded-xl transition-all flex items-center space-x-2 shadow-lg">
              <Bell className="w-4 h-4" />
              <span className="text-sm">Test Notify</span>
            </button>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-4 border border-slate-800 hover:border-orange-500/50 transition-all">
            <div className="text-2xl font-bold text-orange-400 mb-1">{stats.all}</div>
            <div className="text-sm text-slate-400">Total Today</div>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-4 border border-slate-800 hover:border-cyan-500/50 transition-all">
            <div className="text-2xl font-bold text-cyan-400 mb-1">{stats.before}</div>
            <div className="text-sm text-slate-400">Upcoming</div>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-4 border border-slate-800 hover:border-orange-500/50 transition-all">
            <div className="text-2xl font-bold text-orange-400 mb-1">{stats.onTime}</div>
            <div className="text-sm text-slate-400">Take Now</div>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-4 border border-slate-800 hover:border-red-500/50 transition-all">
            <div className="text-2xl font-bold text-red-400 mb-1">{stats.after}</div>
            <div className="text-sm text-slate-400">Missed</div>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-4 border border-slate-800 hover:border-purple-500/50 transition-all">
            <div className="text-2xl font-bold text-purple-400 mb-1">{stats.test}</div>
            <div className="text-sm text-slate-400">Test</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-2 border border-slate-800 flex space-x-2 overflow-x-auto">
          <button 
            onClick={() => setActiveFilter('all')}
            className={`px-6 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex items-center space-x-2 ${activeFilter === 'all' ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <Filter className="w-4 h-4" />
            <span>All ({stats.all})</span>
          </button>
          <button 
            onClick={() => setActiveFilter('before')}
            className={`px-6 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex items-center space-x-2 ${activeFilter === 'before' ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <Clock className="w-4 h-4" />
            <span>Upcoming ({stats.before})</span>
          </button>
          <button 
            onClick={() => setActiveFilter('onTime')}
            className={`px-6 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex items-center space-x-2 ${activeFilter === 'onTime' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <Bell className="w-4 h-4" />
            <span>Take Now ({stats.onTime})</span>
          </button>
          <button 
            onClick={() => setActiveFilter('after')}
            className={`px-6 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex items-center space-x-2 ${activeFilter === 'after' ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <AlertCircle className="w-4 h-4" />
            <span>Missed ({stats.after})</span>
          </button>
          <button 
            onClick={() => setActiveFilter('test')}
            className={`px-6 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex items-center space-x-2 ${activeFilter === 'test' ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Test ({stats.test})</span>
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-12 border border-slate-800 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-10 h-10 text-slate-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">No Notifications</h3>
              <p className="text-slate-400">You don't have any {activeFilter !== 'all' ? activeFilter : ''} notifications yet</p>
            </div>
          ) : (
            filteredNotifications.map((notif, idx) => {
              const badge = getNotificationBadge(notif.type);
              return (
                <div key={idx} className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800 hover:border-orange-500/50 transition-all group">
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className={`w-14 h-14 bg-gradient-to-br ${getNotificationColor(notif.type)}/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      {getNotificationIcon(notif.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="text-lg font-bold">{notif.title}</h3>
                            <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${badge.color}`}>
                              {badge.text}
                            </span>
                          </div>
                          <p className="text-slate-300">{notif.message}</p>
                        </div>
                      </div>

                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-slate-400">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(notif.time)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(notif.time)}</span>
                        </div>
                        {notif.medicineName && (
                          <div className="flex items-center space-x-2">
                            <Pill className="w-4 h-4" />
                            <span>{notif.medicineName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Empty State Helper */}
        {!loading && notifications.length === 0 && (
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-xl rounded-2xl p-8 border border-cyan-500/30 text-center">
            <Sparkles className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Start Receiving Notifications</h3>
            <p className="text-slate-300 mb-4">Add medications to your schedule to receive timely reminders and alerts</p>
            <button onClick={() => window.location.href = '/addMedication'} className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl font-medium transition-all shadow-lg">
              Add Your First Medication
            </button>
          </div>
        )}
      </div>
    </div>
  );
}