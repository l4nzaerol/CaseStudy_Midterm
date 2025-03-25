import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Registration.css"; // Import your CSS

const Registration = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("team_member");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            const response = await fetch("http://127.0.0.1:8000/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    password_confirmation: confirmPassword,
                    role,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                navigate("/");
            } else {
                setError(data.message || "Registration failed");
            }
        } catch (error) {
            setError("Password must be at least 8 characters long");
        }
    };

    return (
        <div className="registration-container"> 
            <div className="registration-form">
                <h2 className="registration-header">Register in Klick Inc.</h2>
                {error && <p className="error-message">{error}</p>}

                <form onSubmit={handleRegister}>
                    <input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="input-field"
                    />
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
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="input-field"
                    />

                    {/* Role dropdown below Confirm Password */}
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="input-field"
                    >
                        <option value="admin">Admin</option>
                        <option value="project_manager">Project Manager</option>
                        <option value="team_member">Team Member</option>
                        <option value="client">Client</option>
                    </select>

                    <button type="submit" className="register-button">Register</button>
                </form>

                <button onClick={() => navigate("/")} className="back-to-login-button">
                    Already have an account? Login
                </button>
            </div>
        </div>
    );
};

export default Registration;
