import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Components/Login";
import Admin from "./Components/Admin";
import OfficeStaff from "./Components/OfficeStaff";
import OfficeStaffProjects from "./Components/OfficeStaffProjects";
import OfficeStaffDailyActions from "./Components/OfficeStaffDailyActions";
import AdminOfficeStaff from "./Components/AdminOfficeStaff";
import AdminWorker from "./Components/AdminWorker";
import AdminProjects from "./Components/AdminProjects";
import AdminProjectDetails from "./Components/AdminProjectDetails";
import AdminActions from "./Components/AdminActions";
const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/office-staff" element={<OfficeStaff />} />
                <Route path="/office-staff/projects" element={<OfficeStaffProjects />} />
                <Route path="/office-staff/daily-actions" element={<OfficeStaffDailyActions />} />
                <Route path="/admin/office-staff" element={<AdminOfficeStaff />} />
                <Route path="/admin/worker" element={<AdminWorker />} />
                <Route path="/admin/projects" element={<AdminProjects />} />
                <Route path="/admin/projects/:projectId" element={<AdminProjectDetails />} />
                <Route path="/admin/actions" element={<AdminActions />} />

            </Routes>
        </Router>
    );
};

export default App;
