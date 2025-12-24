import axios from "axios";
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import './Styles/Admin.css';
import './Styles/Main.css';
import './Styles/Sidebar.css';
import { getDisplayName } from "../utils/auth";
import AddWorker from "./AddWorker";
import AdminSidebar from "./AdminSidebar";

const AdminWorker = () => {
  const [workerList, setWorkerList] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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
        <div className="mb-4 flex space-x-4" style={{ marginBottom: "20px", marginTop: "20px" }}>
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

