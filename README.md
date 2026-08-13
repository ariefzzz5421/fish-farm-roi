# Sumber Jaya Farm — Fish Farm ROI & Aquaculture Hub

Situs statis tanpa build step: HTML, CSS, dan JavaScript biasa. Cukup buka
`index.html` di browser, atau jalankan `python3 -m http.server` di folder ini.

## Isi

| Path | Isi |
|---|---|
| `index.html` | Landing page Sumber Jaya Farm (profil, produk, galeri, kontak) |
| `aquaculture/` | **Aquaculture Hub** — situs multi-halaman dengan sidebar & routing |
| `fishfarm-roi-calculator-v2.html` | Kalkulator ROI mandiri (versi acuan, jsPDF dibundel, jalan offline) |
| `fishfarm-roi-calculator-v1.html` | Versi lama kalkulator |
| `public/images/` | Ilustrasi vektor (SVG) |
| `tools/generate-art.mjs` | Generator ilustrasi SVG |

## Aquaculture Hub

Halaman (hash routing, semua di `aquaculture/index.html`):

| Rute | Isi |
|---|---|
| `#/` | Beranda: peringkat ROI 10 komoditas |
| `#/galeri` | Galeri sistem kolam & kegiatan budidaya, dengan filter + lightbox |
| `#/komoditas` | Top 10 komoditas: kartu + tabel yang bisa diurutkan |
| `#/komoditas/<slug>` | Profil komoditas: parameter teknis, 3 skenario, risiko, tips |
| `#/roi` | Kalkulator ROI dengan preset komoditas dan bagi hasil mitra |
| `#/skenario` | Perbandingan 10 komoditas + rentang risiko pesimis–optimis |
| `#/peta` | Peta skematis sentra budidaya Indonesia |
| `#/alur` | 7 tahap siklus budidaya + 6 sistem kolam |
| `#/glosarium` | Istilah teknis |

Komoditas yang dipetakan: nila, lele, patin, udang vaname, bandeng, gurame,
ikan mas, bawal air tawar, gabus, dan belut.

### Rumus ROI

Sama persis dengan `fishfarm-roi-calculator-v2.html` (fungsi `calcROI` di
`aquaculture/app.js`):

```
panen (kg) = jumlah benih × tingkat hidup × bobot panen
omzet      = panen × harga jual
biaya      = (benih × harga benih) + (panen × FCR × harga pakan)
             + (tenaga kerja/bulan × siklus/30) + biaya lain-lain
laba       = omzet − biaya
ROI        = laba / biaya × 100%
margin     = laba / omzet × 100%
```

> **Semua angka bawaan adalah estimasi pasar 2026 untuk skala usaha kecil.**
> Harga benih, pakan, dan harga jual berbeda jauh antar daerah — ganti dengan
> harga lokal di kalkulator sebelum mengambil keputusan usaha.

## Regenerasi ilustrasi

```bash
node tools/generate-art.mjs
```

Menulis ulang `public/images/species/*.svg` dan `public/images/aquaculture/*.svg`.
Kalau mau memakai foto asli farm, cukup timpa berkas SVG tersebut dengan foto
(sesuaikan nama berkas atau ubah `img()` di `aquaculture/app.js`).

## Deploy ke Vercel

Situs statis, tanpa build. Di dashboard Vercel: **Add New → Project → Import**
repositori ini, lalu:

- Framework Preset: **Other**
- Build Command / Install Command: kosongkan
- Output Directory: kosongkan (akan diambil dari `vercel.json`)

`vercel.json` sudah mengatur semuanya: `outputDirectory: "."` (wajib, karena
tanpa itu Vercel otomatis menganggap folder `public/` sebagai root situs dan
semua halaman jadi 404), `cleanUrls`, `trailingSlash`, cache gambar, dan alias
`/hub` → `/aquaculture/`.
