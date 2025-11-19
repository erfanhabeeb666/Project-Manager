import React from "react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import './Styles/Admin.css';
import './Styles/Main.css';
import './Styles/Sidebar.css';
import { getDisplayName } from "../utils/auth";

const Admin = () => {
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem("jwtToken");
        navigate("/");
    };
    return (
        <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <center><h2>Rizsaf Pvt Ltd</h2></center>
        <nav>
          <ul className="sidebar-menu">
            <li>
              <NavLink to="/admin" className="sidebar-link">
                <i className="fas fa-tachometer-alt"></i> Dashboard
              </NavLink>
            </li>
             <li>
              <NavLink to="/admin/office-staff" className="sidebar-link">
                <i className="fas fa-users"></i> Office Staff
              </NavLink>
            </li>
            <li>
                          <NavLink to="/admin/worker" className="sidebar-link">
                <i className="fas fa-hard-hat"></i> Workers
                          </NavLink>
                        </li>
            <li>
              <NavLink to="/admin/projects" className="sidebar-link">
                <i className="fas fa-project-diagram"></i> Projects
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/actions" className="sidebar-link">
                <i className="fas fa-list"></i> Actions
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/expenses" className="sidebar-link">
                <i className="fas fa-money-bill-wave"></i> Expenses
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <h1>Project Manager Dashboard</h1>
          <div className="topbar-actions">
            <span className="greeting">Hello, {getDisplayName()}</span>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </header>
        <section className="content-area">
            <h2>Welcome to the Admin Dashboard</h2>
            <p>Select an option from the sidebar to get started.</p>
        </section>
        </main>
    </div>
    );
};

export default Admin;

