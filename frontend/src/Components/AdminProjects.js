import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import "./Styles/Admin.css";
import "./Styles/Main.css";
import "./Styles/Sidebar.css";
import { getDisplayName } from "../utils/auth";

const stageOptions = [
  "TENDER_PREPARATION",
  "TENDER_SUBMITTED",
  "TENDER_WON",
  "TENDER_LOST",
  "WORK_STARTED",
  "WORK_IN_PROGRESS",
  "BILL_PREPARATION",
  "BILL_SUBMITTED",
  "PAYMENT_RECEIVED",
  "PROJECT_CLOSED",
];

const defaultPage = {
  content: [],
  totalPages: 0,
  totalElements: 0,
  number: 0,
};

const AdminProjects = () => {
  const navigate = useNavigate();
  const [pageData, setPageData] = useState(defaultPage);
  const [stageFilter, setStageFilter] = useState("");
  const pageSize = 10;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const projects = useMemo(
    () => (Array.isArray(pageData.content) ? pageData.content : []),
    [pageData]
  );

  const fetchProjects = useCallback(async (page = 0, stage = stageFilter) => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("jwtToken");
      const apiUrl = process.env.REACT_APP_API_URL;
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("size", pageSize);
      if (stage) {
        params.append("stage", stage);
      }

      const response = await axios.get(`${apiUrl}admin/projects?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const pageResponse = response?.data?.data ?? defaultPage;
      setPageData({
        content: pageResponse.content ?? [],
        totalPages: pageResponse.totalPages ?? 0,
        totalElements: pageResponse.totalElements ?? (pageResponse.content?.length ?? 0),
        number: pageResponse.number ?? page,
      });
    } catch (err) {
      console.error("Failed to fetch projects", err);
      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Unable to load projects";
      setError(apiMessage);
    } finally {
      setLoading(false);
    }
  }, [pageSize, stageFilter]);

  useEffect(() => {
    fetchProjects(0, stageFilter);
  }, [fetchProjects, stageFilter]);

  const handlePageChange = (nextPage) => {
    if (nextPage < 0 || nextPage >= pageData.totalPages) return;
    fetchProjects(nextPage, stageFilter);
  };

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    navigate("/");
  };

  const handleViewDetails = (projectId) => {
    navigate(`/admin/projects/${projectId}`);
  };

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
            <li>
              <NavLink to="/admin/expenses" className="sidebar-link">
                <i className="fas fa-money-bill-wave"></i> Expenses
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
          <div className="filters">
            <label htmlFor="stageFilter">
              Stage
              <select
                id="stageFilter"
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
              >
                <option value="">All</option>
                {stageOptions.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </label>
            <button onClick={() => fetchProjects(0, stageFilter)}>Refresh</button>
          </div>

          {loading && <p>Loading projects...</p>}
          {error && <p className="text-red-600">{error}</p>}

          {!loading && !error && (
            <>
              <div className="table-meta">
                <p>
                  Showing page {pageData.number + 1} of {Math.max(pageData.totalPages, 1)} (
                  {pageData.totalElements} total projects)
                </p>
              </div>
              <table className="main-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>LSGD</th>
                    <th>Stage</th>
                    <th>Sanctioned Amount</th>
                    <th>Expected End Date</th>
                    <th>Actual End Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {projects.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                        No projects found
                      </td>
                    </tr>
                  ) : (
                    projects.map((project) => (
                      <tr key={project.id}>
                        <td>{project.code}</td>
                        <td>{project.name}</td>
                        <td>{project.lsgdName}</td>
                        <td>{project.stage}</td>
                        <td>{project.sanctionedAmount ?? "-"}</td>
                        <td>{project.expectedEndDate ?? "-"}</td>
                        <td>{project.actualEndDate ?? "-"}</td>
                        <td>
                          <button onClick={() => handleViewDetails(project.id)}>View</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {pageData.totalPages > 1 && (
                <div className="pagination-controls">
                  <button onClick={() => handlePageChange(pageData.number - 1)}>Previous</button>
                  <span>
                    Page {pageData.number + 1} / {pageData.totalPages}
                  </span>
                  <button onClick={() => handlePageChange(pageData.number + 1)}>Next</button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminProjects;


