// src/components/Header.jsx
import React from 'react';
import { Link,NavLink, useNavigate } from 'react-router-dom';
import './Header.css';
import useUserStore from '../store/userStore';

const Header = () => {
  const { user, clearUser } = useUserStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearUser();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">SIWON</div>
      </div>
      <nav className="header-right nav">
        <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Home</NavLink>
        <NavLink to="/artikel" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Artikel</NavLink>
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Dashboard</NavLink>
      </nav>
      <div className="auth-buttons">
        {!user ? (
          <>
            <Link to="/regis" className="signup-btn">Sign up</Link>
            <Link to="/login" className="login-btn">Login</Link>
          </>
        ) : (
          <>
            <span className="username">{user.username}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
