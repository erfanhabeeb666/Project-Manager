import React, { useState, useEffect } from "react";
import axios from "axios";
import OfficeSidebar from "./OfficeSidebar";
import { numberToWords } from "../utils/numberToWords";
import { getDisplayName } from "../utils/auth";
import "./Styles/CreateBill.css";

const CreateBill = () => {
    const [customerName, setCustomerName] = useState("");
    const [customerAddress, setCustomerAddress] = useState("");

    const [items, setItems] = useState([
        { description: "", quantity: 1, rate: "" }
    ]);

    const [calc, setCalc] = useState({
        taxableValue: "0.00",
        sgst: "0.00",
        cgst: "0.00",
        totalAmount: "0.00",
        roundOff: "0.00",
        grandTotal: "0.00",
        amountInWords: ""
    });

    const [loading, setLoading] = useState(false);
    const [successData, setSuccessData] = useState(null);
    const [error, setError] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
        if (successData) setSuccessData(null);
    };

    const addItem = () => {
        setItems([...items, { description: "", quantity: 1, rate: "" }]);
    };

    const removeItem = (index) => {
        if (items.length > 1) {
            const newItems = items.filter((_, i) => i !== index);
            setItems(newItems);
        }
    };

    useEffect(() => {
        let totalTaxable = 0;

        items.forEach(item => {
            const qty = Number(item.quantity) || 0;
            const rateInclGst = Number(item.rate) || 0;

            // Calculate base rate from inclusive rate
            // Base = Inclusive / 1.18
            const taxable = (qty * rateInclGst) / 1.18;

            totalTaxable += taxable;
        });

        // Round taxable to 2 decimals
        const taxableRounded = Math.round(totalTaxable * 100) / 100;

        const sgst = taxableRounded * 0.09;
        const cgst = taxableRounded * 0.09;

        // Round taxes
        const sgstRounded = Math.round(sgst * 100) / 100;
        const cgstRounded = Math.round(cgst * 100) / 100;

        const total = taxableRounded + sgstRounded + cgstRounded;

        const grand = Math.round(total);
        const roundOff = grand - total;

        setCalc({
            taxableValue: taxableRounded.toFixed(2),
            sgst: sgstRounded.toFixed(2),
            cgst: cgstRounded.toFixed(2),
            totalAmount: total.toFixed(2),
            roundOff: roundOff.toFixed(2),
            grandTotal: grand.toFixed(2),
            amountInWords: numberToWords(grand)
        });
    }, [items]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("jwtToken");
            const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8080/api/";

            const payloadItems = items.map(item => ({
                description: item.description,
                quantity: Number(item.quantity),
                // Convert Inclusive Rate to Base Rate
                rate: Number(item.rate) / 1.18
            }));

            const payload = {
                customerName,
                customerAddress,
                items: payloadItems
            };

            const response = await axios.post(`${apiUrl}api/billing/generate`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccessData(response.data);
            // Optional: clear form
            // setItems([{ description: "", quantity: 1, rate: "" }]);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to generate bill. Please check inputs.");
        } finally {
            setLoading(false);
        }
    };





    const isFormValid = customerName && customerAddress && items.every(i => i.description && i.rate && Number(i.rate) > 0);

    const handleLogout = () => {
        localStorage.removeItem("jwtToken");
        window.location.href = "/";
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
                        <h1>Generate GST Bill</h1>
                    </div>
                    <div className="topbar-actions">
                        <span className="greeting">Hello, {getDisplayName()}</span>
                        <button className="logout-btn" onClick={handleLogout}>Logout</button>
                    </div>
                </header>

                <div className="bill-card">
                    <form onSubmit={handleSubmit}>
                        <div className="bill-section">
                            <h3 className="bill-section-title">Customer Details</h3>
                            <div className="input-group-row">
                                <div className="input-field-container">
                                    <label className="input-label">Customer Name</label>
                                    <input
                                        type="text"
                                        className="styled-input"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        required
                                        placeholder="Enter customer name"
                                    />
                                </div>
                            </div>
                            <div className="input-field-container">
                                <label className="input-label">Address</label>
                                <textarea
                                    className="styled-textarea"
                                    rows="3"
                                    value={customerAddress}
                                    onChange={(e) => setCustomerAddress(e.target.value)}
                                    required
                                    placeholder="Enter full address"
                                />
                            </div>
                        </div>

                        <div className="bill-section">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 className="bill-section-title">Work / Particulars</h3>
                                <button type="button" onClick={addItem} className="btn-small btn-primary">+ Add Item</button>
                            </div>

                            {items.map((item, index) => (
                                <div key={index} className="item-row" style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <label className="input-label">Item {index + 1}</label>
                                        {items.length > 1 && (
                                            <button type="button" onClick={() => removeItem(index)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                                        )}
                                    </div>

                                    <div className="input-field-container" style={{ marginBottom: '10px' }}>
                                        <textarea
                                            className="styled-textarea"
                                            rows="2"
                                            value={item.description}
                                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                            required
                                            placeholder="Description of work or item"
                                        />
                                    </div>
                                    <div className="input-group-row">
                                        <div className="input-field-container">
                                            <input
                                                type="number"
                                                className="styled-input"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                min="1"
                                                required
                                                placeholder="Qty"
                                            />
                                        </div>
                                        <div className="input-field-container">
                                            <input
                                                type="number"
                                                className="styled-input"
                                                value={item.rate}
                                                onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                                                min="0"
                                                step="0.01"
                                                required
                                                placeholder="Rate (Incl. GST)"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bill-section">
                            <h3 className="bill-section-title">Tax & Totals (18% GST)</h3>
                            <div className="tax-breakdown-card">
                                <div className="breakdown-row">
                                    <span>Taxable Value</span>
                                    <span>₹{calc.taxableValue}</span>
                                </div>
                                <div className="breakdown-row">
                                    <span>SGST (9%)</span>
                                    <span>₹{calc.sgst}</span>
                                </div>
                                <div className="breakdown-row">
                                    <span>CGST (9%)</span>
                                    <span>₹{calc.cgst}</span>
                                </div>
                                <div className="breakdown-row">
                                    <span>Total Amount (Incl. Tax)</span>
                                    <span>₹{calc.totalAmount}</span>
                                </div>
                                <div className="breakdown-row">
                                    <span>Round Off</span>
                                    <span>{Number(calc.roundOff) > 0 ? '+' : ''}₹{calc.roundOff}</span>
                                </div>
                                <div className="breakdown-row total-row">
                                    <span>Grand Total</span>
                                    <span>₹{calc.grandTotal}</span>
                                </div>
                                <div className="amount-words-banner">
                                    {calc.amountInWords}
                                </div>
                            </div>
                        </div>

                        {error && <div className="error-text" style={{ textAlign: 'center', marginTop: '10px' }}>{error}</div>}

                        {!successData ? (
                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={!isFormValid || loading}
                            >
                                {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-file-invoice"></i>}
                                {loading ? "Generating..." : "Generate PDF Bill"}
                            </button>
                        ) : (
                            <div className="success-area">
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#065f46' }}>
                                    <i className="fas fa-check-circle"></i> Bill Generated Successfully!
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    Invoice No: <strong>{successData.invoiceNumber}</strong>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                    <button
                                        onClick={async () => {
                                            try {
                                                const token = localStorage.getItem("jwtToken");
                                                const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8080/api/";
                                                const response = await axios.get(`${apiUrl.replace(/\/$/, "")}${successData.pdfUrl}`, {
                                                    headers: { Authorization: `Bearer ${token}` },
                                                    responseType: 'blob'
                                                });

                                                const url = window.URL.createObjectURL(new Blob([response.data]));
                                                const link = document.createElement('a');
                                                link.href = url;
                                                link.setAttribute('download', `Invoice_${successData.invoiceNumber}.pdf`);
                                                document.body.appendChild(link);
                                                link.click();
                                                link.remove();
                                                window.URL.revokeObjectURL(url);
                                            } catch (err) {
                                                console.error("Download failed", err);
                                                alert("Failed to download PDF");
                                            }
                                        }}
                                        className="download-link"
                                        style={{ border: 'none', cursor: 'pointer', background: '#3b82f6', color: 'white', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '10px 20px', borderRadius: '6px', fontSize: '1rem' }}
                                    >
                                        <i className="fas fa-download"></i> Download PDF
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-outline"
                                        onClick={() => {
                                            setSuccessData(null);
                                            setItems([{ description: "", quantity: 1, rate: "" }]);
                                            setCustomerName("");
                                            setCustomerAddress("");
                                        }}
                                    >
                                        Create Another
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </main>
        </div>
    );
};

export default CreateBill;
