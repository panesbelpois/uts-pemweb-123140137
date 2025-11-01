import React from "react";

export default function Sidebar() {
  return (
    <div className="sidebar-inner">
      <div className="logo">PaneStify</div>
      <ul className="nav">
        <li className="nav-item active">Home</li>
        <li className="nav-item">Search</li>
        <li className="nav-item">Your Library</li>
      </ul>

      <div className="playlists">
        <h4>Playlists</h4>
        <ul>
          <li>Liked Songs</li>
          <li>Chill Vibes</li>
          <li>Top Hits</li>
          <li>My Mix</li>
        </ul>
      </div>

      <div className="sidebar-footer">
        <small>Premium • PaneStify</small>
      </div>
    </div>
  );
}
