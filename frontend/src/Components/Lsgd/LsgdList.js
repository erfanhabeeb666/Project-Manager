import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../AdminSidebar';
import OfficeSidebar from '../OfficeSidebar';
import { getDisplayName } from '../../utils/auth';
import './LsgdList.css';

const LsgdList = ({ role }) => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Data States
    const [lsgds, setLsgds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pagination, setPagination] = useState({ page: 0, size: 10, totalPages: 0 });

    // Filter States
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [districtFilter, setDistrictFilter] = useState('');

    // Modal States
    const [showModal, setShowModal] = useState(false);
    const [currentLsgd, setCurrentLsgd] = useState(null); // null for add, object for edit
    const [modalLoading, setModalLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'GRAMA_PANCHAYAT',
        district: '',
        block: '',
        wardCount: 0,
        status: 'ACTIVE'
    });

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const fetchLsgds = useCallback(async (page = 0) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('jwtToken');
            const apiUrl = process.env.REACT_APP_API_URL;
            const baseUrl = apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`;

            const params = {
                page,
                size: pagination.size,
                search: search || undefined,
                type: typeFilter || undefined,
                district: districtFilter || undefined
            };

            const response = await axios.get(`${baseUrl}api/lsgds`, {
                headers: { Authorization: `Bearer ${token}` },
                params
            });

            if (response.data.success) {
                setLsgds(response.data.data.content);
                setPagination(prev => ({
                    ...prev,
                    page: response.data.data.number,
                    totalPages: response.data.data.totalPages
                }));
            }
        } catch (err) {
            console.error("Fetch Error", err);
            setError("Failed to fetch LSGDs");
        } finally {
            setLoading(false);
        }
    }, [pagination.size, search, typeFilter, districtFilter]);

    useEffect(() => {
        fetchLsgds(0);
    }, [fetchLsgds]);

    const handleSearch = (e) => {
        setSearch(e.target.value);
    };

    const handleOpenModal = (lsgd = null) => {
        if (lsgd) {
            setCurrentLsgd(lsgd);
            setFormData({
                name: lsgd.name,
                type: lsgd.type,
                district: lsgd.district,
                block: lsgd.block,
                wardCount: lsgd.wardCount,
                status: lsgd.status
            });
        } else {
            setCurrentLsgd(null);
            setFormData({
                name: '',
                type: 'GRAMA_PANCHAYAT',
                district: '',
                block: '',
                wardCount: 0,
                status: 'ACTIVE'
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setModalLoading(true);
        try {
            const token = localStorage.getItem('jwtToken');
            const apiUrl = process.env.REACT_APP_API_URL;
            const baseUrl = apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`;

            if (currentLsgd) {
                await axios.put(`${baseUrl}api/lsgds/${currentLsgd.id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(`${baseUrl}api/lsgds`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setShowModal(false);
            fetchLsgds(pagination.page);
        } catch (err) {
            console.error("Submit Error", err);
            alert("Operation failed check console");
        } finally {
            setModalLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this LSGD?")) return;
        try {
            const token = localStorage.getItem('jwtToken');
            const apiUrl = process.env.REACT_APP_API_URL;
            const baseUrl = apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`;

            await axios.delete(`${baseUrl}api/lsgds/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchLsgds(pagination.page);
        } catch (err) {
            console.error(err);
            alert("Delete failed");
        }
    };



    return (
        <div className="dashboard-container">
            {role === 'ADMIN' ? (
                <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            ) : (
                <OfficeSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            )}

            <main className="main-content">
                <header className="topbar">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <button className="hamburger-btn" onClick={toggleSidebar}>
                            <i className="fas fa-bars"></i>
                        </button>
                        <h1>LSGD Management</h1>
                    </div>
                    <div className="topbar-actions">
                        <span className="greeting">Hello, {getDisplayName()}</span>
                        <button className="logout-btn" onClick={() => navigate('/')}>Logout</button>
                    </div>
                </header>

                <section className="lsgd-container">
                    <div className="lsgd-controls">
                        <input
                            type="text"
                            placeholder="Search by Name/District/Block..."
                            className="search-input"
                            value={search}
                            onChange={handleSearch}
                        />
                        <select
                            className="filter-select"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="">All Types</option>
                            <option value="GRAMA_PANCHAYAT">Grama Panchayat</option>
                            <option value="MUNICIPALITY">Municipality</option>
                            <option value="CORPORATION">Corporation</option>
                            <option value="BLOCK_PANCHAYAT">Block Panchayat</option>
                            <option value="DISTRICT_PANCHAYAT">District Panchayat</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Filter District"
                            className="filter-select"
                            value={districtFilter}
                            onChange={(e) => setDistrictFilter(e.target.value)}
                        />
                        {role === 'OFFICE_STAFF' && (
                            <button className="add-btn" onClick={() => handleOpenModal()}>
                                <i className="fas fa-plus"></i> Add LSGD
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="loading-spinner">Loading...</div>
                    ) : error ? (
                        <div className="error-alert">{error}</div>
                    ) : (
                        <div className="lsgd-table-card">
                            <table className="lsgd-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Type</th>
                                        <th>District</th>
                                        <th>Block</th>
                                        <th>Wards</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lsgds.map((lsgd) => (
                                        <tr key={lsgd.id}>
                                            <td>{lsgd.name}</td>
                                            <td>{lsgd.type.replace('_', ' ')}</td>
                                            <td>{lsgd.district}</td>
                                            <td>{lsgd.block}</td>
                                            <td>{lsgd.wardCount || '-'}</td>
                                            <td>
                                                <span className={`status-badge ${lsgd.status === 'ACTIVE' ? 'status-active' : 'status-inactive'
                                                    }`}>
                                                    {lsgd.status}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="action-btn btn-view"
                                                    onClick={() => navigate((role === 'ADMIN' ? '/admin/lsgds/' : '/office-staff/lsgds/') + lsgd.id)}
                                                    title="View Details"
                                                >
                                                    <i className="fas fa-eye"></i>
                                                </button>
                                                {role === 'OFFICE_STAFF' && (
                                                    <>
                                                        <button
                                                            className="action-btn btn-edit"
                                                            onClick={() => handleOpenModal(lsgd)}
                                                            title="Edit"
                                                        >
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                        <button
                                                            className="action-btn btn-delete"
                                                            onClick={() => handleDelete(lsgd.id)}
                                                            title="Delete"
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {lsgds.length === 0 && (
                                        <tr>
                                            <td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>
                                                No LSGDs found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            <div className="pagination">
                                <button
                                    className="page-btn"
                                    disabled={pagination.page === 0}
                                    onClick={() => fetchLsgds(pagination.page - 1)}
                                >
                                    Previous
                                </button>
                                <span style={{ alignSelf: 'center' }}>
                                    Page {pagination.page + 1} of {pagination.totalPages || 1}
                                </span>
                                <button
                                    className="page-btn"
                                    disabled={pagination.page >= pagination.totalPages - 1}
                                    onClick={() => fetchLsgds(pagination.page + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </section>

                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <h3>{currentLsgd ? 'Edit LSGD' : 'Add LSGD'}</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Type</label>
                                    <select
                                        className="form-control"
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="GRAMA_PANCHAYAT">Grama Panchayat</option>
                                        <option value="MUNICIPALITY">Municipality</option>
                                        <option value="CORPORATION">Corporation</option>
                                        <option value="BLOCK_PANCHAYAT">Block Panchayat</option>
                                        <option value="DISTRICT_PANCHAYAT">District Panchayat</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>District</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        required
                                        value={formData.district}
                                        onChange={e => setFormData({ ...formData, district: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Block</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        required
                                        value={formData.block}
                                        onChange={e => setFormData({ ...formData, block: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Ward Count</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={formData.wardCount}
                                        onChange={e => setFormData({ ...formData, wardCount: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select
                                        className="form-control"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="ACTIVE">Active</option>
                                        <option value="INACTIVE">Inactive</option>
                                    </select>
                                </div>
                                <div className="form-actions">
                                    <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn-submit" disabled={modalLoading}>
                                        {modalLoading ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div >
    );
};

export default LsgdList;
