import React, { useState } from 'react';

const Login = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username.trim()) return alert("Username halnus!");

        try {
            const res = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username.trim() })
            });
            const data = await res.json();

            if (res.ok && data.user) {
                // persist global username for other games/dashboard
                localStorage.setItem('brainbyte_user', data.user.username);
                onLoginSuccess(data.user);
            } else {
                alert(data.message || "Login fail vayo!");
            }
        } catch (err) {
            alert("Backend server connected chaina!");
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1 className="login-title">SPACE WAVES</h1>
                <p className="login-subtitle">IDENTIFY YOURSELF, PILOT</p>
                <form onSubmit={handleSubmit} className="login-form">
                    <input
                        className="login-input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="ENTER PILOT NAME..."
                        maxLength="30"
                    />
                    <button type="submit" className="login-btn">
                        START MISSION
                    </button>
                </form>
            </div>

            <style>{`
                .login-container {
                    height: 100vh;
                    width: 100vw;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #1a0533; /* Dark space theme */
                    font-family: 'Orbitron', sans-serif;
                }
                .login-box {
                    background: rgba(45, 10, 78, 0.8);
                    padding: 50px;
                    border: 3px solid #ff00ff;
                    box-shadow: 0 0 30px rgba(255, 0, 255, 0.4);
                    text-align: center;
                    width: 400px;
                }
                .login-title { color: #ff00ff; font-size: 2.5rem; margin-bottom: 10px; letter-spacing: 5px; }
                .login-subtitle { color: #00ffff; font-size: 0.9rem; margin-bottom: 30px; letter-spacing: 2px; }
                .login-form { display: flex; flex-direction: column; gap: 20px; }
                .login-input {
                    padding: 15px;
                    background: rgba(0,0,0,0.5);
                    border: 2px solid #00ffff;
                    color: white;
                    text-align: center;
                    font-size: 1.1rem;
                    outline: none;
                    font-family: 'Orbitron';
                }
                .login-input:focus { border-color: #ff00ff; box-shadow: 0 0 10px #ff00ff; }
                .login-btn {
                    padding: 15px;
                    background: #ff00ff;
                    color: white;
                    border: none;
                    font-weight: bold;
                    font-size: 1.2rem;
                    cursor: pointer;
                    transition: 0.3s;
                    font-family: 'Orbitron';
                }
                .login-btn:hover { background: #00ffff; color: #1a0533; transform: scale(1.05); }
            `}</style>
        </div>
    );
};

export default Login;