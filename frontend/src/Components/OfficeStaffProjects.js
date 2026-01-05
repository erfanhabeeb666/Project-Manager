import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import { getDisplayName } from "../utils/auth";
import "./Styles/Main.css";
import "./Styles/Admin.css";
import "./Styles/Sidebar.css";
import "./Styles/OfficeStaff.css";
import OfficeSidebar from "./OfficeSidebar";

const PROJECT_STAGE_OPTIONS = [
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

const WORK_TYPES = ["ELECTRICAL", "CIB"];


const initialProjectForm = {
  code: "",
  name: "",
  lsgdName: "",
  workType: WORK_TYPES[0],
  sanctionedAmount: "",
  startDate: "",
  expectedEndDate: "",
};



const OfficeStaffProjects = () => {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL || "";

  const [projects, setProjects] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [stageFilter, setStageFilter] = useState("");
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const [projectForm, setProjectForm] = useState(
    () => ({ ...initialProjectForm })
  );
  const [projectFormErrors, setProjectFormErrors] = useState({});
  const [projectFormSuccess, setProjectFormSuccess] = useState("");
  const [projectSubmitting, setProjectSubmitting] = useState(false);

  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);


  const authHeaders = () => {
    const token = localStorage.getItem("jwtToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem("jwtToken");
    navigate("/");
  }, [navigate]);

  const requireAuth = useCallback(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      handleLogout();
    }
  }, [handleLogout]);

  const handleApiError = useCallback(
    (error, setMessage) => {
      const status = error?.response?.status;
      const serverMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Something went wrong";
      if (setMessage) {
        setMessage(serverMessage);
      }
      if (status === 401 || status === 403) {
        handleLogout();
      }
    },
    [handleLogout]
  );

  const fetchProjects = useCallback(
    async (pageOverride) => {
      const targetPage =
        typeof pageOverride === "number" ? pageOverride : page;
      requireAuth();
      setProjectsLoading(true);
      setProjectsError("");
      try {
        const response = await axios.get(
          `${apiUrl}office-staff/projects`,
          {
            headers: authHeaders(),
            params: {
              page: targetPage,
              size,
              ...(stageFilter ? { stage: stageFilter } : {}),
            },
          }
        );
        const data = response.data?.data;
        setProjects(data?.content || []);
        setPage(data?.number ?? targetPage);
        setSize(data?.size ?? size);
        setTotalPages(data?.totalPages ?? 0);
        setTotalElements(data?.totalElements ?? 0);
      } catch (error) {
        handleApiError(error, setProjectsError);
      } finally {
        setProjectsLoading(false);
      }
    },
    [apiUrl, page, size, stageFilter, requireAuth, handleApiError]
  );

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);



  const handleStageFilterChange = (e) => {
    setStageFilter(e.target.value);
    setPage(0);
  };

  const handleSizeChange = (e) => {
    const newSize = Number(e.target.value);
    setSize(newSize);
    setPage(0);
  };

  const handleProjectFormChange = (e) => {
    const { name, value } = e.target;
    setProjectForm((prev) => ({ ...prev, [name]: value }));
    setProjectFormErrors((prev) => ({ ...prev, [name]: "" }));
    setProjectFormSuccess("");
  };

  const validateProjectForm = () => {
    const errors = {};
    if (!projectForm.name.trim()) {
      errors.name = "Project name is required";
    }
    if (
      projectForm.sanctionedAmount &&
      Number(projectForm.sanctionedAmount) < 0
    ) {
      errors.sanctionedAmount = "Amount must be positive";
    }
    if (
      projectForm.startDate &&
      projectForm.expectedEndDate &&
      projectForm.startDate > projectForm.expectedEndDate
    ) {
      errors.expectedEndDate = "End date cannot be before start date";
    }
    setProjectFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submitProject = async (e) => {
    e.preventDefault();
    setProjectFormSuccess("");
    if (!validateProjectForm()) return;
    requireAuth();
    setProjectSubmitting(true);
    try {
      const payload = {
        code: projectForm.code?.trim() || null,
        name: projectForm.name.trim(),
        lsgdName: projectForm.lsgdName?.trim() || null,
        workType: projectForm.workType || null,
        sanctionedAmount: projectForm.sanctionedAmount
          ? Number(projectForm.sanctionedAmount)
          : null,
        startDate: projectForm.startDate || null,
        expectedEndDate: projectForm.expectedEndDate || null,
      };
      await axios.post(
        `${apiUrl}office-staff/projects`,
        payload,
        { headers: authHeaders() }
      );
      setProjectForm({ ...initialProjectForm });
      setProjectFormSuccess("Project created successfully");
      setPage(0);
      setShowCreateProjectModal(false);
      await fetchProjects(0);
    } catch (error) {
      handleApiError(error, (message) => {
        setProjectFormErrors((prev) => ({
          ...prev,
          form: message,
        }));
      });
    } finally {
      setProjectSubmitting(false);
    }
  };



  const formatCurrency = (value) => {
    if (value === null || value === undefined) return "-";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value);
  };



  return (
    <div className="dashboard-container">
      <OfficeSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <main className="main-content">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button className="hamburger-btn" onClick={toggleSidebar}>
              <i className="fas fa-bars"></i>
            </button>
            <h1>Office Staff Workspace - Projects</h1>
          </div>
          <div className="topbar-actions">
            <span className="greeting">Hello, {getDisplayName()}</span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <section className="content-area office-staff-content">
          <div style={{ marginBottom: "20px" }}>
            <button onClick={() => setShowCreateProjectModal(true)}>
              + Create New Project
            </button>
          </div>

          {/* Create Project Modal */}
          {showCreateProjectModal && (
            <div className="modal-overlay">
              <div className="form-container">
                <div className="card-header">
                  <div>
                    <p className="card-eyebrow">Create</p>
                    <h3>New Project</h3>
                  </div>
                </div>
                {projectFormErrors.form && (
                  <p className="error-text">{projectFormErrors.form}</p>
                )}
                {projectFormSuccess && (
                  <p className="success-text">{projectFormSuccess}</p>
                )}
                <form onSubmit={submitProject} className="form-grid">
                  <label>
                    Code
                    <input
                      type="text"
                      name="code"
                      value={projectForm.code}
                      onChange={handleProjectFormChange}
                      placeholder="Optional code"
                    />
                  </label>
                  <label>
                    Name *
                    <input
                      type="text"
                      name="name"
                      value={projectForm.name}
                      onChange={handleProjectFormChange}
                      required
                    />
                    {projectFormErrors.name && (
                      <span className="error-text">
                        {projectFormErrors.name}
                      </span>
                    )}
                  </label>
                  <label>
                    LSGD Name
                    <input
                      type="text"
                      name="lsgdName"
                      value={projectForm.lsgdName}
                      onChange={handleProjectFormChange}
                    />
                  </label>
                  <label>
                    Work Type
                    <select
                      name="workType"
                      value={projectForm.workType}
                      onChange={handleProjectFormChange}
                    >
                      {WORK_TYPES.map((work) => (
                        <option key={work} value={work}>
                          {work.replaceAll("_", " ")}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Sanctioned Amount
                    <input
                      type="number"
                      name="sanctionedAmount"
                      min="0"
                      step="0.01"
                      value={projectForm.sanctionedAmount}
                      onChange={handleProjectFormChange}
                    />
                    {projectFormErrors.sanctionedAmount && (
                      <span className="error-text">
                        {projectFormErrors.sanctionedAmount}
                      </span>
                    )}
                  </label>
                  <label>
                    Start Date
                    <input
                      type="date"
                      name="startDate"
                      value={projectForm.startDate}
                      onChange={handleProjectFormChange}
                    />
                  </label>
                  <label>
                    Expected End Date
                    <input
                      type="date"
                      name="expectedEndDate"
                      value={projectForm.expectedEndDate}
                      onChange={handleProjectFormChange}
                    />
                    {projectFormErrors.expectedEndDate && (
                      <span className="error-text">
                        {projectFormErrors.expectedEndDate}
                      </span>
                    )}
                  </label>
                  <div className="form-actions full-width">
                    <button type="submit" disabled={projectSubmitting}>
                      {projectSubmitting ? "Creating..." : "Create Project"}
                    </button>
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => {
                        setShowCreateProjectModal(false);
                        setProjectForm({ ...initialProjectForm });
                        setProjectFormErrors({});
                        setProjectFormSuccess("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="office-panels">
            <section className="office-card">
              <div className="card-header">
                <div>
                  <p className="card-eyebrow">Overview</p>
                  <h3>Projects</h3>
                </div>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => fetchProjects(page)}
                  disabled={projectsLoading}
                >
                  Refresh
                </button>
              </div>

              <div className="filters-row">
                <label>
                  Stage
                  <select
                    value={stageFilter}
                    onChange={handleStageFilterChange}
                  >
                    <option value="">All stages</option>
                    {PROJECT_STAGE_OPTIONS.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Rows
                  <select value={size} onChange={handleSizeChange}>
                    {[5, 10, 20, 50].map((count) => (
                      <option key={count} value={count}>
                        {count}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {projectsError && (
                <p className="error-text">{projectsError}</p>
              )}

              <div className="table-scroll">
                {projectsLoading ? (
                  <p className="muted-text">Loading projects...</p>
                ) : projects.length === 0 ? (
                  <p className="muted-text">No projects available</p>
                ) : (
                  <table className="main-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Stage</th>
                        <th>LSGD</th>
                        <th>Start</th>
                        <th>Expected End</th>
                        <th>Amount</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((project) => (
                        <tr key={project.id}>
                          <td>
                            <div className="project-name-cell">
                              <strong>{project.name}</strong>
                              {project.code && (
                                <span className="muted-text">
                                  {project.code}
                                </span>
                              )}
                            </div>
                          </td>
                          <td>{project.stage?.replaceAll("_", " ")}</td>
                          <td>{project.lsgdName || "-"}</td>
                          <td>{project.startDate || "-"}</td>
                          <td>{project.expectedEndDate || "-"}</td>
                          <td>{formatCurrency(project.sanctionedAmount)}</td>
                          <td>
                            <button
                              type="button"
                              className="btn-outline btn-small"
                              onClick={() => navigate(`/office-staff/projects/${project.id}`)}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="pagination-container">
                <button
                  className="pagination-btn"
                  onClick={() => {
                    const prevPage = Math.max(page - 1, 0);
                    setPage(prevPage);
                  }}
                  disabled={page === 0 || projectsLoading}
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {page + 1} of {Math.max(totalPages, 1)} (
                  {totalElements} total)
                </span>
                <button
                  className="pagination-btn"
                  onClick={() => {
                    const next = Math.min(page + 1, totalPages - 1);
                    setPage(next);
                  }}
                  disabled={
                    page >= totalPages - 1 ||
                    totalPages === 0 ||
                    projectsLoading
                  }
                >
                  Next
                </button>
              </div>
            </section>
          </div>


        </section>
      </main>


    </div>
  );
};

export default OfficeStaffProjects;

