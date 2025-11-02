import React from "react";

export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-content">
          <h1>PaneStify</h1>
          <div className="header-right">
            <p className="tagline">Search songs, artists, albums — and make your own playlists!</p>
            <img src="/assets/icon.png" alt="PaneStify Icon" className="header-icon" />
          </div>
        </div>
      </div>
    </header>
  );
}
