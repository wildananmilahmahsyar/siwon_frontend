import React, { useState } from 'react';
import '../css/login.css';
import { Link, useNavigate } from 'react-router-dom';
import dogImage from '../assets/dog.png';
import useUserStore from '../store/userStore';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    rememberMe: false,
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const { setUser } = useUserStore();
  const navigate = useNavigate();
  const token = useUserStore.getState().token;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      alert('Please fill out all fields');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        const { token, user, role } = data;

        if (!token || !user) {
          alert('Login gagal: token atau user tidak ditemukan');
          return;
        }

        // ✅ Simpan token ke localStorage
        localStorage.setItem('token', token);

        // ✅ Simpan user dan role ke Zustand
        setUser(user, role);

        // ✅ Arahkan user ke halaman sesuai role
        if (role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }

      } else {
        alert('Login gagal: ' + (data.error || 'Email atau password salah'));
      }
    } catch (error) {
      alert('Terjadi kesalahan: ' + error.message);
    }
  };

  return (
    <div className="desktop-container">
      <div className="login-section">
        <div className="banner-section">
          <div className="banner-content">
            <div className="banner-text-row">
              <Link to="/" style={{ textDecoration: 'none' }}>
                <img src={dogImage} alt="paw" className="paw-icon" />
              </Link>
              <div className="text-group">
                <h2>Platform Adopsi</h2>
                <h2>Hewan Peliharaan</h2>
              </div>
            </div>
          </div>
        </div>

        <div className="login-card">
          <h2 className="welcome-title">WELCOME BACK</h2>
          <p className="welcome-subtitle">Log in to your account</p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-container">
                <input type={showPassword ? "text" : "password"} id="password" name="password" value={formData.password} onChange={handleChange} required />
                <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                  👁️
                </span>
              </div>
            </div>

            <div className="form-options">
              <div className="remember-me">
                <input type="checkbox" id="remember" name="rememberMe" checked={formData.rememberMe} onChange={handleChange} />
                <label htmlFor="remember">Remember me</label>
              </div>
              <a href="#forgot" className="forgot-link">Forgot password?</a>
            </div>

            <button type="submit" className="primary-btn">CONTINUE</button>
          </form>

          <div className="signup-prompt">
            Don't have an account? <Link to="/regis">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
  