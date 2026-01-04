import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import OTPInput from "../components/OTPInput";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [step, setStep] = useState(1); // 1: Info, 2: OTP
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();

  const [backupCodes, setBackupCodes] = useState([]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8080/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.requiresVerification) {
        setStep(2);
      } else {
        setError(data.message || "Signup failed");
      }
    } catch (err) {
      setError("An error occurred during signup");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8080/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, otp }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.backupCodes) {
          setBackupCodes(data.backupCodes);
          setStep(3); // Show backup codes
        } else {
          navigate("/dashboard");
        }
      } else {
        setError(data.message || "Verification failed");
      }
    } catch (err) {
      setError("An error occurred during verification");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setError("");
    try {
      const res = await fetch("http://localhost:8080/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();
      if (res.ok) {
        setResendTimer(60);
        const timer = setInterval(() => {
          setResendTimer((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(data.message || "Failed to resend OTP");
      }
    } catch (err) {
      setError("An error occurred");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch("http://localhost:8080/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard");
      } else {
        setError(data.message || "Google Login failed");
      }
    } catch (err) {
      setError("An error occurred during Google Login");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white p-4">
      <div className="bg-gray-800 p-8 rounded-2xl w-full max-w-md shadow-2xl border border-gray-700">
        {step === 1 ? (
          <form onSubmit={handleSignupSubmit}>
            <h2 className="text-3xl font-extrabold mb-6 text-center text-blue-400">Join MedSync AI</h2>
            {error && <div className="bg-red-500/20 border border-red-500 text-red-500 p-3 rounded-lg mb-4 text-sm">{error}</div>}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                <input
                  name="name"
                  placeholder="John Doe"
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                <input
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="mt-8 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 w-full p-3 rounded-lg font-bold text-lg transition-colors shadow-lg"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>

            <div className="mt-6 flex flex-col items-center">
              <div className="w-full flex items-center mb-6">
                <div className="flex-1 h-px bg-gray-700"></div>
                <span className="px-3 text-sm text-gray-500 font-medium">OR</span>
                <div className="flex-1 h-px bg-gray-700"></div>
              </div>
              
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google Signup Failed")}
                theme="filled_blue"
                shape="pill"
                text="signup_with"
                width="100%"
              />
            </div>
            <p className="mt-6 text-center text-sm text-gray-400">
              Already have an account? <a href="/login" className="text-blue-400 hover:underline">Login</a>
            </p>
          </form>
        ) : step === 2 ? (
          <div>
            <h2 className="text-3xl font-extrabold mb-2 text-center text-blue-400">Verify Email</h2>
            <p className="text-gray-400 text-center mb-8">We've sent a code to <span className="text-white font-medium">{form.email}</span></p>
            
            {error && <div className="bg-red-500/20 border border-red-500 text-red-500 p-3 rounded-lg mb-6 text-sm">{error}</div>}
            
            <OTPInput onComplete={(code) => setOtp(code)} />
            
            <button 
              onClick={handleVerifyOTP}
              disabled={loading || otp.length < 6}
              className="mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 w-full p-3 rounded-lg font-bold text-lg transition-colors shadow-lg"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-400">Didn't receive the code?</p>
              <button 
                onClick={handleResendOTP}
                disabled={resendTimer > 0}
                className={`mt-2 font-medium ${resendTimer > 0 ? 'text-gray-500 cursor-not-allowed' : 'text-blue-400 hover:underline'}`}
              >
                {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend OTP"}
              </button>
            </div>
            
            <button 
              onClick={() => setStep(1)}
              className="mt-6 w-full text-sm text-gray-500 hover:text-gray-300"
            >
              ← Back to Sign Up
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="bg-green-500/20 p-3 rounded-full">
                <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-extrabold mb-2 text-green-400">Account Verified!</h2>
            <p className="text-gray-400 mb-6">Your backup codes are listed below. Please save them in a safe place.</p>
            
            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 grid grid-cols-1 gap-2 mb-8">
              {backupCodes.map((code, i) => (
                <code key={i} className="text-lg font-mono text-blue-300">{code}</code>
              ))}
            </div>

            <button 
              onClick={() => navigate("/dashboard")}
              className="bg-green-600 hover:bg-green-700 w-full p-3 rounded-lg font-bold text-lg transition-colors shadow-lg"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}