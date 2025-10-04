import React from 'react'
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };



  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:8080/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    if(res.error){
      alert("Login failed", res.error);
      return;
    }
    const data = await res.json();
    console.log(data);
    if (data.token) {
      localStorage.setItem("token", data.token);    // saves token
      localStorage.setItem("user", JSON.stringify(data.user));       // saves user information
      navigate("/dashboard");
    }
  };


  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-xl w-96">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
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
        <button className="bg-green-500 hover:bg-green-600 w-full p-2 rounded">
          Login
        </button>
        <p className="mt-3 text-sm text-gray-400">
            Don't have an account? <a href="/signup" className="text-blue-400">Sign Up</a>
        </p>
      </form>
    </div>
  );
}