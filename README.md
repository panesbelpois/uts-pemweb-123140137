# Music Explorer

# Music Explorer (Tema Pink)

**Nama**: Anisah Octa Rohila
**NIM**: 123140137  
**Studi Kasus**: Music Explorer (digit terakhir 7)  
**API**: iTunes Search API (gratis, tanpa API key)

## Deskripsi
Aplikasi pencarian musik/album/artist menggunakan iTunes Search API. Menyediakan preview audio, tabel hasil, playlist builder yang disimpan di `localStorage`, dan sorting berdasarkan release date atau price.

## Fitur
- Form pencarian (minimal 5 input): keyword, media type, genre (opsional), limit, dan explicit checkbox.
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

## Screenshot & Deployment (isi sebelum submit)
- Tambahkan minimal 1 screenshot tampilan aplikasi di README (contoh: hasil pencarian dan playlist).
- Jika sudah deploy ke Vercel, tambahkan link di bawah ini:

Deployment: [paste Vercel link di sini]

Contoh cara menambah screenshot (letakkan file di `public/` atau di repo root):
![screenshot](./screenshot.png)

## Catatan
- Aplikasi menggunakan iTunes Search API, jadi beberapa media types atau country mungkin mengembalikan sedikit hasil tergantung query.
- Playlist otomatis tersimpan di `localStorage` browser.

## Checklist sebelum submit
- Pastikan project berjalan tanpa error di console.
- Pastikan minimal 10 commit dengan pesan yang jelas (jika syarat tugas meminta).
- Tambahkan screenshot dan link deployment di bagian atas README.
- Jika ingin genre memfilter di server, implementasikan mapping ke parameter iTunes; saat ini dilakukan client-side filtering.

---
