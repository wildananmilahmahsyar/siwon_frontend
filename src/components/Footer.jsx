// src/components/Footer.jsx
import React from 'react';
import './Footer.css'; // jika kamu punya styling terpisah

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <p className="footer-logo">SIWON</p>
        <p>Alamat | Email | Telepon | Media Sosial</p>
      </div>
      <div className="footer-links">
        {['Service', 'Support', 'Company', 'Legal', 'Join Us'].map((link, idx) => (
          <a href="#" key={idx}>{link}</a>
        ))}
      </div>
    </footer>
  );
};

export default Footer;
