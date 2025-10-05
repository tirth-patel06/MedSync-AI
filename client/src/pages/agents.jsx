import React, { useState, useRef, useEffect } from 'react';
import { 
  Brain, Heart, Pill, Activity, Send, Sparkles, 
  ChevronDown, ChevronUp, Loader, User, Bot,
  Zap, Shield, Target, TrendingUp, X, Menu
} from 'lucide-react';

export default function MultiAgentChat() {
  const [activeAgent, setActiveAgent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [messages, setMessages] = useState({
    0: [],
    1: [],
    2: [],
    3: []
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const chatEndRef = useRef(null);

  const agents = [
    {
      id: 0,
      name: 'Medical Knowledge',
      endpoint: 'http://localhost:8080/api/agents/medical',
      icon: Brain,
      gradient: 'from-purple-600 via-violet-600 to-indigo-600',
      bgGradient: 'from-purple-950 via-violet-950 to-indigo-950',
      accentColor: 'text-purple-400',
      borderColor: 'border-purple-500',
      description: 'Advanced medical knowledge & research',
      badge: 'Neural Network',
      complexity: 'Deep Learning Model'
    },
    {
      id: 1,
      name: 'Personal Health',
      endpoint: 'http://localhost:8080/api/agents/personal-health',
      icon: Heart,
      gradient: 'from-rose-600 via-pink-600 to-fuchsia-600',
      bgGradient: 'from-rose-950 via-pink-950 to-fuchsia-950',
      accentColor: 'text-rose-400',
      borderColor: 'border-rose-500',
      description: 'Your personalized health companion',
      badge: 'Context-Aware',
      complexity: 'Memory-Enhanced AI'
    },
    {
      id: 2,
      name: 'Medication Specialist',
      endpoint: 'http://localhost:8080/api/agents/medicine',
      icon: Pill,
      gradient: 'from-cyan-600 via-blue-600 to-indigo-600',
      bgGradient: 'from-cyan-950 via-blue-950 to-indigo-950',
      accentColor: 'text-cyan-400',
      borderColor: 'border-cyan-500',
      description: 'Pharmaceutical intelligence system',
      badge: 'Drug Database',
      complexity: 'Multi-Source Analysis'
    },
    {
      id: 3,
      name: 'Emergency Triage',
      endpoint: 'http://localhost:8080/api/agents/emergency',
      icon: Activity,
      gradient: 'from-orange-600 via-red-600 to-rose-600',
      bgGradient: 'from-orange-950 via-red-950 to-rose-950',
      accentColor: 'text-orange-400',
      borderColor: 'border-orange-500',
      description: 'Critical assessment & response',
      badge: 'Real-Time',
      complexity: 'Priority Algorithm'
    }
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleAgentChange = (newAgent) => {
    if (newAgent === activeAgent) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveAgent(newAgent);
      setIsTransitioning(false);
    }, 300);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => ({
      ...prev,
      [activeAgent]: [...prev[activeAgent], userMessage]
    }));
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(agents[activeAgent].endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: userMessage.content })
      });

      const data = await response.json();

      const assistantMessage = {
        role: 'assistant',
        content: data.output || 'No response received',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => ({
        ...prev,
        [activeAgent]: [...prev[activeAgent], assistantMessage]
      }));
    } catch (error) {
      const errorMessage = {
        role: 'error',
        content: 'Failed to get response. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => ({
        ...prev,
        [activeAgent]: [...prev[activeAgent], errorMessage]
      }));
    } finally {
      setLoading(false);
    }
  };

  const currentAgent = agents[activeAgent];

  return (
    <div className={`h-screen bg-gradient-to-br ${currentAgent.bgGradient} text-white transition-all duration-700 relative overflow-hidden`}>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute w-[500px] h-[500px] bg-gradient-to-br ${currentAgent.gradient} opacity-20 rounded-full blur-3xl -top-48 -right-48 animate-pulse`} />
        <div className={`absolute w-[500px] h-[500px] bg-gradient-to-br ${currentAgent.gradient} opacity-20 rounded-full blur-3xl -bottom-48 -left-48 animate-pulse`} style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 flex h-screen">
        
        {/* Left Sidebar - Agent Cards */}
        <aside className={`${sidebarOpen ? 'w-72' : 'w-0'} bg-slate-900/30 backdrop-blur-2xl border-r border-slate-700/50 transition-all duration-300 overflow-hidden flex flex-col`}>
          <div className="p-4 flex-1 flex flex-col">
            {/* Header */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-10 h-10 bg-gradient-to-br ${currentAgent.gradient} rounded-lg flex items-center justify-center shadow-lg`}>
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold">INSIGHT-X</h1>
                    <p className="text-xs text-slate-400">Multi-Agent AI</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <div className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/30 flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <span>4 Active</span>
                </div>
                <div className="px-2 py-1 bg-slate-700/50 text-slate-400 rounded border border-slate-600/50 text-xs">
                  Orchestration
                </div>
              </div>
            </div>

            {/* Agent Cards */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {agents.map((agent, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAgentChange(idx)}
                  className={`w-full transition-all duration-300 ${
                    idx === activeAgent 
                      ? 'scale-100' 
                      : 'scale-95 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className={`bg-slate-800/50 backdrop-blur-xl rounded-xl p-3 border-2 ${
                    idx === activeAgent 
                      ? `${agent.borderColor} shadow-xl` 
                      : 'border-slate-700/30'
                  }`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={`w-10 h-10 bg-gradient-to-br ${agent.gradient} rounded-lg flex items-center justify-center shadow-lg flex-shrink-0`}>
                        <agent.icon className="w-5 h-5" />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <h3 className="font-bold text-xs truncate">{agent.name}</h3>
                        <p className="text-xs text-slate-400 truncate">{agent.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className={`px-2 py-0.5 ${agent.accentColor} bg-slate-900/50 rounded border ${agent.borderColor}/30`}>
                        {agent.badge}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Zap className={`w-3 h-3 ${agent.accentColor}`} />
                        <span className="text-slate-400 text-xs">{messages[idx].length}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Vertical Slider - Separate from cards */}
        <div className="w-12 bg-slate-900/20 backdrop-blur-xl border-r border-slate-700/50 flex items-center justify-center relative">
          {/* Track Line */}
          <div className="absolute w-0.5 h-3/4 bg-slate-700/50 rounded-full">
            <div 
              className={`w-0.5 bg-gradient-to-b ${currentAgent.gradient} rounded-full transition-all duration-700`}
              style={{ height: `${((activeAgent + 1) / 4) * 100}%` }}
            />
          </div>

          {/* Agent Position Indicators */}
          <div className="absolute h-3/4 flex flex-col justify-between">
            {agents.map((agent, idx) => (
              <button
                key={idx}
                onClick={() => handleAgentChange(idx)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  idx === activeAgent 
                    ? `bg-gradient-to-br ${agent.gradient} scale-150 shadow-lg` 
                    : 'bg-slate-600 scale-100 hover:scale-125'
                }`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="absolute bottom-4 flex flex-col space-y-2">
            <button
              onClick={() => handleAgentChange(Math.max(0, activeAgent - 1))}
              disabled={activeAgent === 0}
              className={`p-1.5 rounded-lg transition-all ${
                activeAgent === 0 
                  ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed' 
                  : 'bg-slate-800/50 hover:bg-slate-700 text-white'
              }`}
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleAgentChange(Math.min(3, activeAgent + 1))}
              disabled={activeAgent === 3}
              className={`p-1.5 rounded-lg transition-all ${
                activeAgent === 3 
                  ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed' 
                  : 'bg-slate-800/50 hover:bg-slate-700 text-white'
              }`}
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col min-w-0">
          
          {/* Agent Header - Compact */}
          <header className={`bg-slate-900/30 backdrop-blur-2xl border-b border-slate-700/50 px-4 py-3 transition-all duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-800/50 rounded-lg transition-all lg:hidden">
                  {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
                <div className={`w-12 h-12 bg-gradient-to-br ${currentAgent.gradient} rounded-xl flex items-center justify-center shadow-xl flex-shrink-0`}>
                  <currentAgent.icon className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-bold truncate">{currentAgent.name}</h2>
                  <p className="text-slate-400 text-xs truncate">{currentAgent.description}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                <div className={`px-3 py-1.5 bg-gradient-to-r ${currentAgent.gradient} rounded-lg text-xs font-medium shadow-lg`}>
                  #{activeAgent + 1}
                </div>
                <button onClick={() => window.location.href = '/dashboard'} className="px-3 py-1.5 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-xs transition-all hidden sm:block">
                  Dashboard
                </button>
              </div>
            </div>
          </header>

          {/* Messages Area - Optimized height */}
          <div className={`flex-1 overflow-y-auto px-4 py-3 space-y-3 transition-all duration-500 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            {messages[activeAgent].length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-3 max-w-md px-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${currentAgent.gradient} rounded-2xl flex items-center justify-center mx-auto shadow-xl`}>
                    <currentAgent.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold">Start Conversation</h3>
                  <p className="text-slate-400 text-sm">Ask me anything about {currentAgent.description.toLowerCase()}</p>
                  <div className="grid grid-cols-1 gap-2 mt-4">
                    {activeAgent === 0 && (
                      <>
                        <button onClick={() => setInput("What are the symptoms of diabetes?")} className="px-3 py-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-xs text-left transition-all">
                          "What are the symptoms of diabetes?"
                        </button>
                        <button onClick={() => setInput("Explain cardiovascular disease")} className="px-3 py-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-xs text-left transition-all">
                          "Explain cardiovascular disease"
                        </button>
                      </>
                    )}
                    {activeAgent === 1 && (
                      <>
                        <button onClick={() => setInput("Track my blood pressure")} className="px-3 py-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-xs text-left transition-all">
                          "Track my blood pressure"
                        </button>
                        <button onClick={() => setInput("Show my health trends")} className="px-3 py-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-xs text-left transition-all">
                          "Show my health trends"
                        </button>
                      </>
                    )}
                    {activeAgent === 2 && (
                      <>
                        <button onClick={() => setInput("What are side effects of aspirin?")} className="px-3 py-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-xs text-left transition-all">
                          "What are side effects of aspirin?"
                        </button>
                        <button onClick={() => setInput("Check drug interactions")} className="px-3 py-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-xs text-left transition-all">
                          "Check drug interactions"
                        </button>
                      </>
                    )}
                    {activeAgent === 3 && (
                      <>
                        <button onClick={() => setInput("I have chest pain")} className="px-3 py-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-xs text-left transition-all">
                          "I have chest pain"
                        </button>
                        <button onClick={() => setInput("Severe headache assessment")} className="px-3 py-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-xs text-left transition-all">
                          "Severe headache assessment"
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages[activeAgent].map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-start space-x-2 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        msg.role === 'user' 
                          ? 'bg-gradient-to-br from-slate-700 to-slate-800' 
                          : `bg-gradient-to-br ${currentAgent.gradient}`
                      }`}>
                        {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div className={`flex-1 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col min-w-0`}>
                        <div className={`px-3 py-2 rounded-xl ${
                          msg.role === 'user' 
                            ? 'bg-slate-800/70 backdrop-blur-xl' 
                            : msg.role === 'error'
                            ? 'bg-red-900/30 backdrop-blur-xl border border-red-500/30'
                            : 'bg-slate-900/50 backdrop-blur-xl border border-slate-700/50'
                        }`}>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                        </div>
                        <span className="text-xs text-slate-500 mt-1 px-1">
                          {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </>
            )}
          </div>

          {/* Input Area - Compact */}
          <div className="bg-slate-900/30 backdrop-blur-2xl border-t border-slate-700/50 px-4 py-3">
            <div className="flex items-end space-x-2">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={`Ask ${currentAgent.name}...`}
                  rows="2"
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all resize-none text-sm text-white placeholder-slate-500"
                  disabled={loading}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || loading}
                className={`px-4 py-2 bg-gradient-to-r ${currentAgent.gradient} hover:opacity-90 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg h-[52px] flex-shrink-0`}
              >
                {loading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1.5 text-center">
              {currentAgent.complexity} • Secure & Private
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}