import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import '../styles/Dashboard.css';  // Aesthetic styling

const Dashboard = ({ onLogout }) => {
    const navigate = useNavigate();
    const [role, setRole] = useState("");

    useEffect(() => {
        const storedRole = localStorage.getItem("role");
        if (storedRole) {
            setRole(storedRole);
        }
    }, []);

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://127.0.0.1:8000/api/logout", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            // Even if logout API fails, force logout on frontend
            if (response.ok || response.status === 401 || response.status === 419) {
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                if (onLogout) {
                    onLogout();
                }
                navigate("/");
            } else {
                console.error("Logout request failed.");
                localStorage.removeItem("token"); 
                localStorage.removeItem("role");
                if (onLogout) {
                    onLogout();
                }
                navigate("/");
            }
        } catch (error) {
            console.error("Logout failed", error);
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            if (onLogout) {
                onLogout();
            }
            navigate("/");
        }
    };

    return (
        <div className="dashboard-container gradient-bg">
            <aside className="sidebar">
                <h3 className="sidebar-title">
                    {role ? role.charAt(0).toUpperCase() + role.slice(1).replace("_", " ") : "User"}
                </h3>
                <ul className="sidebar-links">
                    <li><Link to="/projects">Projects</Link></li>
                    <li><Link to="/tasks">Tasks</Link></li>
                </ul>
            </aside>

            <div className="main-content">
                <header className="dashboard-header">
                    <h2>Klick Inc. Dashboard</h2>
                    <button className="logout-button" onClick={handleLogout}>Logout</button>
                </header>
            </div>
        </div>
    );
};

export default Dashboard;
