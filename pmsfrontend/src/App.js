import React, { useState} from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/login";
import Registration from "./components/registration";
import Dashboard from "./components/dashboard";
import Projects from './components/Projects';
import ProjectDetails from './components/ProjectDetails';



const App = () => {
    const [token, setToken] = useState(localStorage.getItem("token"));


    const handleLogin = (newToken) => {
        localStorage.setItem("token", newToken);
        setToken(newToken);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        setToken(null);
    };

    return (
        <Router>
            <Routes>
                <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} />
                <Route path="/register" element={<Registration />} />
                <Route path="/dashboard" element={token ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/" />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:id" element={<ProjectDetails />} />
            </Routes>
        </Router>
    );
};

export default App;