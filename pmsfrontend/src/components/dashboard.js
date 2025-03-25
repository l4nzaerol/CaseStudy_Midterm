import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import '../styles/Dashboard.css';  // Aesthetic styling

const Dashboard = ({ onLogout }) => {
    const navigate = useNavigate();
    const [role, setRole] = useState("");

    useEffect(() => {
        // Retrieve user role from localStorage
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

            if (response.ok) {
                localStorage.removeItem("token");
                localStorage.removeItem("role"); // Clear stored role
                onLogout();
                navigate("/");
            }
        } catch (error) {
            console.error("Logout failed", error);
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
                    <li><Link to="/reports">Reports</Link></li>
                </ul>
            </aside>

            <div className="main-content">
                <header className="dashboard-header">
                    <h2>Welcome to Klick Inc. Dashboard</h2>
                    <button className="logout-button" onClick={handleLogout}>Logout</button>
                </header>
            </div>
        </div>
    );
};

export default Dashboard;
