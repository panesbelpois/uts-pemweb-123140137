# Music Explorer (Tema Pink)

**Nama**: [Isikan Nama Anda]  
**NIM**: 123140137  
**Studi Kasus**: Music Explorer (digit terakhir 7)  
**API**: iTunes Search API (gratis, tanpa API key)

## Deskripsi
Aplikasi pencarian musik/album/artist menggunakan iTunes Search API. Menyediakan preview audio, tabel hasil, playlist builder yang disimpan di `localStorage`, dan sorting berdasarkan release date atau price.

## Fitur
- Form pencarian (minimal 5 input): keyword, media type, country, limit, explicit checkbox.
- Tabel hasil dengan artwork, track name, artist, price.
- Audio preview player untuk sample musik.
- Playlist builder: tambah track, simpan di localStorage, export JSON, remove.
- Sorting: release date & price (asc/desc).
- Tema berwarna pink, responsive.

## Struktur Folder
my-app/
├── src/
│ ├── components/
│ ├── App.jsx
│ └── App.css
└── package.json


## Teknologi
- React (Vite)
- JavaScript modern (arrow functions, async/await, destructuring)
- Fetch API
- CSS murni (Flexbox/Grid, media queries)

## Cara Menjalankan
1. Clone repository.
2. Jalankan `npm install`.
3. Jalankan `npm run dev`.
4. Buka `http://localhost:5173` (Vite default).

## Deployment
- Deploy ke Vercel (bisa langsung push repository public dan link ke Vercel).
- Pastikan `build` script (`vite build`) berjalan.

## Catatan
- Aplikasi menggunakan iTunes Search API, jadi beberapa media types atau country mungkin mengembalikan sedikit hasil tergantung query.
- Playlist otomatis tersimpan di `localStorage` browser.

---