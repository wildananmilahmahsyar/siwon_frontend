// src/pages/Profil.jsx
import React, { useEffect, useState } from 'react';
import useUserStore from '../store/userStore';
import '../css/profil.css';
import { useParams, useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Profil = () => {
  const { id } = useParams();
  const [hewan, setHewan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [pengajuan, setPengajuan] = useState(null);
  const user = useUserStore((state) => state.user);
  const navigate = useNavigate();
  const [refreshPengajuan, setRefreshPengajuan] = useState(false);
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
      } catch (err) {
        setHewan(null);
      } finally {
        setLoading(false);
      }
    };
    fetchHewan();
  }, [id]);

  // Ambil pengajuan user untuk hewan ini
  useEffect(() => {
    if (user) {
      fetch(`${import.meta.env.VITE_API_BASE}/api/pengajuan/user/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          const found = data
            .filter(p => String(p.hewanId) === String(id))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
          setPengajuan(found || null);
        })
        .catch(() => setPengajuan(null));
    }
  }, [user, id, showPopup, refreshPengajuan]);


  if (loading) return <div>Loading...</div>;
  if (!hewan) return <div>Data hewan tidak ditemukan.</div>;

  // Pastikan kondisi berupa array
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
 
const handleCancelAdopsi = async () => {
  if (!pengajuan || !pengajuan.id) return;

  const konfirmasi = window.confirm('Yakin ingin membatalkan pengajuan adopsi ini?');
  if (!konfirmasi) return;

  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/pengajuan/${pengajuan.id}/batal`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (res.ok) {
      const updated = await res.json();
      alert('Pengajuan berhasil dibatalkan.');
      setRefreshPengajuan(prev => !prev); // trigger reload pengajuan
    } else {
      alert('Gagal membatalkan pengajuan.');
    }
  } catch (err) {
    console.error('Error:', err);
    alert('Terjadi kesalahan saat membatalkan.');
  }
};



  return (
    <div className="profil-container">
      
      <main className="main-content">
        <h1 className="page-title">Profil Hewan</h1>
        <section className="profile-section">
          {/* {pengajuan && (
            <div style={{ textAlign: 'center', marginBottom: 10, fontStyle: 'italic' }}>
              <strong>Status pengajuan:</strong> {pengajuan.status}
            </div>
          )} */}

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
              {/* <div>Jenis: {hewan.jenis}</div> */}
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

          {/* Tombol dinamis sesuai status pengajuan */}
          {!user && (
            <button className="adopt-btn" onClick={() => navigate('/login')}>
              Login untuk Adopsi
            </button>
          )}

          {user && pengajuan === null && (
            <button className="adopt-btn" onClick={() => setShowPopup(true)}>
              Ajukan Adopsi
            </button>
          )}

          {user && pengajuan?.status === 'ditolak' && (
            <button className="adopt-btn" onClick={() => setShowPopup(true)}>
              Ajukan Ulang Adopsi
            </button>
          )}

          {user && pengajuan?.status === 'diterima' && (
            <button className="adopt-btn" disabled>
              Pengajuan Diterima ✅
            </button>
          )}

          {user && pengajuan?.status === 'menunggu' && (
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="adopt-btn" disabled>
                Ajuan sedang diproses
              </button>
              <button
                className="adopt-btn"
                style={{ background: '#e74c3c' }}
                onClick={handleCancelAdopsi}
              >
                Batalkan Adopsi
              </button>
            </div>
          )}

          {user && pengajuan?.status === 'dibatalkan' && (
            <button className="adopt-btn" onClick={() => setShowPopup(true)}>
              Ajukan Ulang Adopsi
            </button>
          )}


        </section>
        {showPopup && <PopupForm onClose={() => setShowPopup(false)} />}
        {user && <ChatComponent user={user} hewanId={hewan.id} />}
      </main>
      
    </div>
  );
};

const PopupForm = ({ onClose }) => {
  const { token } = useUserStore();
  const { id: hewanId } = useParams();
  const user = useUserStore((state) => state.user); // Ambil user dari zustand
  const [form, setForm] = useState({
    nama: '',
    jenisKelamin: '',
    tanggalLahir: '',
    email: '',
    noHp: '',
    alamat: '',
    alasan: '',
    foto: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [notif, setNotif] = useState({ show: false, type: '', message: '' }); // Notifikasi

  const showNotif = (type, message) => {
    setNotif({ show: true, type, message });
    setTimeout(() => setNotif({ show: false, type: '', message: '' }), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

const handleImageChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // ✅ Validasi ukuran file maksimal 10MB
  if (file.size > 10 * 1024 * 1024) {
    alert('Ukuran file terlalu besar. Maksimal 10MB');
    e.target.value = ''; // Reset input file
    return;
  }

  const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/upload/pengaju`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData,
        });
      const data = await res.json();
      if (res.ok) {
        setImagePreview(`${import.meta.env.VITE_API_BASE}/uploads/${data.filename}`);
        setForm((prev) => ({ ...prev, foto: data.filename }));
      } else {
        alert('Upload gagal!');
      }
    } catch (err) {
      console.error('Upload error:', err);
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showNotif('error', 'Anda harus login untuk mengajukan adopsi!');
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/pengajuan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          userId: user.id,
          hewanId: hewanId
        })
      });
      if (res.ok) {
        showNotif('success', 'Pengajuan berhasil dikirim!');
        setTimeout(onClose, 1200); // Tutup popup setelah notifikasi
      } else {
        const text = await res.text();
          try {
            const data = JSON.parse(text);
            if (res.ok) {
              setImagePreview(`${import.meta.env.VITE_API_BASE}/uploads/${data.filename}`);
              setForm((prev) => ({ ...prev, foto: data.filename }));
            } else {
              alert('Upload gagal!');
            }
          } catch {
            console.error('Upload gagal (bukan JSON):', text);
            alert('Upload gagal: respons tidak valid');
          }

        showNotif('error', 'Gagal mengirim pengajuan: ' + (data.error || ''));
      }
    } catch (err) {
      showNotif('error', 'Terjadi kesalahan: ' + err.message);
    }
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={e => e.stopPropagation()}>
        {notif.show && (
          <div
            style={{
              background: notif.type === 'success' ? '#4caf50' : '#e74c3c',
              color: '#fff',
              padding: '10px',
              borderRadius: '6px',
              marginBottom: '10px',
              textAlign: 'center',
              fontWeight: 'bold'
            }}
          >
            {notif.message}
          </div>
        )}
        <h2>Formulir Adopsi</h2>
        <form onSubmit={handleSubmit}>
          <div className="popup-image">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" />
            ) : (
              <span>Foto</span>
            )}
          </div>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          <input type="text" name="nama" placeholder="Nama" value={form.nama} onChange={handleChange} required />
          <select name="jenisKelamin" value={form.jenisKelamin} onChange={handleChange} required>
            <option value="">Pilih Jenis Kelamin</option>
            <option value="Jantan">Jantan</option>
            <option value="Betina">Betina</option>
          </select>
          <input type="date" name="tanggalLahir" value={form.tanggalLahir} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input type="tel" name="noHp" placeholder="No. HP" value={form.noHp} onChange={handleChange} required />
          <input type="text" name="alamat" placeholder="Alamat" value={form.alamat} onChange={handleChange} required />
          <textarea name="alasan" placeholder="Alasan adopsi..." value={form.alasan} onChange={handleChange} required />
          <button className="upload-btn" type="submit">Lanjut</button>
        </form>
      </div>
    </div>
  );
};

export default Profil;

const ChatComponent = ({ user, hewanId }) => {
  const { token } = useUserStore();
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
  }, [user.id, hewanId]);

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
          userId: user.id,
          hewanId,
          senderId: user.id,
          message
        })
      });

      setMessage('');
      fetchChats();
    } catch (err) {
      console.error('Gagal kirim pesan:', err);
    }
  };

  return (
    <section className="chat-section">
      <h3>Chat</h3>
      <div className="chat-messages" ref={chatBoxRef} style={{ maxHeight: 300, overflowY: 'auto' }}>
        {chatList.map((chat, i) => (
      <div key={i} className={`chat-message ${chat.senderId === user.id ? 'chat-admin' : 'chat-user'}`}>
        <div className="chat-bubble">
        <strong>{chat.senderId === user.id ? 'pengguna' : chat.User?.username || 'User'}:</strong>
          {chat.message}
        </div>
      </div>
        ))}
      </div>
      <div className="chat-box">
        <input className="chat-input" value={message} onChange={e => setMessage(e.target.value)} placeholder="Tulis pesan..." />
        <button className="chat-post" onClick={sendMessage}>Kirim</button>
      </div>
    </section>
  );
};