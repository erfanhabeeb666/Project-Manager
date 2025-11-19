import React from "react";
import { useNavigate } from "react-router-dom";

const Admin = () => {
    const navigate = useNavigate();
    return (
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>
            <p>Welcome to the Admin Dashboard.</p>
        
        </div>
    );
};

export default Admin;

