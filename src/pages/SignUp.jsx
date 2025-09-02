import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import OAuth from "../Components/OAuth.jsx";

export default function SignUp() {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        setError(data.message || "Sign up failed");
        setLoading(false);
        return;
      }

      setError(null);
      setLoading(false);
      navigate("/sign-in");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center font-semibold my-7">Sign Up</h1>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          id="username"
          value={formData.username}
          onChange={handleChange}
          className="border p-3 rounded-lg"
          required
        />
        <input
          type="email"
          placeholder="Email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          className="border p-3 rounded-lg"
          required
        />
        <input
          type="password"
          placeholder="Password"
          id="password"
          value={formData.password}
          onChange={handleChange}
          className="border p-3 rounded-lg"
          required
        />
        <button
          disabled={loading}
          className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
        >
          {loading ? "Loading..." : "Sign Up"}
        </button>
        <OAuth />
      </form>

      <div className="flex gap-2 mt-5">
        <p>Have an account?</p>
        <Link to="/sign-in">
          <span className="text-blue-700">Sign in</span>
        </Link>
      </div>

      {error && <p className="text-red-500 mt-5">{error}</p>}
    </div>
  );
}
