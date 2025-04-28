import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/Details.css";

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        assigned_to: '',
        status: 'todo',
        priority: 'medium',
        due_date: ''
    });

    const [editTaskId, setEditTaskId] = useState(null);
    const [editTaskData, setEditTaskData] = useState({
        title: '',
        description: '',
        assigned_to: '',
        status: 'todo',
        priority: 'medium',
        due_date: '',
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
        };

        const response = await fetch(`http://127.0.0.1:8000/api/tasks`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(taskPayload)
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
                due_date: ''
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
            const data = await response.json();
            setProject(data);
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
            <p><strong>Total Budget:</strong> ${project.budget}</p>
            <p><strong>Actual Cost:</strong> ${project.actual_cost}</p>
            <p><strong>Remaining Budget:</strong> ${project.budget - project.actual_cost}</p>

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
            <ul>
                {tasks.length > 0 ? (
                    tasks.map(task => (
                        <li key={task.id}>
                            {editTaskId === task.id ? (
                                <form onSubmit={handleUpdateTask}>
                                    <input
                                        type="text"
                                        name="title"
                                        value={editTaskData.title}
                                        onChange={handleEditInputChange}
                                        required
                                    />
                                    <textarea
                                        name="description"
                                        value={editTaskData.description}
                                        onChange={handleEditInputChange}
                                    />
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
                                    <select
                                        name="status"
                                        value={editTaskData.status}
                                        onChange={handleEditInputChange}
                                    >
                                        <option value="todo">To Do</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="done">Done</option>
                                    </select>
                                    <select
                                        name="priority"
                                        value={editTaskData.priority}
                                        onChange={handleEditInputChange}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                    <input
                                        type="date"
                                        name="due_date"
                                        value={editTaskData.due_date}
                                        onChange={handleEditInputChange}
                                    />
                                    <input
                                        type="number"
                                        name="time_spent"
                                        placeholder="Hours spent"
                                        value={editTaskData.time_spent || ''}
                                        onChange={handleEditInputChange}
                                        min="0"
                                    />
                                    <button type="submit">Save</button>
                                    <button type="button" onClick={() => setEditTaskId(null)}>Cancel</button>
                                </form>
                            ) : (
                                <>
                                    <h4>{task.title}</h4>
                                    <p>{task.description}</p>
                                    <p>Status: {task.status} | Priority: {task.priority}</p>
                                    <p><strong>Assigned To:</strong> {users.find(u => u.id === task.assigned_to)?.name || "Unassigned"}</p>
                                    <p>Due Date: {task.due_date || "N/A"}</p>
                                    <p>Time Spent: {task.time_spent || 0} hours</p>
                                    <button onClick={() => handleEditTask(task)}>Edit</button>
                                    <button onClick={() => handleDeleteTask(task.id)}>Delete</button>
                                </>
                            )}
                        </li>
                    ))
                ) : (
                    <p>No tasks assigned yet.</p>
                )}
            </ul>

            <h3>Create New Task</h3>
            <form onSubmit={handleCreateTask}>
                <input
                    type="text"
                    name="title"
                    placeholder="Task Title"
                    value={newTask.title}
                    onChange={handleInputChange}
                    required
                />
                <textarea
                    name="description"
                    placeholder="Task Description"
                    value={newTask.description}
                    onChange={handleInputChange}
                />
                <select
                    name="assigned_to"
                    value={newTask.assigned_to}
                    onChange={handleInputChange}
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
                >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                </select>
                <select
                    name="priority"
                    value={newTask.priority}
                    onChange={handleInputChange}
                >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
                <input
                    type="date"
                    name="due_date"
                    value={newTask.due_date}
                    onChange={handleInputChange}
                />
                <button type="submit">Create Task</button>
            </form>

            <h3>Gantt Chart</h3>
            <div className="gantt-chart">
                {tasks.map(task => (
                    <div key={task.id} className="gantt-task" style={{
                        marginLeft: `${(new Date(task.start_date || project.start_date).getTime() - new Date(project.start_date).getTime()) / (1000 * 60 * 60 * 24)}px`,
                        width: `${(new Date(task.due_date).getTime() - new Date(task.start_date || project.start_date).getTime()) / (1000 * 60 * 60 * 24)}px`
                    }}>
                        {task.title}
                    </div>
                ))}
            </div>

            <button onClick={handleBackToProjects}>Back to Projects List</button>
        </div>
    );
};

export default ProjectDetails;
