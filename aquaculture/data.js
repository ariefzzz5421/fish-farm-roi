/* ══════════════════════════════════════════════════════════════════════════
   AQUACULTURE HUB — DATA
   Semua angka di bawah adalah ESTIMASI PASAR 2026 untuk skala usaha kecil di
   Indonesia. Angka dipakai sebagai TITIK AWAL kalkulator, bukan janji hasil.
   Harga benih, pakan, dan harga jual sangat berbeda antar daerah — selalu
   ganti dengan harga lokal sebelum mengambil keputusan.

   Sumber acuan penyusunan angka:
   - Statistik & prioritas komoditas budidaya KKP (nila, udang, lele, bandeng,
     patin sebagai penyumbang produksi terbesar).
   - Analisa usaha lapangan yang umum dipakai pembudidaya (lele 2-3 bulan
     panen ukuran 6-8 ekor/kg, nila SR ~85% siklus 4-6 bulan, patin panen
     ~4-6 bulan, gabus 4 bulan ukuran ~3 ekor/kg, vaname 3 bulan/siklus).
   ══════════════════════════════════════════════════════════════════════════ */

(function (global) {
  'use strict';

  /* ── 1. KOMODITAS ─────────────────────────────────────────────────────────
     params  = nilai dasar (skenario "Base") yang langsung masuk kalkulator
     scen    = pengubah untuk skenario Optimis / Pesimis (hanya field berubah)
     Field params identik dengan input kalkulator ROI v2:
       fishCount     jumlah benih ditebar (ekor)
       survivalRate  tingkat hidup sampai panen (%)
       harvestWeight bobot rata-rata saat panen (kg/ekor)
       sellPrice     harga jual di tingkat pembudidaya (IDR/kg)
       fingerlingCost harga benih (IDR/ekor)
       fcr           feed conversion ratio (kg pakan per kg ikan)
       feedPrice     harga pakan (IDR/kg)
       cycleDays     lama satu siklus (hari)
       laborCost     tenaga kerja + listrik (IDR/bulan)
       otherCost     biaya lain-lain per siklus (IDR)
       totalCapital  modal investasi awal unit ini (IDR)
  ─────────────────────────────────────────────────────────────────────────── */

  const SPECIES = [
    {
      slug: 'nila',
      name: 'Ikan Nila',
      latin: 'Oreochromis niloticus',
      air: 'Tawar',
      kesulitan: 'Mudah',
      pasar: 'Nasional + Ekspor',
      tagline: 'Komoditas ikan budidaya nomor satu nasional dan prioritas ekspor KKP.',
      ringkas:
        'Nila adalah tulang punggung budidaya air tawar Indonesia: tahan banting, mau makan pelet murah, dan pasarnya menyerap semua ukuran. Cocok untuk pemula yang ingin siklus jelas tanpa perawatan rumit.',
      sistem: ['Kolam terpal', 'Kolam tanah', 'Bioflok', 'Keramba jaring apung', 'Minapadi'],
      padatTebar: '10–15 ekor/m² (kolam), 100–150 ekor/m³ (KJA)',
      suhu: '25–32 °C',
      ph: '6,5–8,5',
      ukuranPanen: '3–4 ekor/kg (300–350 g)',
      lamaPanen: '4–6 bulan',
      keunggulan: [
        'Tahan perubahan kualitas air, cocok untuk pemula',
        'Harga stabil sepanjang tahun, jarang anjlok ekstrem',
        'Pasar lengkap: konsumsi lokal, rumah makan, fillet ekspor',
      ],
      risiko: [
        'Ukuran tidak seragam kalau tidak disortir saat pendederan',
        'Rentan penyakit Streptococcus saat suhu tinggi & padat tebar berlebih',
        'Nila jantan tumbuh lebih cepat — benih campur menurunkan bobot panen',
      ],
      tips: [
        'Pakai benih monosex (jantan) untuk bobot panen lebih seragam',
        'Sortir ukuran di umur 30–45 hari untuk menekan kanibalisme pertumbuhan',
        'Jaga FCR di bawah 1,6 — di atas itu margin cepat habis',
      ],
      sentra: ['Jawa Barat', 'Sumatera Utara', 'Jawa Tengah', 'Jawa Timur'],
      params: { fishCount: 5000, survivalRate: 85, harvestWeight: 0.35, sellPrice: 32000, fingerlingCost: 400, fcr: 1.5, feedPrice: 11500, cycleDays: 150, laborCost: 1200000, otherCost: 700000, totalCapital: 18000000 },
      scen: {
        optimistic: { survivalRate: 92, harvestWeight: 0.4, sellPrice: 35000, fcr: 1.35, feedPrice: 11000, cycleDays: 140, otherCost: 600000 },
        pessimistic: { survivalRate: 72, harvestWeight: 0.3, sellPrice: 28000, fcr: 1.8, feedPrice: 12500, cycleDays: 170, otherCost: 900000 },
      },
    },
    {
      slug: 'lele',
      name: 'Ikan Lele',
      latin: 'Clarias gariepinus',
      air: 'Tawar',
      kesulitan: 'Mudah',
      pasar: 'Lokal harian',
      tagline: 'Siklus tercepat, modal terkecil, perputaran uang paling sering.',
      ringkas:
        'Lele panen 2–3 bulan dan bisa dipelihara padat di kolam terpal sempit. Marginnya tipis per kilo, tapi 4 siklus setahun membuat perputaran modal jauh lebih cepat dari komoditas lain.',
      sistem: ['Kolam terpal', 'Bioflok', 'Kolam tanah'],
      padatTebar: '100–150 ekor/m² (terpal), 200–400 ekor/m³ (bioflok)',
      suhu: '26–32 °C',
      ph: '6,5–8,0',
      ukuranPanen: '6–8 ekor/kg (125–160 g)',
      lamaPanen: '2–3 bulan',
      keunggulan: [
        'Perputaran cepat: 3–4 siklus per tahun',
        'Tahan oksigen rendah, bisa padat tebar tinggi di lahan sempit',
        'Permintaan harian stabil dari warung pecel lele dan pasar basah',
      ],
      risiko: [
        'Harga mudah jatuh saat panen raya serentak di satu daerah',
        'Kanibalisme kalau ukuran tidak disortir',
        'Margin tipis — kenaikan harga pakan langsung menggerus untung',
      ],
      tips: [
        'Sortir minimal 2 kali per siklus untuk menekan kanibalisme',
        'Amankan pembeli sebelum tebar, jangan tebar mengikuti tetangga',
        'Ganti sebagian air / pakai bioflok untuk menahan amonia di padat tebar tinggi',
      ],
      sentra: ['Jawa Timur', 'Jawa Barat', 'Jawa Tengah', 'Lampung'],
      params: { fishCount: 5000, survivalRate: 80, harvestWeight: 0.14, sellPrice: 22000, fingerlingCost: 200, fcr: 1.1, feedPrice: 11000, cycleDays: 90, laborCost: 600000, otherCost: 400000, totalCapital: 9000000 },
      scen: {
        optimistic: { survivalRate: 90, harvestWeight: 0.16, sellPrice: 24000, fcr: 0.95, feedPrice: 10500, cycleDays: 80, otherCost: 320000 },
        pessimistic: { survivalRate: 65, harvestWeight: 0.12, sellPrice: 19000, fcr: 1.35, feedPrice: 12000, cycleDays: 105, otherCost: 550000 },
      },
    },
    {
      slug: 'patin',
      name: 'Ikan Patin',
      latin: 'Pangasius hypophthalmus',
      air: 'Tawar',
      kesulitan: 'Sedang',
      pasar: 'Nasional + Olahan',
      tagline: 'Bobot besar per ekor, kuat untuk kolam dalam dan produksi massal.',
      ringkas:
        'Patin tumbuh besar (600–900 g) dan diserap industri fillet serta ikan salai. Butuh kolam lebih dalam dan modal pakan lebih panjang, tapi biaya per kilo daging termasuk paling efisien.',
      sistem: ['Kolam tanah', 'Keramba jaring apung', 'Kolam beton'],
      padatTebar: '8–12 ekor/m²',
      suhu: '27–31 °C',
      ph: '6,5–8,0',
      ukuranPanen: '1–1,5 ekor/kg (700–1000 g)',
      lamaPanen: '5–6 bulan',
      keunggulan: [
        'Daging tebal, diserap pabrik fillet dan pengolah ikan salai',
        'Toleran terhadap oksigen rendah dan air keruh',
        'Bobot panen besar sehingga biaya tenaga kerja per kilo rendah',
      ],
      risiko: [
        'Harga di tingkat pembudidaya relatif rendah — sangat sensitif terhadap FCR',
        'Siklus panjang, modal pakan tertahan lebih lama',
        'Bau lumpur (off-flavor) menurunkan harga bila air tidak diganti sebelum panen',
      ],
      tips: [
        'Kunci untung ada di FCR — target di bawah 1,6',
        'Ganti air 1–2 minggu sebelum panen untuk menghilangkan bau lumpur',
        'Cari kontrak dengan pengolah salai/fillet sebelum tebar',
      ],
      sentra: ['Sumatera Selatan', 'Jambi', 'Riau', 'Kalimantan Selatan'],
      params: { fishCount: 3000, survivalRate: 85, harvestWeight: 0.8, sellPrice: 23000, fingerlingCost: 350, fcr: 1.45, feedPrice: 10000, cycleDays: 180, laborCost: 1200000, otherCost: 800000, totalCapital: 20000000 },
      scen: {
        optimistic: { survivalRate: 92, harvestWeight: 0.95, sellPrice: 25000, fcr: 1.3, feedPrice: 9500, cycleDays: 165, otherCost: 700000 },
        pessimistic: { survivalRate: 75, harvestWeight: 0.65, sellPrice: 20000, fcr: 1.75, feedPrice: 11000, cycleDays: 200, otherCost: 1000000 },
      },
    },
    {
      slug: 'vaname',
      name: 'Udang Vaname',
      latin: 'Litopenaeus vannamei',
      air: 'Payau',
      kesulitan: 'Sulit',
      pasar: 'Ekspor',
      tagline: 'Nilai jual tertinggi dan komoditas ekspor utama — sekaligus paling berisiko.',
      ringkas:
        'Vaname memberi omzet terbesar per petak dan menjadi prioritas ekspor nasional, tapi menuntut kincir, listrik, dan kontrol kualitas air harian. Satu serangan penyakit bisa menghapus seluruh siklus.',
      sistem: ['Tambak intensif', 'Terpal bundar + kincir', 'Semi-intensif'],
      padatTebar: '80–150 ekor/m² (intensif)',
      suhu: '28–32 °C',
      ph: '7,5–8,5',
      ukuranPanen: 'Size 50–70 ekor/kg',
      lamaPanen: '3–3,5 bulan',
      keunggulan: [
        'Harga per kilo paling tinggi di antara komoditas budidaya massal',
        'Siklus hanya ~100 hari, bisa 3 siklus per tahun',
        'Pasar ekspor menyerap volume besar dengan harga terukur',
      ],
      risiko: [
        'Penyakit (WSSV, AHPND/EMS) dapat memusnahkan satu petak dalam hitungan hari',
        'Biaya listrik kincir dan pakan sangat besar',
        'Harga mengikuti pasar ekspor global, bukan pasar lokal',
      ],
      tips: [
        'Beli benur (PL) bersertifikat SPF, jangan tergiur benur murah',
        'Siapkan biaya listrik kincir sebagai pos tersendiri, bukan "lain-lain"',
        'Panen parsial saat size sudah masuk harga terbaik, jangan tunggu semua besar',
      ],
      sentra: ['Lampung', 'Jawa Timur', 'Sulawesi Selatan', 'Nusa Tenggara Barat'],
      params: { fishCount: 50000, survivalRate: 75, harvestWeight: 0.017, sellPrice: 78000, fingerlingCost: 60, fcr: 1.4, feedPrice: 21000, cycleDays: 100, laborCost: 3500000, otherCost: 6000000, totalCapital: 120000000 },
      scen: {
        optimistic: { survivalRate: 85, harvestWeight: 0.02, sellPrice: 85000, fcr: 1.25, feedPrice: 20000, cycleDays: 95, otherCost: 5500000 },
        pessimistic: { survivalRate: 55, harvestWeight: 0.014, sellPrice: 70000, fcr: 1.7, feedPrice: 22500, cycleDays: 110, otherCost: 7000000 },
      },
    },
    {
      slug: 'bandeng',
      name: 'Ikan Bandeng',
      latin: 'Chanos chanos',
      air: 'Payau',
      kesulitan: 'Mudah',
      pasar: 'Nasional + Olahan',
      tagline: 'Ikan tambak paling hemat pakan, bisa numpang pakan alami.',
      ringkas:
        'Bandeng memakan klekap dan plankton, sehingga biaya pakan bisa ditekan jauh di tambak yang dikelola baik. Cocok dipadu dengan udang (polikultur) dan punya pasar olahan yang kuat.',
      sistem: ['Tambak payau', 'Polikultur dengan vaname', 'Keramba'],
      padatTebar: '3–5 ekor/m² (tambak)',
      suhu: '26–32 °C',
      ph: '7,5–8,5',
      ukuranPanen: '3–4 ekor/kg (250–350 g)',
      lamaPanen: '4–6 bulan',
      keunggulan: [
        'Bisa mengandalkan pakan alami sehingga FCR efektif rendah',
        'Sangat tahan penyakit dibanding udang',
        'Pasar olahan kuat: bandeng presto, asap, cabut duri',
      ],
      risiko: [
        'Butuh akses air payau — tidak bisa di sembarang lokasi',
        'Harga jual per kilo menengah, untung datang dari volume',
        'Banyak duri menekan harga bila dijual mentah tanpa olahan',
      ],
      tips: [
        'Kelola klekap/plankton dulu sebelum tebar nener — itu pakan gratisnya',
        'Polikultur dengan vaname untuk membagi risiko satu petak',
        'Jual ke pengolah presto/asap untuk harga lebih baik daripada pasar mentah',
      ],
      sentra: ['Jawa Timur (Sidoarjo, Gresik)', 'Jawa Tengah (Pati)', 'Sulawesi Selatan', 'Banten'],
      params: { fishCount: 3000, survivalRate: 80, harvestWeight: 0.35, sellPrice: 28000, fingerlingCost: 300, fcr: 1.6, feedPrice: 9000, cycleDays: 150, laborCost: 1000000, otherCost: 900000, totalCapital: 15000000 },
      scen: {
        optimistic: { survivalRate: 88, harvestWeight: 0.4, sellPrice: 31000, fcr: 1.2, feedPrice: 8500, cycleDays: 140, otherCost: 800000 },
        pessimistic: { survivalRate: 68, harvestWeight: 0.28, sellPrice: 25000, fcr: 2.0, feedPrice: 9800, cycleDays: 170, otherCost: 1100000 },
      },
    },
    {
      slug: 'gurame',
      name: 'Ikan Gurame',
      latin: 'Osphronemus goramy',
      air: 'Tawar',
      kesulitan: 'Sedang',
      pasar: 'Restoran / Premium',
      tagline: 'Harga premium dan stabil, imbalannya siklus paling panjang.',
      ringkas:
        'Gurame dihargai jauh di atas nila dan lele karena permintaan rumah makan. Konsekuensinya siklus 8–12 bulan, sehingga modal tertahan lama dan pembesaran bertahap jadi kunci arus kas.',
      sistem: ['Kolam terpal', 'Kolam tanah', 'Kolam beton bertingkat'],
      padatTebar: '5–10 ekor/m²',
      suhu: '25–30 °C',
      ph: '6,5–8,0',
      ukuranPanen: '1,5–2 ekor/kg (500–700 g)',
      lamaPanen: '8–12 bulan (dari benih kecil)',
      keunggulan: [
        'Harga jual premium dan sangat stabil sepanjang tahun',
        'Bisa bernapas dengan labirin, tahan air tenang & oksigen rendah',
        'Segmen pendederan benih sendiri sudah menguntungkan',
      ],
      risiko: [
        'Pertumbuhan lambat — modal pakan tertahan hampir setahun',
        'Harga benih mahal, kematian awal langsung terasa di biaya',
        'Rentan jamur dan kutu ikan pada suhu rendah',
      ],
      tips: [
        'Beli benih ukuran lebih besar (silet/korek) untuk memotong 2–3 bulan siklus',
        'Buat sistem bertingkat: pendederan + pembesaran agar ada panen tiap bulan',
        'Kombinasikan pelet dengan daun talas/sente untuk menekan biaya pakan',
      ],
      sentra: ['Jawa Barat (Tasikmalaya, Ciamis)', 'Jawa Tengah (Banyumas)', 'Jawa Timur (Tulungagung)', 'Sumatera Barat'],
      params: { fishCount: 2000, survivalRate: 80, harvestWeight: 0.6, sellPrice: 48000, fingerlingCost: 3000, fcr: 1.7, feedPrice: 12500, cycleDays: 270, laborCost: 700000, otherCost: 900000, totalCapital: 25000000 },
      scen: {
        optimistic: { survivalRate: 88, harvestWeight: 0.7, sellPrice: 53000, fcr: 1.55, feedPrice: 12000, cycleDays: 240, otherCost: 800000 },
        pessimistic: { survivalRate: 68, harvestWeight: 0.5, sellPrice: 43000, fcr: 2.1, feedPrice: 13500, cycleDays: 300, otherCost: 1200000 },
      },
    },
    {
      slug: 'ikan-mas',
      name: 'Ikan Mas',
      latin: 'Cyprinus carpio',
      air: 'Tawar',
      kesulitan: 'Sedang',
      pasar: 'Lokal + Pemancingan',
      tagline: 'Harga bagus di dataran tinggi dan pasar pemancingan.',
      ringkas:
        'Ikan mas tumbuh cepat di air mengalir dan sangat dicari pasar Jawa Barat serta kolam pemancingan. Kelemahannya rentan penyakit KHV, sehingga sumber benih dan kualitas air jadi penentu.',
      sistem: ['Kolam air deras', 'Keramba jaring apung', 'Minapadi', 'Kolam tanah'],
      padatTebar: '5–10 ekor/m² (kolam), lebih padat di air deras',
      suhu: '23–30 °C',
      ph: '6,5–8,0',
      ukuranPanen: '2–3 ekor/kg (350–500 g)',
      lamaPanen: '4–5 bulan',
      keunggulan: [
        'Tumbuh cepat pada air mengalir dan dingin',
        'Serapan besar dari kolam pemancingan dengan harga di atas pasar',
        'Cocok dipadukan dengan sawah (minapadi) untuk menambah pendapatan',
      ],
      risiko: [
        'Sangat rentan virus KHV, terutama saat pergantian musim',
        'Butuh oksigen tinggi — mati massal bila air tenang dan panas',
        'Harga naik-turun mengikuti musim hajatan',
      ],
      tips: [
        'Ambil benih dari hatchery bersertifikat bebas KHV',
        'Hindari tebar saat peralihan musim dengan suhu berayun ekstrem',
        'Sasar segmen pemancingan untuk harga lebih tinggi dari pasar basah',
      ],
      sentra: ['Jawa Barat (Cianjur, Sukabumi)', 'Sumatera Utara', 'Sumatera Barat', 'Jawa Tengah'],
      params: { fishCount: 3000, survivalRate: 80, harvestWeight: 0.4, sellPrice: 33000, fingerlingCost: 600, fcr: 1.7, feedPrice: 11500, cycleDays: 150, laborCost: 1000000, otherCost: 700000, totalCapital: 15000000 },
      scen: {
        optimistic: { survivalRate: 88, harvestWeight: 0.45, sellPrice: 36000, fcr: 1.5, feedPrice: 11000, cycleDays: 135, otherCost: 600000 },
        pessimistic: { survivalRate: 60, harvestWeight: 0.34, sellPrice: 29000, fcr: 2.0, feedPrice: 12500, cycleDays: 170, otherCost: 950000 },
      },
    },
    {
      slug: 'bawal',
      name: 'Bawal Air Tawar',
      latin: 'Colossoma macropomum',
      air: 'Tawar',
      kesulitan: 'Mudah',
      pasar: 'Lokal + Pemancingan',
      tagline: 'Rakus, cepat besar, dan paling toleran terhadap kesalahan pemula.',
      ringkas:
        'Bawal tumbuh cepat, tidak rewel soal air, dan mau makan hampir apa saja termasuk pakan alternatif. Pilihan aman untuk kolam baru yang manajemen airnya belum rapi.',
      sistem: ['Kolam tanah', 'Kolam terpal', 'Keramba'],
      padatTebar: '10–15 ekor/m²',
      suhu: '25–32 °C',
      ph: '6,0–8,0',
      ukuranPanen: '2–3 ekor/kg (350–500 g)',
      lamaPanen: '4–5 bulan',
      keunggulan: [
        'Sangat toleran terhadap kualitas air yang belum ideal',
        'Mau menerima pakan alternatif sehingga biaya pakan bisa ditekan',
        'Pertumbuhan cepat dengan tingkat hidup tinggi',
      ],
      risiko: [
        'Harga jual di bawah nila di sebagian pasar',
        'Bergigi kuat — bisa merusak jaring dan melukai ikan lain',
        'Tidak cocok dicampur dengan ikan berukuran jauh lebih kecil',
      ],
      tips: [
        'Manfaatkan sisa sayur/limbah organik aman sebagai pakan tambahan',
        'Jangan campur dengan benih ikan kecil di kolam yang sama',
        'Sasar pasar pemancingan untuk harga di atas pasar basah',
      ],
      sentra: ['Jawa Barat', 'Sumatera Selatan', 'Jawa Tengah', 'Kalimantan Barat'],
      params: { fishCount: 3000, survivalRate: 85, harvestWeight: 0.4, sellPrice: 28000, fingerlingCost: 500, fcr: 1.5, feedPrice: 11000, cycleDays: 150, laborCost: 1000000, otherCost: 600000, totalCapital: 13000000 },
      scen: {
        optimistic: { survivalRate: 92, harvestWeight: 0.45, sellPrice: 31000, fcr: 1.35, feedPrice: 10500, cycleDays: 135, otherCost: 500000 },
        pessimistic: { survivalRate: 75, harvestWeight: 0.34, sellPrice: 25000, fcr: 1.8, feedPrice: 12000, cycleDays: 170, otherCost: 800000 },
      },
    },
    {
      slug: 'gabus',
      name: 'Ikan Gabus',
      latin: 'Channa striata',
      air: 'Tawar',
      kesulitan: 'Sulit',
      pasar: 'Premium + Albumin',
      tagline: 'Harga tinggi karena permintaan albumin dan olahan, benih masih terbatas.',
      ringkas:
        'Gabus dihargai jauh di atas ikan konsumsi biasa karena kandungan albuminnya dan pasar olahan (pempek, kerupuk). Tantangannya: benih belum banyak dan sifat kanibal butuh sortir ketat.',
      sistem: ['Kolam terpal', 'Kolam tanah', 'Drum/bak beton'],
      padatTebar: '10–20 ekor/m² (dengan sortir rutin)',
      suhu: '26–32 °C',
      ph: '6,0–8,0',
      ukuranPanen: '3 ekor/kg (±350 g), 2 ekor/kg di bulan 8–9',
      lamaPanen: '4–8 bulan',
      keunggulan: [
        'Harga jual sangat tinggi dan cenderung naik terus',
        'Bisa hidup di air minim oksigen karena punya organ pernapasan tambahan',
        'Permintaan industri albumin dan pempek belum terpenuhi',
      ],
      risiko: [
        'Kanibal — tanpa sortir rutin, tingkat hidup jatuh drastis',
        'Butuh pakan berprotein tinggi (karnivora), FCR lebih mahal',
        'Pasokan benih masih terbatas dan harganya mahal',
      ],
      tips: [
        'Sortir ukuran tiap 2–3 minggu, ini penentu utama tingkat hidup',
        'Latih makan pelet sejak kecil agar tidak tergantung pakan hidup',
        'Beri tempat berlindung (pipa/tanaman) untuk menekan stres dan kanibalisme',
      ],
      sentra: ['Sumatera Selatan', 'Kalimantan Selatan', 'Jambi', 'Kalimantan Tengah'],
      params: { fishCount: 2000, survivalRate: 70, harvestWeight: 0.35, sellPrice: 60000, fingerlingCost: 1500, fcr: 2.0, feedPrice: 14000, cycleDays: 180, laborCost: 1000000, otherCost: 900000, totalCapital: 18000000 },
      scen: {
        optimistic: { survivalRate: 82, harvestWeight: 0.45, sellPrice: 68000, fcr: 1.7, feedPrice: 13500, cycleDays: 165, otherCost: 800000 },
        pessimistic: { survivalRate: 52, harvestWeight: 0.3, sellPrice: 52000, fcr: 2.5, feedPrice: 15000, cycleDays: 210, otherCost: 1100000 },
      },
    },
    {
      slug: 'belut',
      name: 'Belut Sawah',
      latin: 'Monopterus albus',
      air: 'Tawar',
      kesulitan: 'Sulit',
      pasar: 'Ekspor + Olahan',
      tagline: 'Nilai jual tinggi di lahan sempit, tapi teknis paling menuntut.',
      ringkas:
        'Belut bisa dibudidayakan di bak sempit dengan nilai jual tinggi dan permintaan ekspor Asia Timur. Kendalanya ada di pasokan bibit hasil tangkapan alam dan kebutuhan pakan hidup.',
      sistem: ['Bak terpal tanpa lumpur', 'Drum plastik', 'Kolam beton'],
      padatTebar: '50–100 ekor/m²',
      suhu: '25–31 °C',
      ph: '6,0–7,5',
      ukuranPanen: '5–8 ekor/kg (125–200 g)',
      lamaPanen: '4–6 bulan',
      keunggulan: [
        'Harga per kilo tinggi dengan permintaan ekspor yang belum terpenuhi',
        'Butuh lahan sangat sempit — cocok untuk pekarangan',
        'Bisa dipelihara di media air bersih tanpa lumpur agar mudah dipantau',
      ],
      risiko: [
        'Bibit banyak berasal dari tangkapan alam, kualitas dan stok tidak stabil',
        'Butuh pakan hidup/segar sehingga rantai pakan lebih repot',
        'Kanibal dan mudah stres saat penanganan',
      ],
      tips: [
        'Karantina dan puasakan bibit tangkapan sebelum ditebar',
        'Pakai sistem air bersih + tempat berlindung, bukan lumpur, agar mudah kontrol',
        'Kunci pembeli/pengepul ekspor sebelum menambah skala',
      ],
      sentra: ['Jawa Barat', 'Yogyakarta', 'Jawa Tengah', 'Sumatera Barat'],
      params: { fishCount: 5000, survivalRate: 70, harvestWeight: 0.15, sellPrice: 70000, fingerlingCost: 2000, fcr: 2.2, feedPrice: 13000, cycleDays: 150, laborCost: 1000000, otherCost: 1200000, totalCapital: 22000000 },
      scen: {
        optimistic: { survivalRate: 82, harvestWeight: 0.18, sellPrice: 80000, fcr: 1.9, feedPrice: 12500, cycleDays: 140, otherCost: 1000000 },
        pessimistic: { survivalRate: 50, harvestWeight: 0.12, sellPrice: 62000, fcr: 2.8, feedPrice: 14000, cycleDays: 180, otherCost: 1500000 },
      },
    },
  ];

  /* ── 2. SISTEM BUDIDAYA ─────────────────────────────────────────────────── */
  const SYSTEMS = [
    {
      slug: 'terpal', nama: 'Kolam Terpal', img: 'kolam-terpal',
      modal: 'Rp 1,5–4 jt / unit', padat: 'Sedang–tinggi', air: 'Ganti berkala',
      cocok: ['Lele', 'Nila', 'Gurame', 'Gabus'],
      plus: ['Modal awal murah dan cepat dipasang', 'Mudah dikuras dan dipanen', 'Bisa dipindah / dibongkar'],
      minus: ['Umur terpal 2–4 tahun', 'Suhu cepat berubah saat cuaca ekstrem', 'Butuh sumber air bersih rutin'],
    },
    {
      slug: 'bioflok', nama: 'Bioflok', img: 'bioflok',
      modal: 'Rp 4–8 jt / unit', padat: 'Sangat tinggi', air: 'Minim ganti air',
      cocok: ['Lele', 'Nila'],
      plus: ['Padat tebar 3–5x kolam biasa', 'Hemat air dan lahan', 'Flok jadi pakan tambahan, FCR turun'],
      minus: ['Wajib listrik & aerator 24 jam', 'Gagal listrik = risiko mati massal', 'Butuh disiplin pengukuran air'],
    },
    {
      slug: 'kolam-tanah', nama: 'Kolam Tanah', img: 'kolam-tanah',
      modal: 'Rp 3–10 jt / petak', padat: 'Rendah–sedang', air: 'Alami + pergantian',
      cocok: ['Patin', 'Nila', 'Bawal', 'Ikan mas'],
      plus: ['Ada pakan alami sehingga biaya pakan turun', 'Biaya operasional paling murah', 'Stabil untuk skala besar'],
      minus: ['Butuh lahan luas', 'Kontrol kualitas air sulit', 'Rawan bocor, hama, dan predator'],
    },
    {
      slug: 'kja', nama: 'Keramba Jaring Apung', img: 'keramba-jaring',
      modal: 'Rp 8–20 jt / unit', padat: 'Tinggi', air: 'Mengalir alami',
      cocok: ['Nila', 'Ikan mas', 'Patin'],
      plus: ['Tidak perlu pompa, air mengalir sendiri', 'Pertumbuhan cepat karena oksigen tinggi', 'Bisa skala besar di waduk/danau'],
      minus: ['Butuh izin dan lokasi perairan umum', 'Rawan upwelling / mati massal', 'Sulit dijaga dari pencurian'],
    },
    {
      slug: 'tambak', nama: 'Tambak Payau', img: 'tambak-vaname',
      modal: 'Rp 60–200 jt / petak', padat: 'Tinggi (intensif)', air: 'Payau + kincir',
      cocok: ['Vaname', 'Bandeng'],
      plus: ['Omzet per petak paling besar', 'Bisa polikultur udang + bandeng', 'Akses langsung pasar ekspor'],
      minus: ['Modal dan biaya listrik besar', 'Risiko penyakit udang tinggi', 'Hanya bisa di wilayah pesisir'],
    },
    {
      slug: 'ras', nama: 'RAS / Resirkulasi', img: 'hatchery-benih',
      modal: 'Rp 15–50 jt / unit', padat: 'Sangat tinggi', air: 'Didaur ulang',
      cocok: ['Benih', 'Nila', 'Belut'],
      plus: ['Hemat air ekstrem, cocok kota', 'Kualitas air terkontrol penuh', 'Produksi tidak terganggu musim'],
      minus: ['Investasi filter dan pompa mahal', 'Butuh operator yang paham teknis', 'Sangat bergantung listrik'],
    },
  ];

  /* ── 3. ALUR / TAHAPAN BUDIDAYA ─────────────────────────────────────────── */
  const STAGES = [
    {
      no: 1, nama: 'Persiapan Wadah', durasi: '7–14 hari', img: 'kolam-terpal',
      isi: ['Bersihkan & keringkan kolam, perbaiki kebocoran', 'Pengapuran dan pemupukan untuk menumbuhkan pakan alami', 'Isi air dan diamkan sampai plankton tumbuh (air kehijauan)'],
      kpi: 'Air stabil, pH 6,5–8,5 sebelum tebar',
      risiko: 'Tebar di air baru tanpa pengendapan → benih stres dan mati awal',
    },
    {
      no: 2, nama: 'Pemilihan & Tebar Benih', durasi: '1 hari', img: 'hatchery-benih',
      isi: ['Ambil benih dari hatchery terpercaya, ukuran seragam', 'Aklimatisasi 15–30 menit sebelum dilepas', 'Tebar pagi atau sore, hindari terik siang'],
      kpi: 'Kematian 3 hari pertama di bawah 5%',
      risiko: 'Benih murah kualitas rendah = SR rendah sepanjang siklus',
    },
    {
      no: 3, nama: 'Pendederan', durasi: '21–45 hari', img: 'hatchery-benih',
      isi: ['Pakan halus/serbuk dengan frekuensi lebih sering', 'Sortir ukuran untuk memisahkan yang tumbuh cepat', 'Pantau kematian harian dan catat'],
      kpi: 'Ukuran seragam, SR pendederan > 80%',
      risiko: 'Tidak sortir → kanibalisme dan ukuran panen tidak rata',
    },
    {
      no: 4, nama: 'Pembesaran & Pakan', durasi: '60–240 hari', img: 'pakan',
      isi: ['Beri pakan 3–5% bobot biomassa per hari, dibagi 2–3 kali', 'Sesuaikan jumlah pakan tiap sampling bobot (2 minggu sekali)', 'Catat pakan masuk untuk menghitung FCR nyata'],
      kpi: 'FCR sesuai target komoditas (lihat halaman komoditas)',
      risiko: 'Pakan berlebih = uang terbuang + amonia naik',
    },
    {
      no: 5, nama: 'Kontrol Air & Kesehatan', durasi: 'Harian', img: 'kualitas-air',
      isi: ['Ukur DO, pH, suhu, dan amonia secara rutin', 'Ganti air sebagian bila air pekat atau berbau', 'Pisahkan ikan sakit, hentikan pakan saat cuaca ekstrem'],
      kpi: 'DO > 4 mg/L, amonia < 0,1 mg/L',
      risiko: 'Amonia menumpuk → nafsu makan turun, kematian bertahap',
    },
    {
      no: 6, nama: 'Panen', durasi: '1–3 hari', img: 'panen',
      isi: ['Puasakan ikan 12–24 jam sebelum panen', 'Panen pagi hari saat suhu rendah', 'Timbang per keranjang dan catat total hasil'],
      kpi: 'Total kg panen vs proyeksi kalkulator ROI',
      risiko: 'Panen siang hari → ikan stres, susut bobot, mati di perjalanan',
    },
    {
      no: 7, nama: 'Pasca Panen & Pasar', durasi: 'Berkelanjutan', img: 'pasca-panen',
      isi: ['Sortir grade ukuran sebelum dijual', 'Jaga rantai dingin 0–4 °C untuk ikan mati', 'Bandingkan harga pengepul, pasar, dan penjualan langsung'],
      kpi: 'Harga jual riil vs asumsi kalkulator',
      risiko: 'Jual borongan ke satu pengepul = posisi tawar lemah',
    },
  ];

  /* ── 4. PETA SENTRA PRODUKSI ────────────────────────────────────────────── */
  const REGIONS = [
    {
      id: 'sumatera', nama: 'Sumatera', fokus: 'Patin, vaname, gabus, nila',
      catatan: 'Sabuk sungai Sumatera Selatan–Jambi–Riau adalah pusat patin dan gabus nasional, sementara pesisir Lampung dan Aceh menjadi tulang punggung tambak vaname.',
      komoditas: ['patin', 'vaname', 'gabus', 'nila'],
      daerah: ['Sumsel (patin, gabus)', 'Jambi & Riau (patin)', 'Lampung (vaname, lele)', 'Sumut (nila Danau Toba)'],
    },
    {
      id: 'jawa', nama: 'Jawa', fokus: 'Nila, lele, gurame, bandeng, ikan mas',
      catatan: 'Pusat konsumsi sekaligus produksi. Jawa Barat kuat di nila, mas, dan gurame; Jawa Timur dan Jawa Tengah menguasai lele, bandeng tambak, dan vaname pantura.',
      komoditas: ['nila', 'lele', 'gurame', 'bandeng', 'ikan-mas'],
      daerah: ['Jabar (nila, mas, gurame — Cianjur, Sukabumi, Tasikmalaya)', 'Jateng (bandeng Pati, lele Boyolali)', 'Jatim (lele Tulungagung & Kediri, bandeng Sidoarjo-Gresik)', 'Banten (bandeng, vaname)'],
    },
    {
      id: 'kalimantan', nama: 'Kalimantan', fokus: 'Patin, gabus, vaname',
      catatan: 'Kalimantan Selatan dan Tengah kuat di ikan rawa seperti gabus (haruan) dan patin, dengan pasar olahan lokal yang mahal dan stabil.',
      komoditas: ['patin', 'gabus', 'vaname', 'nila'],
      daerah: ['Kalsel (gabus/haruan, patin)', 'Kalteng (gabus, patin)', 'Kalbar (nila, vaname)', 'Kaltim (vaname pesisir)'],
    },
    {
      id: 'sulawesi', nama: 'Sulawesi', fokus: 'Bandeng, vaname, nila',
      catatan: 'Sulawesi Selatan adalah sentra tambak bandeng dan vaname terbesar di luar Jawa, ditopang jalur ekspor dari Makassar.',
      komoditas: ['bandeng', 'vaname', 'nila'],
      daerah: ['Sulsel (bandeng Pangkep-Maros, vaname)', 'Sulteng & Sultra (vaname, bandeng)', 'Gorontalo (nila danau)'],
    },
    {
      id: 'bali-nusra', nama: 'Bali & Nusa Tenggara', fokus: 'Vaname, nila, komoditas laut',
      catatan: 'NTB (Sumbawa) berkembang pesat untuk vaname, sementara Bali menopang permintaan pariwisata dengan nila dan produk laut segar.',
      komoditas: ['vaname', 'nila'],
      daerah: ['NTB (vaname Sumbawa, lobster)', 'Bali (nila, vaname, pasar pariwisata)', 'NTT (rumput laut, bandeng)'],
    },
    {
      id: 'maluku-papua', nama: 'Maluku & Papua', fokus: 'Bandeng, komoditas laut',
      catatan: 'Potensi lahan sangat besar tetapi rantai logistik dan pasokan pakan masih jadi kendala utama pengembangan budidaya intensif.',
      komoditas: ['bandeng', 'nila'],
      daerah: ['Papua Selatan (bandeng Merauke)', 'Maluku (kerapu, rumput laut)', 'Papua Barat (nila air tawar)'],
    },
  ];

  /* ── 5. GALERI ──────────────────────────────────────────────────────────── */
  const GALLERY = [
    { img: 'aquaculture/kolam-terpal', kategori: 'Sistem Kolam', judul: 'Kolam Terpal Bundar', teks: 'Unit paling umum untuk pemula: murah, cepat dipasang, mudah dipanen.' },
    { img: 'aquaculture/bioflok', kategori: 'Sistem Kolam', judul: 'Kolam Bioflok', teks: 'Padat tebar tinggi dengan aerator 24 jam dan pergantian air minimal.' },
    { img: 'aquaculture/kolam-tanah', kategori: 'Sistem Kolam', judul: 'Kolam Tanah', teks: 'Biaya operasional termurah, pakan alami membantu menekan FCR.' },
    { img: 'aquaculture/keramba-jaring', kategori: 'Sistem Kolam', judul: 'Keramba Jaring Apung', teks: 'Memanfaatkan air waduk yang mengalir, pertumbuhan cepat tanpa pompa.' },
    { img: 'aquaculture/tambak-vaname', kategori: 'Sistem Kolam', judul: 'Tambak Vaname Intensif', teks: 'Kincir menjaga oksigen di padat tebar tinggi — omzet dan risiko sama besar.' },
    { img: 'aquaculture/hatchery-benih', kategori: 'Benih', judul: 'Pendederan Benih', teks: 'Fase penentu: ukuran seragam di sini menyelamatkan seluruh siklus.' },
    { img: 'aquaculture/pakan', kategori: 'Pakan', judul: 'Manajemen Pakan', teks: 'Pos biaya terbesar, 50–70% total biaya produksi.' },
    { img: 'aquaculture/kualitas-air', kategori: 'Kualitas Air', judul: 'Kontrol Kualitas Air', teks: 'DO, pH, suhu, dan amonia diukur rutin — bukan ditebak.' },
    { img: 'aquaculture/panen', kategori: 'Panen', judul: 'Panen', teks: 'Puasakan ikan sebelum panen dan kerjakan saat suhu masih rendah.' },
    { img: 'aquaculture/sortasi', kategori: 'Pasca Panen', judul: 'Sortasi & Grading', teks: 'Ukuran seragam menaikkan harga jual tanpa menambah biaya produksi.' },
    { img: 'aquaculture/pasca-panen', kategori: 'Pasca Panen', judul: 'Rantai Dingin', teks: 'Es dan cool box menjaga mutu sampai ke tangan pembeli.' },
    { img: 'aquaculture/tim-farm', kategori: 'Tim', judul: 'Tim Farm', teks: 'Operasional harian: pakan, kontrol air, catatan produksi.' },
  ].concat(
    SPECIES.map((s) => ({
      img: 'species/' + s.slug,
      kategori: 'Komoditas',
      judul: s.name,
      teks: s.tagline,
      link: '#/komoditas/' + s.slug,
    }))
  );

  const GLOSSARY = [
    ['SR (Survival Rate)', 'Persentase ikan yang hidup sampai panen dari jumlah benih yang ditebar.'],
    ['FCR', 'Kilogram pakan yang dihabiskan untuk menghasilkan 1 kg daging ikan. Makin kecil makin efisien.'],
    ['Padat tebar', 'Jumlah ikan per satuan luas atau volume air.'],
    ['Pendederan', 'Tahap membesarkan benih kecil sampai siap masuk kolam pembesaran.'],
    ['Biomassa', 'Total bobot seluruh ikan di kolam pada satu waktu.'],
    ['DO', 'Dissolved oxygen — kadar oksigen terlarut dalam air (mg/L).'],
    ['Panen parsial', 'Memanen sebagian ikan yang sudah mencapai ukuran jual, sisanya dibesarkan lagi.'],
    ['Break-even', 'Titik ketika akumulasi keuntungan sudah menutup modal awal.'],
  ];

  global.AQUA = { SPECIES, SYSTEMS, STAGES, REGIONS, GALLERY, GLOSSARY };
})(window);
