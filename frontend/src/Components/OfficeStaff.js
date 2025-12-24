import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import { getDisplayName } from "../utils/auth";
import "./Styles/Main.css";
import "./Styles/Admin.css";
import "./Styles/Sidebar.css";
import "./Styles/OfficeStaff.css";
import OfficeSidebar from "./OfficeSidebar";

const OfficeStaff = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("jwtToken");
      const apiUrl = process.env.REACT_APP_API_URL;
      const baseUrl = apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`;

      const response = await axios.get(`${baseUrl}office-staff/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response?.data?.data ?? null);
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Unable to load dashboard statistics";
      setError(apiMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    navigate("/");
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return "₹0.00";
    return `₹${value.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const renderBarChart = (data, maxValue) => {
    if (!data || Object.keys(data).length === 0) return null;
    return (
      <div className="chart-container">
        {Object.entries(data).map(([key, value]) => {
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
          return (
            <div key={key} className="chart-row">
              <div className="chart-label-row">
                <span className="chart-label">{key.replace(/_/g, " ")}</span>
                <span className="chart-value">{value}</span>
              </div>
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    );
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
            <h1>Office Staff Workspace</h1>
          </div>
          <div className="topbar-actions">
            <span className="greeting">Hello, {getDisplayName()}</span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <section className="content-area office-staff-content">
          {loading && <div className="loading-spinner">Loading dashboard statistics...</div>}
          {error && <div className="text-danger error-alert">{error}</div>}

          {!loading && !error && stats && (
            <div className="grid-container">
              {/* Stat Cards */}
              <div className="info-card">
                <div>
                  <h3>My Projects</h3>
                  <div className="stat-value" style={{ fontSize: "32px", fontWeight: "bold" }}>{stats.myProjectsCount ?? 0}</div>
                </div>
                <i className="fas fa-project-diagram text-primary" style={{ fontSize: "24px", opacity: 0.8, alignSelf: 'flex-end' }}></i>
              </div>

              <div className="info-card">
                <div>
                  <h3>Pending Actions</h3>
                  <div className="stat-value" style={{ fontSize: "32px", fontWeight: "bold" }}>{stats.pendingActionsCount ?? 0}</div>
                </div>
                <i className="fas fa-clock text-warning" style={{ fontSize: "24px", opacity: 0.8, alignSelf: 'flex-end' }}></i>
              </div>

              <div className="info-card">
                <div>
                  <h3>Completed Actions</h3>
                  <div className="stat-value" style={{ fontSize: "32px", fontWeight: "bold" }}>{stats.completedActionsCount ?? 0}</div>
                </div>
                <i className="fas fa-check-circle text-success" style={{ fontSize: "24px", opacity: 0.8, alignSelf: 'flex-end' }}></i>
              </div>

              <div className="info-card">
                <div>
                  <h3>Today's Actions</h3>
                  <div className="stat-value" style={{ fontSize: "32px", fontWeight: "bold" }}>{stats.totalActionsToday ?? 0}</div>
                  <div className="text-secondary" style={{ fontSize: "0.85rem", marginTop: "5px" }}>
                    {stats.pendingActionsToday ?? 0} Pending
                  </div>
                </div>
                <i className="fas fa-calendar-day" style={{ fontSize: "24px", color: "#8b5cf6", opacity: 0.8, alignSelf: 'flex-end' }}></i>
              </div>

              <div className="info-card">
                <div>
                  <h3>Total Expenses</h3>
                  <div className="stat-value" style={{ fontSize: "28px", fontWeight: "bold" }}>{formatCurrency(stats.myProjectsTotalExpenses)}</div>
                </div>
                <i className="fas fa-money-bill-wave text-danger" style={{ fontSize: "24px", opacity: 0.8, alignSelf: 'flex-end' }}></i>
              </div>

              <div className="info-card">
                <div>
                  <h3>Sanctioned Amount</h3>
                  <div className="stat-value" style={{ fontSize: "28px", fontWeight: "bold" }}>{formatCurrency(stats.myProjectsTotalSanctionedAmount)}</div>
                </div>
                <i className="fas fa-rupee-sign text-success" style={{ fontSize: "24px", opacity: 0.8, alignSelf: 'flex-end' }}></i>
              </div>
            </div>
          )}

          {!loading && !error && stats && stats.myProjectsByStage && Object.keys(stats.myProjectsByStage).length > 0 && (
            <div className="grid-container" style={{ marginTop: "30px" }}>
              <div className="info-card">
                <h3>My Projects by Stage</h3>
                {renderBarChart(
                  stats.myProjectsByStage,
                  Math.max(...Object.values(stats.myProjectsByStage))
                )}
              </div>
            </div>
          )}

          <div style={{ marginTop: "30px" }}>
            <NavLink to="/office-staff/projects">
              <button className="btn-primary">
                Go to Projects
              </button>
            </NavLink>
          </div>
        </section>
      </main>
    </div>
  );
};

export default OfficeStaff;
