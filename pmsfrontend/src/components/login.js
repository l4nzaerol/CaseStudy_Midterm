import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";  // Updated CSS file

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://127.0.0.1:8000/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Store token and role in localStorage
                localStorage.setItem("token", data.token);
                localStorage.setItem("role", data.user.role); // Assuming API returns user role

                onLogin(data.token);
                navigate("/dashboard");
            } else {
                setError(data.message || "Login failed");
            }
        } catch (error) {
            setError("Server error");
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="design-section">
                    <h1 className="welcome-text">Welcome!</h1>
                </div>

                <div className="form-section">
                    <h1>Klick Inc.</h1>
                    <form onSubmit={handleLogin} className="login-form">
                        {error && <p className="error-message">{error}</p>}

                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="input-field"
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="input-field"
                        />

                        <button type="submit" className="submit-button">Login</button>
                    </form>
                    <button 
                        onClick={() => navigate("/register")} 
                        className="register-button"
                    >
                        Register in Klick Inc.
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
