import { BrowserRouter as Router, Routes, Route, useLocation , useNavigate} from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import useUserStore from './src/store/userStore';
import './App.css';
import Login from './src/pages/login';
import Regis from '/src/pages/regis';
import Admin from '/src/pages/admin';
import Dashboard from '/src/pages/Dashboard';
import Artikel from '/src/pages/artikel';
import Header from './src/components/Header';
import Footer from './src/components/Footer';
import dogImage from './src/assets/anjing.png';
import Profil from './src/pages/profil'; // pastikan sudah di-import
import ProfilAdmin from './src/pages/ProfilAdminTemp';
import Hasil from './src/pages/Hasil';

const AppContent = () => {
  const location = useLocation();

  return (
    <div className="app">
      {/* Header hanya ditampilkan jika bukan di halaman login atau regis */}
      {!['/login', '/regis', '/admin'].includes(location.pathname) && !location.pathname.startsWith('/profiladmin') && <Header />}


      {/* Routing */}
      <Routes>
        <Route path="/regis" element={<Regis />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} /> {/* Route ke Dashboard */}
        <Route path="/admin" element={<Admin />} />
        <Route path="/" element={<Home />} />
        <Route path="/artikel" element={<Artikel />} />
        <Route path="/profil/:id" element={<Profil />} /> {/* Tambahkan ini */}
        <Route path="/profiladmin/:id" element={<ProfilAdmin />} />
        <Route path="/hasil/:status/:id" element={<Hasil />} />
      </Routes>

      {/* Footer hanya tampil jika bukan halaman login atau regis */}
      {!['/login', '/regis', '/admin'].includes(location.pathname) && !location.pathname.startsWith('/profiladmin') && <Footer />}
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

const Home = () => {
  const [hewanList, setHewanList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const user = useUserStore((state) => state.user);
  const navigate = useNavigate();
  const [filterJenis, setFilterJenis] = useState('');
  const [noResult, setNoResult] = useState(false);
  const [searchNama, setSearchNama] = useState('');

useEffect(() => {
  const fetchData = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (searchNama) {
        queryParams.append('nama', searchNama); // sekarang `nama` dianggap sebagai jenis
      } else if (filterJenis) {
        queryParams.append('jenis', filterJenis.toLowerCase());
      }

      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/hewan?${queryParams.toString()}`);
      if (!res.ok) {
        setHewanList([]);
        setNoResult(true);
        return;
      }
      const data = await res.json();
      setHewanList(data);
      setNoResult(false);
    } catch (err) {
      console.error('Gagal ambil data:', err);
      setNoResult(true);
    }
  };

  fetchData();
}, [filterJenis, searchNama]); // 🆕 Tambahkan searchNama sebagai dependency



  const totalPages = Math.ceil(hewanList.length / itemsPerPage);
  const currentData = hewanList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <section className="hero">
        <div className="hero-overlay">
          <h1>SIWON</h1>
          <p>Adopsi hewan secara bertanggung jawab melalui platform kami.</p>
        </div>
      </section>

      <section className="search-filter">
        <input type="text" className="search-input" placeholder="🔍  Cari nama hewan..." value={searchNama} onChange={(e) => setSearchNama(e.target.value)} />
          <div className="filter-tags">
            {['Kucing', 'Anjing', 'Ayam', 'Kelinci', 'Burung', 'Ikan'].map((tag, index) => (
              <button
                key={index}
                className={`filter-tag ${filterJenis === tag ? 'active' : ''}`}
                onClick={() => {
                                  setFilterJenis(tag);
                                  setSearchNama(''); // supaya tidak saling tabrakan
                                }}
              >
                {tag}
              </button>
            ))}
            <button
              className={`filter-tag ${filterJenis === '' ? 'active' : ''}`}
              onClick={() => setFilterJenis('')}
            >
              Semua
            </button>
          </div>
      </section>

    <section className="animal-gallery">
      {noResult ? (
        <div className="no-result">
          <p style={{ textAlign: 'center', color: '#e74c3c', fontWeight: 'bold', fontSize: 18 }}>
            Hewan dengan jenis <em>{filterJenis}</em> belum tersedia.
          </p>
        </div>
      ) : (
        currentData.map((hewan, index) => (
          <div className="animal-card" key={index}>
            <img
              src={`${import.meta.env.VITE_API_BASE}/uploads/${hewan.foto}`}
              alt={hewan.nama}
              onError={(e) => (e.target.src = '/assets/anjing.png')}
            />
            <h3>{hewan.nama}</h3>
            <p>{hewan.umur} Tahun</p>
            <button
              className="adopt-btn"
              onClick={() => {
                if (user) {
                  navigate(`/profil/${hewan.id}`);
                } else {
                  navigate('/login');
                }
              }}
            >
              PROFILE
            </button>
          </div>
        ))
      )}
    </section>


      <div className="pagination">
        <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}>&lt;</button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            className={currentPage === i + 1 ? 'active' : ''}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}>&gt;</button>
        
      </div>
    </>
  );
};




export default App;
