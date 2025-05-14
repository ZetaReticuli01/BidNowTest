// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import "../styles/AuthForm.css";

// const AuthForm = () => {
//   const { role } = useParams(); 
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [name, setName] = useState("");
//   const [isNewUser, setIsNewUser] = useState(false);
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     setError(null);
//   }, [isNewUser]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError(null);

//     if (isNewUser) {
//       try {
//         await axios.post("http://localhost:9000/api/auth/register", { name, email, password, role });
//         alert("Signup successful! Now login.");
//         setIsNewUser(false); 
//       } catch (err) {
//         setError(err.response?.data?.error || "Signup failed.");
//       }
//     } else {
//       try {
//         const response = await axios.post("http://localhost:9000/api/auth/login", { email, password });
//         localStorage.setItem("token", response.data.token);
//         localStorage.setItem("role", response.data.role);

//         if (role === "seller") navigate("/seller-dashboard");
//         else if (role === "bidder") navigate("/auctions");
//         else navigate("/");

//       } catch (err) {
//         setError(err.response?.data?.error || "Login failed.");
//       }
//     }
//   };

//   return (
//     <div className="auth-container">
//       <h2>{isNewUser ? "Sign Up" : "Login"} as {role.charAt(0).toUpperCase() + role.slice(1)}</h2>
//       {error && <p className="error-message">{error}</p>}

//       <form onSubmit={handleSubmit}>
//         {isNewUser && <input type="text" placeholder="Full Name" required onChange={(e) => setName(e.target.value)} />}
//         <input type="email" placeholder="Email" required onChange={(e) => setEmail(e.target.value)} />
//         <input type="password" placeholder="Password" required onChange={(e) => setPassword(e.target.value)} />
//         <button type="submit">{isNewUser ? "Sign Up" : "Login"}</button>
//       </form>

//       <p className="toggle-auth">
//         {isNewUser ? "Already have an account? " : "New user? "}
//         <span onClick={() => setIsNewUser(!isNewUser)}>{isNewUser ? "Login here" : "Sign up here"}</span>
//       </p>
//     </div>
//   );
// };

// export default AuthForm;









import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../styles/AuthForm.css";

const AuthForm = () => {
  const { role: urlRole } = useParams(); // From /auth/:role
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [error, setError] = useState(null);

  // Extract role from query param or URL, default to bidder
  const searchParams = new URLSearchParams(location.search);
  const roleFromQuery = searchParams.get("role");
  const role = roleFromQuery || urlRole || "bidder"; // Prioritize query param over URL param
  console.log("AuthForm role:", { urlRole, roleFromQuery, finalRole: role }); // Debug log
  

  useEffect(() => {
    setError(null);
  }, [isNewUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      let response;
      if (isNewUser) {
        response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
          name,
          email,
          password,
          role: role === "seller" ? "seller" : "bidder", // Use final role for signup
        });
        console.log("Register response:", response.data); // Debug log
        alert("Signup successful! Please log in.");
        setIsNewUser(false);
        localStorage.setItem("name", name); // Store name from signup
      } else {
        response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
          email,
          password,
        });
        console.log("Login response (full):", response.data); // Detailed debug log
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", response.data.role); // Set role from backend
        localStorage.setItem("userId", response.data.userId || response.data._id);

        // Attempt to extract name from response, adjust based on backend structure
        const userName = response.data.name || response.data.user?.name; // Try common structures
        if (userName) {
          localStorage.setItem("name", userName);
          console.log("Name extracted from login response:", userName);
        } else {
          console.warn("No name found in login response, using default or signup name if exists");
          const storedName = localStorage.getItem("name") || "User"; // Fallback to stored or default
          localStorage.setItem("name", storedName);
        }
      }

      if (response.data.role === "bidder") {
        navigate("/bidder-dashboard");
      } else if (response.data.role === "seller") {
        navigate("/seller-dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Authentication failed.");
      console.error("Auth error:", err.response?.data || err.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>{isNewUser ? "Sign Up" : "Login"} as {role.charAt(0).toUpperCase() + role.slice(1)}</h2>
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit}>
        {isNewUser && <input type="text" placeholder="Full Name" required onChange={(e) => setName(e.target.value)} />}
        <input type="email" placeholder="Email" required onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" required onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">{isNewUser ? "Sign Up" : "Login"}</button>
      </form>

      <p className="toggle-auth">
        {isNewUser ? "Already have an account? " : "New user? "}
        <span onClick={() => setIsNewUser(!isNewUser)}>{isNewUser ? "Login here" : "Sign up here"}</span>
      </p>
    </div>
  );
};

export default AuthForm;