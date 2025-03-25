import React from "react";
import { useNavigate } from "react-router-dom";
import '../styles/Dashboard.css';  // Import the CSS for styling

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
        <div className="dashboard-container">
            <div className="sidebar">
                <h3 className="sidebar-title">Project Manager</h3>
                <ul className="sidebar-links">
                    <li><a href="#projects">Projects</a></li>
                    <li><a href="#tasks">Tasks</a></li>
                    <li><a href="#team">Team</a></li>
                    <li><a href="#reports">Reports</a></li>
                </ul>
            </div>

            <div className="main-content">
                <header className="dashboard-header">
                    <h2>Welcome to your Dashboard</h2>
                    <button className="logout-button" onClick={handleLogout}>Logout</button>
                </header>

                <section className="cards-container">
                    <div className="card">
                        <h4>Active Projects</h4>
                        <p>3 Projects In Progress</p>
                    </div>
                    <div className="card">
                        <h4>Pending Tasks</h4>
                        <p>12 Tasks Remaining</p>
                    </div>
                    <div className="card">
                        <h4>Team Members</h4>
                        <p>5 Active Team Members</p>
                    </div>
                </section>

                <section className="overview-section">
                    <h3>Project Overview</h3>
                    <div className="project-status">
                        <div className="status-card">
                            <h5>Project Alpha</h5>
                            <p>80% Complete</p>
                        </div>
                        <div className="status-card">
                            <h5>Project Beta</h5>
                            <p>50% Complete</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Dashboard;
