// src/pages/Hasil.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../css/hasil.css";
import useUserStore from "../store/userStore";

const Hasil = () => {
  const { status, id } = useParams();
  const [hewan, setHewan] = useState(null);
  const navigate = useNavigate();
  const { token } = useUserStore();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE}/api/hewan/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then(setHewan)
      .catch(() => setHewan(null));
  }, [id]);

  if (!hewan) return <div className="hasil-container">Memuat...</div>;

  const kondisiArr = Array.isArray(hewan.kondisi)
    ? hewan.kondisi
    : JSON.parse(hewan.kondisi || "[]");

  const pesanDiterima = (
    <div className="pesan-box">
      Ajuan Diterima
      <p>
        "Mereka mungkin hanya bagian kecil dari dunia kita, tapi buat mereka...
        kamu adalah seluruh dunianya. Terima kasih sudah jadi pahlawan bagi satu
        nyawa."
      </p>
    </div>
  );

  const pesanDitolak = (
    <div className="pesan-box">
      Ajuan Ditolak
      <p>
        "Terima kasih sudah tertarik untuk mengadopsi. Namun, demi kebaikan
        hewan ini dan kenyamanan kamu ke depannya, kami rasa ini belum waktu
        yang tepat."
      </p>
    </div>
  );

  return (
    <div className="hasil-container">
      <div className="hasil-header">
        Ajuan {status === "diterima" ? "Diterima" : "Ditolak"}
      </div>
      <img
        src={`${import.meta.env.VITE_API_BASE}/uploads/${hewan.foto}`}
        alt={hewan.nama}
        className="hasil-img"
        onError={(e) => (e.target.src = "/assets/anjing.png")}
      />

      <div className="hasil-info">
        <div className="left">
          <h3>PROFIL 🐾</h3>
          <h2>{hewan.nama}</h2>
          <h2>{hewan.umur} tahun</h2>
        </div>
        <div className="right">
          <h3>KONDISI 🐾</h3>
          <div className="kondisi-grid">
            {kondisiArr.map((k, i) => (
              <div key={i} className="kondisi-item">
                {k}
              </div>
            ))}
          </div>
        </div>
      </div>

      {status === "diterima" ? pesanDiterima : pesanDitolak}

      <button className="back-btn" onClick={() => navigate("/dashboard")}>
        Kembali ke Dashboard
      </button>
    </div>
  );
};

export default Hasil;
