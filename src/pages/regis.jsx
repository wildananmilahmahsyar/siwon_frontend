import React, { useState, useEffect } from 'react';
import '../css/regis.css';
import logoImage from '../assets/dog.png';
import { Link } from 'react-router-dom';

const Regis = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (
      formData.password &&
      formData.confirmPassword &&
      formData.password !== formData.confirmPassword
    ) {
      setPasswordError('Passwords do not match');
    } else {
      setPasswordError('');
    }
  }, [formData.password, formData.confirmPassword]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (!formData.username || !formData.email || !formData.password) {
      alert('Please fill out all fields');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        })
      });

      if (response.ok) {
          alert('Registrasi berhasil!');
          setFormData({
            username: '',
            email: '',
            password: '',
            confirmPassword: ''
          });
        } else {
          const contentType = response.headers.get("content-type");

          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            alert('Gagal registrasi: ' + errorData.error);
          } else {
            const errorText = await response.text(); // Ini untuk tangani HTML error
            alert('Gagal registrasi: Server mengembalikan response tidak valid.\n' + errorText);
          }
        }
      } catch (error) {
        alert('Terjadi kesalahan: ' + error.message);
      }
  };

  return (
    <div className="regis-wrapper">
      <div className="regis-left">
        <img src={logoImage} alt="Logo" className="regis-logo" />
        <div className="regis-title-text">
          <h2>Platform Adopsi</h2>
          <h2>Hewan Peliharaan</h2>
        </div>
      </div>

      <div className="regis-form-card">
        <h3>LET'S GET YOU STARTED</h3>
        <h2 className="form-title">Create an Account</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" name="username" placeholder="Your Name" value={formData.username} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Username@Email.com" value={formData.email} onChange={handleChange} required />
          <input type="password" name="password" placeholder="********" value={formData.password} onChange={handleChange} required />
          <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required />
          {passwordError && <div className="error">{passwordError}</div>}
          <button type="submit">GET STARTED</button>
        </form>
        <p className="login-redirect">
          Already have an account? <Link to="/login">LOGIN HERE</Link>
        </p>
      </div>
    </div>
  );
};

export default Regis;
