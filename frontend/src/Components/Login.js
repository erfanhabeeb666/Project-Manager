import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { scheduleAutoLogout } from "../utils/auth";
import './Styles/Login.css';
import './Styles/Main.css'

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        const apiUrl = process.env.REACT_APP_API_URL;
        e.preventDefault();
        setError(null);
        
        try {
            const response = await axios.post(`${apiUrl}auth/authenticate`, {
                email,
                password,
            });

            const token = response.data.token;
            localStorage.setItem("jwtToken", token);
            scheduleAutoLogout();

            const decodedToken = jwtDecode(token);
            const role = decodedToken.userType;

            if (role === "ADMIN") {
                navigate("/admin");
            } else if (role === "OFFICE_STAFF") {
                navigate("/office-staff");
            } else {
                setError("Invalid role");
            }
        } catch (err) {
            setError("Invalid credentials");
        }
    };

    return (
        <div className="login-container">
            <form className="form-box" onSubmit={handleLogin}>
                <h2>User Login</h2>
                <input
                    type="email"
                    id="username"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    id="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Login</button>
                {error && <div className="error show">{error}</div>}
            </form>
        </div>
    );
};

export default Login;
