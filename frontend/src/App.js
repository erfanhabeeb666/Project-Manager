import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Components/Login";
import Admin from "./Components/Admin";
import OfficeStaff from "./Components/OfficeStaff";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/office-staff" element={<OfficeStaff />} />
            </Routes>
        </Router>
    );
};

export default App;
