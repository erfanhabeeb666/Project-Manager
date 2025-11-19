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
const ACTION_STATUS_OPTIONS = ["PENDING", "COMPLETED"];

const initialProjectForm = {
  code: "",
  name: "",
  lsgdName: "",
  workType: WORK_TYPES[0],
  sanctionedAmount: "",
  startDate: "",
  expectedEndDate: "",
};

const initialActionForm = {
  title: "",
  actionDate: "",
  notes: "",
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

  const [projectForm, setProjectForm] = useState(
    () => ({ ...initialProjectForm })
  );
  const [projectFormErrors, setProjectFormErrors] = useState({});
  const [projectFormSuccess, setProjectFormSuccess] = useState("");
  const [projectSubmitting, setProjectSubmitting] = useState(false);

  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [stageForm, setStageForm] = useState({ stage: "", notes: "" });
  const [stageSubmitting, setStageSubmitting] = useState(false);
  const [stageSuccess, setStageSuccess] = useState("");
  const [stageError, setStageError] = useState("");

  const [actionForm, setActionForm] = useState(
    () => ({ ...initialActionForm })
  );
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionStatusLoading, setActionStatusLoading] = useState({});

  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [showUpdateProjectModal, setShowUpdateProjectModal] = useState(false);
  const [showChangeStageModal, setShowChangeStageModal] = useState(false);
  const [showLogActionModal, setShowLogActionModal] = useState(false);

  const [updateForm, setUpdateForm] = useState({
    expectedEndDate: "",
    sanctionedAmount: "",
  });
  const [updateFormErrors, setUpdateFormErrors] = useState({});
  const [updateFormSuccess, setUpdateFormSuccess] = useState("");
  const [updateSubmitting, setUpdateSubmitting] = useState(false);

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

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );

  useEffect(() => {
    if (selectedProject) {
      setStageForm({
        stage: selectedProject.stage || "",
        notes: "",
      });
      setUpdateForm({
        expectedEndDate: selectedProject.expectedEndDate || "",
        sanctionedAmount: selectedProject.sanctionedAmount
          ? String(selectedProject.sanctionedAmount)
          : "",
      });
    } else {
      setStageForm({ stage: "", notes: "" });
      setUpdateForm({ expectedEndDate: "", sanctionedAmount: "" });
    }
    setActionForm({ ...initialActionForm });
    setStageSuccess("");
    setStageError("");
    setActionSuccess("");
    setActionError("");
    setUpdateFormSuccess("");
    setUpdateFormErrors({});
  }, [selectedProject]);

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

  const submitStageChange = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;
    requireAuth();
    setStageSubmitting(true);
    setStageSuccess("");
    setStageError("");
    try {
      await axios.put(
        `${apiUrl}office-staff/projects/${selectedProject.id}/stage`,
        {
          stage: stageForm.stage,
          notes: stageForm.notes || null,
        },
        { headers: authHeaders() }
      );
      setStageSuccess("Stage updated");
      setStageForm((prev) => ({ ...prev, notes: "" }));
      setShowChangeStageModal(false);
      await fetchProjects(page);
    } catch (error) {
      handleApiError(error, setStageError);
    } finally {
      setStageSubmitting(false);
    }
  };

  const submitAction = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;
    if (!actionForm.title.trim() || !actionForm.actionDate) {
      setActionError("Title and action date are required");
      return;
    }
    requireAuth();
    setActionSubmitting(true);
    setActionSuccess("");
    setActionError("");
    try {
      const payload = {
        title: actionForm.title.trim(),
        actionDate: actionForm.actionDate,
        notes: actionForm.notes?.trim() || null,
      };
      await axios.post(
        `${apiUrl}office-staff/projects/${selectedProject.id}/actions`,
        payload,
        { headers: authHeaders() }
      );
      setActionSuccess("Action added");
      setActionForm({ ...initialActionForm });
      setShowLogActionModal(false);
      await fetchProjects(page);
    } catch (error) {
      handleApiError(error, setActionError);
    } finally {
      setActionSubmitting(false);
    }
  };

  const updateActionStatus = async (actionId, status) => {
    if (!selectedProject) return;
    requireAuth();
    setActionStatusLoading((prev) => ({ ...prev, [actionId]: true }));
    try {
      await axios.put(
        `${apiUrl}office-staff/projects/${selectedProject.id}/actions/${actionId}`,
        {},
        {
          headers: authHeaders(),
          params: { status },
        }
      );
      await fetchProjects(page);
    } catch (error) {
      handleApiError(error, setActionError);
    } finally {
      setActionStatusLoading((prev) => ({ ...prev, [actionId]: false }));
    }
  };

  const handleUpdateFormChange = (e) => {
    const { name, value } = e.target;
    setUpdateForm((prev) => ({ ...prev, [name]: value }));
    setUpdateFormErrors((prev) => ({ ...prev, [name]: "" }));
    setUpdateFormSuccess("");
  };

  const validateUpdateForm = () => {
    const errors = {};
    if (
      updateForm.sanctionedAmount &&
      Number(updateForm.sanctionedAmount) < 0
    ) {
      errors.sanctionedAmount = "Amount must be positive";
    }
    setUpdateFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submitUpdate = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;
    setUpdateFormSuccess("");
    if (!validateUpdateForm()) return;
    requireAuth();
    setUpdateSubmitting(true);
    try {
      const payload = {
        expectedEndDate: updateForm.expectedEndDate || null,
        sanctionedAmount: updateForm.sanctionedAmount
          ? Number(updateForm.sanctionedAmount)
          : null,
      };
      await axios.put(
        `${apiUrl}office-staff/projects/${selectedProject.id}`,
        payload,
        { headers: authHeaders() }
      );
      setUpdateFormSuccess("Project updated successfully");
      setShowUpdateProjectModal(false);
      await fetchProjects(page);
    } catch (error) {
      handleApiError(error, (message) => {
        setUpdateFormErrors((prev) => ({
          ...prev,
          form: message,
        }));
      });
    } finally {
      setUpdateSubmitting(false);
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

  const renderStatusBadge = (status) => (
    <span
      className={`status-badge ${
        status === "COMPLETED" ? "status-complete" : "status-pending"
      }`}
    >
      {status || "PENDING"}
    </span>
  );

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
          <h1>Office Staff Workspace - Projects</h1>
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
                              className={`btn-outline btn-small ${
                                selectedProjectId === project.id
                                  ? "btn-selected"
                                  : ""
                              }`}
                              onClick={() =>
                                setSelectedProjectId(project.id)
                              }
                            >
                              {selectedProjectId === project.id
                                ? "Viewing"
                                : "View"}
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

          <section className="office-card">
            <div className="card-header">
              <div>
                <p className="card-eyebrow">Details</p>
                <h3>Project Actions & Stage</h3>
              </div>
              {selectedProject && (
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => fetchProjects(page)}
                >
                  Reload project
                </button>
              )}
            </div>
            {!selectedProject ? (
              <p className="muted-text">
                Select a project from the list to see details.
              </p>
            ) : (
              <>
                <div className="project-summary">
                  <div>
                    <h4>{selectedProject.name}</h4>
                    <p className="muted-text">
                      Code: {selectedProject.code || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="label">Stage</p>
                    <p>{selectedProject.stage?.replaceAll("_", " ")}</p>
                  </div>
                  <div>
                    <p className="label">Work Type</p>
                    <p>{selectedProject.workType || "—"}</p>
                  </div>
                  <div>
                    <p className="label">LSGD Name</p>
                    <p>{selectedProject.lsgdName || "—"}</p>
                  </div>
                  <div>
                    <p className="label">Sanctioned Amount</p>
                    <p>{formatCurrency(selectedProject.sanctionedAmount)}</p>
                  </div>
                  <div>
                    <p className="label">Start Date</p>
                    <p>{selectedProject.startDate || "—"}</p>
                  </div>
                  <div>
                    <p className="label">Expected End Date</p>
                    <p>{selectedProject.expectedEndDate || "—"}</p>
                  </div>
                  <div>
                    <p className="label">Actual End Date</p>
                    <p>{selectedProject.actualEndDate || "—"}</p>
                  </div>
                  <div>
                    <p className="label">Created At</p>
                    <p>
                      {selectedProject.createdAt
                        ? new Date(selectedProject.createdAt)
                            .toLocaleDateString("en-IN", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                        : "—"}
                    </p>
                  </div>
                </div>

                <div className="detail-grid" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => setShowUpdateProjectModal(true)}
                    style={{ padding: '12px 24px' }}
                  >
                    Update Project Details
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => setShowChangeStageModal(true)}
                    style={{ padding: '12px 24px' }}
                  >
                    Change Stage
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => setShowLogActionModal(true)}
                    style={{ padding: '12px 24px' }}
                  >
                    Log Action
                  </button>
                </div>

                <div className="actions-section">
                  <div className="actions-header">
                    <h4>Project Actions</h4>
                    <span className="muted-text">
                      {selectedProject.actions?.length || 0} total
                    </span>
                  </div>
                  {selectedProject.actions?.length ? (
                    <div className="actions-table-wrapper">
                      <table className="main-table">
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Notes</th>
                            <th>Update</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedProject.actions.map((action) => (
                            <tr key={action.id}>
                              <td>{action.title}</td>
                              <td>{action.actionDate}</td>
                              <td>{renderStatusBadge(action.status)}</td>
                              <td>{action.notes || "—"}</td>
                              <td>
                                <div className="action-buttons">
                                  {ACTION_STATUS_OPTIONS.map((status) => (
                                    <button
                                      key={status}
                                      type="button"
                                      className={`btn-small ${
                                        action.status === status
                                          ? "btn-selected"
                                          : "btn-outline"
                                      }`}
                                      disabled={
                                        action.status === status ||
                                        actionStatusLoading[action.id]
                                      }
                                      onClick={() =>
                                        updateActionStatus(
                                          action.id,
                                          status
                                        )
                                      }
                                    >
                                      {actionStatusLoading[action.id] &&
                                      action.status !== status
                                        ? "Updating..."
                                        : status}
                                    </button>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="muted-text">
                      No actions logged yet. Use the form above to add one.
                    </p>
                  )}
                </div>
              </>
            )}
          </section>
        </section>
      </main>

      {/* Update Project Details Modal */}
      {showUpdateProjectModal && (
        <div className="modal-overlay" onClick={() => setShowUpdateProjectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={submitUpdate}>
              <h3>Update Project Details</h3>
              {updateFormErrors.form && (
                <p className="error-text">{updateFormErrors.form}</p>
              )}
              {updateFormSuccess && (
                <p className="success-text">{updateFormSuccess}</p>
              )}
              <label>
                Expected End Date
                <input
                  type="date"
                  name="expectedEndDate"
                  value={updateForm.expectedEndDate}
                  onChange={handleUpdateFormChange}
                />
              </label>
              <label>
                Sanctioned Amount
                <input
                  type="number"
                  name="sanctionedAmount"
                  min="0"
                  step="0.01"
                  value={updateForm.sanctionedAmount}
                  onChange={handleUpdateFormChange}
                />
                {updateFormErrors.sanctionedAmount && (
                  <span className="error-text">
                    {updateFormErrors.sanctionedAmount}
                  </span>
                )}
              </label>
              <div className="form-actions">
                <button type="submit" disabled={updateSubmitting}>
                  {updateSubmitting ? "Updating..." : "Update Details"}
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setShowUpdateProjectModal(false);
                    setUpdateFormErrors({});
                    setUpdateFormSuccess("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Stage Modal */}
      {showChangeStageModal && (
        <div className="modal-overlay" onClick={() => setShowChangeStageModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={submitStageChange}>
              <h3>Change Stage</h3>
              {stageError && (
                <p className="error-text">{stageError}</p>
              )}
              {stageSuccess && (
                <p className="success-text">{stageSuccess}</p>
              )}
              <label>
                New Stage
                <select
                  value={stageForm.stage}
                  onChange={(e) =>
                    setStageForm((prev) => ({
                      ...prev,
                      stage: e.target.value,
                    }))
                  }
                  required
                >
                  <option value="" disabled>
                    Select stage
                  </option>
                  {PROJECT_STAGE_OPTIONS.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Notes
                <textarea
                  rows={3}
                  value={stageForm.notes}
                  onChange={(e) =>
                    setStageForm((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="Explain why the stage changed"
                />
              </label>
              <div className="form-actions">
                <button type="submit" disabled={stageSubmitting}>
                  {stageSubmitting ? "Updating..." : "Update Stage"}
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setShowChangeStageModal(false);
                    setStageError("");
                    setStageSuccess("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Action Modal */}
      {showLogActionModal && (
        <div className="modal-overlay" onClick={() => setShowLogActionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={submitAction}>
              <h3>Log Action</h3>
              {actionError && (
                <p className="error-text">{actionError}</p>
              )}
              {actionSuccess && (
                <p className="success-text">{actionSuccess}</p>
              )}
              <label>
                Title *
                <input
                  type="text"
                  value={actionForm.title}
                  onChange={(e) =>
                    setActionForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  required
                />
              </label>
              <label>
                Action Date *
                <input
                  type="date"
                  value={actionForm.actionDate}
                  onChange={(e) =>
                    setActionForm((prev) => ({
                      ...prev,
                      actionDate: e.target.value,
                    }))
                  }
                  required
                />
              </label>
              <label>
                Notes
                <textarea
                  rows={3}
                  value={actionForm.notes}
                  onChange={(e) =>
                    setActionForm((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="Additional context"
                />
              </label>
              <div className="form-actions">
                <button type="submit" disabled={actionSubmitting}>
                  {actionSubmitting ? "Saving..." : "Add Action"}
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setShowLogActionModal(false);
                    setActionError("");
                    setActionSuccess("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficeStaffProjects;

