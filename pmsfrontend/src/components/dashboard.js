import React from "react";
import { useNavigate } from "react-router-dom";
import '../styles/Dashboard.css';  // Aesthetic styling

const Dashboard = ({ onLogout }) => {
    const navigate = useNavigate();

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
                <h3 className="sidebar-title">Project Manager</h3>
                <ul className="sidebar-links">
                    <li><a href="#projects">Projects</a></li>
                    <li><a href="#tasks">Tasks</a></li>
                    <li><a href="#team">Team</a></li>
                    <li><a href="#reports">Reports</a></li>
                </ul>
            </aside>

            <div className="main-content">
                <header className="dashboard-header">
                    <h2>Welcome to your Dashboard </h2>
                    <button className="logout-button" onClick={handleLogout}>Logout</button>
                </header>
                </div>
            </div>
        
    );
};

export default Dashboard;
