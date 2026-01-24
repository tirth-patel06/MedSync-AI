import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Pill,
  Heart,
  Clock,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
} from "lucide-react";

export default function LandingPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* ---------------- AUTH ---------------- */

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!data.token) {
        alert("Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) {
      alert("Login failed");
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
        alert("Signup failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/health");
    } catch (err) {
      alert("Signup failed");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* ================= BACKGROUND ORBS ================= */}
      <div
        className="absolute w-[28rem] h-[28rem] bg-gradient-to-br from-orange-500/20 to-rose-500/20 rounded-full blur-3xl"
        style={{
          top: "10%",
          left: "5%",
          transform: `translate(${mousePosition.x * 0.02}px, ${
            mousePosition.y * 0.02
          }px)`,
        }}
      />
      <div
        className="absolute w-[26rem] h-[26rem] bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl"
        style={{
          bottom: "10%",
          right: "5%",
          transform: `translate(${-mousePosition.x * 0.02}px, ${
            -mousePosition.y * 0.02
          }px)`,
        }}
      />

      {/* ================= HEADER ================= */}
      <nav className="fixed inset-x-0 top-0 z-50 backdrop-blur-xl bg-slate-950/70 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/40">
              <Pill />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">
              INSIGHT-X
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm">
            <a className="hover:text-white text-slate-300" href="#features">
              Features
            </a>
            <a className="hover:text-white text-slate-300" href="#about">
              About
            </a>
            <a className="hover:text-white text-slate-300" href="#contact">
              Contact
            </a>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 shadow-lg shadow-orange-500/40"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ================= MAIN ================= */}
      <div className="pt-32 relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        {/* LEFT */}
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/60 border border-slate-700">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-slate-300">Webster 2025</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Your Health,
            <br />
            <span className="bg-gradient-to-r from-orange-400 via-rose-400 to-pink-400 bg-clip-text text-transparent">
              Simplified
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-xl">
            Intelligent medication tracking with AI-powered assistance to keep
            your health on track.
          </p>

          <div className="flex flex-wrap gap-3">
            <Feature icon={Clock} label="Smart Reminders" />
            <Feature icon={TrendingUp} label="Track Progress" />
            <Feature icon={Zap} label="AI Assistant" />
          </div>
        </div>

        {/* RIGHT – AUTH */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl">
            <div className="flex border-b border-slate-800">
              <Tab active={isLogin} onClick={() => setIsLogin(true)}>
                Login
              </Tab>
              <Tab active={!isLogin} onClick={() => setIsLogin(false)}>
                Sign Up
              </Tab>
            </div>

            <form
              onSubmit={isLogin ? handleLoginSubmit : handleSignupSubmit}
              className="p-8 space-y-5"
            >
              {!isLogin && (
                <Input
                  label="Full Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                />
              )}
              <Input
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
              />
              <Input
                label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
              />

              <button className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/40">
                {isLogin ? "Login" : "Create Account"}
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>

          <div className="mt-6 flex justify-center gap-6 text-sm text-slate-400">
            <Badge icon={Shield} label="Secure" />
            <Badge icon={Heart} label="HIPAA Compliant" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= REUSABLE ================= */

const Feature = ({ icon: Icon, label }) => (
  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/60 border border-slate-700">
    <Icon className="w-4 h-4 text-orange-400" />
    <span className="text-sm">{label}</span>
  </div>
);

const Tab = ({ active, children, ...props }) => (
  <button
    {...props}
    className={`flex-1 py-4 text-sm font-medium transition ${
      active
        ? "bg-slate-800 text-white"
        : "text-slate-400 hover:text-white"
    }`}
  >
    {children}
  </button>
);

const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-sm text-slate-300 mb-1">{label}</label>
    <input
      {...props}
      required
      className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
    />
  </div>
);

const Badge = ({ icon: Icon, label }) => (
  <div className="flex items-center gap-2">
    <Icon className="w-4 h-4" />
    <span>{label}</span>
  </div>
);
