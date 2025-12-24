import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './Styles/Admin.css';
import './Styles/Main.css';
import './Styles/Sidebar.css';
import { getDisplayName } from "../utils/auth";
import AdminSidebar from "./AdminSidebar";

const Admin = () => {
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
            // Ensure API URL ends with slash
            const baseUrl = apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`;

            const response = await axios.get(`${baseUrl}admin/dashboard/stats`, {
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
            <div className="chart-container">
                {Object.entries(data).map(([key, value]) => {
                    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
                    return (
                        <div key={key} className="chart-row">
                            <div className="chart-label-row">
                                <span className="chart-label">{key.replace(/_/g, ' ')}</span>
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
            {/* Sidebar with mobile toggle props */}
            <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            {/* Main Content */}
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
                        <button className="logout-btn" onClick={handleLogout}>Logout</button>
                    </div>
                </header>

                <section className="content-area">
                    <h2>Admin Overview</h2>

                    {loading && <div className="loading-spinner">Loading dashboard statistics...</div>}
                    {error && <div className="text-danger error-alert">{error}</div>}

                    {!loading && !error && stats && (
                        <div className="grid-container">
                            {/* Stat Cards */}
                            <div className="info-card">
                                <div>
                                    <h3>Total Projects</h3>
                                    <div className="stat-value" style={{ fontSize: '32px' }}>{stats.totalProjects ?? 0}</div>
                                </div>
                                <i className="fas fa-project-diagram text-primary" style={{ fontSize: '24px', opacity: 0.8, alignSelf: 'flex-end' }}></i>
                            </div>

                            <div className="info-card">
                                <div>
                                    <h3>Office Staff</h3>
                                    <div className="stat-value" style={{ fontSize: '32px' }}>{stats.totalOfficeStaff ?? 0}</div>
                                </div>
                                <i className="fas fa-users text-success" style={{ fontSize: '24px', opacity: 0.8, alignSelf: 'flex-end' }}></i>
                            </div>

                            <div className="info-card">
                                <div>
                                    <h3>Workers</h3>
                                    <div className="stat-value" style={{ fontSize: '32px' }}>{stats.totalWorkers ?? 0}</div>
                                </div>
                                <i className="fas fa-hard-hat text-warning" style={{ fontSize: '24px', opacity: 0.8, alignSelf: 'flex-end' }}></i>
                            </div>

                            <div className="info-card">
                                <div>
                                    <h3>Total Actions</h3>
                                    <div className="stat-value" style={{ fontSize: '32px' }}>{stats.totalActions ?? 0}</div>
                                    <div className="text-secondary" style={{ fontSize: '0.85rem', marginTop: '5px' }}>
                                        {stats.pendingActions ?? 0} Pending, {stats.completedActions ?? 0} Completed
                                    </div>
                                </div>
                                <i className="fas fa-list" style={{ fontSize: '24px', color: '#8b5cf6', opacity: 0.8, alignSelf: 'flex-end' }}></i>
                            </div>

                            <div className="info-card">
                                <div>
                                    <h3>Total Expenses</h3>
                                    <div className="stat-value" style={{ fontSize: '28px' }}>{formatCurrency(stats.totalExpenses)}</div>
                                    <div className="text-secondary" style={{ fontSize: '0.85rem', marginTop: '5px' }}>
                                        {stats.totalExpensesCount ?? 0} expenses
                                    </div>
                                </div>
                                <i className="fas fa-money-bill-wave text-danger" style={{ fontSize: '24px', opacity: 0.8, alignSelf: 'flex-end' }}></i>
                            </div>

                            <div className="info-card">
                                <div>
                                    <h3>Sanctioned Amount</h3>
                                    <div className="stat-value" style={{ fontSize: '28px' }}>{formatCurrency(stats.totalSanctionedAmount)}</div>
                                </div>
                                <i className="fas fa-rupee-sign" style={{ fontSize: '24px', color: '#059669', opacity: 0.8, alignSelf: 'flex-end' }}></i>
                            </div>
                        </div>
                    )}

                    {!loading && !error && stats && (
                        <div className="grid-container" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
                            {/* Projects by Stage Chart */}
                            {stats.projectsByStage && Object.keys(stats.projectsByStage).length > 0 && (
                                <div className="info-card">
                                    <h3>Projects by Stage</h3>
                                    {renderBarChart(stats.projectsByStage, Math.max(...Object.values(stats.projectsByStage)))}
                                </div>
                            )}

                            {/* Projects by Work Type Chart */}
                            {stats.projectsByWorkType && Object.keys(stats.projectsByWorkType).length > 0 && (
                                <div className="info-card">
                                    <h3>Projects by Work Type</h3>
                                    {renderBarChart(stats.projectsByWorkType, Math.max(...Object.values(stats.projectsByWorkType)))}
                                </div>
                            )}

                            {/* Expenses Breakdown */}
                            {(stats.visitExpensesCount > 0 || stats.materialExpensesCount > 0) && (
                                <div className="info-card">
                                    <h3>Expenses by Type</h3>
                                    <div style={{ marginTop: '15px' }}>
                                        <div className="chart-row">
                                            <div className="chart-label-row">
                                                <span>Visit Expenses</span>
                                                <span className="chart-value">{stats.visitExpensesCount ?? 0}</span>
                                            </div>
                                            <div className="progress-bar-bg">
                                                <div
                                                    className="progress-bar-fill"
                                                    style={{ width: `${(stats.visitExpensesCount / (stats.totalExpensesCount || 1)) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <div className="chart-row">
                                            <div className="chart-label-row">
                                                <span>Material Expenses</span>
                                                <span className="chart-value">{stats.materialExpensesCount ?? 0}</span>
                                            </div>
                                            <div className="progress-bar-bg">
                                                <div
                                                    className="progress-bar-fill"
                                                    style={{ width: `${(stats.materialExpensesCount / (stats.totalExpensesCount || 1)) * 100}%`, backgroundColor: '#f59e0b' }}
                                                ></div>
                                            </div>
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

