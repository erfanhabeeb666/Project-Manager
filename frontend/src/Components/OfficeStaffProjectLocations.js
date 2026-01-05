import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { getDisplayName } from "../utils/auth";
import "./Styles/Main.css";
import "./Styles/Admin.css";
import "./Styles/Sidebar.css";
import "./Styles/OfficeStaff.css";
import OfficeSidebar from "./OfficeSidebar";

const OfficeStaffProjectLocations = () => {
    const navigate = useNavigate();
    const { projectId } = useParams();
    const apiUrl = process.env.REACT_APP_API_URL || "";

    const [project, setProject] = useState(null);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Form State
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        name: "",
        address: "",
        googleMapLink: "",
        latitude: "",
        longitude: "",
    });
    const [submitting, setSubmitting] = useState(false);

    const authHeaders = () => {
        const token = localStorage.getItem("jwtToken");
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const handleLogout = useCallback(() => {
        localStorage.removeItem("jwtToken");
        navigate("/");
    }, [navigate]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const [projectRes, locationsRes] = await Promise.all([
                axios.get(`${apiUrl}office-staff/projects/${projectId}`, {
                    headers: authHeaders(),
                }),
                axios.get(`${apiUrl}office-staff/projects/${projectId}/locations`, {
                    headers: authHeaders(),
                }),
            ]);

            setProject(projectRes.data?.data);
            setLocations(locationsRes.data?.data || []);
        } catch (err) {
            console.error(err);
            setError("Failed to load data. Please try again.");
            if (err.response?.status === 401) handleLogout();
        } finally {
            setLoading(false);
        }
    }, [apiUrl, projectId, handleLogout]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await axios.post(
                `${apiUrl}office-staff/projects/${projectId}/locations`,
                form,
                { headers: authHeaders() }
            );
            setForm({ name: "", address: "", googleMapLink: "", latitude: "", longitude: "" });
            setShowModal(false);
            fetchData(); // Refresh list
        } catch (err) {
            console.error(err);
            alert("Failed to add location.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (locationId) => {
        if (!window.confirm("Are you sure you want to delete this location?")) return;
        try {
            await axios.delete(`${apiUrl}office-staff/locations/${locationId}`, {
                headers: authHeaders(),
            });
            fetchData();
        } catch (err) {
            console.error(err);
            alert("Failed to delete location.");
        }
    };

    if (loading && !project) {
        return <div className="loading-spinner">Loading...</div>;
    }

    return (
        <div className="dashboard-container">
            <OfficeSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            <main className="main-content">
                <header className="topbar">
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <button className="hamburger-btn" onClick={toggleSidebar}>
                            <i className="fas fa-bars"></i>
                        </button>
                        <div className="breadcrumbs">
                            <span onClick={() => navigate("/office-staff/projects")} style={{ cursor: 'pointer', color: '#666' }}>Projects</span>
                            <span className="separator"> / </span>
                            <span onClick={() => navigate(`/office-staff/projects/${projectId}`)} style={{ cursor: 'pointer', color: '#666', fontWeight: 600 }}>{project?.name || "Project"}</span>
                            <span className="separator"> / </span>
                            <span className="current">Site Locations</span>
                        </div>
                    </div>
                    <div className="topbar-actions">
                        <span className="greeting">Hello, {getDisplayName()}</span>
                        <button className="logout-btn" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </header>

                <section className="content-area office-staff-content">
                    <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2>Site Locations</h2>
                        <button onClick={() => setShowModal(true)}>+ Add Location</button>
                    </div>

                    {error && <p className="error-text">{error}</p>}

                    <div className="locations-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '20px'
                    }}>
                        {locations.length === 0 ? (
                            <p className="muted-text">No locations added yet.</p>
                        ) : (
                            locations.map(loc => (
                                <div key={loc.id} className="office-card" style={{ padding: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <h3 style={{ margin: '0 0 10px 0' }}>{loc.name}</h3>
                                        <button className="btn-icon" onClick={() => handleDelete(loc.id)} style={{ color: 'red' }}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                    <p style={{ marginBottom: '10px' }}><strong>Address:</strong><br />{loc.address || "-"}</p>
                                    {loc.googleMapLink ? (
                                        <p className="muted-text" style={{ fontSize: '0.9em' }}>
                                            <a
                                                href={loc.googleMapLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ color: '#007bff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}
                                            >
                                                <i className="fas fa-map-marker-alt"></i> View on Google Maps
                                            </a>
                                        </p>
                                    ) : loc.latitude && loc.longitude ? (
                                        <p className="muted-text" style={{ fontSize: '0.9em' }}>
                                            <i className="fas fa-map-marker-alt"></i> {loc.latitude}, {loc.longitude}
                                        </p>
                                    ) : (
                                        <p className="muted-text" style={{ fontSize: '0.9em' }}>No location data</p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {showModal && (
                        <div className="modal-overlay">
                            <div className="form-container">
                                <div className="card-header">
                                    <div>
                                        <p className="card-eyebrow">Add</p>
                                        <h3>New Location</h3>
                                    </div>
                                </div>
                                <form onSubmit={handleSubmit} className="form-grid">
                                    <label>
                                        Name *
                                        <input
                                            type="text"
                                            name="name"
                                            value={form.name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </label>
                                    <label>
                                        Address
                                        <textarea
                                            name="address"
                                            value={form.address}
                                            onChange={handleInputChange}
                                            rows={3}
                                        />
                                    </label>
                                    <label>
                                        Google Map Link
                                        <input
                                            type="text"
                                            placeholder="Paste Google Maps URL here"
                                            onChange={(e) => {
                                                const url = e.target.value;
                                                // Regex to capture @lat,long or q=lat,long
                                                // Common formats:
                                                // .../maps/place/.../@10.0213,76.1233,15z
                                                // .../maps?q=10.0213,76.1233
                                                let lat = "";
                                                let lng = "";

                                                // Try matching @lat,lng
                                                const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
                                                if (atMatch) {
                                                    lat = atMatch[1];
                                                    lng = atMatch[2];
                                                } else {
                                                    // Try matching q=lat,long
                                                    const qMatch = url.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
                                                    if (qMatch) {
                                                        lat = qMatch[1];
                                                        lng = qMatch[2];
                                                    }
                                                }

                                                let updates = { googleMapLink: url };
                                                if (lat && lng) {
                                                    updates = {
                                                        ...updates,
                                                        latitude: lat,
                                                        longitude: lng
                                                    };
                                                }
                                                setForm(prev => ({ ...prev, ...updates }));
                                            }}
                                        />
                                        <small className="muted-text" style={{ display: 'block', marginTop: '4px' }}>
                                            Paste a full Google Maps link to auto-fill coordinates.
                                        </small>
                                    </label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <label style={{ flex: 1 }}>
                                            Latitude
                                            <input
                                                type="text"
                                                name="latitude"
                                                value={form.latitude}
                                                onChange={handleInputChange}
                                                placeholder="e.g. 10.0123"
                                            />
                                        </label>
                                        <label style={{ flex: 1 }}>
                                            Longitude
                                            <input
                                                type="text"
                                                name="longitude"
                                                value={form.longitude}
                                                onChange={handleInputChange}
                                                placeholder="e.g. 76.1234"
                                            />
                                        </label>
                                    </div>
                                    <div className="form-actions full-width">
                                        <button type="submit" disabled={submitting}>
                                            {submitting ? "Adding..." : "Add Location"}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-cancel"
                                            onClick={() => setShowModal(false)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                </section>
            </main>
        </div>
    );
};

export default OfficeStaffProjectLocations;
