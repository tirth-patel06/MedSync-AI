import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        if (data.requiresVerification) {
          setError("Account not verified. Please sign up again to receive a new code.");
          // Optionally redirect to a dedicated verification page if we had one
        } else {
          setError(data.message || "Login failed");
        }
        return;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard");
      }
    } catch (err) {
      setError("An error occurred during login");
    } finally {
      setLoading(false);
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
        <form onSubmit={handleSubmit}>
          <h2 className="text-3xl font-extrabold mb-6 text-center text-green-400">Welcome Back</h2>
          
          {error && <div className="bg-red-500/20 border border-red-500 text-red-500 p-3 rounded-lg mb-4 text-sm">{error}</div>}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
              <input
                name="email"
                type="email"
                placeholder="john@example.com"
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
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
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="mt-8 bg-green-600 hover:bg-green-700 disabled:bg-green-800 w-full p-3 rounded-lg font-bold text-lg transition-colors shadow-lg"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="mt-6 flex flex-col items-center">
            <div className="w-full flex items-center mb-6">
              <div className="flex-1 h-px bg-gray-700"></div>
              <span className="px-3 text-sm text-gray-500 font-medium">OR</span>
              <div className="flex-1 h-px bg-gray-700"></div>
            </div>
            
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google Login Failed")}
              theme="filled_blue"
              shape="pill"
              text="continue_with"
              width="100%"
            />
          </div>
          
          <p className="mt-6 text-center text-sm text-gray-400">
            Don't have an account? <a href="/signup" className="text-blue-400 hover:underline">Sign Up</a>
          </p>
        </form>
      </div>
    </div>
  );
}