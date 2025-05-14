import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        email,
        password,
      });

      console.log("Login API response:", response.data);

      const { token, role, userId, id, _id, user } = response.data;
      if (!token) {
        throw new Error("No token received");
      }

      const userIdFinal = userId || id || _id || (user && (user.id || user._id || user.userId));
      if (!userIdFinal) {
        throw new Error("No user ID found in response: " + JSON.stringify(response.data));
      }

      localStorage.setItem("token", token);
      localStorage.setItem("role", role || "user"); // Default if missing
      localStorage.setItem("userId", userIdFinal);
      console.log("Login saved:", { token, role, userId: userIdFinal });

      navigate("/seller-dashboard", { replace: true });
    } catch (error) {
      setError(error.response?.data?.error || "Login failed: " + error.message);
      console.error("Login error:", error.response || error);
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Auth;