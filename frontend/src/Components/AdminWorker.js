import axios from "axios";
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import './Styles/Admin.css';
import './Styles/Main.css';
import './Styles/Sidebar.css';
import { getDisplayName } from "../utils/auth";
import AddWorker from "./AddWorker";

const AdminWorker = () => {
  const [workerList, setWorkerList] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchWorker = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const apiUrl = process.env.REACT_APP_API_URL;

      const response = await axios.get(`${apiUrl}admin/list-worker`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setWorkerList(response.data);
    } catch (err) {
      console.error("Failed to fetch staff", err);
    }
  };

  useEffect(() => {
    fetchWorker();
  }, []);

  const handleAddSuccess = () => {
    fetchWorker();
    setShowAddForm(false);
  };

    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem("jwtToken");
        navigate("/");
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
        <div className="mb-4 flex space-x-4" style={{ marginBottom: "20px" ,marginTop:"50px" }}>
          <button onClick={() => setShowAddForm(true)}>+ Add Worker</button>
          <button onClick={() => fetchWorker()} style={{ marginLeft: "15px" }}>Refresh List</button>
        </div>

        {/* Add Worker Staff Modal */}
        {showAddForm && (
          <div className="modal-overlay">
            <div className="form-container">
              <AddWorker onSuccess={handleAddSuccess} />
              <button onClick={() => setShowAddForm(false)} className="btn-cancel">Close</button>
            </div>
          </div>
        )}



        <div>
          <table className="main-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Mobile</th>
                <th>Adhar</th>
                 <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {workerList.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>No Workers available</td>
                </tr>
              ) : (
                workerList.map((worker) => (
                  <tr key={worker.id}>
                    <td>{worker.name}</td>
                    <td>{worker.mobileNumber}</td>
                    <td>{worker.adharUid}</td>
                    <td>{worker.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        </main>
    </div>
    );
};

export default AdminWorker;

