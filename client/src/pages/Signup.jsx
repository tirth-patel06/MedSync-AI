import { useState } from "react";
import { useNavigate } from "react-router-dom";
export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    const navigate = useNavigate();
    e.preventDefault();
    const res = await fetch("http://localhost:8080/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    console.log(data);
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-xl w-96">
        <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
        <input
          name="name"
          placeholder="Name"
          className="w-full mb-3 p-2 rounded text-black"
          onChange={handleChange}
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-2 rounded text-black"
          onChange={handleChange}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="w-full mb-3 p-2 rounded text-black"
          onChange={handleChange}
        />
        <button className="bg-blue-500 hover:bg-blue-600 w-full p-2 rounded">
          Sign Up
        </button>
        <p className="mt-3 text-sm text-gray-400">
            Already have an account? <a href="/login" className="text-blue-400">Login</a>
        </p>
      </form>
    </div>
  );
}