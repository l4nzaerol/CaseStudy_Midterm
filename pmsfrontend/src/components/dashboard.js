import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, FolderKanban } from "lucide-react"; // Removed ClipboardList import
import "../styles/Dashboard.css";


const Dashboard = ({ onLogout }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState("projects");
    const [projects, setProjects] = useState([]);
    const [newProject, setNewProject] = useState({
        name: "",
        description: "",
        budget: "",
        status: "active",
    });

    useEffect(() => {
        fetchUserDetails();
        fetchProjects();
    }, []);

    const fetchUserDetails = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch("http://127.0.0.1:8000/api/user", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setUser(data);
            }
        } catch (error) {
            console.error("Error fetching user details:", error);
        }
    };

    const fetchProjects = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch("http://127.0.0.1:8000/api/my-projects", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setProjects(data);
            }
        } catch (error) {
            console.error("Error fetching projects:", error);
        }
    };

    const handleLogout = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch("http://127.0.0.1:8000/api/logout", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                localStorage.removeItem("token");
                onLogout();
                navigate("/");
            }
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        try {
            const response = await fetch("http://127.0.0.1:8000/api/projects", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newProject),
            });
            if (response.ok) {
                const data = await response.json();
                console.log("Project created:", data);
                setNewProject({ name: "", description: "", budget: "", status: "active" });
                fetchProjects(); // Refresh the project list after creating a new project
            } else {
                const errorData = await response.json();
                console.error("Error creating project:", errorData);
            }
        } catch (error) {
            console.error("Error creating project:", error);
        }
    };

    return (
        <div className="dashboard">
            <aside className="sidebar">
                <h2>{user ? `Welcome, ${user.name}` : "Loading..."}</h2>
                <ul>
                    <li className={activeTab === "projects" ? "active" : ""} onClick={() => setActiveTab("projects")}>
                        <FolderKanban size={16} />
                        Projects
                    </li>
                    <li className={activeTab === "task" ? "active" : ""} onClick={() => setActiveTab("task")}>
                        <FolderKanban size={16} />
                        My Task
                    </li>
                </ul>
            </aside>

            <button className="logout-btn" onClick={handleLogout}>
                <LogOut size={16} /> Logout
            </button>

            <main className="main-content">
                {activeTab === "projects" && (
                    <>
                        <h2>Projects</h2>

                        <form onSubmit={handleCreateProject} className="project-form">
                            <input
                                type="text"
                                placeholder="Project Name"
                                value={newProject.name}
                                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Description"
                                value={newProject.description}
                                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                required
                            />
                            <input
                                type="number"
                                placeholder="Budget"
                                value={newProject.budget}
                                onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                                required
                            />
                            <select
                                value={newProject.status}
                                onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                            >
                                <option value="active">Active</option>
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                            </select>
                            <button type="submit">Create Project</button>
                        </form>

                        <table className="user-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Budget</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects.length > 0 ? (
                                    projects.map((project) => (
                                        <tr key={project.id}>
                                            <td>{project.id}</td>
                                            <td>{project.name}</td>
                                            <td>{project.description}</td>
                                            <td>{project.budget}</td>
                                            <td>{project.status}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5">No projects available.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </>
                )}
            </main>
        </div>
    );
};

export default Dashboard;

