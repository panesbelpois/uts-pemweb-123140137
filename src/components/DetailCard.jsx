import React from "react";

export default function DetailCard({ selected }) {
  if (!selected) {
    return (
      <div className="detail-card">
        <h3>Details & How to use</h3>
        <div className="muted small">
          <p>Belum ada track yang dipilih. Berikut cara menggunakan aplikasi:</p>
          <ol>
            <li>Isi <strong>Keyword</strong> lalu pilih <strong>Media</strong> (dan <strong>Genre</strong> jika mau), set <strong>Limit</strong>, centang <em>Include explicit</em> jika perlu, lalu klik <strong>Search</strong>.</li>
            <li>Hasil akan muncul di tabel. Gunakan kontrol <strong>Sort by</strong> dan <strong>Direction</strong> untuk mengurutkan hasil berdasarkan release date atau price.</li>
            <li>Klik judul pada baris (Track / Collection) untuk melihat detail dan memutar preview audio.</li>
            <li>Untuk menyimpan lagu ke playlist, klik tombol <strong>Add</strong>. Playlist tersimpan otomatis di <code>localStorage</code>.</li>
            <li>Di panel kanan, Anda bisa memutar preview dari playlist, <strong>Export</strong> (download JSON) atau <strong>Clear</strong> untuk mengosongkan playlist.</li>
          </ol>
          <p>Tips: jika ingin memfilter berdasarkan genre, pilih <strong>Genre</strong> sebelum melakukan pencarian — aplikasi melakukan penyaringan genre di sisi-klien.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-card">
      <h3>Details</h3>
      <div className="detail-inner">
        <img src={selected.artworkUrl100 ?? selected.artworkUrl60} alt={selected.trackName} />
        <div className="detail-meta">
          <h4>{selected.trackName ?? selected.collectionName}</h4>
          <p className="sub">{selected.artistName}</p>
          <p className="muted">Album: {selected.collectionName ?? "—"}</p>
          <p>Release: {selected.releaseDate ? new Date(selected.releaseDate).toLocaleDateString() : "—"}</p>
          <p>Genre: {selected.primaryGenreName ?? "—"}</p>
          <p>Price: { (selected.trackPrice ?? selected.collectionPrice) ? `$${(selected.trackPrice ?? selected.collectionPrice).toFixed(2)}` : "—"}</p>
          {selected.previewUrl && (
            <div className="preview">
              <p className="muted">Preview</p>
              <audio controls src={selected.previewUrl} preload="none" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
