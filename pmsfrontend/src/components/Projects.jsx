import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Project.css";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  
  // For editing
  const [editProjectId, setEditProjectId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [teamMembers, setTeamMembers] = useState([]);
  const [newMember, setNewMember] = useState("");
  const [newProjectMembers, setNewProjectMembers] = useState([]);

  const [assignedMembers, setAssignedMembers] = useState([]);
  const [modalNewMember, setModalNewMember] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
    fetchTeamMembers();
  }, []);

  async function fetchProjects() {
    const token = localStorage.getItem("token");
    const res = await fetch("http://127.0.0.1:8000/api/projects", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setProjects(await res.json());
  }

  async function fetchTeamMembers() {
    const token = localStorage.getItem("token");
    const res = await fetch("http://127.0.0.1:8000/api/team-members", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setTeamMembers(await res.json());
  }

  async function fetchAssignedMembers(projectId) {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://127.0.0.1:8000/api/projects/${projectId}/members`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        setAssignedMembers(data);
      } else if (Array.isArray(data.members)) {
        setAssignedMembers(data.members);
      } else {
        setAssignedMembers([]);
      }
    }
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
        user_id: 1, // or current user
      }),
    });
    if (!res.ok) return console.error("Create failed");
    const project = await res.json();
    await Promise.all(
      newProjectMembers.map((memberId) =>
        fetch(`http://127.0.0.1:8000/api/projects/${project.id}/addMember`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ user_id: memberId }),
        })
      )
    );
    setName("");
    setDescription("");
    setStartDate("");
    setNewProjectMembers([]);
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
      }),
    });
    if (!res.ok) return console.error("Update failed");
    await fetchProjects();
    await fetchAssignedMembers(editProjectId);
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

  const handleAddMemberToNew = () => {
    if (!newMember) return;
    const id = parseInt(newMember, 10);
    if (!newProjectMembers.includes(id)) {
      setNewProjectMembers([...newProjectMembers, id]);
    }
    setNewMember("");
  };

  const handleRemoveMemberFromNew = (id) =>
    setNewProjectMembers(newProjectMembers.filter((mid) => mid !== id));

  const handleAddMemberInModal = async () => {
    if (!modalNewMember) return;
    const id = parseInt(modalNewMember, 10);
    const token = localStorage.getItem("token");
    const res = await fetch(
      `http://127.0.0.1:8000/api/projects/${editProjectId}/addMember`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: id }),
      }
    );
    if (res.ok) {
      setModalNewMember("");
      await fetchAssignedMembers(editProjectId);
    }
  };

  const handleRemoveMemberInModal = async (userId) => {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `http://127.0.0.1:8000/api/projects/${editProjectId}/removeMember`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: userId }),
      }
    );
    if (res.ok) await fetchAssignedMembers(editProjectId);
  };

  const openModal = (project) => {
    setEditProjectId(project.id);
    setEditName(project.name);
    setEditDescription(project.description);
    setEditStartDate(project.start_date);
    fetchAssignedMembers(project.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditProjectId(null);
    setAssignedMembers([]);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
};

  return (
    <div className="gradient-bg">
      <div className="main-content">
        <h2 className="dashboard-header">Projects</h2> <button onClick={handleBackToDashboard}>Back to Dashboard</button>

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

            {/* Select & Add Members BEFORE creating */}
            <div className="team-member-selection">
              <select
                value={newMember}
                onChange={(e) => setNewMember(e.target.value)}
                className="input-field"
              >
                <option value="">Select Team Member</option>
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddMemberToNew}
                className="submit-button"
              >
                Add Member
              </button>
            </div>

            {newProjectMembers.length > 0 && (
              <div className="selected-members">
                <h4>Members to Add:</h4>
                <ul>
                  {newProjectMembers.map((mid) => {
                    const u = teamMembers.find((x) => x.id === mid) || {};
                    return (
                      <li key={mid}>
                        {u.name || "(unknown)"}{" "}
                        <button
                          type="button"
                          onClick={() => handleRemoveMemberFromNew(mid)}
                          className="remove-button"
                        >
                          Remove
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

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
                  <td>{p.status}</td>
                  <td className="button-group">
                    <button className="edit-button" onClick={() => openModal(p)}>Edit</button>
                    <button className="delete-button" onClick={() => handleDeleteProject(p.id)}>Delete</button>
                    <button className="view-button" onClick={() => navigate(`/projects/${p.id}`)}>View</button>
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
                <h4>Assigned Members</h4>
                <ul className="assigned-members-list">
                  {assignedMembers.map((m) => (
                    <li key={m.id}>
                      {m.name}{" "}
                      <button
                        type="button"
                        onClick={() => handleRemoveMemberInModal(m.id)}
                        className="remove-button"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="team-member-selection">
                  <select
                    value={modalNewMember}
                    onChange={(e) => setModalNewMember(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Select Team Member</option>
                    {teamMembers
                      .filter((m) => !assignedMembers.some((am) => am.id === m.id))
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddMemberInModal}
                    className="submit-button"
                  >
                    Add Member
                  </button>
                </div>

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