import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import { getDisplayName } from "../utils/auth";
import "./Styles/Main.css";
import "./Styles/Admin.css";
import "./Styles/Sidebar.css";
import "./Styles/OfficeStaff.css";

const ACTION_STATUS_OPTIONS = ["PENDING", "COMPLETED"];

const OfficeStaffDailyActions = () => {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL || "";

  const todayIso = useMemo(
    () => new Date().toISOString().split("T")[0],
    []
  );
  const [fromDate, setFromDate] = useState(todayIso);
  const [toDate, setToDate] = useState(todayIso);
  const [datedActions, setDatedActions] = useState([]);
  const [actionsLoading, setActionsLoading] = useState(false);
  const [actionsError, setActionsError] = useState("");
  const [actionStatusLoading, setActionStatusLoading] = useState({});
  const [sortField, setSortField] = useState("actionDate");
  const [sortDirection, setSortDirection] = useState("asc");

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

  const fetchActionsByDateRange = useCallback(
    async (fromDateValue, toDateValue) => {
      requireAuth();
      setActionsLoading(true);
      setActionsError("");
      try {
        const params = {};
        if (fromDateValue && toDateValue) {
          params.fromDate = fromDateValue;
          params.toDate = toDateValue;
        } else if (fromDateValue) {
          params.date = fromDateValue;
        }
        const endpoint = `${apiUrl}office-staff/actions`;
        const response = await axios.get(endpoint, {
          headers: authHeaders(),
          params,
        });
        setDatedActions(response.data?.data || []);
      } catch (error) {
        handleApiError(error, setActionsError);
      } finally {
        setActionsLoading(false);
      }
    },
    [apiUrl, requireAuth, handleApiError]
  );

  useEffect(() => {
    fetchActionsByDateRange(fromDate, toDate);
  }, [fetchActionsByDateRange, fromDate, toDate]);

  const updateActionStatus = async (actionId, projectId, status) => {
    requireAuth();
    setActionStatusLoading((prev) => ({ ...prev, [actionId]: true }));
    try {
      await axios.put(
        `${apiUrl}office-staff/projects/${projectId}/actions/${actionId}`,
        {},
        {
          headers: authHeaders(),
          params: { status },
        }
      );
      await fetchActionsByDateRange(fromDate, toDate);
    } catch (error) {
      handleApiError(error, setActionsError);
    } finally {
      setActionStatusLoading((prev) => ({ ...prev, [actionId]: false }));
    }
  };

  const sortedActions = useMemo(() => {
    // Filter out STAGE_CHANGE actions
    const filteredActions = datedActions.filter(action => action.actionType !== "STAGE_CHANGE");
    
    if (!filteredActions.length) return [];
    
    const sorted = [...filteredActions].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case "projectName":
          aValue = (a.projectName || "").toLowerCase();
          bValue = (b.projectName || "").toLowerCase();
          break;
        case "projectLsgdName":
          aValue = (a.projectLsgdName || "").toLowerCase();
          bValue = (b.projectLsgdName || "").toLowerCase();
          break;
        case "title":
          aValue = (a.title || "").toLowerCase();
          bValue = (b.title || "").toLowerCase();
          break;
        case "actionDate":
          aValue = a.actionDate || "";
          bValue = b.actionDate || "";
          break;
        case "status":
          aValue = (a.status || "PENDING").toLowerCase();
          bValue = (b.status || "PENDING").toLowerCase();
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    
    return sorted;
  }, [datedActions, sortField, sortDirection]);

  const handleSortChange = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
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
          <h1>Office Staff Workspace - Daily Actions</h1>
          <div className="topbar-actions">
            <span className="greeting">Hello, {getDisplayName()}</span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <section className="content-area office-staff-content">
          <section className="office-card">
            <div className="card-header">
              <div>
                <p className="card-eyebrow">Schedule</p>
                <h3>Daily Actions</h3>
              </div>
              <div className="filters-row">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>From:</span>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>To:</span>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    min={fromDate}
                  />
                </label>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => fetchActionsByDateRange(fromDate, toDate)}
                  disabled={actionsLoading}
                >
                  Load
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setFromDate(todayIso);
                    setToDate(todayIso);
                    fetchActionsByDateRange(todayIso, todayIso);
                  }}
                  disabled={actionsLoading}
                >
                  Today
                </button>
              </div>
            </div>
            {actionsError && <p className="error-text">{actionsError}</p>}
            {sortedActions.length > 0 && (
              <div className="filters-row" style={{ marginBottom: '16px', marginTop: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Sort by:</span>
                  <select
                    value={sortField}
                    onChange={(e) => handleSortChange(e.target.value)}
                    style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ccc' }}
                  >
                    <option value="actionDate">Date</option>
                    <option value="projectName">Project Name</option>
                    <option value="projectLsgdName">LSGD Name</option>
                    <option value="title">Title</option>
                    <option value="status">Status</option>
                  </select>
                </label>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                  style={{ minWidth: '100px' }}
                >
                  {sortDirection === "asc" ? "↑ Ascending" : "↓ Descending"}
                </button>
              </div>
            )}
            <div className="table-scroll">
              {actionsLoading ? (
                <p className="muted-text">Loading actions...</p>
              ) : sortedActions.length === 0 ? (
                <p className="muted-text">No actions scheduled.</p>
              ) : (
                <table className="main-table">
                  <thead>
                    <tr>
                      <th>Project Name</th>
                      <th>LSGD Name</th>
                      <th>Title</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Notes</th>
                      <th>Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedActions.map((action) => (
                      <tr key={action.id}>
                        <td>{action.projectName || "—"}</td>
                        <td>{action.projectLsgdName || "—"}</td>
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
                                  actionStatusLoading[action.id] ||
                                  !action.projectId
                                }
                                onClick={() =>
                                  updateActionStatus(
                                    action.id,
                                    action.projectId,
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
              )}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
};

export default OfficeStaffDailyActions;

