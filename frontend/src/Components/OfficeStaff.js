import React from "react";
import { getDisplayName } from "../utils/auth";
import "./Styles/Main.css";
import "./Styles/Admin.css";
import "./Styles/Sidebar.css";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
const OfficeStaff = () => {
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem("jwtToken");
        navigate("/");
    };
   return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <center><h2>P A S S</h2></center>
        <nav>
          <ul className="sidebar-menu">
            <li><NavLink to="/office-staff" className="sidebar-link"><i className="fas fa-tachometer-alt"></i> Dashboard</NavLink></li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <h1>Dashboard</h1>
          <div className="topbar-actions">
            <span className="greeting">Hello, {getDisplayName()}</span>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </header>
        <section className="content-area">
            <h2>Welcome to the Office Staff Dashboard</h2>
            <p>Select an option from the sidebar to get started.</p>
        </section>
      </main>
    </div>
  );
};

export default OfficeStaff;
