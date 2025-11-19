import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import { getDisplayName } from "../utils/auth";
import "./Styles/Main.css";
import "./Styles/Admin.css";
import "./Styles/Sidebar.css";
import "./Styles/OfficeStaff.css";

const OfficeStaff = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("jwtToken");
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await axios.get(`${apiUrl}office-staff/dashboard/stats`, {
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

  const handleLogout = useCallback(() => {
    localStorage.removeItem("jwtToken");
    navigate("/");
  }, [navigate]);

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return "₹0.00";
    return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const renderBarChart = (data, maxValue) => {
    if (!data || Object.keys(data).length === 0) return null;
    return (
      <div style={{ marginTop: '15px' }}>
        {Object.entries(data).map(([key, value]) => {
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
          return (
            <div key={key} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '14px' }}>{key.replace(/_/g, ' ')}</span>
                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{value}</span>
              </div>
              <div style={{
                width: '100%',
                height: '24px',
                backgroundColor: '#e5e7eb',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${percentage}%`,
                  height: '100%',
                  backgroundColor: '#3b82f6',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
            </div>
          );
        })}
      </div>
    );
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
          {loading && <p>Loading dashboard statistics...</p>}
          {error && <p className="error-text">{error}</p>}

          {!loading && !error && stats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
              {/* Stat Cards */}
              <div className="office-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <i className="fas fa-project-diagram" style={{ fontSize: '24px', color: '#3b82f6' }}></i>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>My Projects</h3>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937' }}>
                  {stats.myProjectsCount ?? 0}
                </div>
              </div>

              <div className="office-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <i className="fas fa-clock" style={{ fontSize: '24px', color: '#f59e0b' }}></i>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>Pending Actions</h3>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937' }}>
                  {stats.pendingActionsCount ?? 0}
                </div>
              </div>

              <div className="office-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <i className="fas fa-check-circle" style={{ fontSize: '24px', color: '#10b981' }}></i>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>Completed Actions</h3>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937' }}>
                  {stats.completedActionsCount ?? 0}
                </div>
              </div>

              <div className="office-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <i className="fas fa-calendar-day" style={{ fontSize: '24px', color: '#8b5cf6' }}></i>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>Today's Actions</h3>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937' }}>
                  {stats.totalActionsToday ?? 0}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '5px' }}>
                  {stats.pendingActionsToday ?? 0} Pending
                </div>
              </div>

              <div className="office-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <i className="fas fa-money-bill-wave" style={{ fontSize: '24px', color: '#ef4444' }}></i>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>Total Expenses</h3>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>
                  {formatCurrency(stats.myProjectsTotalExpenses)}
                </div>
              </div>

              <div className="office-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <i className="fas fa-rupee-sign" style={{ fontSize: '24px', color: '#059669' }}></i>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>Sanctioned Amount</h3>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>
                  {formatCurrency(stats.myProjectsTotalSanctionedAmount)}
                </div>
              </div>
            </div>
          )}

          {!loading && !error && stats && stats.myProjectsByStage && Object.keys(stats.myProjectsByStage).length > 0 && (
            <div style={{ marginTop: '30px' }}>
              <div className="office-card" style={{ padding: '20px' }}>
                <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '18px', fontWeight: '600' }}>
                  My Projects by Stage
                </h3>
                {renderBarChart(stats.myProjectsByStage, Math.max(...Object.values(stats.myProjectsByStage)))}
              </div>
            </div>
          )}

          <div style={{ marginTop: '30px' }}>
            <NavLink to="/office-staff/projects">
              <button className="btn-primary" style={{ padding: '12px 24px' }}>Go to Projects</button>
            </NavLink>
          </div>
        </section>
      </main>
    </div>
  );
};

export default OfficeStaff;
