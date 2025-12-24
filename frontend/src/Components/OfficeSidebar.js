import React from "react";
import { NavLink } from "react-router-dom";
import "./Styles/Sidebar.css";

const OfficeSidebar = ({ isOpen, toggleSidebar }) => {
    return (
        <>
            {/* Mobile Overlay */}
            <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={toggleSidebar}></div>

            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <center>
                    <h2>Rizsaf Pvt Ltd</h2>
                </center>
                <nav>
                    <ul className="sidebar-menu">
                        <li>
                            <NavLink to="/office-staff" className="sidebar-link" end onClick={toggleSidebar}>
                                <i className="fas fa-tachometer-alt"></i> Office Staff Dashboard
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/office-staff/projects" className="sidebar-link" onClick={toggleSidebar}>
                                <i className="fas fa-project-diagram"></i> Projects
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/office-staff/daily-actions" className="sidebar-link" onClick={toggleSidebar}>
                                <i className="fas fa-calendar-day"></i> Daily Actions
                            </NavLink>
                        </li>

                        <li className="menu-header" style={{ color: '#94a3b8', padding: '10px 20px', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>
                            Billing
                        </li>
                        <li>
                            <NavLink to="/office-staff/create-bill" className="sidebar-link" onClick={toggleSidebar}>
                                <i className="fas fa-file-invoice-dollar"></i> Create GST Bill
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/office-staff/bills-history" className="sidebar-link" onClick={toggleSidebar}>
                                <i className="fas fa-history"></i> Bills History
                            </NavLink>
                        </li>
                    </ul>
                </nav>
            </aside>
        </>
    );
};

export default OfficeSidebar;
