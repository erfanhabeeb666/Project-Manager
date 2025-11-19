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
  const [viewingExpense, setViewingExpense] = useState(null);

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
  const projectExpenses = project?.expenses ?? [];

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
                  <div className="info-card">
                    <span className="label">Total Expense</span>
                    <strong>₹{project.totalExpense?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "0.00"}</strong>
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

              <div className="section">
                <h3>Expenses</h3>
                <table className="main-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Total Amount</th>
                      <th>Items Count</th>
                      <th>Workers</th>
                      <th>Created By</th>
                      <th>Created At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectExpenses.length === 0 ? (
                      <tr>
                        <td colSpan="9" style={{ textAlign: "center", padding: "20px" }}>
                          No expenses recorded for this project
                        </td>
                      </tr>
                    ) : (
                      projectExpenses.map((expense) => (
                        <tr key={expense.id}>
                          <td>{expense.type}</td>
                          <td>{expense.date ?? "-"}</td>
                          <td>{expense.description ?? "-"}</td>
                          <td>₹{expense.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "0.00"}</td>
                          <td>{expense.items?.length ?? 0}</td>
                          <td>
                            {expense.workers && expense.workers.length > 0 ? (
                              <span>{expense.workers.length} worker(s)</span>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td>{expense.createdByName ?? "-"}</td>
                          <td>{expense.createdAt?.split("T")[0] ?? "-"}</td>
                          <td>
                            <button
                              type="button"
                              className="btn-outline btn-small"
                              onClick={() => setViewingExpense(expense)}
                            >
                              View Details
                            </button>
                          </td>
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

      {/* View Expense Details Modal */}
      {viewingExpense && (
        <div className="modal-overlay" onClick={() => setViewingExpense(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3>Expense Details</h3>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <strong>Type:</strong> {viewingExpense.type}
                </div>
                <div>
                  <strong>Date:</strong> {viewingExpense.date ?? "—"}
                </div>
                <div>
                  <strong>Total Amount:</strong> ₹{viewingExpense.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "0.00"}
                </div>
                <div>
                  <strong>Created By:</strong> {viewingExpense.createdByName ?? "—"}
                </div>
                <div>
                  <strong>Created At:</strong> {viewingExpense.createdAt?.split("T")[0] ?? "—"}
                </div>
              </div>
              {viewingExpense.description && (
                <div style={{ marginBottom: '15px' }}>
                  <strong>Description:</strong>
                  <p style={{ marginTop: '5px', whiteSpace: 'pre-wrap' }}>{viewingExpense.description}</p>
                </div>
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4>Expense Items</h4>
              {viewingExpense.items && viewingExpense.items.length > 0 ? (
                <table className="main-table">
                  <thead>
                    <tr>
                      <th>Particular</th>
                      <th>Quantity</th>
                      <th>Rate</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewingExpense.items.map((item, index) => (
                      <tr key={item.id || index}>
                        <td>{item.particular ?? "—"}</td>
                        <td>{item.quantity ?? "—"}</td>
                        <td>₹{item.rate?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "0.00"}</td>
                        <td>₹{item.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "0.00"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="muted-text">No items recorded</p>
              )}
            </div>

            {viewingExpense.workers && viewingExpense.workers.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h4>Assigned Workers ({viewingExpense.workers.length})</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                  {viewingExpense.workers.map((worker) => (
                    <div key={worker.id} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
                      <div><strong>{worker.name}</strong></div>
                      {worker.mobileNumber && (
                        <div className="muted-text" style={{ fontSize: '14px' }}>{worker.mobileNumber}</div>
                      )}
                      {worker.adharUid && (
                        <div className="muted-text" style={{ fontSize: '12px' }}>Aadhar: {worker.adharUid}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setViewingExpense(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProjectDetails;


