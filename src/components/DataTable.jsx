import React from "react";

export default function DataTable({ results, onSelect, onAddToPlaylist, playlist, likedSongs }) {
  if (!results || results.length === 0) {
    return <div className="empty">No results yet. Try a search.</div>;
  }

  const isInPlaylist = (track) => {
    const id = track.trackId ?? track.collectionId;
    return playlist.some(p => (p.trackId ?? p.collectionId) === id);
  };

  const isLiked = (track) => {
    const id = track.trackId ?? track.collectionId;
    return likedSongs.some(p => (p.trackId ?? p.collectionId) === id);
  };

  return (
    <div className="data-table">
      <table>
        <thead>
          <tr>
            <th>Artwork</th>
            <th>Track / Collection</th>
            <th>Artist</th>
            <th>Price</th>
            <th>Preview</th>
            <th>Like</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {results.map(item => (
            <tr key={item.trackId ?? item.collectionId ?? item.artistId + item.trackName}>
              <td className="artwork-cell">
                <img src={item.artworkUrl60 ?? item.artworkUrl100} alt={item.trackName ?? item.collectionName} />
              </td>
              <td className="track-cell">
                <div className="track-title" onClick={() => onSelect(item)} role="button" tabIndex={0}>
                  {item.trackName ?? item.collectionName}
                </div>
                <div className="small muted">{item.collectionName}</div>
              </td>
              <td>{item.artistName}</td>
              <td>
                { (item.trackPrice ?? item.collectionPrice) ? `$${(item.trackPrice ?? item.collectionPrice).toFixed(2)}` : "—" }
              </td>
              <td>
                {item.previewUrl ? (
                  <audio controls src={item.previewUrl} preload="none" />
                ) : <span className="muted">No preview</span>}
              </td>
              <td>
                <button
                  className={`btn small ghost ${playlist.some(p => (p.trackId ?? p.collectionId) === (item.trackId ?? item.collectionId)) ? "liked" : ""}`}
                  onClick={() => onAddToPlaylist(item, "Liked Songs")}
                  title="Add to Liked Songs"
                >
                  ♥
                </button>
              </td>
              <td>
                <button
                  className={`btn small ${isInPlaylist(item) ? "disabled" : ""}`}
                  onClick={() => onAddToPlaylist(item)}
                  disabled={isInPlaylist(item)}
                >
                  {isInPlaylist(item) ? "Added" : "Add"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
