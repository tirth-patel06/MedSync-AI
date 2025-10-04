import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pill, Heart, Clock, TrendingUp, Sparkles, ArrowRight, Shield, Zap } from 'lucide-react';

export default function LandingPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password })
      });
      
      const data = await res.json();
      
      if (res.error || !data.token) {
        alert("Login failed: " + (data.message || "Invalid credentials"));
        return;
      }
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      console.log("Login successful:", JSON.stringify(data.user));
      console.log("local user",JSON.parse(localStorage.getItem("user")))
      navigate("/dashboard");
    } catch (error) {
      alert("Login failed: " + error.message);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8080/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        alert("Signup failed: " + (data.message || "Please try again"));
        return;
      }
      
      alert("Account created successfully! Please login.");
      setIsLogin(true);
      setForm({ name: "", email: "", password: "" });
    } catch (error) {
      alert("Signup failed: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden relative">
      {/* Animated gradient orbs */}
      <div 
        className="absolute w-96 h-96 bg-gradient-to-br from-orange-500/20 to-rose-500/20 rounded-full blur-3xl"
        style={{
          top: '10%',
          left: '5%',
          transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
        }}
      />
      <div 
        className="absolute w-96 h-96 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl"
        style={{
          bottom: '10%',
          right: '5%',
          transform: `translate(${-mousePosition.x * 0.02}px, ${-mousePosition.y * 0.02}px)`
        }}
      />
      <div 
        className="absolute w-96 h-96 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-full blur-3xl"
        style={{
          top: '50%',
          left: '50%',
          transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`
        }}
      />

      {/* Header */}
      <nav className="relative z-10 px-6 py-6 flex justify-between items-center backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/50">
            <Pill className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">
            INSIGHT-X
          </span>
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-slate-300 hover:text-white transition-colors">Features</a>
          <a href="#about" className="text-slate-300 hover:text-white transition-colors">About</a>
          <a href="#contact" className="text-slate-300 hover:text-white transition-colors">Contact</a>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side - Hero Content */}
        <div className="space-y-8">
          <div className="inline-flex items-center space-x-2 bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-700">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-slate-300">Webster 2025</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold leading-tight">
            Your Health,
            <br />
            <span className="bg-gradient-to-r from-orange-400 via-rose-400 to-pink-400 bg-clip-text text-transparent">
              Simplified
            </span>
          </h1>

          <p className="text-xl text-slate-400 leading-relaxed">
            Never miss a dose again. INSIGHT-X combines intelligent medication tracking with AI-powered health assistance to keep you on track.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-4">
            <div className="space-y-1">
              <div className="text-3xl font-bold text-orange-400">50%</div>
              <div className="text-sm text-slate-400">Adherence Rate</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-rose-400">125K</div>
              <div className="text-sm text-slate-400">Deaths/Year</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-cyan-400">24/7</div>
              <div className="text-sm text-slate-400">AI Support</div>
            </div>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center space-x-2 bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-700">
              <Clock className="w-4 h-4 text-orange-400" />
              <span className="text-sm">Smart Reminders</span>
            </div>
            <div className="flex items-center space-x-2 bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-700">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span className="text-sm">Track Progress</span>
            </div>
            <div className="flex items-center space-x-2 bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-700">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm">AI Assistant</span>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Card */}
        <div className="lg:justify-self-end w-full max-w-md">
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-slate-800">
              <button
                onClick={() => {
                  setIsLogin(true);
                  setForm({ name: "", email: "", password: "" });
                }}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-all ${
                  isLogin
                    ? 'bg-gradient-to-br from-slate-800 to-slate-900 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Log In
              </button>
              <button
                onClick={() => {
                  setIsLogin(false);
                  setForm({ name: "", email: "", password: "" });
                }}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-all ${
                  !isLogin
                    ? 'bg-gradient-to-br from-slate-800 to-slate-900 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form */}
            <form onSubmit={isLogin ? handleLoginSubmit : handleSignupSubmit} className="p-8 space-y-6">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-white"
                />
              </div>

              {isLogin && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-700 text-orange-500 focus:ring-orange-500/50" />
                    <span className="text-slate-400">Remember me</span>
                  </label>
                  <a href="#" className="text-orange-400 hover:text-orange-300 transition-colors">
                    Forgot password?
                  </a>
                </div>
              )}

              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-orange-500/50 hover:shadow-xl hover:shadow-orange-500/60 flex items-center justify-center space-x-2 group"
              >
                <span>{isLogin ? 'Log In' : 'Create Account'}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-slate-900 text-slate-400">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button type="button" className="px-4 py-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-sm">Google</span>
                </button>
                <button type="button" className="px-4 py-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all flex items-center justify-center space-x-2">
                  <Heart className="w-5 h-5" />
                  <span className="text-sm">Health App</span>
                </button>
              </div>
            </form>
          </div>

          {/* Trust Badges */}
          <div className="mt-6 flex items-center justify-center space-x-6 text-slate-400 text-sm">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Secure</span>
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4" />
              <span>HIPAA Compliant</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-gradient-to-br from-orange-500/10 to-rose-500/10 rounded-2xl backdrop-blur-sm border border-orange-500/20 flex items-center justify-center animate-pulse">
        <Pill className="w-10 h-10 text-orange-400" />
      </div>
      <div className="absolute bottom-1/4 right-1/4 w-16 h-16 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl backdrop-blur-sm border border-cyan-500/20 flex items-center justify-center animate-pulse delay-150">
        <Clock className="w-8 h-8 text-cyan-400" />
      </div>
    </div>
  );
}