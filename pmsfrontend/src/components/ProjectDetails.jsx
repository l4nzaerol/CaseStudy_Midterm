import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/Details.css";

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null)
    const [showModal, setShowModal] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        assigned_to: '',
        status: 'todo',
        priority: 'medium',
        due_date: '',
        start_date: '',
        time_spent: 0
    });

    const [editTaskId, setEditTaskId] = useState(null);
    const [editTaskData, setEditTaskData] = useState({
        title: '',
        description: '',
        assigned_to: '',
        status: 'todo',
        priority: 'medium',
        due_date: '',
        start_date: '',
        time_spent: 0
    });

    const [budgetUpdate, setBudgetUpdate] = useState(0);

    useEffect(() => {
        const fetchProject = async () => {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://127.0.0.1:8000/api/projects/${id}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                }
            });
            const data = await response.json();
            setProject(data);
            setBudgetUpdate(data.actual_cost || 0);
        };

        const fetchTasks = async () => {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://127.0.0.1:8000/api/tasks`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                }
            });
            const data = await response.json();
            const filteredTasks = data.filter(task => task.project_id === parseInt(id));
            setTasks(filteredTasks);
        };

        const fetchUsers = async () => {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://127.0.0.1:8000/api/team-members`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                }
            });
            const data = await response.json();
            setUsers(data);
        };

        fetchProject();
        fetchTasks();
        fetchUsers();
    }, [id]);

    const handleInputChange = (e) => {
        setNewTask({
            ...newTask,
            [e.target.name]: e.target.value
        });
    };
    
    const handleEditInputChange = (e) => {
        setEditTaskData({
            ...editTaskData,
            [e.target.name]: e.target.value
        });
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
    
        const taskPayload = {
            ...newTask,
            project_id: parseInt(id),
            assigned_to: newTask.assigned_to || null,
            time_spent: newTask.time_spent || 0
        };
    
        const response = await fetch(`http://127.0.0.1:8000/api/tasks`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(taskPayload) // ✅ Use the variable here
        });
    
        if (response.ok) {
            const createdTask = await response.json();
            const assignedUser = users.find(u => u.id === parseInt(createdTask.assigned_to));
    
            const updatedTask = {
                ...createdTask,
                assigned_user_name: assignedUser ? assignedUser.name : "Unassigned"
            };
    
            setTasks(prev => [...prev, updatedTask]);
    
            setNewTask({
                title: '',
                description: '',
                assigned_to: '',
                status: 'todo',
                priority: 'medium',
                due_date: '',
                time_spent: 0
            });
        } else {
            console.error("Failed to create task");
        }
    };
    

    const handleDeleteTask = async (taskId) => {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://127.0.0.1:8000/api/tasks/${taskId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            }
        });

        if (response.ok) {
            setTasks(prev => prev.filter(task => task.id !== taskId));
        } else {
            console.error("Failed to delete task");
        }
    };

    const handleEditTask = (task) => {
        setEditTaskId(task.id);
        setEditTaskData(task);
    };

    const handleUpdateTask = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        const response = await fetch(`http://127.0.0.1:8000/api/tasks/${editTaskId}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(editTaskData)
        });

        if (response.ok) {
            const updatedTask = await response.json();
            const assignedUser = users.find(u => u.id === parseInt(updatedTask.assigned_to));

            setTasks(prevTasks => prevTasks.map(task =>
                task.id === editTaskId
                    ? {
                        ...updatedTask,
                        assigned_to: assignedUser ? assignedUser.id : null,
                        assigned_user_name: assignedUser ? assignedUser.name : "Unassigned"
                    }
                    : task
            ));

            setEditTaskId(null);
            setEditTaskData({
                title: '',
                description: '',
                assigned_to: '',
                status: 'todo',
                priority: 'medium',
                due_date: '',
                time_spent: 0
            });
        } else {
            console.error("Failed to update task");
        }
    };

    const handleBudgetUpdate = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
    
        const updatedProject = {
            ...project,
            actual_cost: budgetUpdate,
        };
    
      
        const response = await fetch(`http://127.0.0.1:8000/api/projects/${id}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedProject)
        });
    
        if (response.ok) {
            // Fetch updated project again
            const refreshedProject = await fetch(`http://127.0.0.1:8000/api/projects/${id}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                }
            });
            const data = await refreshedProject.json();
            setProject(data);
            setBudgetUpdate(data.actual_cost); // sync local input
        } else {
            console.error("Failed to update budget");
        }
    };
    

    const handleBackToProjects = () => {
        navigate('/projects');
    };

    if (!project) {
        return <p>Loading project details...</p>;
    }

    const totalTasks = tasks.length;
    const completedPoints = tasks.reduce((acc, task) => {
        if (task.status === "done") {
            return acc + 1; // 100% complete
        } else if (task.status === "in_progress") {
            return acc + 0.5; // 50% complete
        }
        return acc; // 0% for "todo"
    }, 0);
    const progressPercent = totalTasks ? Math.round((completedPoints / totalTasks) * 100) : 0;

    const getGanttBarStyle = (taskStartDate, taskEndDate) => {
        const projectStartDate = new Date(project.start_date);
        const projectEndDate = new Date(project.end_date || Date.now());

        const taskStart = new Date(taskStartDate);
        const taskEnd = new Date(taskEndDate);

        const totalProjectDuration = (projectEndDate - projectStartDate) / (1000 * 60 * 60 * 24); // Days
        const taskDuration = (taskEnd - taskStart) / (1000 * 60 * 60 * 24); // Days
        const taskStartOffset = (taskStart - projectStartDate) / (1000 * 60 * 60 * 24); // Days

        return {
            width: `${(taskDuration / totalProjectDuration) * 100}%`,
            left: `${(taskStartOffset / totalProjectDuration) * 100}%`
        };
    };

    return (
        <div className="project-details-container">
            <h2>{project.name}</h2>
            <p>{project.description}</p>
            <p><strong>Status:</strong> {project.status}</p>
            <p><strong>Start Date:</strong> {project.start_date}</p>
            <p><strong>End Date:</strong> {project.end_date || "N/A"}</p>

            <h3>Project Progress</h3>
            <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${progressPercent}%` }}>
                    {progressPercent}%
                </div>
            </div>

            <h3>Budget Tracking</h3>
            {project && (
            <>
                <p><strong>Total Budget:</strong> ${project.budget ?? 0}</p>
                <p><strong>Actual Cost:</strong> ${project.actual_cost ?? 0}</p>
                <p><strong>Remaining Budget:</strong> ${Math.max(0, (project.budget ?? 0) - (project.actual_cost ?? 0))}</p>
            </>
            )}

            <form onSubmit={handleBudgetUpdate}>
                <input
                    type="number"
                    min="0"
                    value={budgetUpdate}
                    onChange={(e) => setBudgetUpdate(parseFloat(e.target.value))}
                />
                <button type="submit">Update Actual Cost</button>
            </form>

            <h3>Tasks</h3>
{tasks.length > 0 ? (
    <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
            <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Assigned To</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Start Date</th>
                <th>Due Date</th>
                <th>Time Spent (hrs)</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {tasks.map(task => (
                <tr key={task.id}>
                    {editTaskId === task.id ? (
                        <>
                            <td>
                                <input
                                    type="text"
                                    name="title"
                                    value={editTaskData.title}
                                    onChange={handleEditInputChange}
                                    required
                                />
                            </td>
                            <td>
                                <textarea
                                    name="description"
                                    value={editTaskData.description}
                                    onChange={handleEditInputChange}
                                />
                            </td>
                            <td>
                                <select
                                    name="assigned_to"
                                    value={editTaskData.assigned_to}
                                    onChange={handleEditInputChange}
                                >
                                    <option value="">Assign User</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>{user.name}</option>
                                    ))}
                                </select>
                            </td>
                            <td>
                                <select
                                    name="status"
                                    value={editTaskData.status}
                                    onChange={handleEditInputChange}
                                >
                                    <option value="todo">To Do</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="done">Done</option>
                                </select>
                            </td>
                            <td>
                                <select
                                    name="priority"
                                    value={editTaskData.priority}
                                    onChange={handleEditInputChange}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </td>
                            <td>
                                <input
                                    type="date"
                                    name="start_date"
                                    value={editTaskData.start_date || ''}
                                    onChange={handleEditInputChange}
                                />
                            </td>
                            <td>
                                <input
                                    type="date"
                                    name="due_date"
                                    value={editTaskData.due_date}
                                    onChange={handleEditInputChange}
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    name="time_spent"
                                    placeholder="Hours spent"
                                    value={editTaskData.time_spent || ''}
                                    onChange={handleEditInputChange}
                                    min="0"
                                />
                            </td>
                            <td>
                                <button type="button" onClick={handleUpdateTask}>Save</button>
                                <button type="button" onClick={() => setEditTaskId(null)}>Cancel</button>
                            </td>
                        </>
                    ) : (
                        <>
                            <td>{task.title}</td>
                            <td>{task.description}</td>
                            <td>{users.find(u => u.id === task.assigned_to)?.name || "Unassigned"}</td>
                            <td>{task.status}</td>
                            <td>{task.priority}</td>
                            <td>{task.start_date || "N/A"}</td>
                            <td>{task.due_date || "N/A"}</td>
                            <td>{task.time_spent || 0}</td>
                            <td>
                                <button onClick={() => handleEditTask(task)}>Edit</button>
                                <button onClick={() => handleDeleteTask(task.id)}>Delete</button>
                            </td>
                        </>
                    )}
                </tr>
            ))}
        </tbody>
    </table>
) : (
    <p>No tasks assigned yet.</p>
)}


