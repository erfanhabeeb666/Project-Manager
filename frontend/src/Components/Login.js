import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import './Styles/Login.css';
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
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Login</button>
            </form>
            {error && <p className="error">{error}</p>}
        </div>
    );
};

export default Login;
