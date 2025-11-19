import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import "./Styles/Admin.css";
import "./Styles/Main.css";
import "./Styles/Sidebar.css";
import { getDisplayName } from "../utils/auth";

const AdminProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProject = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("jwtToken");
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await axios.get(`${apiUrl}admin/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProject(response?.data?.data ?? null);
    } catch (err) {
      console.error("Unable to load project", err);
      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to load project";
      setError(apiMessage);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    navigate("/");
  };

  const projectActions = project?.actions ?? [];

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <center>
          <h2>Rizsaf Pvt Ltd</h2>
        </center>
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
          </ul>
        </nav>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <h1>Project Manager Dashboard</h1>
          <div className="topbar-actions">
            <span className="greeting">Hello, {getDisplayName()}</span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <section className="content-area">
          <button onClick={() => navigate("/admin/projects")}>Back to Projects</button>

          {loading && <p>Loading project...</p>}
          {error && <p className="text-red-600">{error}</p>}

          {!loading && !error && project && (
            <>
              <div className="project-summary">
                <h2>{project.name}</h2>
                <p className="muted-text">Project Code: {project.code ?? "-"}</p>
                <div className="project-grid">
                  <div className="info-card">
                    <span className="label">Stage</span>
                    <strong>{project.stage ?? "-"}</strong>
                  </div>
                  <div className="info-card">
                    <span className="label">Work Type</span>
                    <strong>{project.workType ?? "-"}</strong>
                  </div>
                  <div className="info-card">
                    <span className="label">Sanctioned Amount</span>
                    <strong>{project.sanctionedAmount ?? "-"}</strong>
                  </div>
                  <div className="info-card">
                    <span className="label">LSGD Name</span>
                    <strong>{project.lsgdName ?? "-"}</strong>
                  </div>
                  <div className="info-card">
                    <span className="label">Start Date</span>
                    <strong>{project.startDate ?? "-"}</strong>
                  </div>
                  <div className="info-card">
                    <span className="label">Expected End Date</span>
                    <strong>{project.expectedEndDate ?? "-"}</strong>
                  </div>
                  <div className="info-card">
                    <span className="label">Actual End Date</span>
                    <strong>{project.actualEndDate ?? "-"}</strong>
                  </div>
                  <div className="info-card">
                    <span className="label">Created On</span>
                    <strong>{project.createdAt?.split("T")[0] ?? "-"}</strong>
                  </div>
                </div>
              </div>

              <div className="section">
                <h3>Actions / Notes</h3>
                <table className="main-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Notes</th>
                      <th>Created By</th>
                      <th>Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectActions.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                          No actions recorded for this project
                        </td>
                      </tr>
                    ) : (
                      projectActions.map((action) => (
                        <tr key={action.id}>
                          <td>{action.title}</td>
                          <td>{action.actionDate ?? "-"}</td>
                          <td>{action.status}</td>
                          <td>{action.notes ?? "-"}</td>
                          <td>{action.createdById ?? "-"}</td>
                          <td>{action.createdAt?.split("T")[0] ?? "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminProjectDetails;


