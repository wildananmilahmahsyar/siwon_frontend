// src/admin.jsx
import '../css/admin.css';
import React, { useEffect, useState } from 'react';
import useUserStore from '../store/userStore';
import { useNavigate } from 'react-router-dom';


const Admin = () => {
  const { token } = useUserStore();
  const { user, role, clearUser } = useUserStore(); 
  const navigate = useNavigate();

  // ⛔️ Validasi role hanya admin yang boleh akses halaman ini
      useEffect(() => {
        if (role !== 'admin') {
          alert('Akses ditolak! Halaman ini hanya untuk Admin.');
          navigate('/');
        }
      }, [role, navigate]);

  const [showPopup, setShowPopup] = useState(false);
  const [editingHewan, setEditingHewan] = useState(null);
  const [formData, setFormData] = useState({ nama: '', jenis: '', umur: '', kondisi: [], foto: '' });
  const [hewanList, setHewanList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [pengajuanMenunggu, setPengajuanMenunggu] = useState([]);
  const [popupUser, setPopupUser] = useState(null);
  const [popupHewan, setPopupHewan] = useState(null);

  const fetchHewan = async () => {
    try {
      console.log("Fetching hewan untuk adminId:", user?.adminId || user?.id);
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/hewan?adminId=${user?.adminId || user?.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      console.log("Data hewan berhasil diambil:", data);
      setHewanList(data);
    } catch (err) {
      console.error('Gagal fetch hewan:', err);
    }
  };


      useEffect(() => {
        if (user?.adminId || user?.id) {
          fetchHewan();
        }
      }, [user]);


  // Modify the useEffect that fetches pengajuan data
  useEffect(() => {
    if (user?.id) {
      fetch(`${import.meta.env.VITE_API_BASE}/api/pengajuan/menunggu?adminId=${user.adminId || user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        .then(res => res.json())
        .then(data => {
          console.log('Response API lengkap:', data);
          data.forEach(item => {
            console.log('Format foto untuk pengajuan ID:', item.id);
            console.log('Foto:', item.foto ? item.foto.substring(0, 50) : 'tidak ada foto');
          });
          setPengajuanMenunggu(data);
        })
        .catch(error => {
          console.error('Error fetching pengajuan:', error);
          setPengajuanMenunggu([]);
        });
    }
  }, [user?.id]); // Add user.id as dependency

  const handleLogout = () => {
    clearUser();
    navigate('/login');
  };

  const togglePopup = () => setShowPopup(!showPopup);

  const closePopupOutside = (e) => {
    if (e.target.classList.contains('popup-overlay')) {
      setShowPopup(false);
      setEditingHewan(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const kondisi = checked ? [...prev.kondisi, value] : prev.kondisi.filter((k) => k !== value);
      return { ...prev, kondisi };
    });
  };

const handleFileChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('image', file);

  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });
    const data = await res.json();
    if (res.ok) {
      setFormData((prev) => ({ ...prev, foto: data.filename }));
    } else {
      alert('Gagal upload gambar');
    }
  } catch (err) {
    alert('Terjadi kesalahan saat upload gambar');
  }
};




  const handleSubmit = async () => {
    const url = editingHewan
      ? `${import.meta.env.VITE_API_BASE}/api/hewan/${editingHewan}`
      : `${import.meta.env.VITE_API_BASE}/api/hewan`;
    const method = editingHewan ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
        body: JSON.stringify({ ...formData, kondisi: formData.kondisi, adminId: user?.adminId || user?.id })
      });

      if (res.ok) {
        alert(editingHewan ? 'Data diperbarui!' : 'Data ditambahkan!');
        setFormData({ nama: '', jenis: '', umur: '', kondisi: [], foto: '' });
        setShowPopup(false);
        setEditingHewan(null);
        fetchHewan();
      } else {
        alert('Gagal menyimpan data.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat mengirim data.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus data ini?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/hewan/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        alert('Data dihapus');
        setHewanList(hewanList.filter((h) => h.id !== id));
      } else {
        alert('Gagal menghapus data');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan.');
    }
  };

  const startEdit = (hewan) => {
    setShowPopup(true);
    setEditingHewan(hewan.id);
    setFormData({
      nama: hewan.nama,
      jenis: hewan.jenis,
      umur: hewan.umur,
      kondisi: JSON.parse(hewan.kondisi),
      foto: hewan.foto
    });
  };

  const handleVerifikasi = async (id, status) => {
    if (!window.confirm(`Yakin ingin ${status === 'diterima' ? 'menerima' : 'menolak'} pengajuan ini?`)) return;
    await fetch(`${import.meta.env.VITE_API_BASE}/api/pengajuan/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    setPengajuanMenunggu(pengajuanMenunggu.filter((p) => p.id !== id));
  };

  const totalPages = Math.ceil(hewanList.length / itemsPerPage);
  const currentData = hewanList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="admin-container">
      <header className="header">
        <div className="header-left"><div className="logo">SIWON</div></div>
        <div className="admin-username">
          {user?.username || 'Admin'}
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <main className="admin-content">
        <section className="admin-card">
          <h3 className="section-title">Data Hewan</h3>
          <button className="btn-edit" onClick={togglePopup}>MASUKKAN HEWAN</button>

          {showPopup && (
            <div className="popup-overlay" onClick={closePopupOutside}>
              <div className="popup-form" onClick={(e) => e.stopPropagation()}>
                <h3>Tambah Data Adopsi</h3>
                <div className="popup-content">
                  <div className="popup-image">
                    {formData.foto ? (
                      <img
                        src={`${import.meta.env.VITE_API_BASE}/uploads/${formData.foto}`}
                        alt="Preview"
                        style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '8px' }}
                        onError={(e) => (e.target.src = '/assets/anjing.png')}
                      />
                    ) : <span>foto</span>}
                  </div>
                  <input type="file" accept="image/*" onChange={handleFileChange} />
                  <input type="text" name="nama" placeholder="Nama Hewan" value={formData.nama} onChange={handleInputChange} />
                  <select name="jenis" value={formData.jenis} onChange={handleInputChange}>
                    <option value="">Pilih Jenis Hewan</option>
                      <option value="anjing">Anjing</option>
                      <option value="kucing">Kucing</option>
                      <option value="kelinci">Kelinci</option>
                      <option value="hamster">Hamster</option>
                      <option value="guinea-pig">Guinea Pig</option>
                      <option value="burung">Burung</option>
                      <option value="ikan">Ikan</option>
                      <option value="kura-kura">Kura-kura</option>
                      <option value="sugar-glider">Sugar Glider</option>
                      <option value="ferret">Ferret</option>
                      <option value="landak-mini">Landak Mini</option>
                      <option value="ular">Ular</option>
                      <option value="kadal">Kadal</option>
                      <option value="tikus-putih">Tikus Putih</option>
                      <option value="ayam-hias">Ayam Hias</option>
                      <option value="bebek">Bebek</option>
                      <option value="chinchilla">Chinchilla</option>
                      <option value="chinchilla">Panda</option>
                  </select>
                  <input type="text" name="umur" placeholder="Umur" value={formData.umur} onChange={handleInputChange} />
                  <div className="checkbox-group">
                    {['Sehat', 'Cacat', 'Steril', 'Vaksin', 'Jinak', 'Lecet'].map((item, idx) => (
                      <label key={idx}>
                        <input type="checkbox" value={item} checked={formData.kondisi.includes(item)} onChange={handleCheckboxChange} /> {item}
                      </label>
                    ))}
                  </div>
                  <button className="upload-btn" onClick={handleSubmit}>{editingHewan ? 'Update' : 'Upload'} Data</button>
                </div>
              </div>
            </div>
          )}

          <table className="admin-table">
            <thead>
              <tr>
                <th>Id</th>
                <th>Nama Hewan</th>
                <th>Jenis</th>
                <th>Foto</th>
                <th>Edit</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((hewan) => (
                <tr key={hewan.id}>
                  <td>{hewan.id}</td>
                  <td>{hewan.nama}</td>
                  <td>{hewan.jenis}</td>
                  <td>
                  <img
                      src={`${import.meta.env.VITE_API_BASE}/uploads/${hewan.foto}`}
                      alt={hewan.nama}
                      onError={(e) => e.target.src = '/assets/anjing.png'}
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                  </td>
                  <td>
                  <button className="btn-edit" onClick={() => startEdit(hewan)}>Edit</button>
                  <button className="btn-delete" onClick={() => handleDelete(hewan.id)}>Delete</button>
                  <button
                    className="btn-profil"
                    onClick={() => navigate(`/profiladmin/${hewan.id}`)}
                    style={{ background: '#d6b88d', color: '#3a1e0c', marginLeft: 6 }}
                  >
                    Detail
                  </button>
                </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}>&lt; Previous</button>
            {[...Array(totalPages)].map((_, idx) => (
              <button key={idx} className={currentPage === idx + 1 ? 'active' : ''} onClick={() => setCurrentPage(idx + 1)}>{idx + 1}</button>
            ))}
            <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}>Next &gt;</button>
          </div>
        </section>
        <section className="admin-card">
          <h3 className="section-title">Verifikasi Pengajuan</h3>
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Hewan</th>
                <th>Verifikasi</th>
              </tr>
            </thead>
            <tbody>
              {pengajuanMenunggu.map((p) => (
                <tr key={p.id}>
                  <td>
                    <button className="btn-profil" onClick={() => {
                      const userData = {
                        ...p,
                        foto: p.foto // Pastikan foto terambil dengan benar
                      };
                      console.log('Data lengkap yang akan ditampilkan:', userData);
                      console.log('Format foto:', typeof p.foto, p.foto ? p.foto.substring(0, 50) : 'tidak ada foto');
                      setPopupUser(userData);
                    }}>Profil</button>
                  </td>
                  <td>
                    <button className="btn-profil" onClick={() => setPopupHewan(p.Hewan)}>Profil</button>
                  </td>
                  <td>
                    <button className="btn-edit" onClick={() => handleVerifikasi(p.id, 'diterima')}>Terima</button>
                    <button className="btn-delete" onClick={() => handleVerifikasi(p.id, 'ditolak')}>Tolak</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

      </main>
      
      {/* Tambahkan console.log untuk debugging */}
      {popupUser && (
        <div className="popup-overlay" onClick={() => setPopupUser(null)}>
          <div className="popup-content" style={{color: 'black'}} onClick={e => e.stopPropagation()}>
            <h3>Profil Lengkap Pengguna</h3>
            
            {/* Ubah logika penampilan foto */}
            {popupUser.foto ? (
              <img
                src={popupUser.foto
                        ? popupUser.foto.startsWith('/uploads/')
                          ? `${import.meta.env.VITE_API_BASE}${popupUser.foto}`
                          : `${import.meta.env.VITE_API_BASE}/uploads/${popupUser.foto}`
                        : '/assets/anjingdeh.png'}
                alt={popupUser.nama}
                onError={(e) => {
                  console.log('Error loading image:', e);
                  e.target.onerror = null;
                  e.target.src = "/assets/anjingdeh.png";
                }}
                style={{ 
                  width: 150, 
                  height: 150, 
                  objectFit: 'cover', 
                  borderRadius: 10, 
                  marginBottom: 10,
                  border: '2px solid #333'
                }}
              />
            ) : (
              <div style={{
                width: 150,
                height: 150,
                backgroundColor: '#f0f0f0',
                borderRadius: 10,
                marginBottom: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #333'
              }}>
                <span>Tidak ada foto</span>
              </div>
            )}
            
            <p><strong>Username Akun:</strong> {popupUser.User?.username || '-'}</p>
            <p><strong>Nama Lengkap:</strong> {popupUser.nama}</p>
            <p><strong>Jenis Kelamin:</strong> {popupUser.jenisKelamin || '-'}</p>
            <p><strong>Tanggal Lahir:</strong> {popupUser.tanggalLahir || '-'}</p>
            <p><strong>Email:</strong> {popupUser.User?.email || '-'}</p>
            <p><strong>No. HP:</strong> {popupUser.noHp || '-'}</p>
            <p><strong>Alamat:</strong> {popupUser.alamat || '-'}</p>
            <p><strong>Alasan Adopsi:</strong> {popupUser.alasan || '-'}</p>
            <p><strong>Tanggal Pengajuan:</strong> {popupUser.createdAt ? new Date(popupUser.createdAt).toLocaleString() : '-'}</p>
            
            <button 
              onClick={() => setPopupUser(null)}
              style={{
                marginTop: 10,
                padding: '8px 16px',
                backgroundColor: '#955b24',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer'
              }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}

        {popupHewan && (
          <div className="popup-overlay" onClick={() => setPopupHewan(null)}>
            <div className="popup-content"  style={{color: 'black'}} onClick={e => e.stopPropagation()}>
              <h3>Detail Lengkap Hewan</h3>
              {popupHewan.foto && (
                 <img
                      src={`${import.meta.env.VITE_API_BASE}/uploads/${popupHewan.foto}`}
                      alt={popupHewan.nama}
                      onError={(e) => (e.target.src = '/assets/anjingdeh.png')}
                      style={{ width: 150, height: 150, objectFit: 'cover', borderRadius: 10, marginBottom: 10 }}
                    />
                  )}
              <p><strong>Nama:</strong> {popupHewan.nama}</p>
              <p><strong>Jenis:</strong> {popupHewan.jenis}</p>
              <p><strong>Umur:</strong> {popupHewan.umur} tahun</p>
              <p><strong>Kondisi:</strong></p>
              <ul>
                {Array.isArray(popupHewan.kondisi)
                  ? popupHewan.kondisi.map((k, i) => <li key={i}>{k}</li>)
                  : JSON.parse(popupHewan.kondisi || '[]').map((k, i) => <li key={i}>{k}</li>)
                }
              </ul>
              {/* <p><strong>ID Pemilik/Admin:</strong> {popupHewan.userId || '-'}</p> */}
              <button onClick={() => setPopupHewan(null)}>Tutup</button>
            </div>
          </div>
        )}

    </div>
  );
};

export default Admin;
