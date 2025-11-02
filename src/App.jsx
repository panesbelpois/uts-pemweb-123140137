import React, { useEffect, useState, useRef } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import SearchForm from "./components/SearchForm";
import DataTable from "./components/DataTable";
import { loadPlaylistsFromStorage, savePlaylistsToStorage, ensurePlaylist } from "./utils/storage";

export default function App() {
  const [queryParams, setQueryParams] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [playlists, setPlaylists] = useState(loadPlaylistsFromStorage());
  const [activePlaylist, setActivePlaylist] = useState(() => {
    const keys = Object.keys(loadPlaylistsFromStorage());
    return keys.length ? keys[0] : "Liked Songs";
  });
  const [sortBy, setSortBy] = useState({ key: "releaseDate", dir: "desc" });
  const [page, setPage] = useState("home");
  const [libraryNewName, setLibraryNewName] = useState("");
  const [libraryTouched, setLibraryTouched] = useState(false);
  const inputRef = useRef(null);
  

  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [addToPlaylistTrack, setAddToPlaylistTrack] = useState(null);

  useEffect(() => {
    savePlaylistsToStorage(playlists);
  }, [playlists]);

  

  useEffect(() => {
    if (page === 'add-playlist' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [page]);

  useEffect(() => {
    if (results.length > 0) {
      const r = [...results].sort((a, b) => {
        if (sortBy.key === "price") {
          const pa = (a.trackPrice ?? a.collectionPrice ?? 0);
          const pb = (b.trackPrice ?? b.collectionPrice ?? 0);
          return sortBy.dir === "asc" ? pa - pb : pb - pa;
        } else {
          const da = new Date(a.releaseDate).getTime() || 0;
          const db = new Date(b.releaseDate).getTime() || 0;
          return sortBy.dir === "asc" ? da - db : db - da;
        }
      });
      setResults(r);
    }
    }, [sortBy]);  useEffect(() => {
    if (!queryParams) return;
    const controller = new AbortController();
    const performSearch = async () => {
      setLoading(true);
      setError(null);
      setResults([]);
      setSelected(null);
      const { term, media, genre, limit, explicit } = queryParams;
      const params = new URLSearchParams();
      params.append("term", term);
      if (media) params.append("media", media);
      if (genre) params.append("genre", genre);
      if (limit !== undefined && limit !== null) params.append("limit", String(limit));
      params.append("explicit", explicit ? "Yes" : "No");
      const url = `https://itunes.apple.com/search?${params.toString()}`;
      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`Network response not ok (${res.status} ${res.statusText}) for ${url}`);
        const data = await res.json();
        let items = (data.results || []);
        if (genre) {
          const g = genre.toLowerCase();
          items = items.filter(it => (it.primaryGenreName || "").toLowerCase().includes(g));
        }
        const results = items.map(item => ({ ...item }));
        setResults(results);
      } catch (err) {
        if (err.name !== "AbortError") {
        setError(err.message || String(err));
        }
      } finally {
        setLoading(false);
      }
    };
    performSearch();
    return () => controller.abort();
  }, [queryParams]);

  const handleAddToPlaylist = (track, addToLikedSongs = false) => {
    if (addToLikedSongs) {
      // Directly add to Liked Songs
      const id = track.trackId ?? track.collectionId ?? track.artistId + "-" + track.trackName;
      setPlaylists(prev => {
        const copy = { ...prev };
        if (!copy["Liked Songs"]) copy["Liked Songs"] = [];
        if (copy["Liked Songs"].some(p => (p.trackId ?? p.collectionId) === id)) return prev;
        copy["Liked Songs"] = [...copy["Liked Songs"], track];
        return copy;
      });
    } else {
      // Show modal for other playlists
      setAddToPlaylistTrack(track);
    }
  };

  const confirmAddToPlaylist = (playlistName) => {
    if (!addToPlaylistTrack || !playlistName) return;
    
    const track = addToPlaylistTrack;
    const id = track.trackId ?? track.collectionId ?? track.artistId + "-" + track.trackName;
    
    setPlaylists(prev => {
      const copy = { ...prev };
      if (!copy[playlistName]) copy[playlistName] = [];
      if (copy[playlistName].some(p => (p.trackId ?? p.collectionId) === id)) return prev;
      copy[playlistName] = [...copy[playlistName], track];
      return copy;
    });

    setToast({ 
      id: Date.now(), 
      message: `Added "${track.trackName ?? track.collectionName}" to ${playlistName}`, 
      actionLabel: 'View', 
      action: () => { selectPlaylist(playlistName); setToast(null); }
    });
    
    setAddToPlaylistTrack(null);
  };

  const handleRemoveFromPlaylist = (track, playlistName = activePlaylist) => {
    const id = track.trackId ?? track.collectionId ?? track.artistId + "-" + track.trackName;
    setPlaylists(p => ({
      ...p,
      [playlistName]: p[playlistName].filter(item => (item.trackId ?? item.collectionId) !== id)
    }));
  };

  const clearPlaylist = (playlistName = activePlaylist) => {
    setPlaylists(p => ({ ...p, [playlistName]: [] }));
  };

  const createPlaylist = (name) => {
    const safe = (name || "").trim();
    if (!safe) return;
    if (safe.toLowerCase() === 'liked songs') {
      window.alert("" + 'Cannot create a playlist named "Liked Songs".');
      return;
    }
    setPlaylists(p => {
      if (p[safe]) return p;
      return { ...p, [safe]: [] };
    });
    // no cover feature: create playlist with default data
    setActivePlaylist(safe);
    setToast({ id: Date.now(), message: `Playlist "${safe}" created.`, actionLabel: 'Open', action: () => { selectPlaylist(safe); setToast(null); } });
  };

  const handleCreateFromLibrary = (e) => {
    e && e.preventDefault();
    const name = (libraryNewName || "").trim();
    if (!name) return;
    createPlaylist(name);
    setLibraryNewName("");
    setLibraryTouched(false);
  };

  

  const selectPlaylist = (name) => {
    setActivePlaylist(name);
    setPage(name);
  };

  const deletePlaylist = (name) => {
    if (!name) return;
    if (name === "Liked Songs") return;
    setDeleteCandidate(name);
  };

  const requestDelete = (name) => {
    if (!name) return;
    if (name === 'Liked Songs') return;
    setDeleteCandidate(name);
  };

  const confirmDelete = () => {
    const name = deleteCandidate;
    if (!name) return setDeleteCandidate(null);
    setPlaylists(p => {
      const copy = { ...p };
      const payload = copy[name] || [];
      delete copy[name];
      return copy;
    });
    setPage('library');
    setActivePlaylist('Liked Songs');
    setDeleteCandidate(null);
  };

  const cancelDelete = () => setDeleteCandidate(null);

  // Undo handler used by toast for delete (in case toast action used after state changes)
  const handleUndoDelete = () => {
    setPlaylists(p => ({ ...p, [deletedCache.name]: deletedCache.payload || [] }));
    setDeletedCache(null);
    setToast(null);
  };

  const handleNavigate = (p) => {
    setPage(p);
  };

  return (
    <div className="app-container spotify-app">
      <Header />
      <main className="main-grid">
          <nav className="spotify-sidebar" aria-label="Main navigation">
          <Sidebar active={page} onNavigate={handleNavigate} playlists={playlists} onCreatePlaylist={createPlaylist} onSelectPlaylist={selectPlaylist} onDeletePlaylist={deletePlaylist} />
        </nav>
        <section className="left-panel content-area">
          {page === "search" ? (
            <>
              <SearchForm onSearch={setQueryParams} loading={loading} focus={true} />

              <div className="sort-row">
                <label>
                  Sort by:
                  <select value={sortBy.key} onChange={(e) => setSortBy(s => ({ ...s, key: e.target.value }))}>
                    <option value="releaseDate">Release Date</option>
                    <option value="price">Price</option>
                  </select>
                </label>
                <label>
                  Direction:
                  <select value={sortBy.dir} onChange={(e) => setSortBy(s => ({ ...s, dir: e.target.value }))}>
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </label>

                <div className="playlist-summary">
                  <strong>Playlist:</strong> { (playlists[activePlaylist] || []).length } tracks
                  <button className="btn small" aria-label="Export playlist as JSON" title="Export playlist" onClick={() => {
                    const blob = new Blob([JSON.stringify(playlists[activePlaylist] || [], null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${activePlaylist.replace(/\s+/g,'_') || 'playlist'}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}>Export</button>
                  <button className="btn small danger" aria-label="Clear playlist" title="Clear playlist" onClick={() => clearPlaylist(activePlaylist)} disabled={(playlists[activePlaylist] || []).length===0}>Clear</button>
                </div>
              </div>

              <div className="table-area">
                {loading && <div className="status">Loading...</div>}
                {error && <div className="status error">Error: {error}</div>}
                {!loading && !error && <DataTable
                  results={results}
                  onSelect={setSelected}
                  onAddToPlaylist={handleAddToPlaylist}
                  playlist={playlists[activePlaylist] || []}
                  likedSongs={playlists["Liked Songs"] || []}
                />}
              </div>
            </>
          ) : page === "home" ? (
            <div className="home-hero" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: '1.2rem' }}>
                <h2>Welcome to PaneStify</h2>
                <p className="muted" style={{ marginBottom: '0.8rem' }}>Explore music with the iTunes API. Click <button className="btn small" onClick={() => setPage("search")}>Search</button> to get started.</p>
              </div>
              <div style={{ 
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '-1rem',
                marginBottom: '0.8rem'
              }}>
                <img 
                  src="/assets/gif01.gif" 
                  alt="Welcome animation" 
                  style={{ 
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '12px'
                  }} 
                />
              </div>
            </div>
          ) : page === "add-playlist" ? (
            <div className="add-playlist-view">
              <h2>Add New Playlist</h2>
              <p className="muted">Enter a name for your new playlist.</p>
              <form className="library-add-form" onSubmit={handleCreateFromLibrary} style={{marginTop:12}}>
                <input className="library-add-input" placeholder="New playlist name" value={libraryNewName} onChange={(e) => { setLibraryNewName(e.target.value); setLibraryTouched(true); }} onBlur={() => setLibraryTouched(true)} ref={inputRef} aria-label="New playlist name" />
                <button className="btn small" type="submit" disabled={libraryTouched && !libraryNewName.trim()}>Add Playlist</button>
                <button type="button" className="btn small ghost" onClick={() => { setLibraryNewName(''); setPage('library'); }}>Cancel</button>
              </form>
            </div>
          ) : page === "library" ? (
            <div className="library-view">
              <h2>Your Library</h2>
                <p className="muted">All your playlists are listed below. Click Open to view a playlist.</p>
                <div style={{margin: '8px 0'}}>
                  <button className="btn small ghost" onClick={() => setPage('add-playlist')}>Add New Playlist</button>
                </div>
                <div className="playlists-grid">
                      {Object.keys(playlists).map((name) => (
                        <div className="playlist-card small" key={name}>
                          <h4>{name}</h4>
                          <p className="muted">{(playlists[name] || []).length} tracks</p>
                          <div style={{display: 'flex', gap: 8}}>
                            <button className="btn small" onClick={() => selectPlaylist(name)}>Open</button>
                            <button className="btn small danger" onClick={() => clearPlaylist(name)} disabled={(playlists[name] || []).length===0}>Clear</button>
                            {name !== 'Liked Songs' && (
                              <button className="btn small danger-outline" onClick={() => deletePlaylist(name)}>Delete</button>
                            )}
                          </div>
                        </div>
                      ))}
                {Object.keys(playlists).length === 0 && <p className="muted">No playlists yet — create one from the sidebar.</p>}
              </div>
            </div>
          ) : (
            <div className="playlist-shortcut-view">
              <h2>{page}</h2>
              <p className="muted">This view shows your current playlist. You can add tracks from Search.</p>

              <div className="playlist-card">
                <h3>Playlist: {activePlaylist}</h3>
                {(!playlists[activePlaylist] || playlists[activePlaylist].length === 0) && (
                  <p className="muted">No tracks yet. Add songs from Search.</p>
                )}
              </div>

              <ul className="playlist-list">
                {(playlists[activePlaylist] || []).map((t) => (
                  <li key={t.trackId ?? t.collectionId ?? t.artistId + t.trackName} className="playlist-item">
                    <img src={t.artworkUrl60} alt={t.trackName} />
                    <div className="meta">
                      <div className="title">{t.trackName ?? t.collectionName}</div>
                      <div className="sub">{t.artistName}</div>
                    </div>
                    <div className="controls">
                      {t.previewUrl ? (
                        <audio controls src={t.previewUrl} preload="none" />
                      ) : null}
                      <button className="btn small danger" onClick={() => handleRemoveFromPlaylist(t, activePlaylist)}>Remove</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <aside className="right-panel">
          <div className="playlist-card" style={{ height: '100%' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12, 
              marginBottom: 16,
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.5)',
              borderRadius: 8,
              border: '1px solid var(--pink-200)'
            }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, color: 'var(--pink-500)' }}>Now Playing</h3>
                <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <select 
                    value={activePlaylist}
                    onChange={(e) => selectPlaylist(e.target.value)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 6,
                      border: '1px solid var(--pink-200)',
                      background: 'white',
                      color: '#2a1a24',
                      fontWeight: 500,
                      minWidth: 160
                    }}
                  >
                    {Object.keys(playlists).map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                  <span className="muted">({(playlists[activePlaylist] || []).length} tracks)</span>
                </div>
              </div>
            </div>
            {(!playlists[activePlaylist] || playlists[activePlaylist].length === 0) && <p className="muted">No tracks yet. Add songs from results.</p>}
            <ul className="playlist-list">
              {(playlists[activePlaylist] || []).map((t) => (
                <li key={t.trackId ?? t.collectionId ?? t.artistId + t.trackName} className="playlist-item">
                  <img src={t.artworkUrl60} alt={t.trackName} />
                  <div className="meta">
                    <div className="title">{t.trackName ?? t.collectionName}</div>
                    <div className="sub">{t.artistName}</div>
                  </div>
                  <div className="controls">
                    {t.previewUrl ? (
                      <audio controls src={t.previewUrl} preload="none" />
                    ) : null}
                    <button className="btn small danger" onClick={() => handleRemoveFromPlaylist(t, activePlaylist)}>Remove</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </main>
      <footer className="footer">
        <div>Made by Anisah Octa Rohila • 123140137 • Pengembangan Aplikasi Web RA</div>
      </footer>

      

      {/* Delete confirmation modal */}
      {deleteCandidate && (
        <div className="modal-backdrop" style={{ 
          position: 'fixed', 
          inset: 0, 
          backgroundColor: 'rgba(255, 43, 122, 0.15)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          backdropFilter: 'blur(4px)' 
        }}>
          <div className="modal" style={{ 
            backgroundColor: 'white',
            padding: 24, 
            borderRadius: 12, 
            maxWidth: 400, 
            width: '90%',
            boxShadow: '0 8px 32px rgba(255, 43, 122, 0.15)',
            border: '1px solid var(--pink-200)'
          }}>
            <h3 style={{ color: 'var(--pink-500)', marginTop: 0 }}>Delete Playlist</h3>
            <p style={{ margin: '12px 0', color: '#2a1a24' }}>Are you sure you want to delete the playlist "{deleteCandidate}"? This can be undone.</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button className="btn danger" onClick={confirmDelete}>Delete Playlist</button>
              <button className="btn ghost" onClick={cancelDelete}>Cancel</button>
            </div>
          </div>
        </div>
      )}



      {/* Add to playlist modal */}
      {addToPlaylistTrack && (
        <div className="modal-backdrop" style={{ 
          position: 'fixed', 
          inset: 0, 
          backgroundColor: 'rgba(255, 43, 122, 0.15)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          backdropFilter: 'blur(4px)'
        }}>
          <div className="modal" style={{ 
            backgroundColor: 'white',
            padding: 24, 
            borderRadius: 12, 
            maxWidth: 400, 
            width: '90%',
            boxShadow: '0 8px 32px rgba(255, 43, 122, 0.15)',
            border: '1px solid var(--pink-200)'
          }}>
            <h3 style={{ color: 'var(--pink-500)', marginTop: 0 }}>Add to Playlist</h3>
            <p style={{ margin: '12px 0', color: '#2a1a24' }}>
              Add "{addToPlaylistTrack.trackName ?? addToPlaylistTrack.collectionName}" to:
            </p>
            <div className="playlists-grid" style={{ margin: '20px 0', maxHeight: '300px', overflowY: 'auto' }}>
              {Object.keys(playlists).map((name) => (
                <button
                  key={name}
                  className="btn ghost playlist-choice"
                  style={{ 
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px',
                    marginBottom: '8px',
                    borderRadius: '8px',
                    border: '1px solid var(--pink-200)',
                    background: 'white',
                    color: '#2a1a24',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--pink-100)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  onClick={() => confirmAddToPlaylist(name)}
                >
                  <strong>{name}</strong>
                  <div style={{ fontSize: '0.9em', color: 'var(--pink-500)' }}>{playlists[name].length} tracks</div>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 20, borderTop: '1px solid var(--pink-200)', paddingTop: 20 }}>
              <button className="btn ghost" onClick={() => setAddToPlaylistTrack(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