<button
  onClick={() => setShowModal(true)}
  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
>
  + Create Task
</button>

{showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg w-full max-w-xl p-6 shadow-lg relative">
      <button
        onClick={() => setShowModal(false)}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>

      <h3 className="text-xl font-semibold mb-4">Create New Task</h3>
      <form onSubmit={handleCreateTask} className="space-y-3">
        <input
          type="text"
          name="title"
          placeholder="Task Title"
          value={newTask.title}
          onChange={handleInputChange}
          required
          className="w-full border p-2 rounded"
        />
        <textarea
          name="description"
          placeholder="Task Description"
          value={newTask.description}
          onChange={handleInputChange}
          className="w-full border p-2 rounded"
        />
        <select
          name="assigned_to"
          value={newTask.assigned_to}
          onChange={handleInputChange}
          className="w-full border p-2 rounded"
        >
          <option value="">Assign User</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>{user.name}</option>
          ))}
        </select>
        <select
          name="status"
          value={newTask.status}
          onChange={handleInputChange}
          className="w-full border p-2 rounded"
        >
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <select
          name="priority"
          value={newTask.priority}
          onChange={handleInputChange}
          className="w-full border p-2 rounded"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <input
          type="date"
          name="start_date"
          value={newTask.start_date}
          onChange={handleInputChange}
          className="w-full border p-2 rounded"
        />
        <input
          type="date"
          name="due_date"
          value={newTask.due_date}
          onChange={handleInputChange}
          className="w-full border p-2 rounded"
        />
        <div className="flex justify-end gap-2">
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Create Task
          </button>
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
)}

<h3>Gantt Chart</h3>
            <div className="gantt-chart">
                {tasks.map(task => (
                    <div
                        key={task.id}
                        className="gantt-task"
                        style={getGanttBarStyle(task.start_date, task.due_date)}
                    >
                        <div className="gantt-task-bar"></div>
                        <span className="gantt-task-title">{task.title}</span>
                    </div>
                ))}
            </div>




            <button className="back-to-projects-btn" onClick={handleBackToProjects}>Back to Projects List</button>

        </div>
    );
};

export default ProjectDetails;