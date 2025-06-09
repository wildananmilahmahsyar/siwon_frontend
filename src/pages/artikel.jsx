import React from 'react';
import '../css/artikel.css';
import dogImage from '../assets/anjingdeh.png';

const Artikel = () => {
  return (
    <main className="artikel-container">
      <div className="left-section">
        <h1>Temukan berbagai artikel edukatif tentang hewan, perawatan, dan kesehatannya.</h1>

        {/* Artikel Utama */}
        <ArticleCard
          title="8 Cara Merawat Kucing agar Tubuhnya Sehat"
          link="https://www.alodokter.com/8-cara-merawat-kucing-agar-tubuhnya-sehat"          
          excerpt="Artikel ini membahas langkah-langkah penting dalam merawat kucing, seperti pemberian makanan sehat, menjaga kebersihan kotak pasir, serta vaksinasi dan perawatan bulu secara rutin agar kucing tetap sehat dan aktif."
        />
        <ArticleCard
          title="10 Cara Merawat Anjing Peliharaan agar Sehat dan Bahagia"
          link="https://hellosehat.com/sehat/informasi-kesehatan/cara-merawat-anjing/"
          excerpt="Membahas tentang kebutuhan nutrisi, rutinitas grooming, aktivitas fisik, serta vaksinasi dan pemeriksaan kesehatan untuk menjaga kebugaran dan kesehatan anjing peliharaan."
        />
        <ArticleCard
          title="Khusus Pemula, Ini Tips Merawat Hamster"
          link="https://www.halodoc.com/artikel/khusus-pemula-ini-tips-merawat-hamster"
          excerpt="Panduan lengkap bagi pemula dalam merawat hamster, mulai dari pemilihan kandang yang tepat, pemberian pakan, hingga menjaga kebersihan dan kesehatan hamster agar tetap aktif dan sehat."
        />
      </div>

      <div className="right-section">
        <h3>Trending</h3>

        <ArticleCard
          title="7 Cara Menjinakkan Kucing agar Lebih Ramah dan Penurut"
          link="https://www.purina.co.id/artikel/kucing/perilaku/latihan/cara-menjinakkan"
          excerpt="Artikel ini khusus membahas cara menjinakkan kucing yang galak atau pemalu. Dengan pendekatan yang lembut dan penuh perhatian, kucing dapat menjadi lebih ramah dan penurut."
        />

        <ArticleCard
          title="10 Cara Menjinakkan Anjing yang Galak dan Tidak Mau Nurut"
          link="https://hellosehat.com/sehat/informasi-kesehatan/cara-menjinakkan-anjing/"
          excerpt="Artikel ini memberikan sepuluh cara untuk menjinakkan anjing yang galak, termasuk memahami jenis dan karakteristik anjing, memberikan pelatihan sejak usia dini, serta menggunakan pendekatan yang konsisten dan penuh kasih sayang."
        />
      </div>
    </main>
  );
};

// ✅ Komponen Artikel
const ArticleCard = ({ title, link, excerpt }) => (
  <div className="article-card">
    <img src={dogImage} alt="Artikel" />
    <div className="article-content">
      <h2>{title}</h2>
      <p className="category">
        <a href={link} target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc' }}>
          {link}
        </a>
      </p>
      <p className="excerpt">{excerpt}</p>
    </div>
  </div>
);

export default Artikel;
