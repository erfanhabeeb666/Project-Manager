import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Components/Login";
import Admin from "./Components/Admin";
import OfficeStaff from "./Components/OfficeStaff";
import AdminOfficeStaff from "./Components/AdminOfficeStaff";
import AdminWorker from "./Components/AdminWorker";
const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/office-staff" element={<OfficeStaff />} />
                <Route path="/admin/office-staff" element={<AdminOfficeStaff />} />
                <Route path="/admin/worker" element={<AdminWorker />} />
            </Routes>
        </Router>
    );
};

export default App;
