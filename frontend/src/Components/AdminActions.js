import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import "./Styles/Admin.css";
import "./Styles/Main.css";
import "./Styles/Sidebar.css";
import { getDisplayName } from "../utils/auth";
import AdminSidebar from "./AdminSidebar";

const AdminActions = () => {
  const navigate = useNavigate();
  const [actions, setActions] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const fetchActions = useCallback(
    async (date) => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("jwtToken");
        const apiUrl = process.env.REACT_APP_API_URL;
        const params = new URLSearchParams();
        if (date) {
          params.append("date", date);
        }
        const query = params.toString();
        const url = query ? `${apiUrl}admin/actions?${query}` : `${apiUrl}admin/actions`;
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setActions(response?.data?.data ?? []);
      } catch (err) {
        console.error("Failed to fetch actions", err);
        const apiMessage =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to fetch actions";
        setError(apiMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    navigate("/");
  };

  const handleApplyFilter = () => {
    fetchActions(selectedDate);
  };

  const handleClearFilter = () => {
    setSelectedDate("");
    fetchActions();
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <main className="main-content">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button className="hamburger-btn" onClick={toggleSidebar}>
              <i className="fas fa-bars"></i>
            </button>
            <h1>Project Manager Dashboard</h1>
          </div>
          <div className="topbar-actions">
            <span className="greeting">Hello, {getDisplayName()}</span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <section className="content-area">
          <div className="filters">
            <label htmlFor="actionDate">
              Filter by Date
              <input
                id="actionDate"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </label>
            <button onClick={handleApplyFilter}>Apply</button>
            <button onClick={handleClearFilter}>Clear</button>
          </div>

          {loading && <p>Loading actions...</p>}
          {error && <p className="text-red-600">{error}</p>}

          {!loading && !error && (
            <table className="main-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Project Name</th>
                  <th>LSGD Name</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th>Created By</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {actions.filter(action => action.actionType !== "STAGE_CHANGE").length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
                      No actions found
                    </td>
                  </tr>
                ) : (
                  actions
                    .filter(action => action.actionType !== "STAGE_CHANGE")
                    .map((action) => (
                      <tr key={action.id}>
                        <td>{action.title}</td>
                        <td>{action.projectName ?? "-"}</td>
                        <td>{action.projectLsgdName ?? "-"}</td>
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
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminActions;


