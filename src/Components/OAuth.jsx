import React from "react";

export default function OAuth() {
  const API_URL = import.meta.env.VITE_BACKEND_API_URL;

  const handleGoogleSignIn = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();
      console.log("Google Sign In Response:", data);

      if (data.success === false) {
        alert(data.message);
        return;
      }

      // yahan dispatch/signInSuccess ya redirect kar sakte ho
    } catch (err) {
      console.error("Could not sign in with Google", err);
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      className="bg-red-600 text-white p-3 rounded-lg mt-2"
    >
      Sign in with Google
    </button>
  );
}
