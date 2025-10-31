import React from "react";

export default function DetailCard({ selected }) {
  if (!selected) {
    return (
      <div className="detail-card">
        <h3>Details</h3>
        <p className="muted">Select a track from the table to see details.</p>
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
