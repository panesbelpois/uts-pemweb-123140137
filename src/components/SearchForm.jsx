import React, { useState } from "react";

/**
 * Form has >=5 inputs:
 * - keyword (text) [required]
 * - media (select) [required]
 * - genre (select) [optional]
 * - limit (number) [required, min 1 max 200]
 * - explicit (checkbox)
 *
 * Uses HTML5 validation attributes.
 */

const DEFAULT = {
  term: "",
  media: "music",
  genre: "",
  limit: 25,
  explicit: false,
};

export default function SearchForm({ onSearch, loading, focus }) {
  const [form, setForm] = useState(DEFAULT);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (focus && inputRef.current) inputRef.current.focus();
  }, [focus]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.term.trim()) return;
    onSearch({
      term: form.term.trim(),
      media: form.media,
      genre: form.genre,
      limit: form.limit,
      explicit: form.explicit,
    });
  };

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <fieldset>
        <legend>Search Music</legend>

        <label className="field">
          <span>Keyword</span>
          <input
            name="term"
            type="search"
            value={form.term}
            required
            placeholder="Song, artist, album..."
            aria-label="Search keyword"
            ref={inputRef}
            onChange={(e) => setForm(f => ({ ...f, term: e.target.value }))}
          />
        </label>

        <label className="field">
          <span>Media</span>
          <select
            name="media"
            value={form.media}
            required
            onChange={(e) => setForm(f => ({ ...f, media: e.target.value }))}
          >
            <option value="music">Music</option>
            <option value="musicVideo">Music Video</option>
            <option value="album">Album</option>
            <option value="podcast">Podcast</option>
            <option value="audiobook">Audiobook</option>
          </select>
        </label>
        <label className="field">
          <span>Genre</span>
          <select
            name="genre"
            value={form.genre}
            onChange={(e) => setForm(f => ({ ...f, genre: e.target.value }))}
          >
            <option value="">All</option>
            <option value="pop">Pop</option>
            <option value="rock">Rock</option>
            <option value="hiphop">Hip-Hop</option>
            <option value="jazz">Jazz</option>
            <option value="classical">Classical</option>
            <option value="electronic">Electronic</option>
            <option value="country">Country</option>
            <option value="rnb">R&amp;B</option>
          </select>
        </label>

        <label className="field">
          <span>Limit</span>
          <input
            name="limit"
            type="number"
            value={form.limit}
            min="1"
            max="200"
            required
            onChange={(e) => setForm(f => ({ ...f, limit: Math.min(200, Math.max(1, Number(e.target.value || 1))) }))}
          />
        </label>

        <label className="inline-field">
          <input
            name="explicit"
            type="checkbox"
            checked={form.explicit}
            onChange={(e) => setForm(f => ({ ...f, explicit: e.target.checked }))}
          />
          <span>Include explicit</span>
        </label>

        <div className="actions">
          <button className="btn" type="submit" disabled={loading}>Search</button>
          <button
            type="button"
            className="btn ghost"
            onClick={() => setForm(DEFAULT)}
          >
            Reset
          </button>
        </div>
      </fieldset>
    </form>
  );
}
