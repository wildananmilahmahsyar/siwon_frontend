// src/pages/ProfilAdmin.jsx
import React, { useEffect, useState } from 'react';
import '../css/profil.css';
import '../css/ProfilAdmin.css';
import { useParams, useNavigate } from 'react-router-dom';
import useUserStore from '../store/userStore';
import { useRef } from 'react';

const ProfilAdmin = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [hewan, setHewan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [targetUserId, setTargetUserId] = useState(null);
  const user = useUserStore((state) => state.user);
  const admin = useUserStore((state) => state.user); // ambil admin yang login
  const { token } = useUserStore();


  useEffect(() => {
    const fetchHewan = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/hewan/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
        if (!res.ok) throw new Error('Data tidak ditemukan');
        const data = await res.json();
        setHewan(data);

        const resPengajuan = await fetch(`${import.meta.env.VITE_API_BASE}/api/pengajuan/hewan/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
        const pengajuanData = await resPengajuan.json();
        if (pengajuanData.length > 0) {
          setTargetUserId(pengajuanData[0].userId);
        }
      } catch (err) {
        setHewan(null);
      } finally {
        setLoading(false);
      }
    };
    fetchHewan();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!hewan) return <div>Data hewan tidak ditemukan.</div>;

  let kondisiArr = [];
  try {
    kondisiArr = Array.isArray(hewan.kondisi)
      ? hewan.kondisi
      : JSON.parse(hewan.kondisi || '[]');
  } catch {
    kondisiArr = [];
  }

  const conditionRows = [
    ["Sehat", "Vaksin", "Steril"],
    ["Jinak", "Cacat", "Lecet"]
  ];

  return (
    <div className="profil-container">
      <HeaderAdmin />
      <main className="main-content">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <button 
            onClick={() => navigate(-1)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#955b24',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            ← Kembali
          </button>
          <h1 className="page-title">Profil Hewan</h1>
        </div>
        <section className="profile-section">
          <img
            src={`${import.meta.env.VITE_API_BASE}/uploads/${hewan.foto}`}
            alt={hewan.nama}
            className="animal-img"
            onError={e => (e.target.src = '/assets/anjing.png')}
          />
          <div className="labels">
            <h3 className="label">PROFIL <span className="paw">🐾</span></h3>
            <h3 className="label">KONDISI <span className="paw">🐾</span></h3>
          </div>
          <div className="info-box">
            <div className="left-box">
              <h2>{hewan.nama}<br />{hewan.umur} Tahun <br />{hewan.jenis}</h2>
            </div>
            <div className="right-box">
              {conditionRows.map((row, rowIndex) => (
                <div className="condition-checklist" key={rowIndex}>
                  {row.map((cond) => (
                    <label key={cond} className="checkbox-item">
                      <input type="checkbox" checked={kondisiArr.includes(cond)} readOnly />
                      {cond}
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {targetUserId && user && (
          <ChatComponent
            userId={targetUserId}
            hewanId={hewan.id}
            senderId={admin.id}
          />
        )}
      </main>
      <FooterAdmin />
    </div>
  );
};

const ChatComponent = ({ userId, hewanId, senderId }) => {
  const { token } = useUserStore(); // Tambahkan ini agar token tetap reaktif
  const admin = useUserStore((state) => state.user);
  const [chatList, setChatList] = useState([]);
  const [message, setMessage] = useState("");
  const chatBoxRef = useRef(null);

      const fetchChats = async () => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/chat/${hewanId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await res.json();
          setChatList(data);
        } catch (err) {
          console.error('Gagal mengambil chat:', err);
        }
      };


  useEffect(() => {
    fetchChats();
    const interval = setInterval(fetchChats, 2000);
    return () => clearInterval(interval);
  }, [userId, hewanId]);

  useEffect(() => {
    chatBoxRef.current?.scrollTo({ top: chatBoxRef.current.scrollHeight, behavior: 'smooth' });
  }, [chatList]);

  const sendMessage = async () => {
    if (!message.trim()) return;
    try {
    await fetch(`${import.meta.env.VITE_API_BASE}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        userId,
        hewanId,
        senderId: admin.id,
        message
        })
      });
      setMessage("");
      fetchChats();
    } catch (err) {
      console.error('Gagal kirim pesan:', err);
    }
  };

  return (
    <section className="chat-section">
      <h3>Chat</h3>
      <div className="chat-messages" ref={chatBoxRef} style={{ maxHeight: 300, overflowY: 'auto' }}>
        {chatList.map((chat, index) => (          
            <div key={index} className={`chat-message ${chat.senderId === admin.id ? 'chat-user' : 'chat-admin'}`}>
              <div className="chat-bubble">
                <strong>{chat.senderId === admin.id ? 'Anda' : chat.User?.username || 'User'}:</strong>
                {chat.message}
              </div>
            </div>
        ))}
      </div>
      <div className="chat-box">
        <input
          className="chat-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tulis pesan..."
        />
        <button className="chat-post" onClick={sendMessage}>Kirim</button>
      </div>
    </section>
  );
};


const HeaderAdmin = () => (
  <header style={{
    backgroundColor: '#955b24',
    padding: '15px 30px',
    color: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: 'bold'
  }}>
    <div style={{ fontSize: '22px' }}>Profil Hewan</div>
    <nav style={{ display: 'flex', gap: '25px', fontSize: '16px' }}>
      <span style={{ color: '#ffd7a0' }}>Admin</span>
    </nav>
  </header>
);

const FooterAdmin = () => (
  <footer style={{
    backgroundColor: '#d6b88d',
    color: '#3a1e0c',
    textAlign: 'center',
    padding: '30px 20px',
    fontSize: '14px',
    marginTop: '40px'
  }}>
    <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>SIWON</p>
    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
      <span>Service</span>
      <span>Support</span>
      <span>Company</span>
      <span>Legal</span>
      <span>Join Us</span>
    </div>
    <p style={{ marginTop: '10px', fontSize: '12px', color: '#6c4c2a' }}>
      &copy; {new Date().getFullYear()} SIWON. All rights reserved.
    </p>
  </footer>
);

export default ProfilAdmin;
