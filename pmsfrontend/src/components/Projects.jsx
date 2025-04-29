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

  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    const token = localStorage.getItem("token");
    const res = await fetch("http://127.0.0.1:8000/api/projects", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setProjects(await res.json());
  }

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
        user_id: 1, // or use the current logged-in user's ID
      }),
    });
    if (!res.ok) return console.error("Create failed");
    setName("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    fetchProjects();
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
    if (!res.ok) return console.error("Update failed");
    await fetchProjects();
    closeModal();
  };

  const handleDeleteProject = async (id) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://127.0.0.1:8000/api/projects/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) fetchProjects();
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

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="gradient-bg">
      <div className="main-content">
        <h2 className="dashboard-header">Projects</h2>
        <button onClick={handleBackToDashboard}>Back to Dashboard</button>

        {/* Create Project */}
        <div className="form-container">
          <form onSubmit={handleCreateProject} className="project-form">
            <input
              placeholder="Project Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              required
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea-field"
            />
            <input
              placeholder="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field"
              required
            />
            <input
              placeholder="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-field"
            />
            <button type="submit" className="submit-button">
              Create Project
            </button>
          </form>
        </div>

        {/* Projects List */}
        <div className="project-list">
          <table>
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Description</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th></th>
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
                  <td className="button-group">
                    <button className="edit-button" onClick={() => openModal(p)}>
                      Edit
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteProject(p.id)}
                    >
                      Delete
                    </button>
                    <button
                      className="view-button"
                      onClick={() => navigate(`/projects/${p.id}`)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edit Modal */}
        {isModalOpen && (
          <div className="modal">
            <div className="modal-content">
              <h3>Edit Project</h3>
              <form onSubmit={handleEditProject}>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="input-field"
                  required
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="textarea-field"
                />
                <input
                  type="date"
                  value={editStartDate}
                  onChange={(e) => setEditStartDate(e.target.value)}
                  className="input-field"
                  required
                />
                <input
                  type="date"
                  value={editEndDate}
                  onChange={(e) => setEditEndDate(e.target.value)}
                  className="input-field"
                />
                <div className="button-group" style={{ marginTop: 16 }}>
                  <button type="submit" className="submit-button">
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="cancel-button"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
