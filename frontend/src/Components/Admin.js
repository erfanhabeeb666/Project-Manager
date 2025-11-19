import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import './Styles/Admin.css';
import './Styles/Main.css';
import './Styles/Sidebar.css';
import { getDisplayName } from "../utils/auth";

const Admin = () => {
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
            const response = await axios.get(`${apiUrl}admin/dashboard/stats`, {
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
      {/* Sidebar */}
      <aside className="sidebar">
        <center><h2>Rizsaf Pvt Ltd</h2></center>
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

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <h1>Project Manager Dashboard</h1>
          <div className="topbar-actions">
            <span className="greeting">Hello, {getDisplayName()}</span>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </header>
        <section className="content-area">
            <h2>Admin Dashboard</h2>
            
            {loading && <p>Loading dashboard statistics...</p>}
            {error && <p className="text-red-600">{error}</p>}

            {!loading && !error && stats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
                    {/* Stat Cards */}
                    <div className="info-card" style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <i className="fas fa-project-diagram" style={{ fontSize: '24px', color: '#3b82f6' }}></i>
                            <h3 style={{ margin: 0, fontSize: '18px' }}>Total Projects</h3>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937' }}>
                            {stats.totalProjects ?? 0}
                        </div>
                    </div>

                    <div className="info-card" style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <i className="fas fa-users" style={{ fontSize: '24px', color: '#10b981' }}></i>
                            <h3 style={{ margin: 0, fontSize: '18px' }}>Office Staff</h3>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937' }}>
                            {stats.totalOfficeStaff ?? 0}
                        </div>
                    </div>

                    <div className="info-card" style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <i className="fas fa-hard-hat" style={{ fontSize: '24px', color: '#f59e0b' }}></i>
                            <h3 style={{ margin: 0, fontSize: '18px' }}>Workers</h3>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937' }}>
                            {stats.totalWorkers ?? 0}
                        </div>
                    </div>

                    <div className="info-card" style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <i className="fas fa-list" style={{ fontSize: '24px', color: '#8b5cf6' }}></i>
                            <h3 style={{ margin: 0, fontSize: '18px' }}>Total Actions</h3>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937' }}>
                            {stats.totalActions ?? 0}
                        </div>
                        <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '5px' }}>
                            {stats.pendingActions ?? 0} Pending, {stats.completedActions ?? 0} Completed
                        </div>
                    </div>

                    <div className="info-card" style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <i className="fas fa-money-bill-wave" style={{ fontSize: '24px', color: '#ef4444' }}></i>
                            <h3 style={{ margin: 0, fontSize: '18px' }}>Total Expenses</h3>
                        </div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>
                            {formatCurrency(stats.totalExpenses)}
                        </div>
                        <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '5px' }}>
                            {stats.totalExpensesCount ?? 0} expenses
                        </div>
                    </div>

                    <div className="info-card" style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <i className="fas fa-rupee-sign" style={{ fontSize: '24px', color: '#059669' }}></i>
                            <h3 style={{ margin: 0, fontSize: '18px' }}>Sanctioned Amount</h3>
                        </div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>
                            {formatCurrency(stats.totalSanctionedAmount)}
                        </div>
                    </div>
                </div>
            )}

            {!loading && !error && stats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginTop: '30px' }}>
                    {/* Projects by Stage Chart */}
                    {stats.projectsByStage && Object.keys(stats.projectsByStage).length > 0 && (
                        <div style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                            <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '18px', fontWeight: '600' }}>
                                Projects by Stage
                            </h3>
                            {renderBarChart(stats.projectsByStage, Math.max(...Object.values(stats.projectsByStage)))}
                        </div>
                    )}

                    {/* Projects by Work Type Chart */}
                    {stats.projectsByWorkType && Object.keys(stats.projectsByWorkType).length > 0 && (
                        <div style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                            <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '18px', fontWeight: '600' }}>
                                Projects by Work Type
                            </h3>
                            {renderBarChart(stats.projectsByWorkType, Math.max(...Object.values(stats.projectsByWorkType)))}
                        </div>
                    )}

                    {/* Expenses Breakdown */}
                    {(stats.visitExpensesCount > 0 || stats.materialExpensesCount > 0) && (
                        <div style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                            <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '18px', fontWeight: '600' }}>
                                Expenses by Type
                            </h3>
                            <div style={{ marginTop: '15px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span>Visit Expenses</span>
                                    <span style={{ fontWeight: 'bold' }}>{stats.visitExpensesCount ?? 0}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Material Expenses</span>
                                    <span style={{ fontWeight: 'bold' }}>{stats.materialExpensesCount ?? 0}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </section>
        </main>
    </div>
    );
};

export default Admin;

