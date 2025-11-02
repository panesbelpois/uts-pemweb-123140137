import React from "react";

const NAV_ITEMS = [
  { id: "home", label: "Home" },
  { id: "search", label: "Search" },
  { id: "library", label: "Your Library" },
];

export default function Sidebar({ active, onNavigate, playlists = {}, covers = {}, onSelectPlaylist, onCreatePlaylist, onDeletePlaylist }) {

  return (
    <div className="sidebar-inner">
      <div className="logo">PaneStify</div>
      <ul className="nav" role="menubar" aria-label="Main">
        {NAV_ITEMS.map((it) => (
          <li key={it.id} className={`nav-item ${active === it.id ? "active" : ""}`}>
            <button type="button" className="nav-link" aria-current={active === it.id ? "page" : undefined} onClick={() => onNavigate && onNavigate(it.id)}>{it.label}</button>
          </li>
        ))}
      </ul>

      <div className="playlists">
        <h4>Library</h4>
        <ul className="nav playlist-nav">
          <li className="nav-item">
            <button 
              type="button" 
              className={`nav-link ${active === 'Liked Songs' ? 'active' : ''}`}
              onClick={() => onSelectPlaylist && onSelectPlaylist('Liked Songs')}
            >
              Liked Songs
            </button>
          </li>
          {Object.keys(playlists).filter(name => name !== 'Liked Songs').map((name) => (
            <li key={name} className="nav-item playlist-row">
              <button 
                type="button" 
                className={`nav-link ${active === name ? "active" : ""}`}
                onClick={() => onSelectPlaylist && onSelectPlaylist(name)}
              >
                {covers && covers[name] ? (
                  <img
                    src={covers[name]}
                    alt={`${name} thumbnail`}
                    style={{width:28, height:28, objectFit:'cover', borderRadius:6, marginRight:8, verticalAlign:'middle'}}
                    onError={(e) => { e.target.style.display = 'none'; console.warn('Broken cover in Sidebar for', name); }}
                  />
                ) : null}
                {name}
              </button>
              {name !== 'Liked Songs' && (
                <button type="button" className="delete-playlist" title="Delete playlist" onClick={() => onDeletePlaylist && onDeletePlaylist(name)}>×</button>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="bottom-section">
        <div className="sidebar-footer">
        </div>
      </div>
    </div>
  );
}
