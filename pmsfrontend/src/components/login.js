import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/Login.css';  // Import the updated CSS

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
            <h2 className="login-header">Klick Inc.</h2>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleLogin} className="login-form">
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
                <button type="submit" className="login-button">Login</button>
            </form>
            <button onClick={() => navigate("/register")} className="register-button">Register</button>
        </div>
    );
};

export default Login;
