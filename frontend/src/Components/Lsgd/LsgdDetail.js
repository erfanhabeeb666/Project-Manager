import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import AdminSidebar from '../AdminSidebar';
import OfficeSidebar from '../OfficeSidebar';
import { getDisplayName } from '../../utils/auth';
import './LsgdList.css'; // Reuse table/layout styles
import './LsgdDetail.css';

const LsgdDetail = ({ role }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // LSGD State
    const [lsgd, setLsgd] = useState(null);
    const [lsgdLoading, setLsgdLoading] = useState(true);

    // Contacts State
    const [contacts, setContacts] = useState([]);
    const [contactsLoading, setContactsLoading] = useState(false);
    const [contactsPagination, setContactsPagination] = useState({ page: 0, size: 10, totalPages: 0 });
    const [activeTab, setActiveTab] = useState('contacts');

    // Contact Filters
    const [contactSearch, setContactSearch] = useState('');
    const [filterVerified, setFilterVerified] = useState(''); // '' | 'true' | 'false'
    const [filterSource, setFilterSource] = useState('');

    // Contact Modal
    const [showContactModal, setShowContactModal] = useState(false);
    const [currentContact, setCurrentContact] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [contactForm, setContactForm] = useState({
        personName: '',
        designation: '',
        department: '',
        primaryPhone: '',
        secondaryPhone: '',
        whatsappNumber: '',
        email: '',
        remarks: '',
        source: 'OFFICIAL_LIST',
        verified: false
    });

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const fetchLsgd = useCallback(async () => {
        try {
            setLsgdLoading(true);
            const token = localStorage.getItem('jwtToken');
            const apiUrl = process.env.REACT_APP_API_URL;
            const baseUrl = apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`;

            const response = await axios.get(`${baseUrl}api/lsgds/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setLsgd(response.data.data);
            }
        } catch (err) {
            console.error("Fetch LSGD Error", err);
            // navigate back or show error
        } finally {
            setLsgdLoading(false);
        }
    }, [id]);

    const fetchContacts = useCallback(async (page = 0) => {
        try {
            setContactsLoading(true);
            const token = localStorage.getItem('jwtToken');
            const apiUrl = process.env.REACT_APP_API_URL;
            const baseUrl = apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`;

            const params = {
                page,
                size: contactsPagination.size,
                search: contactSearch || undefined,
                verified: filterVerified === '' ? undefined : (filterVerified === 'true'),
                source: filterSource || undefined
            };

            const response = await axios.get(`${baseUrl}api/lsgds/${id}/contacts`, {
                headers: { Authorization: `Bearer ${token}` },
                params
            });

            if (response.data.success) {
                setContacts(response.data.data.content);
                setContactsPagination(prev => ({
                    ...prev,
                    page: response.data.data.number,
                    totalPages: response.data.data.totalPages
                }));
            }
        } catch (err) {
            console.error("Fetch Contacts Error", err);
        } finally {
            setContactsLoading(false);
        }
    }, [id, contactsPagination.size, contactSearch, filterVerified, filterSource]);

    useEffect(() => {
        fetchLsgd();
    }, [fetchLsgd]);

    useEffect(() => {
        if (activeTab === 'contacts') {
            fetchContacts(0);
        }
    }, [fetchContacts, activeTab]);

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setModalLoading(true);
        try {
            const token = localStorage.getItem('jwtToken');
            const apiUrl = process.env.REACT_APP_API_URL;
            const baseUrl = apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`;

            if (currentContact) {
                await axios.put(`${baseUrl}api/contacts/${currentContact.id}`, contactForm, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(`${baseUrl}api/lsgds/${id}/contacts`, contactForm, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setShowContactModal(false);
            fetchContacts(contactsPagination.page);
        } catch (err) {
            console.error("Contact Submit Error", err);
            alert(err?.response?.data?.message || "Operation failed");
        } finally {
            setModalLoading(false);
        }
    };

    const handleCreateContact = () => {
        setCurrentContact(null);
        setContactForm({
            personName: '',
            designation: '',
            department: '',
            primaryPhone: '',
            secondaryPhone: '',
            whatsappNumber: '',
            email: '',
            remarks: '',
            source: 'OFFICIAL_LIST',
            verified: false
        });
        setShowContactModal(true);
    };

    const handleEditContact = (contact) => {
        setCurrentContact(contact);
        setContactForm({
            personName: contact.personName,
            designation: contact.designation || '',
            department: contact.department || '',
            primaryPhone: contact.primaryPhone,
            secondaryPhone: contact.secondaryPhone || '',
            whatsappNumber: contact.whatsappNumber || '',
            email: contact.email || '',
            remarks: contact.remarks || '',
            source: contact.source,
            verified: contact.verified
        });
        setShowContactModal(true);
    };

    const handleDeleteContact = async (contactId) => {
        if (!window.confirm("Are you sure you want to delete this contact?")) return;
        try {
            const token = localStorage.getItem('jwtToken');
            const apiUrl = process.env.REACT_APP_API_URL;
            const baseUrl = apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`;

            await axios.delete(`${baseUrl}api/contacts/${contactId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchContacts(contactsPagination.page);
        } catch (err) {
            console.error("Delete Contact Error", err);
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
                        <h1>LSGD Details</h1>
                    </div>
                    <div className="topbar-actions">
                        <span className="greeting">Hello, {getDisplayName()}</span>
                        <button className="logout-btn" onClick={() => navigate('/')}>Logout</button>
                    </div>
                </header>

                <section className="lsgd-container">
                    <button className="add-btn" style={{ marginBottom: '20px', background: 'transparent', color: '#64748b', border: '1px solid #e2e8f0' }} onClick={() => navigate(role === 'ADMIN' ? '/admin/lsgds' : '/office-staff/lsgds')}>
                        <i className="fas fa-arrow-left"></i> Back to List
                    </button>

                    {lsgdLoading ? (
                        <div className="loading-spinner">Loading LSGD...</div>
                    ) : lsgd ? (
                        <>
                            <div className="detail-card">
                                <div className="detail-header">
                                    <h2 style={{ fontSize: '1.8rem', color: '#1e293b' }}>{lsgd.name}</h2>
                                    <span className={`status-badge ${lsgd.status === 'ACTIVE' ? 'status-active' : 'status-inactive'}`}>
                                        {lsgd.status}
                                    </span>
                                </div>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <label>Type</label>
                                        <span>{lsgd.type?.replace('_', ' ')}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>District</label>
                                        <span>{lsgd.district}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Block</label>
                                        <span>{lsgd.block}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Ward Count</label>
                                        <span>{lsgd.wardCount || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="tabs">
                                <button
                                    className={`tab-btn ${activeTab === 'contacts' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('contacts')}
                                >
                                    Contacts
                                </button>
                                <button
                                    className={`tab-btn ${activeTab === 'metadata' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('metadata')}
                                >
                                    Metadata
                                </button>
                            </div>

                            {activeTab === 'contacts' && (
                                <div>
                                    <div className="lsgd-controls">
                                        <input
                                            type="text"
                                            placeholder="Search Name/Phone..."
                                            className="search-input"
                                            value={contactSearch}
                                            onChange={e => setContactSearch(e.target.value)}
                                        />
                                        <select
                                            className="filter-select"
                                            value={filterVerified}
                                            onChange={e => setFilterVerified(e.target.value)}
                                        >
                                            <option value="">Verified: All</option>
                                            <option value="true">Yes</option>
                                            <option value="false">No</option>
                                        </select>
                                        <select
                                            className="filter-select"
                                            value={filterSource}
                                            onChange={e => setFilterSource(e.target.value)}
                                        >
                                            <option value="">Source: All</option>
                                            <option value="OFFICIAL_LIST">Official List</option>
                                            <option value="FIELD_COLLECTION">Field Collection</option>
                                            <option value="REFERRAL">Referral</option>
                                        </select>
                                        {role === 'OFFICE_STAFF' && (
                                            <button className="add-btn" onClick={handleCreateContact}>
                                                <i className="fas fa-plus"></i> Add Contact
                                            </button>
                                        )}
                                    </div>

                                    {contactsLoading ? (
                                        <div className="loading-spinner">Loading Contacts...</div>
                                    ) : (
                                        <div className="lsgd-table-card">
                                            <table className="lsgd-table">
                                                <thead>
                                                    <tr>
                                                        <th>Name</th>
                                                        <th>Designation</th>
                                                        <th>Phone</th>
                                                        <th>Verified</th>
                                                        <th>Source</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {contacts.map(contact => (
                                                        <tr key={contact.id}>
                                                            <td>
                                                                <div style={{ fontWeight: 500 }}>{contact.personName}</div>
                                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{contact.department}</div>
                                                            </td>
                                                            <td>{contact.designation || '-'}</td>
                                                            <td>
                                                                <div>{contact.primaryPhone}</div>
                                                                {contact.secondaryPhone && <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{contact.secondaryPhone}</div>}
                                                            </td>
                                                            <td>
                                                                {contact.verified ?
                                                                    <span className="badge-verified"><i className="fas fa-check-circle"></i> Verified</span> :
                                                                    <span className="badge-unverified">Unverified</span>
                                                                }
                                                            </td>
                                                            <td style={{ fontSize: '0.85rem' }}>{contact.source?.replace('_', ' ')}</td>
                                                            <td>
                                                                {role === 'OFFICE_STAFF' && (
                                                                    <>
                                                                        <button
                                                                            className="action-btn btn-edit"
                                                                            onClick={() => handleEditContact(contact)}
                                                                            title="Edit"
                                                                        >
                                                                            <i className="fas fa-edit"></i>
                                                                        </button>
                                                                        <button
                                                                            className="action-btn btn-delete"
                                                                            onClick={() => handleDeleteContact(contact.id)}
                                                                            title="Delete"
                                                                        >
                                                                            <i className="fas fa-trash"></i>
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {contacts.length === 0 && (
                                                        <tr>
                                                            <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>
                                                                No contacts found.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                            <div className="pagination">
                                                <button
                                                    className="page-btn"
                                                    disabled={contactsPagination.page === 0}
                                                    onClick={() => fetchContacts(contactsPagination.page - 1)}
                                                >
                                                    Previous
                                                </button>
                                                <span style={{ alignSelf: 'center' }}>
                                                    Page {contactsPagination.page + 1} of {contactsPagination.totalPages || 1}
                                                </span>
                                                <button
                                                    className="page-btn"
                                                    disabled={contactsPagination.page >= contactsPagination.totalPages - 1}
                                                    onClick={() => fetchContacts(contactsPagination.page + 1)}
                                                >
                                                    Next
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'metadata' && (
                                <div className="detail-card">
                                    <div className="detail-item">
                                        <label>Created At</label>
                                        <span>{new Date(lsgd.createdAt).toLocaleString()}</span>
                                    </div>
                                    <div className="detail-item" style={{ marginTop: '20px' }}>
                                        <label>Last Updated</label>
                                        <span>{new Date(lsgd.updatedAt).toLocaleString()}</span>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="error-alert">LSGD not found</div>
                    )}
                </section>

                {showContactModal && (
                    <div className="modal-overlay" onClick={() => setShowContactModal(false)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                            <h3>{currentContact ? 'Edit Contact' : 'Add Contact'}</h3>
                            <form onSubmit={handleContactSubmit}>
                                <div className="detail-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div className="form-group">
                                        <label>Person Name *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            required
                                            value={contactForm.personName}
                                            onChange={e => setContactForm({ ...contactForm, personName: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Primary Phone *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            required
                                            value={contactForm.primaryPhone}
                                            onChange={e => setContactForm({ ...contactForm, primaryPhone: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Designation</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={contactForm.designation}
                                            onChange={e => setContactForm({ ...contactForm, designation: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Department</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={contactForm.department}
                                            onChange={e => setContactForm({ ...contactForm, department: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Secondary Phone</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={contactForm.secondaryPhone}
                                            onChange={e => setContactForm({ ...contactForm, secondaryPhone: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>WhatsApp</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={contactForm.whatsappNumber}
                                            onChange={e => setContactForm({ ...contactForm, whatsappNumber: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={contactForm.email}
                                            onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Source</label>
                                        <select
                                            className="form-control"
                                            value={contactForm.source}
                                            onChange={e => setContactForm({ ...contactForm, source: e.target.value })}
                                        >
                                            <option value="OFFICIAL_LIST">Official List</option>
                                            <option value="FIELD_COLLECTION">Field Collection</option>
                                            <option value="REFERRAL">Referral</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Remarks</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        value={contactForm.remarks}
                                        onChange={e => setContactForm({ ...contactForm, remarks: e.target.value })}
                                    ></textarea>
                                </div>
                                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input
                                        type="checkbox"
                                        id="verifiedCheck"
                                        checked={contactForm.verified}
                                        onChange={e => setContactForm({ ...contactForm, verified: e.target.checked })}
                                        style={{ width: '20px', height: '20px' }}
                                    />
                                    <label htmlFor="verifiedCheck" style={{ marginBottom: 0 }}>Verified Contact</label>
                                </div>

                                <div className="form-actions">
                                    <button type="button" className="btn-cancel" onClick={() => setShowContactModal(false)}>Cancel</button>
                                    <button type="submit" className="btn-submit" disabled={modalLoading}>
                                        {modalLoading ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default LsgdDetail;
