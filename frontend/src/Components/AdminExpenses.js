import React, { useCallback, useEffect, useState, useMemo } from "react";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import "./Styles/Admin.css";
import "./Styles/Main.css";
import "./Styles/Sidebar.css";
import { getDisplayName } from "../utils/auth";

const AdminExpenses = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [viewingExpense, setViewingExpense] = useState(null);
  const pageSize = 50;

  const fetchExpenses = useCallback(
    async (date, pageNum = 0) => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("jwtToken");
        const apiUrl = process.env.REACT_APP_API_URL;
        const params = new URLSearchParams();
        params.append("page", pageNum);
        params.append("size", pageSize);
        const query = params.toString();
        const url = `${apiUrl}office-staff/expenses?${query}`;
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response?.data?.data;
        setExpenses(data?.content ?? []);
        setPage(data?.number ?? pageNum);
        setTotalPages(data?.totalPages ?? 0);
      } catch (err) {
        console.error("Failed to fetch expenses", err);
        const apiMessage =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to fetch expenses";
        setError(apiMessage);
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  useEffect(() => {
    fetchExpenses(selectedDate, 0);
  }, [fetchExpenses]);

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    navigate("/");
  };

  const handleClearFilter = () => {
    setSelectedDate("");
    fetchExpenses("", 0);
  };

  // Group expenses by date
  const expensesByDate = useMemo(() => {
    const grouped = {};
    expenses.forEach((expense) => {
      const date = expense.date || expense.createdAt?.split("T")[0] || "Unknown";
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(expense);
    });
    
    // Sort dates in descending order
    const sortedDates = Object.keys(grouped).sort((a, b) => {
      if (a === "Unknown") return 1;
      if (b === "Unknown") return -1;
      return new Date(b) - new Date(a);
    });

    // Filter by selected date if provided
    if (selectedDate) {
      const filtered = sortedDates.filter((date) => date === selectedDate);
      return filtered.reduce((acc, date) => {
        acc[date] = grouped[date];
        return acc;
      }, {});
    }

    return sortedDates.reduce((acc, date) => {
      acc[date] = grouped[date];
      return acc;
    }, {});
  }, [expenses, selectedDate]);

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return "₹0.00";
    return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const calculateDateTotal = (dateExpenses) => {
    return dateExpenses.reduce((sum, exp) => sum + (exp.totalAmount || 0), 0);
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
            <label htmlFor="expenseDate">
              Filter by Date
              <input
                id="expenseDate"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </label>
            <button onClick={() => fetchExpenses(selectedDate, 0)}>Apply</button>
            <button onClick={handleClearFilter}>Clear</button>
          </div>

          {loading && <p>Loading expenses...</p>}
          {error && <p className="text-red-600">{error}</p>}

          {!loading && !error && (
            <>
              {Object.keys(expensesByDate).length === 0 ? (
                <p style={{ textAlign: "center", padding: "20px" }}>
                  No expenses found
                </p>
              ) : (
                Object.entries(expensesByDate).map(([date, dateExpenses]) => (
                  <div key={date} style={{ marginBottom: "30px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "15px",
                        padding: "10px",
                        backgroundColor: "#f5f5f5",
                        borderRadius: "4px",
                      }}
                    >
                      <h3 style={{ margin: 0 }}>
                        {date === "Unknown"
                          ? "Unknown Date"
                          : new Date(date).toLocaleDateString("en-IN", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                      </h3>
                      <strong style={{ fontSize: "18px", color: "#2563eb" }}>
                        Total: {formatCurrency(calculateDateTotal(dateExpenses))}
                      </strong>
                    </div>
                    <table className="main-table">
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Project Name</th>
                          <th>LSGD Name</th>
                          <th>Project</th>
                          <th>Description</th>
                          <th>Total Amount</th>
                          <th>Items</th>
                          <th>Workers</th>
                          <th>Created By</th>
                          <th>Created At</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dateExpenses.map((expense) => (
                          <tr key={expense.id}>
                            <td>{expense.type}</td>
                            <td>{expense.projectName ?? "-"}</td>
                            <td>{expense.projectLsgdName ?? "-"}</td>
                            <td>
                              {expense.projectId ? (
                                <button
                                  type="button"
                                  className="btn-outline btn-small"
                                  onClick={() =>
                                    navigate(`/admin/projects/${expense.projectId}`)
                                  }
                                >
                                  View Project
                                </button>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td>{expense.description || "-"}</td>
                            <td>{formatCurrency(expense.totalAmount)}</td>
                            <td>{expense.items?.length || 0}</td>
                            <td>
                              {expense.workers && expense.workers.length > 0 ? (
                                <span>{expense.workers.length} worker(s)</span>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td>{expense.createdByName || "-"}</td>
                            <td>
                              {expense.createdAt?.split("T")[0] || "-"}
                            </td>
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
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))
              )}
              {totalPages > 1 && (
                <div style={{ marginTop: "20px", textAlign: "center" }}>
                  <button
                    onClick={() => fetchExpenses(selectedDate, page - 1)}
                    disabled={page === 0}
                    style={{ marginRight: "10px" }}
                  >
                    Previous
                  </button>
                  <span style={{ margin: "0 10px" }}>
                    Page {page + 1} of {totalPages}
                  </span>
                  <button
                    onClick={() => fetchExpenses(selectedDate, page + 1)}
                    disabled={page >= totalPages - 1}
                  >
                    Next
                  </button>
                </div>
              )}
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
                  <strong>Total Amount:</strong> {formatCurrency(viewingExpense.totalAmount)}
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

export default AdminExpenses;

