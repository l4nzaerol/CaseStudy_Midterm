import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Project.css";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [editProjectId, setEditProjectId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [budget, setBudget] = useState("");


  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://127.0.0.1:8000/api/projects", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      setProjects(data);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const res = await fetch("http://127.0.0.1:8000/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        description,
        start_date: startDate,
        end_date: endDate,
        budget,
        user_id: 1,
      }),
      
    });

    if (res.ok) {
  setName("");
  setDescription("");
  setStartDate("");
  setEndDate("");
  setBudget(""); // <-- add this
  fetchProjects();
}

    
  };

  const handleDeleteProject = async (id) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://127.0.0.1:8000/api/projects/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.ok) {
      fetchProjects();
    }
  };

  const openModal = (project) => {
    setEditProjectId(project.id);
    setEditName(project.name);
    setEditDescription(project.description);
    setEditStartDate(project.start_date);
    setEditEndDate(project.end_date || "");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditProjectId(null);
  };

  const handleEditProject = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const res = await fetch(`http://127.0.0.1:8000/api/projects/${editProjectId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: editName,
        description: editDescription,
        start_date: editStartDate,
        end_date: editEndDate,
      }),
    });

    if (res.ok) {
      fetchProjects();
      closeModal();
    }
  };

  return (
    <div className="project-container">
      <h2>Projects</h2>
      <div className="project-wrapper">
        {/* Project Form */}
        <div className="project-form">
          <h3>Create Project</h3>
          <form onSubmit={handleCreateProject}>
            <input
              type="text"
              placeholder="Project Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <input
              type="number"
              placeholder="Total Budget"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              required
            />

            <button type="submit">Create Project</button>
          </form>
        </div>

        {/* Project List */}
        <div className="project-list">
          <h3>Project List</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Start</th>
                <th>End</th>
                <th>Status</th>
                <th>Budget</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.description}</td>
                  <td>{p.start_date}</td>
                  <td>{p.end_date || "-"}</td>
                  <td>{p.status}</td>
                  <td>{p.budget}</td>
                  <td>
                    <button onClick={() => openModal(p)}>Edit</button>
                    <button onClick={() => handleDeleteProject(p.id)}>Delete</button>
                    <button onClick={() => navigate(`/projects/${p.id}`)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Editing */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Project</h3>
            <form onSubmit={handleEditProject}>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              ></textarea>
              <input
                type="date"
                value={editStartDate}
                onChange={(e) => setEditStartDate(e.target.value)}
                required
              />
              <input
                type="date"
                value={editEndDate}
                onChange={(e) => setEditEndDate(e.target.value)}
              />
              <button type="submit">Save</button>
              <button type="button" onClick={closeModal}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Back to Dashboard Button */}
      <div style={{ textAlign: "center", marginTop: "30px" }}>
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            padding: "10px 20px",
            backgroundColor: "var(--primary)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Projects;
