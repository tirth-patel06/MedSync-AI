import React, { useState, useEffect, useRef } from 'react';
import { Send, FileText, ChevronDown, User, Bot, Loader } from 'lucide-react';
import axios from 'axios';

const ReportChat = () => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [localUser, setLocalUser] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setLocalUser(user);
      fetchReports(user);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchReports = async (user) => {
    try {
      const response = await axios.post('http://localhost:8080/api/agents/reports', { user: user });
      setReports(response.data.reports);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedReport || loading) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8080/api/agents/chat', {
        question: input,
        reportId: selectedReport._id
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.data.reply,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = {
        role: 'error',
        content: 'Failed to get response. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col">
      <header className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="w-6 h-6 text-orange-400" />
          <h1 className="text-xl font-bold">Report Chat</h1>
        </div>
        <div className="relative w-72">
          <select
            value={selectedReport ? selectedReport._id : ''}
            onChange={(e) => {
              const report = reports.find(r => r._id === e.target.value);
              setSelectedReport(report);
              setMessages([]);
            }}
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-white appearance-none"
          >
            <option value="" disabled>Select a report to discuss</option>
            {reports.map(report => (
              <option key={report._id} value={report._id}>{report.filename}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Select a Report</h2>
              <p className="text-slate-400">Choose a report from the dropdown above to start chatting.</p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start space-x-2 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-gradient-to-br from-slate-700 to-slate-800' : 'bg-gradient-to-br from-orange-500 to-rose-500'}`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`px-3 py-2 rounded-xl ${msg.role === 'user' ? 'bg-slate-800/70 backdrop-blur-xl' : msg.role === 'error' ? 'bg-red-900/30 backdrop-blur-xl border border-red-500/30' : 'bg-slate-900/50 backdrop-blur-xl border border-slate-700/50'}`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </main>

      <footer className="bg-slate-900/50 backdrop-blur-xl border-t border-slate-800 p-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={selectedReport ? `Ask about ${selectedReport.filename}...` : "Select a report first..."}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-white"
            disabled={!selectedReport || loading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || !selectedReport || loading}
            className="px-4 py-3 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-medium rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ReportChat;