import axios from "axios";
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import './Styles/Admin.css';
import './Styles/Main.css';
import './Styles/Sidebar.css';
import { getDisplayName } from "../utils/auth";
import AddOfficeStaff from "./AddOfficeStaff";

const AdminOfficeStaff = () => {
  const [officeStaffList, setOfficeStaffList] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchOfficeStaff = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const apiUrl = process.env.REACT_APP_API_URL;

      const response = await axios.get(`${apiUrl}admin/list-staff`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOfficeStaffList(response.data);
    } catch (err) {
      console.error("Failed to fetch staff", err);
    }
  };

  useEffect(() => {
    fetchOfficeStaff();
  }, []);

  const handleAddSuccess = () => {
    fetchOfficeStaff();
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
          <button onClick={() => setShowAddForm(true)}>+ Add staff</button>
          <button onClick={() => fetchOfficeStaff()} style={{ marginLeft: "15px" }}>Refresh List</button>
        </div>

        {/* Add Office Staff Modal */}
        {showAddForm && (
          <div className="modal-overlay">
            <div className="form-container">
              <AddOfficeStaff onSuccess={handleAddSuccess} />
              <button onClick={() => setShowAddForm(false)} className="btn-cancel">Close</button>
            </div>
          </div>
        )}



        <div>
          <table className="main-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Adhar</th>
              </tr>
            </thead>
            <tbody>
              {officeStaffList.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>No Office Staff available</td>
                </tr>
              ) : (
                officeStaffList.map((staff) => (
                  <tr key={staff.id}>
                    <td>{staff.name}</td>
                    <td>{staff.email}</td>
                    <td>{staff.mobileNumber}</td>
                    <td>{staff.adharUid}</td>
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

export default AdminOfficeStaff;

