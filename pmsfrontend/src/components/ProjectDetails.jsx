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
        due_date: ''
    });

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
            const response = await fetch(`http://127.0.0.1:8000/api/users`, {
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
    
        // Prepare the task payload
        const taskPayload = {
            ...newTask,
            project_id: id,
            assigned_to: newTask.assigned_to || null, // set to null if not assigned
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
            setNewTask({
                title: '',
                description: '',
                assigned_to: '',
                status: 'todo',
                priority: 'medium',
                due_date: ''
            });
            const updatedTasks = await response.json();
            setTasks(prev => [...prev, updatedTasks]);
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
            setTasks(prev => prev.map(task => task.id === editTaskId ? updatedTask : task));
            setEditTaskId(null);
            setEditTaskData({
                title: '',
                description: '',
                assigned_to: '',
                status: 'todo',
                priority: 'medium',
                due_date: ''
            });
        } else {
            console.error("Failed to update task");
        }
    };

    const handleBackToProjects = () => {
        navigate('/projects');
    };

    if (!project) {
        return <p>Loading project details...</p>;
    }

    return (
        <div className="project-details-container">
            <h2>{project.name}</h2>
            <p>{project.description}</p>
            <p><strong>Status:</strong> {project.status}</p>
            <p><strong>Start Date:</strong> {project.start_date}</p>
            <p><strong>End Date:</strong> {project.end_date || "N/A"}</p>

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
                                    <button type="submit">Save</button>
                                    <button type="button" onClick={() => setEditTaskId(null)}>Cancel</button>
                                </form>
                            ) : (
                                <>
                                    <h4>{task.title}</h4>
                                    <p>{task.description}</p>
                                    <p>Status: {task.status} | Priority: {task.priority}</p>
                                    <p>Assigned To: {task.assigned_to || "Unassigned"}</p>
                                    <p>Due Date: {task.due_date || "N/A"}</p>
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

            <button onClick={handleBackToProjects}>Back to Projects List</button>
        </div>
    );
};

export default ProjectDetails;
