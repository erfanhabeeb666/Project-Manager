import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import OfficeSidebar from "./OfficeSidebar";
import AdminSidebar from "./AdminSidebar";
import { getDisplayName } from "../utils/auth";
import "./Styles/Main.css";
// import "./Styles/CreateBill.css"; // Reuse .bill-page-container etc - No longer needed
import "./Styles/Sidebar.css";

const COMPANIES = [
    { value: "", label: "All Companies" },
    { value: "RIZSAF_LIGHTING", label: "RIZ SAF Lighting Solutions" },
    { value: "RIZSAF_PVT_LTD", label: "Rizsaf Private Limited" }
];

const BillsHistory = ({ role = "OFFICE_STAFF" }) => {
    const Sidebar = role === "ADMIN" ? AdminSidebar : OfficeSidebar;

    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [search, setSearch] = useState("");
    const [selectedCompany, setSelectedCompany] = useState("");
    const [error, setError] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const fetchBills = useCallback(async (pageNo = 0) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("jwtToken");
            const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8080/api/";

            const params = {
                page: pageNo,
                size: 10,
                search: search || null
            };

            if (selectedCompany) {
                params.company = selectedCompany;
            }

            const response = await axios.get(`${apiUrl}api/billing/history`, {
                headers: { Authorization: `Bearer ${token}` },
                params
            });

            const data = response.data;
            setBills(data.content || []);
            setTotalPages(data.totalPages);
            setPage(data.number);
        } catch (err) {
            setError("Failed to fetch bills history.");
        } finally {
            setLoading(false);
        }
    }, [search, selectedCompany]);

    useEffect(() => {
        fetchBills(0);
    }, [fetchBills]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchBills(0);
    };

    const handleLogout = () => {
        localStorage.removeItem("jwtToken");
        window.location.href = "/";
    };

    const getCompanyLabel = (companyValue) => {
        const company = COMPANIES.find(c => c.value === companyValue);
        return company ? company.label : companyValue;
    };

    return (
        <div className="dashboard-container">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            <main className="main-content">
                <header className="topbar">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <button className="hamburger-btn" onClick={toggleSidebar}>
                            <i className="fas fa-bars"></i>
                        </button>
                        <h1>Bills History</h1>
                    </div>
                    <div className="topbar-actions">
                        <span className="greeting">Hello, {getDisplayName()}</span>
                        <button className="logout-btn" onClick={handleLogout}>Logout</button>
                    </div>
                </header>

                <div className="content-area">
                    <div className="card-header" style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: 'var(--shadow-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <select
                                value={selectedCompany}
                                onChange={(e) => setSelectedCompany(e.target.value)}
                                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', minWidth: '200px', cursor: 'pointer' }}
                            >
                                {COMPANIES.map(company => (
                                    <option key={company.value} value={company.value}>
                                        {company.label}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="text"
                                placeholder="Search Invoice No (e.g. 00067)"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', minWidth: '250px' }}
                            />
                            <button type="submit" className="btn-primary" style={{ marginTop: 0 }}>Search</button>
                        </form>
                        <button className="btn-outline" onClick={() => fetchBills(page)} style={{ marginTop: 0 }}>
                            <i className="fas fa-sync"></i> Refresh
                        </button>
                    </div>

                    <div className="table-container shadow-md">
                        <table className="main-table">
                            <thead>
                                <tr>
                                    <th>Company</th>
                                    <th>Invoice No</th>
                                    <th>Date</th>
                                    <th>Customer</th>
                                    <th>Amount</th>
                                    <th style={{ textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>Loading...</td>
                                    </tr>
                                ) : bills.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>No bills found.</td>
                                    </tr>
                                ) : (
                                    bills.map(bill => (
                                        <tr key={bill.id}>
                                            <td style={{ fontSize: '0.85rem' }}>
                                                <span style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    backgroundColor: bill.company === 'RIZSAF_PVT_LTD' ? '#dcfce7' : '#dbeafe',
                                                    color: bill.company === 'RIZSAF_PVT_LTD' ? '#166534' : '#1e40af',
                                                    fontWeight: '500'
                                                }}>
                                                    {bill.company === 'RIZSAF_PVT_LTD' ? 'RPL' : 'RLS'}
                                                </span>
                                            </td>
                                            <td style={{ fontWeight: '600' }}>#{bill.invoiceNumber}</td>
                                            <td>{bill.invoiceDate}</td>
                                            <td>{bill.customerName}</td>
                                            <td style={{ fontWeight: 'bold' }}>₹{bill.grandTotal}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            const token = localStorage.getItem("jwtToken");
                                                            const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8080/api/";
                                                            const response = await axios.get(`${apiUrl.replace(/\/$/, "")}${bill.pdfUrl}`, {
                                                                headers: { Authorization: `Bearer ${token}` },
                                                                responseType: 'blob'
                                                            });

                                                            const url = window.URL.createObjectURL(new Blob([response.data]));
                                                            const link = document.createElement('a');
                                                            link.href = url;
                                                            link.setAttribute('download', `Invoice_${bill.invoiceNumber}.pdf`);
                                                            document.body.appendChild(link);
                                                            link.click();
                                                            link.remove();
                                                            window.URL.revokeObjectURL(url);
                                                        } catch (err) {
                                                            console.error("Download failed", err);
                                                            alert("Failed to download PDF");
                                                        }
                                                    }}
                                                    className="action-button"
                                                    style={{ textDecoration: 'none', background: '#3b82f6', display: 'inline-flex', alignItems: 'center', gap: '5px', border: 'none', cursor: 'pointer', color: 'white', padding: '6px 12px', borderRadius: '4px' }}
                                                >
                                                    <i className="fas fa-download"></i> Download
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination-container" style={{ marginTop: '20px', justifyContent: 'center' }}>
                            <button
                                className="pagination-btn"
                                disabled={page === 0}
                                onClick={() => fetchBills(page - 1)}
                            >
                                Previous
                            </button>
                            <span className="pagination-info">Page {page + 1} of {totalPages}</span>
                            <button
                                className="pagination-btn"
                                disabled={page === totalPages - 1}
                                onClick={() => fetchBills(page + 1)}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default BillsHistory;
