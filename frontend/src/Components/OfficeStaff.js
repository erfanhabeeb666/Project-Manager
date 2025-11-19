import React, { useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getDisplayName } from "../utils/auth";
import "./Styles/Main.css";
import "./Styles/Admin.css";
import "./Styles/Sidebar.css";
import "./Styles/OfficeStaff.css";

const OfficeStaff = () => {
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    localStorage.removeItem("jwtToken");
    navigate("/");
  }, [navigate]);

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <center>
          <h2>Rizsaf Pvt Ltd</h2>
        </center>
        <nav>
          <ul className="sidebar-menu">
            <li>
              <NavLink to="/office-staff" className="sidebar-link">
                <i className="fas fa-tachometer-alt"></i> Office Staff
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/office-staff/projects" className="sidebar-link">
                <i className="fas fa-project-diagram"></i> Projects
              </NavLink>
            </li>
            <li>
              <NavLink to="/office-staff/daily-actions" className="sidebar-link">
                <i className="fas fa-calendar-day"></i> Daily Actions
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <h1>Office Staff Workspace</h1>
          <div className="topbar-actions">
            <span className="greeting">Hello, {getDisplayName()}</span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <section className="content-area office-staff-content">
          <div className="office-panels">
            <section className="office-card">
              <div className="card-header">
                <div>
                  <p className="card-eyebrow">Welcome</p>
                  <h3>Office Staff Dashboard</h3>
                </div>
              </div>
              <p>Welcome to the Office Staff workspace. Use the navigation menu to access different sections.</p>
              <div style={{ marginTop: "20px" }}>
                <NavLink to="/office-staff/projects">
                  <button>Go to Projects</button>
                </NavLink>
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
};

export default OfficeStaff;
