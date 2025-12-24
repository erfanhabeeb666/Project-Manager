import React from "react";
import { NavLink } from "react-router-dom";
import "./Styles/Sidebar.css";

const AdminSidebar = ({ isOpen, toggleSidebar }) => {
    return (
        <>
            {/* Mobile Overlay */}
            <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={toggleSidebar}></div>

            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <center><h2>Rizsaf Pvt Ltd</h2></center>
                <nav>
                    <ul className="sidebar-menu">
                        <li>
                            <NavLink to="/admin" className="sidebar-link" end onClick={toggleSidebar}>
                                <i className="fas fa-tachometer-alt"></i> Dashboard
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/office-staff" className="sidebar-link" onClick={toggleSidebar}>
                                <i className="fas fa-users"></i> Office Staff
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/worker" className="sidebar-link" onClick={toggleSidebar}>
                                <i className="fas fa-hard-hat"></i> Workers
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/projects" className="sidebar-link" onClick={toggleSidebar}>
                                <i className="fas fa-project-diagram"></i> Projects
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/actions" className="sidebar-link" onClick={toggleSidebar}>
                                <i className="fas fa-list"></i> Actions
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/expenses" className="sidebar-link" onClick={toggleSidebar}>
                                <i className="fas fa-money-bill-wave"></i> Expenses
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/lsgds" className="sidebar-link" onClick={toggleSidebar}>
                                <i className="fas fa-building"></i> LSGD Management
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/bills-history" className="sidebar-link" onClick={toggleSidebar}>
                                <i className="fas fa-file-invoice-dollar"></i> Bills History
                            </NavLink>
                        </li>
                    </ul>
                </nav>
            </aside>
        </>
    );
};

export default AdminSidebar;
