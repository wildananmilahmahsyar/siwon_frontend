import React, { useEffect, useState } from "react";
import "../css/dashboard.css";
import useUserStore from "../store/userStore";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { token } = useUserStore();
  const { user } = useUserStore();
  const [pengajuan, setPengajuan] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      fetch(`${import.meta.env.VITE_API_BASE}/api/pengajuan/user/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => setPengajuan(data))
        .catch(() => setPengajuan([]));
    }
  }, [user]);

  // Ambil pengajuan per status (hanya satu per status)
  const getPengajuanByStatus = (status) => {
  const filtered = pengajuan
      .filter((p) => p.status === status.toLowerCase() && p.Hewan)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return filtered[0] || null;
  };


  return (
    <>
      {/* Hero Section */}
      <section className="hero_D">
        <div className="hero_D-overlay">
          <h2>
            SELAMAT DATANG KEMBALI, {user?.username?.toUpperCase() || "USER"}
          </h2>
        </div>
      </section>

      {/* Status Cards */}
      <section className="status-section">
        {["Menunggu", "Diterima", "Ditolak"].map((status, index) => {
          const p = getPengajuanByStatus(status);
          return (
            <div className="status-card" key={index}>
              <h3>{status}</h3>
              <div className="status-box">
                {p && p.Hewan && (
                  <img
                    src={`${import.meta.env.VITE_API_BASE}/uploads/${
                      p.Hewan.foto
                    }`}
                    alt={p.Hewan.nama}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "10px",
                      marginBottom: "10px",
                    }}
                  />
                )}
              </div>
              {p && p.Hewan ? (
                <button
                  className="status-button"
                  onClick={() => {
                    if (status === "Menunggu") {
                      navigate(`/profil/${p.Hewan.id}`);
                    } else {
                      navigate(`/hasil/${status.toLowerCase()}/${p.Hewan.id}`);
                    }
                  }}
                >
                  Lihat
                </button>
              ) : (
                <button className="status-button" disabled>
                  Belum Mengadopsi
                </button>
              )}
            </div>
          );
        })}
      </section>

      {/* Call to Action */}
      <div className="cta-button">
        <button className="adopt-button" onClick={() => navigate("/")}>
          Lihat Hewan untuk Diadopsi
        </button>
      </div>
    </>
  );
};

export default Dashboard;
