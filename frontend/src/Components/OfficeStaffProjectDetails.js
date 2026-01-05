import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getDisplayName } from "../utils/auth";
import "./Styles/Main.css";
import "./Styles/Admin.css";
import "./Styles/Sidebar.css";
import "./Styles/OfficeStaff.css";
import OfficeSidebar from "./OfficeSidebar";

const PROJECT_STAGE_OPTIONS = [
    "TENDER_PREPARATION",
    "TENDER_SUBMITTED",
    "TENDER_WON",
    "TENDER_LOST",
    "WORK_STARTED",
    "WORK_IN_PROGRESS",
    "BILL_PREPARATION",
    "BILL_SUBMITTED",
    "PAYMENT_RECEIVED",
    "PROJECT_CLOSED",
];

const ACTION_STATUS_OPTIONS = ["PENDING", "COMPLETED"];
const EXPENSE_TYPES = ["VISIT", "MATERIAL"];

const initialActionForm = {
    title: "",
    actionDate: "",
    notes: "",
};

const initialExpenseForm = {
    type: EXPENSE_TYPES[0],
    date: "",
    description: "",
    items: [{ particular: "", quantity: "", rate: "" }],
    workerIds: [],
};

const OfficeStaffProjectDetails = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_URL || "";

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Forms state
    const [stageForm, setStageForm] = useState({ stage: "", notes: "" });
    const [stageSubmitting, setStageSubmitting] = useState(false);
    const [stageSuccess, setStageSuccess] = useState("");
    const [stageError, setStageError] = useState("");

    const [actionForm, setActionForm] = useState(() => ({ ...initialActionForm }));
    const [actionSubmitting, setActionSubmitting] = useState(false);
    const [actionSuccess, setActionSuccess] = useState("");
    const [actionError, setActionError] = useState("");
    const [actionStatusLoading, setActionStatusLoading] = useState({});

    const [expenseForm, setExpenseForm] = useState(() => ({ ...initialExpenseForm }));
    const [expenseSubmitting, setExpenseSubmitting] = useState(false);
    const [expenseSuccess, setExpenseSuccess] = useState("");
    const [expenseError, setExpenseError] = useState("");
    const [workers, setWorkers] = useState([]);
    const [workersLoading, setWorkersLoading] = useState(false);

    const [updateForm, setUpdateForm] = useState({
        expectedEndDate: "",
        sanctionedAmount: "",
    });
    const [updateFormErrors, setUpdateFormErrors] = useState({});
    const [updateFormSuccess, setUpdateFormSuccess] = useState("");
    const [updateSubmitting, setUpdateSubmitting] = useState(false);

    // Document Management State
    const [documents, setDocuments] = useState([]);
    const [documentsLoading, setDocumentsLoading] = useState(false);
    const [documentsError, setDocumentsError] = useState("");
    const [documentSearchTerm, setDocumentSearchTerm] = useState("");
    const [documentUploadForm, setDocumentUploadForm] = useState({
        title: "",
        description: "",
        file: null,
    });
    const [documentUploading, setDocumentUploading] = useState(false);
    const [documentUploadSuccess, setDocumentUploadSuccess] = useState("");
    const [documentUploadError, setDocumentUploadError] = useState("");

    // Modals
    const [showUpdateProjectModal, setShowUpdateProjectModal] = useState(false);
    const [showChangeStageModal, setShowChangeStageModal] = useState(false);
    const [showLogActionModal, setShowLogActionModal] = useState(false);
    const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
    const [showUploadDocumentModal, setShowUploadDocumentModal] = useState(false);
    const [viewingExpense, setViewingExpense] = useState(null);
    const [viewingDocument, setViewingDocument] = useState(null);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const authHeaders = () => {
        const token = localStorage.getItem("jwtToken");
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const handleLogout = useCallback(() => {
        localStorage.removeItem("jwtToken");
        navigate("/");
    }, [navigate]);

    const requireAuth = useCallback(() => {
        const token = localStorage.getItem("jwtToken");
        if (!token) {
            handleLogout();
        }
    }, [handleLogout]);

    const handleApiError = useCallback(
        (error, setMessage) => {
            const status = error?.response?.status;
            const serverMessage =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                "Something went wrong";
            if (setMessage) {
                setMessage(serverMessage);
            }
            if (status === 401 || status === 403) {
                handleLogout();
            }
        },
        [handleLogout]
    );

    const formatCurrency = (value) => {
        if (value === null || value === undefined) return "-";
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2,
        }).format(value);
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return "—";
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    };

    const getFileIcon = (contentType) => {
        if (!contentType) return "📄";
        if (contentType.startsWith("image/")) return "🖼️";
        if (contentType.includes("pdf")) return "📕";
        if (contentType.includes("word") || contentType.includes("document")) return "📝";
        if (contentType.includes("excel") || contentType.includes("spreadsheet")) return "📊";
        if (contentType.includes("powerpoint") || contentType.includes("presentation")) return "📽️";
        if (contentType.includes("zip") || contentType.includes("rar") || contentType.includes("archive")) return "🗜️";
        return "📄";
    };

    const renderStatusBadge = (status) => (
        <span
            className={`status-badge ${status === "COMPLETED" ? "status-complete" : "status-pending"
                }`}
        >
            {status || "PENDING"}
        </span>
    );

    const fetchWorkers = useCallback(async () => {
        requireAuth();
        setWorkersLoading(true);
        try {
            const response = await axios.get(
                `${apiUrl}office-staff/workers`,
                { headers: authHeaders() }
            );
            setWorkers(response?.data?.data ?? []);
        } catch (error) {
            console.error("Failed to fetch workers", error);
        } finally {
            setWorkersLoading(false);
        }
    }, [apiUrl, requireAuth]);

    const fetchProject = useCallback(async () => {
        if (!projectId) return;
        requireAuth();
        setLoading(true);
        setError("");
        try {
            const response = await axios.get(
                `${apiUrl}office-staff/projects/${projectId}`,
                { headers: authHeaders() }
            );
            const data = response.data?.data;
            setProject(data || null);

            if (data) {
                setStageForm({
                    stage: data.stage || "",
                    notes: "",
                });
                setUpdateForm({
                    expectedEndDate: data.expectedEndDate || "",
                    sanctionedAmount: data.sanctionedAmount
                        ? String(data.sanctionedAmount)
                        : "",
                });
            }
        } catch (error) {
            handleApiError(error, setError);
        } finally {
            setLoading(false);
        }
    }, [projectId, apiUrl, requireAuth, handleApiError]);

    // Document Management
    const fetchDocuments = useCallback(async (search = "") => {
        if (!projectId) return;
        requireAuth();
        setDocumentsLoading(true);
        setDocumentsError("");
        try {
            const params = search ? { search } : {};
            const response = await axios.get(
                `${apiUrl}office-staff/projects/${projectId}/documents`,
                { headers: authHeaders(), params }
            );
            setDocuments(response.data?.data || []);
        } catch (error) {
            handleApiError(error, setDocumentsError);
        } finally {
            setDocumentsLoading(false);
        }
    }, [apiUrl, projectId, requireAuth, handleApiError]);

    useEffect(() => {
        fetchProject();
        fetchDocuments();
    }, [fetchProject, fetchDocuments]);

    // Update Logic
    const handleUpdateFormChange = (e) => {
        const { name, value } = e.target;
        setUpdateForm((prev) => ({ ...prev, [name]: value }));
        setUpdateFormErrors((prev) => ({ ...prev, [name]: "" }));
        setUpdateFormSuccess("");
    };

    const validateUpdateForm = () => {
        const errors = {};
        if (
            updateForm.sanctionedAmount &&
            Number(updateForm.sanctionedAmount) < 0
        ) {
            errors.sanctionedAmount = "Amount must be positive";
        }
        setUpdateFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const submitUpdate = async (e) => {
        e.preventDefault();
        if (!project) return;
        setUpdateFormSuccess("");
        if (!validateUpdateForm()) return;
        requireAuth();
        setUpdateSubmitting(true);
        try {
            const payload = {
                expectedEndDate: updateForm.expectedEndDate || null,
                sanctionedAmount: updateForm.sanctionedAmount
                    ? Number(updateForm.sanctionedAmount)
                    : null,
            };
            await axios.put(
                `${apiUrl}office-staff/projects/${project.id}`,
                payload,
                { headers: authHeaders() }
            );
            setUpdateFormSuccess("Project updated successfully");
            setShowUpdateProjectModal(false);
            await fetchProject();
        } catch (error) {
            handleApiError(error, (message) => {
                setUpdateFormErrors((prev) => ({
                    ...prev,
                    form: message,
                }));
            });
        } finally {
            setUpdateSubmitting(false);
        }
    };

    // Stage Logic
    const submitStageChange = async (e) => {
        e.preventDefault();
        if (!project) return;
        requireAuth();
        setStageSubmitting(true);
        setStageSuccess("");
        setStageError("");
        try {
            await axios.put(
                `${apiUrl}office-staff/projects/${project.id}/stage`,
                {
                    stage: stageForm.stage,
                    notes: stageForm.notes || null,
                },
                { headers: authHeaders() }
            );
            setStageSuccess("Stage updated");
            setStageForm((prev) => ({ ...prev, notes: "" }));
            setShowChangeStageModal(false);
            await fetchProject();
        } catch (error) {
            handleApiError(error, setStageError);
        } finally {
            setStageSubmitting(false);
        }
    };

    // Action Logic
    const submitAction = async (e) => {
        e.preventDefault();
        if (!project) return;
        if (!actionForm.title.trim() || !actionForm.actionDate) {
            setActionError("Title and action date are required");
            return;
        }
        requireAuth();
        setActionSubmitting(true);
        setActionSuccess("");
        setActionError("");
        try {
            const payload = {
                title: actionForm.title.trim(),
                actionDate: actionForm.actionDate,
                notes: actionForm.notes?.trim() || null,
            };
            await axios.post(
                `${apiUrl}office-staff/projects/${project.id}/actions`,
                payload,
                { headers: authHeaders() }
            );
            setActionSuccess("Action added");
            setActionForm({ ...initialActionForm });
            setShowLogActionModal(false);
            await fetchProject();
        } catch (error) {
            handleApiError(error, setActionError);
        } finally {
            setActionSubmitting(false);
        }
    };

    const updateActionStatus = async (actionId, status) => {
        if (!project) return;
        requireAuth();
        setActionStatusLoading((prev) => ({ ...prev, [actionId]: true }));
        try {
            await axios.put(
                `${apiUrl}office-staff/projects/${project.id}/actions/${actionId}`,
                {},
                {
                    headers: authHeaders(),
                    params: { status },
                }
            );
            await fetchProject();
        } catch (error) {
            handleApiError(error, setActionError);
        } finally {
            setActionStatusLoading((prev) => ({ ...prev, [actionId]: false }));
        }
    };

    // Expense Logic
    const handleExpenseFormChange = (e) => {
        const { name, value } = e.target;
        setExpenseForm((prev) => ({ ...prev, [name]: value }));
        setExpenseError("");
        setExpenseSuccess("");
    };

    const handleExpenseItemChange = (index, field, value) => {
        setExpenseForm((prev) => {
            const newItems = [...prev.items];
            newItems[index] = { ...newItems[index], [field]: value };
            return { ...prev, items: newItems };
        });
        setExpenseError("");
    };

    const addExpenseItem = () => {
        setExpenseForm((prev) => ({
            ...prev,
            items: [...prev.items, { particular: "", quantity: "", rate: "" }],
        }));
    };

    const removeExpenseItem = (index) => {
        if (expenseForm.items.length > 1) {
            setExpenseForm((prev) => ({
                ...prev,
                items: prev.items.filter((_, i) => i !== index),
            }));
        }
    };

    const submitExpense = async (e) => {
        e.preventDefault();
        if (!project) return;
        if (!expenseForm.type || !expenseForm.date) {
            setExpenseError("Type and date are required");
            return;
        }
        if (!expenseForm.items || expenseForm.items.length === 0) {
            setExpenseError("At least one expense item is required");
            return;
        }
        requireAuth();
        setExpenseSubmitting(true);
        setExpenseSuccess("");
        setExpenseError("");
        try {
            const items = expenseForm.items
                .filter(
                    (item) =>
                        item.particular?.trim() &&
                        item.quantity !== "" &&
                        item.rate !== ""
                )
                .map((item) => ({
                    particular: item.particular.trim(),
                    quantity: Number(item.quantity) || 0,
                    rate: Number(item.rate) || 0,
                }));

            if (items.length === 0) {
                setExpenseError("At least one valid expense item is required");
                setExpenseSubmitting(false);
                return;
            }

            const payload = {
                type: expenseForm.type,
                projectId: project.id,
                date: expenseForm.date,
                description: expenseForm.description?.trim() || null,
                items: items,
                workerIds: expenseForm.type === "VISIT" && expenseForm.workerIds?.length > 0
                    ? expenseForm.workerIds
                    : null,
            };
            await axios.post(
                `${apiUrl}office-staff/expenses`,
                payload,
                { headers: authHeaders() }
            );
            setExpenseSuccess("Expense added successfully");
            setExpenseForm({ ...initialExpenseForm });
            setShowAddExpenseModal(false);
            await fetchProject();
        } catch (error) {
            handleApiError(error, setExpenseError);
        } finally {
            setExpenseSubmitting(false);
        }
    };

    // Document Logic
    const handleDocumentUploadFormChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "file") {
            setDocumentUploadForm((prev) => ({ ...prev, file: files[0] || null }));
        } else {
            setDocumentUploadForm((prev) => ({ ...prev, [name]: value }));
        }
        setDocumentUploadError("");
        setDocumentUploadSuccess("");
    };

    const submitDocumentUpload = async (e) => {
        e.preventDefault();
        if (!project) return;
        if (!documentUploadForm.file) {
            setDocumentUploadError("Please select a file to upload");
            return;
        }
        requireAuth();
        setDocumentUploading(true);
        setDocumentUploadSuccess("");
        setDocumentUploadError("");
        try {
            const formData = new FormData();
            formData.append("file", documentUploadForm.file);
            if (documentUploadForm.title) {
                formData.append("title", documentUploadForm.title);
            }
            if (documentUploadForm.description) {
                formData.append("description", documentUploadForm.description);
            }
            await axios.post(
                `${apiUrl}office-staff/projects/${project.id}/documents`,
                formData,
                {
                    headers: {
                        ...authHeaders(),
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            setDocumentUploadSuccess("Document uploaded successfully");
            setDocumentUploadForm({ title: "", description: "", file: null });
            setShowUploadDocumentModal(false);
            await fetchDocuments(documentSearchTerm);
        } catch (error) {
            handleApiError(error, setDocumentUploadError);
        } finally {
            setDocumentUploading(false);
        }
    };

    const downloadDocument = async (documentId, filename) => {
        requireAuth();
        try {
            const response = await axios.get(
                `${apiUrl}office-staff/documents/${documentId}/download`,
                {
                    headers: authHeaders(),
                    responseType: "blob",
                }
            );
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            handleApiError(error, setDocumentsError);
        }
    };

    const deleteDocument = async (documentId) => {
        if (!window.confirm("Are you sure you want to delete this document?")) {
            return;
        }
        requireAuth();
        try {
            await axios.delete(
                `${apiUrl}office-staff/documents/${documentId}`,
                { headers: authHeaders() }
            );
            if (viewingDocument?.id === documentId) {
                setViewingDocument(null);
            }
            await fetchDocuments(documentSearchTerm);
        } catch (error) {
            handleApiError(error, setDocumentsError);
        }
    };

    const handleDocumentSearch = () => {
        if (project) {
            fetchDocuments(documentSearchTerm);
        }
    };

    const handleDocumentSearchKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleDocumentSearch();
        }
    };

    return (
        <div className="dashboard-container">
            <OfficeSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            <main className="main-content">
                <header className="topbar">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <button className="hamburger-btn" onClick={toggleSidebar}>
                            <i className="fas fa-bars"></i>
                        </button>
                        <div className="breadcrumbs">
                            <Link to="/office-staff/projects" className="breadcrumb-link">Projects</Link>
                            <span className="breadcrumb-separator"> / </span>
                            <span className="breadcrumb-current">{project ? project.name : "Loading..."}</span>
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
                    {loading ? (
                        <div className="loading-state">
                            <p>Loading details...</p>
                        </div>
                    ) : error ? (
                        <div className="error-state">
                            <p className="error-text">{error}</p>
                            <button onClick={() => navigate("/office-staff/projects")} className="btn-primary">Back to Projects</button>
                        </div>
                    ) : project && (
                        <>
                            <div className="office-card" style={{ marginBottom: "20px" }}>
                                <div className="card-header">
                                    <div>
                                        <p className="card-eyebrow">Project Details</p>
                                        <h3>{project.name}</h3>
                                    </div>
                                    <div style={{ display: "flex", gap: "10px" }}>
                                        <button
                                            type="button"
                                            className="btn-outline"
                                            onClick={fetchProject}
                                        >
                                            Refresh
                                        </button>
                                    </div>
                                </div>

                                <div className="project-summary">
                                    <div>
                                        <h4 style={{ marginTop: 0 }}>{project.name}</h4>
                                        <p className="muted-text">Code: {project.code || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="label">Stage</p>
                                        <p>{project.stage?.replaceAll("_", " ")}</p>
                                    </div>
                                    <div>
                                        <p className="label">Work Type</p>
                                        <p>{project.workType || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="label">LSGD Name</p>
                                        <p>{project.lsgdName || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="label">Sanctioned Amount</p>
                                        <p>{formatCurrency(project.sanctionedAmount)}</p>
                                    </div>
                                    <div>
                                        <p className="label">Start Date</p>
                                        <p>{project.startDate || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="label">Expected End Date</p>
                                        <p>{project.expectedEndDate || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="label">Actual End Date</p>
                                        <p>{project.actualEndDate || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="label">Created On</p>
                                        <p>
                                            {project.createdAt
                                                ? new Date(project.createdAt).toLocaleDateString("en-IN", {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                })
                                                : "—"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="label">Total Expense</p>
                                        <p>₹{project.totalExpense?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "0.00"}</p>
                                    </div>
                                </div>

                                <div className="detail-grid" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '20px' }}>
                                    <button
                                        type="button"
                                        className="btn-primary"
                                        onClick={() => setShowUpdateProjectModal(true)}
                                    >
                                        Update Details
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-primary"
                                        onClick={() => setShowChangeStageModal(true)}
                                    >
                                        Change Stage
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-primary"
                                        onClick={() => setShowLogActionModal(true)}
                                    >
                                        Log Action
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-primary"
                                        onClick={() => {
                                            setShowAddExpenseModal(true);
                                            if (!workers.length && !workersLoading) {
                                                fetchWorkers();
                                            }
                                        }}
                                    >
                                        Add Expense
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-primary"
                                        onClick={() => setShowUploadDocumentModal(true)}
                                    >
                                        📤 Upload Document
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-primary"
                                        style={{ backgroundColor: "#2ecc71" }}
                                        onClick={() => navigate(`/office-staff/projects/${project.id}/locations`)}
                                    >
                                        📍 Manage Locations
                                    </button>
                                </div>
                            </div>

                            {/* Actions Section */}
                            <div className="office-card" style={{ marginBottom: "20px" }}>
                                <div className="card-header">
                                    <h4>Project Actions</h4>
                                    <span className="muted-text">
                                        {project.actions?.length || 0} total
                                    </span>
                                </div>
                                {project.actions?.length ? (
                                    <div className="table-scroll">
                                        <table className="main-table">
                                            <thead>
                                                <tr>
                                                    <th>Title</th>
                                                    <th>Date</th>
                                                    <th>Status</th>
                                                    <th>Notes</th>
                                                    <th>Update</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {project.actions.map((action) => (
                                                    <tr key={action.id}>
                                                        <td>{action.title}</td>
                                                        <td>{action.actionDate}</td>
                                                        <td>{renderStatusBadge(action.status)}</td>
                                                        <td>{action.notes || "—"}</td>
                                                        <td>
                                                            <div className="action-buttons">
                                                                {ACTION_STATUS_OPTIONS.map((status) => (
                                                                    <button
                                                                        key={status}
                                                                        type="button"
                                                                        className={`btn-small ${action.status === status
                                                                            ? "btn-selected"
                                                                            : "btn-outline"
                                                                            }`}
                                                                        disabled={
                                                                            action.status === status ||
                                                                            actionStatusLoading[action.id]
                                                                        }
                                                                        onClick={() =>
                                                                            updateActionStatus(
                                                                                action.id,
                                                                                status
                                                                            )
                                                                        }
                                                                    >
                                                                        {actionStatusLoading[action.id] &&
                                                                            action.status !== status
                                                                            ? "Updating..."
                                                                            : status}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="empty-state">
                                        <p className="muted-text">No actions logged yet.</p>
                                    </div>
                                )}
                            </div>

                            {/* Expenses Section */}
                            <div className="office-card" style={{ marginBottom: "20px" }}>
                                <div className="card-header">
                                    <h4>Project Expenses</h4>
                                    <span className="muted-text">
                                        {project.expenses?.length || 0} total
                                    </span>
                                </div>
                                {project.expenses?.length ? (
                                    <div className="table-scroll">
                                        <table className="main-table">
                                            <thead>
                                                <tr>
                                                    <th>Type</th>
                                                    <th>Date</th>
                                                    <th>Description</th>
                                                    <th>Total Amount</th>
                                                    <th>Items Count</th>
                                                    <th>Workers</th>
                                                    <th>Created By</th>
                                                    <th>Created At</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {project.expenses.map((expense) => (
                                                    <tr key={expense.id}>
                                                        <td>{expense.type}</td>
                                                        <td>{expense.date ?? "—"}</td>
                                                        <td>{expense.description ?? "—"}</td>
                                                        <td>₹{expense.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "0.00"}</td>
                                                        <td>{expense.items?.length ?? 0}</td>
                                                        <td>
                                                            {expense.workers && expense.workers.length > 0 ? (
                                                                <span>{expense.workers.length} worker(s)</span>
                                                            ) : (
                                                                "—"
                                                            )}
                                                        </td>
                                                        <td>{expense.createdByName ?? "—"}</td>
                                                        <td>{expense.createdAt?.split("T")[0] ?? "—"}</td>
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
                                ) : (
                                    <div className="empty-state">
                                        <p className="muted-text">No expenses recorded for this project.</p>
                                    </div>
                                )}
                            </div>

                            {/* Documents Section */}
                            <div className="office-card">
                                <div className="card-header">
                                    <div>
                                        <h4>📁 Project Documents</h4>
                                        <p className="muted-text" style={{ margin: 0 }}>Manage files for this project</p>
                                    </div>
                                </div>

                                {/* Document Search */}
                                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
                                    <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                                        <input
                                            type="text"
                                            placeholder="Search documents..."
                                            value={documentSearchTerm}
                                            onChange={(e) => setDocumentSearchTerm(e.target.value)}
                                            onKeyPress={handleDocumentSearchKeyPress}
                                            className="search-input"
                                            style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                                        />
                                        <button type="button" className="btn-outline" onClick={handleDocumentSearch}>🔍</button>
                                        {documentSearchTerm && (
                                            <button className="btn-cancel" onClick={() => {
                                                setDocumentSearchTerm("");
                                                fetchDocuments("");
                                            }}>Clear</button>
                                        )}
                                    </div>
                                </div>

                                {documentsError && <p className="error-text">{documentsError}</p>}

                                {documentsLoading ? (
                                    <p className="muted-text">Loading documents...</p>
                                ) : documents.length > 0 ? (
                                    <div className="table-scroll">
                                        <table className="main-table">
                                            <thead>
                                                <tr>
                                                    <th style={{ width: '40px' }}></th>
                                                    <th>Title</th>
                                                    <th>Filename</th>
                                                    <th>Size</th>
                                                    <th>Uploaded By</th>
                                                    <th>Uploaded At</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {documents.map((doc) => (
                                                    <tr key={doc.id}>
                                                        <td style={{ fontSize: '20px', textAlign: 'center' }}>
                                                            {getFileIcon(doc.contentType)}
                                                        </td>
                                                        <td>
                                                            <div>
                                                                <strong>{doc.title}</strong>
                                                                {doc.description && (
                                                                    <p className="muted-text" style={{ fontSize: '12px', margin: '4px 0 0 0' }}>
                                                                        {doc.description.length > 50
                                                                            ? doc.description.substring(0, 50) + '...'
                                                                            : doc.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td>{doc.originalFilename}</td>
                                                        <td>{formatFileSize(doc.fileSize)}</td>
                                                        <td>{doc.uploadedByName || "—"}</td>
                                                        <td>
                                                            {doc.uploadedAt
                                                                ? new Date(doc.uploadedAt).toLocaleDateString("en-IN", {
                                                                    year: "numeric",
                                                                    month: "short",
                                                                    day: "numeric",
                                                                })
                                                                : "—"}
                                                        </td>
                                                        <td>
                                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                                <button
                                                                    type="button"
                                                                    className="btn-small"
                                                                    onClick={() => downloadDocument(doc.id, doc.originalFilename)}
                                                                    title="Download"
                                                                >
                                                                    ⬇️
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="btn-small btn-outline"
                                                                    onClick={() => setViewingDocument(doc)}
                                                                    title="View Details"
                                                                >
                                                                    👁️
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="btn-cancel"
                                                                    onClick={() => deleteDocument(doc.id)}
                                                                    title="Delete"
                                                                    style={{ padding: '6px 10px' }}
                                                                >
                                                                    🗑️
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="empty-state" style={{ textAlign: 'center', padding: '40px', background: '#f9fafb', borderRadius: '8px', border: '1px dashed #e5e7eb' }}>
                                        <p style={{ fontSize: '32px' }}>📂</p>
                                        <p className="muted-text">No documents uploaded yet.</p>
                                        <button className="btn-primary" onClick={() => setShowUploadDocumentModal(true)} style={{ marginTop: '10px' }}>
                                            Upload First Document
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </section>
            </main>

            {/* Modals */}
            {showUpdateProjectModal && (
                <div className="modal-overlay" onClick={() => setShowUpdateProjectModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <form onSubmit={submitUpdate}>
                            <h3>Update Project Details</h3>
                            {updateFormErrors.form && <p className="error-text">{updateFormErrors.form}</p>}
                            {updateFormSuccess && <p className="success-text">{updateFormSuccess}</p>}
                            <label>
                                Expected End Date
                                <input
                                    type="date"
                                    name="expectedEndDate"
                                    value={updateForm.expectedEndDate}
                                    onChange={handleUpdateFormChange}
                                />
                            </label>
                            <label>
                                Sanctioned Amount
                                <input
                                    type="number"
                                    name="sanctionedAmount"
                                    min="0"
                                    step="0.01"
                                    value={updateForm.sanctionedAmount}
                                    onChange={handleUpdateFormChange}
                                />
                                {updateFormErrors.sanctionedAmount && (
                                    <span className="error-text">{updateFormErrors.sanctionedAmount}</span>
                                )}
                            </label>
                            <div className="form-actions">
                                <button type="submit" disabled={updateSubmitting}>
                                    {updateSubmitting ? "Updating..." : "Update Details"}
                                </button>
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => {
                                        setShowUpdateProjectModal(false);
                                        setUpdateFormErrors({});
                                        setUpdateFormSuccess("");
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showChangeStageModal && (
                <div className="modal-overlay" onClick={() => setShowChangeStageModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <form onSubmit={submitStageChange}>
                            <h3>Change Stage</h3>
                            {stageError && <p className="error-text">{stageError}</p>}
                            {stageSuccess && <p className="success-text">{stageSuccess}</p>}
                            <label>
                                New Stage
                                <select
                                    value={stageForm.stage}
                                    onChange={(e) => setStageForm((prev) => ({ ...prev, stage: e.target.value }))}
                                    required
                                >
                                    <option value="" disabled>Select stage</option>
                                    {PROJECT_STAGE_OPTIONS.map((stage) => (
                                        <option key={stage} value={stage}>
                                            {stage.replaceAll("_", " ")}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Notes
                                <textarea
                                    rows={3}
                                    value={stageForm.notes}
                                    onChange={(e) => setStageForm((prev) => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Explain why the stage changed"
                                />
                            </label>
                            <div className="form-actions">
                                <button type="submit" disabled={stageSubmitting}>
                                    {stageSubmitting ? "Updating..." : "Update Stage"}
                                </button>
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => {
                                        setShowChangeStageModal(false);
                                        setStageError("");
                                        setStageSuccess("");
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showLogActionModal && (
                <div className="modal-overlay" onClick={() => setShowLogActionModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <form onSubmit={submitAction}>
                            <h3>Log Action</h3>
                            {actionError && <p className="error-text">{actionError}</p>}
                            {actionSuccess && <p className="success-text">{actionSuccess}</p>}
                            <label>
                                Title *
                                <input
                                    type="text"
                                    value={actionForm.title}
                                    onChange={(e) => setActionForm((prev) => ({ ...prev, title: e.target.value }))}
                                    required
                                />
                            </label>
                            <label>
                                Action Date *
                                <input
                                    type="date"
                                    value={actionForm.actionDate}
                                    onChange={(e) => setActionForm((prev) => ({ ...prev, actionDate: e.target.value }))}
                                    required
                                />
                            </label>
                            <label>
                                Notes
                                <textarea
                                    rows={3}
                                    value={actionForm.notes}
                                    onChange={(e) => setActionForm((prev) => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Additional context"
                                />
                            </label>
                            <div className="form-actions">
                                <button type="submit" disabled={actionSubmitting}>
                                    {actionSubmitting ? "Saving..." : "Add Action"}
                                </button>
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => {
                                        setShowLogActionModal(false);
                                        setActionError("");
                                        setActionSuccess("");
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showAddExpenseModal && (
                <div className="modal-overlay" onClick={() => setShowAddExpenseModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <form onSubmit={submitExpense}>
                            <h3>Add Expense</h3>
                            {expenseError && <p className="error-text">{expenseError}</p>}
                            {expenseSuccess && <p className="success-text">{expenseSuccess}</p>}
                            <label>
                                Type *
                                <select
                                    name="type"
                                    value={expenseForm.type}
                                    onChange={handleExpenseFormChange}
                                    required
                                >
                                    {EXPENSE_TYPES.map((type) => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Date *
                                <input
                                    type="date"
                                    name="date"
                                    value={expenseForm.date}
                                    onChange={handleExpenseFormChange}
                                    required
                                />
                            </label>
                            <label>
                                Description
                                <textarea
                                    rows={3}
                                    name="description"
                                    value={expenseForm.description}
                                    onChange={handleExpenseFormChange}
                                    placeholder="Optional description"
                                />
                            </label>
                            {expenseForm.type === "VISIT" && (
                                <label>
                                    Assign Workers
                                    {workersLoading ? (
                                        <p className="muted-text">Loading workers...</p>
                                    ) : (
                                        <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
                                            {workers.length === 0 ? (
                                                <p className="muted-text">No workers available</p>
                                            ) : (
                                                workers.map((worker) => (
                                                    <label key={worker.id} style={{ display: 'block', marginBottom: '8px' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={expenseForm.workerIds?.includes(worker.id) || false}
                                                            onChange={(e) => {
                                                                const workerId = worker.id;
                                                                setExpenseForm((prev) => {
                                                                    const currentIds = prev.workerIds || [];
                                                                    if (e.target.checked) {
                                                                        return { ...prev, workerIds: [...currentIds, workerId] };
                                                                    } else {
                                                                        return { ...prev, workerIds: currentIds.filter(id => id !== workerId) };
                                                                    }
                                                                });
                                                            }}
                                                            style={{ marginRight: '8px' }}
                                                        />
                                                        {worker.name} {worker.mobileNumber && `(${worker.mobileNumber})`}
                                                    </label>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </label>
                            )}
                            <div style={{ marginTop: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <h4>Expense Items *</h4>
                                    <button type="button" onClick={addExpenseItem} className="btn-outline" style={{ padding: '6px 12px' }}>+ Add Item</button>
                                </div>
                                {expenseForm.items.map((item, index) => (
                                    <div key={index} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '10px', borderRadius: '4px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                            <strong>Item {index + 1}</strong>
                                            {expenseForm.items.length > 1 && (
                                                <button type="button" onClick={() => removeExpenseItem(index)} className="btn-cancel" style={{ padding: '4px 8px', fontSize: '12px' }}>Remove</button>
                                            )}
                                        </div>
                                        <label style={{ display: 'block', marginBottom: '10px' }}>
                                            Particular *
                                            <input
                                                type="text"
                                                value={item.particular}
                                                onChange={(e) => handleExpenseItemChange(index, 'particular', e.target.value)}
                                                placeholder="Item description"
                                                required
                                            />
                                        </label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                            <label>
                                                Quantity *
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="1"
                                                    value={item.quantity}
                                                    onChange={(e) => handleExpenseItemChange(index, 'quantity', e.target.value)}
                                                    placeholder="0"
                                                    required
                                                />
                                            </label>
                                            <label>
                                                Rate *
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.rate}
                                                    onChange={(e) => handleExpenseItemChange(index, 'rate', e.target.value)}
                                                    placeholder="0.00"
                                                    required
                                                />
                                            </label>
                                        </div>
                                        {item.quantity && item.rate && (
                                            <p style={{ marginTop: '8px', color: '#666', fontSize: '14px' }}>
                                                Amount: ₹{(Number(item.quantity) * Number(item.rate)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="form-actions">
                                <button type="submit" disabled={expenseSubmitting}>
                                    {expenseSubmitting ? "Saving..." : "Add Expense"}
                                </button>
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => {
                                        setShowAddExpenseModal(false);
                                        setExpenseError("");
                                        setExpenseSuccess("");
                                        setExpenseForm({ ...initialExpenseForm });
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showUploadDocumentModal && (
                <div className="modal-overlay" onClick={() => setShowUploadDocumentModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <form onSubmit={submitDocumentUpload}>
                            <h3>📤 Upload Document</h3>
                            <p className="muted-text" style={{ marginBottom: '20px' }}>
                                Upload documents related to project: <strong>{project?.name}</strong>
                            </p>
                            {documentUploadError && <p className="error-text">{documentUploadError}</p>}
                            {documentUploadSuccess && <p className="success-text">{documentUploadSuccess}</p>}

                            <label style={{ display: 'block', marginBottom: '16px' }}>
                                Document Title
                                <input
                                    type="text"
                                    name="title"
                                    value={documentUploadForm.title}
                                    onChange={handleDocumentUploadFormChange}
                                    placeholder="Enter a descriptive title (optional)"
                                    style={{ width: '100%', marginTop: '6px' }}
                                />
                            </label>

                            <label style={{ display: 'block', marginBottom: '16px' }}>
                                Description
                                <textarea
                                    name="description"
                                    value={documentUploadForm.description}
                                    onChange={handleDocumentUploadFormChange}
                                    placeholder="Optional description of the document"
                                    rows={3}
                                    style={{ width: '100%', marginTop: '6px' }}
                                />
                            </label>

                            <label style={{ display: 'block', marginBottom: '20px' }}>
                                Select File *
                                <input
                                    type="file"
                                    name="file"
                                    onChange={handleDocumentUploadFormChange}
                                    style={{ marginTop: '8px' }}
                                />
                            </label>

                            <div className="form-actions">
                                <button type="submit" disabled={documentUploading}>
                                    {documentUploading ? "Uploading..." : "📤 Upload Document"}
                                </button>
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => {
                                        setShowUploadDocumentModal(false);
                                        setDocumentUploadForm({ title: "", description: "", file: null });
                                        setDocumentUploadError("");
                                        setDocumentUploadSuccess("");
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {viewingExpense && (
                <div className="modal-overlay" onClick={() => setViewingExpense(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h3>Expense Details</h3>
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                <div><strong>Type:</strong> {viewingExpense.type}</div>
                                <div><strong>Date:</strong> {viewingExpense.date ?? "—"}</div>
                                <div><strong>Total Amount:</strong> ₹{viewingExpense.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "0.00"}</div>
                                <div><strong>Created By:</strong> {viewingExpense.createdByName ?? "—"}</div>
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
                                <h4>Assigned Workers</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                                    {viewingExpense.workers.map((worker) => (
                                        <div key={worker.id} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
                                            <div><strong>{worker.name}</strong></div>
                                            {worker.mobileNumber && <div className="muted-text">{worker.mobileNumber}</div>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="form-actions">
                            <button type="button" className="btn-cancel" onClick={() => setViewingExpense(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {viewingDocument && (
                <div className="modal-overlay" onClick={() => setViewingDocument(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <h3>📄 Document Details</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', background: '#e0f2fe', borderRadius: '12px', marginBottom: '20px' }}>
                            <span style={{ fontSize: '48px' }}>{getFileIcon(viewingDocument.contentType)}</span>
                            <div>
                                <h4 style={{ margin: '0 0 4px 0' }}>{viewingDocument.title}</h4>
                                <p className="muted-text" style={{ margin: 0, fontSize: '13px' }}>{viewingDocument.originalFilename}</p>
                            </div>
                        </div>
                        <p className="muted-text" style={{ fontSize: '12px' }}>UPLOADED BY: {viewingDocument.uploadedByName} on {new Date(viewingDocument.uploadedAt).toLocaleString()}</p>
                        {viewingDocument.description && (
                            <div style={{ margin: '20px 0', padding: '10px', background: '#f9fafb', borderRadius: '8px' }}>
                                <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{viewingDocument.description}</p>
                            </div>
                        )}
                        <div className="form-actions">
                            <button type="button" className="btn-primary" onClick={() => downloadDocument(viewingDocument.id, viewingDocument.originalFilename)}>⬇️ Download</button>
                            <button type="button" className="btn-cancel" onClick={() => setViewingDocument(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default OfficeStaffProjectDetails;
