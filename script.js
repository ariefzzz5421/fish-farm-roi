const products = [
  {
    name: 'Gurame',
    description: 'Ikan premium air tawar dengan tekstur daging padat dan rasa gurih.',
    advantages: 'Cocok untuk menu bakar, goreng, dan sup premium.',
    status: 'Tersedia sesuai siklus panen',
    size: 'Ukuran konsumsi 500-900 gr/ekor',
    price: 48000,
    // GANTI_DENGAN_FOTO_IKAN
    image: 'public/images/fish/gurame.svg'
  },
  {
    name: 'Nila',
    description: 'Komoditas favorit pasar lokal karena pertumbuhan cepat dan permintaan stabil.',
    advantages: 'Mudah diolah, cocok untuk skala rumah makan hingga distributor.',
    status: 'Ready stock berkala',
    size: 'Ukuran konsumsi 300-500 gr/ekor',
    price: 36000,
    // GANTI_DENGAN_FOTO_IKAN
    image: 'public/images/fish/nila.svg'
  },
  {
    name: 'Lele',
    description: 'Ikan konsumsi harian dengan harga kompetitif dan pasar yang luas.',
    advantages: 'Pilihan tepat untuk kebutuhan supply rutin warung dan katering.',
    status: 'Tersedia harian',
    size: 'Ukuran 7-9 ekor/kg',
    price: 28000,
    // GANTI_DENGAN_FOTO_IKAN
    image: 'public/images/fish/lele.svg'
  },
  {
    name: 'Patin',
    description: 'Ikan berdaging lembut dengan nilai ekonomi tinggi untuk berbagai olahan.',
    advantages: 'Cocok untuk fillet, sup, gulai, dan menu keluarga.',
    status: 'Tersedia by request volume',
    size: 'Ukuran 800 gr - 1.2 kg/ekor',
    price: 34000,
    // GANTI_DENGAN_FOTO_IKAN
    image: 'public/images/fish/patin.svg'
  },
  {
    name: 'Ikan Lainnya',
    description: 'Kami juga membuka opsi budidaya komoditas lain sesuai kebutuhan mitra.',
    advantages: 'Skema kerja sama fleksibel untuk pengembangan produk.',
    status: 'Diskusi kemitraan',
    size: 'Menyesuaikan permintaan',
    price: 0,
    // GANTI_DENGAN_FOTO_IKAN
    image: 'public/images/fish/ikan-lainnya.svg'
  }
];

const processSteps = [
  { title: 'Persiapan kolam', detail: 'Sterilisasi, pengeringan, dan pengecekan infrastruktur kolam sebelum tebar benih.' },
  { title: 'Pemilihan bibit', detail: 'Pemilihan benih unggul, sehat, dan seragam untuk pertumbuhan optimal.' },
  { title: 'Pemberian pakan', detail: 'Pakan diberikan teratur sesuai fase pertumbuhan dan target biomassa.' },
  { title: 'Monitoring kualitas air', detail: 'Pemantauan pH, oksigen terlarut, dan kejernihan air secara berkala.' },
  { title: 'Perawatan harian', detail: 'Kontrol kesehatan ikan, kebersihan kolam, dan pencatatan operasional.' },
  { title: 'Panen', detail: 'Sortasi panen sesuai ukuran pasar dan persiapan distribusi.' }
];

const galleryItems = [
  // GANTI_DENGAN_FOTO_GALERI
  { name: 'Kolam utama', image: 'public/images/gallery/kolam-1.svg' },
  { name: 'Aktivitas pakan', image: 'public/images/gallery/kegiatan-pakan-1.svg' },
  { name: 'Persiapan panen', image: 'public/images/gallery/panen-1.svg' },
  { name: 'Sortasi hasil', image: 'public/images/gallery/sortasi-1.svg' },
  { name: 'Dokumentasi tim', image: 'public/images/gallery/tim-1.svg' },
  { name: 'Area budidaya', image: 'public/images/gallery/kolam-2.svg' },
  { name: 'Kontrol kualitas air', image: 'public/images/gallery/kualitas-air-1.svg' },
  { name: 'Pengelolaan harian', image: 'public/images/gallery/kegiatan-harian-1.svg' }
];

const stats = [
  { value: '12+', label: 'Jumlah Kolam' },
  { value: '5', label: 'Jenis Ikan Utama' },
  { value: '8+', label: 'Tahun Pengalaman' },
  { value: '3 Ton', label: 'Target Panen / Siklus' },
  { value: '100%', label: 'Komitmen Kualitas' }
];

const advantages = [
  { icon: '💧', title: 'Air kolam terpantau', text: 'Pemantauan kualitas air untuk menjaga kesehatan ikan.' },
  { icon: '🕒', title: 'Pakan teratur', text: 'Jadwal pakan disiplin berdasarkan fase pertumbuhan.' },
  { icon: '🧬', title: 'Bibit pilihan', text: 'Benih dipilih dengan standar kualitas dan ketahanan.' },
  { icon: '🛟', title: 'Perawatan harian', text: 'Kontrol rutin untuk mencegah gangguan budidaya.' },
  { icon: '🤝', title: 'Siap kerja sama', text: 'Terbuka untuk kemitraan supply maupun pengembangan komoditas.' },
  { icon: '📦', title: 'Supply lokal', text: 'Mendukung kebutuhan pasar lokal dengan pasokan stabil.' }
];

const formatRupiah = (value) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

const productCards = document.getElementById('productCards');
const fishTypeSelect = document.getElementById('fishType');
const calcForm = document.getElementById('calcForm');
const resultCard = document.getElementById('resultCard');
const year = document.getElementById('year');
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');

year.textContent = new Date().getFullYear();

function renderProducts() {
  productCards.innerHTML = products
    .map(
      (item, index) => `
      <article>
        <img class="fish-image" src="${item.image}" alt="Ikan ${item.name}" loading="lazy" />
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <p><strong>Keunggulan:</strong> ${item.advantages}</p>
        <p><strong>Ukuran:</strong> ${item.size}</p>
        ${item.price ? `<p><strong>Harga indikatif:</strong> ${formatRupiah(item.price)} / kg</p>` : '<p><strong>Harga:</strong> Menyesuaikan kebutuhan</p>'}
        <span class="chip">${item.status}</span>
        <p><button class="btn" type="button" data-select="${index}">Pilih untuk Simulasi</button></p>
      </article>
    `
    )
    .join('');

  fishTypeSelect.innerHTML = products
    .filter((item) => item.price > 0)
    .map((item, index) => `<option value="${index}">${item.name} - ${formatRupiah(item.price)}/kg</option>`)
    .join('');
}

function renderProcess() {
  const processTimeline = document.getElementById('processTimeline');
  processTimeline.innerHTML = processSteps
    .map(
      (item, index) => `
        <article>
          <span class="step">${index + 1}</span>
          <h3>${item.title}</h3>
          <p>${item.detail}</p>
        </article>
      `
    )
    .join('');
}

function renderGallery() {
  const farmGallery = document.getElementById('farmGallery');
  farmGallery.innerHTML = galleryItems
    .map(
      (item) => `
        <figure class="gallery-item">
          <img src="${item.image}" alt="${item.name}" loading="lazy" />
          <figcaption>${item.name}</figcaption>
        </figure>
      `
    )
    .join('');
}

function renderStats() {
  const statsGrid = document.getElementById('statsGrid');
  statsGrid.innerHTML = stats
    .map(
      (item) => `
        <article>
          <div class="stat-number">${item.value}</div>
          <p>${item.label}</p>
        </article>
      `
    )
    .join('');
}

function renderAdvantages() {
  const advantagesGrid = document.getElementById('advantagesGrid');
  advantagesGrid.innerHTML = advantages
    .map(
      (item) => `
        <article>
          <div class="icon">${item.icon}</div>
          <h3>${item.title}</h3>
          <p>${item.text}</p>
        </article>
      `
    )
    .join('');
}

function calculateEstimate(event) {
  event.preventDefault();

  const selectedIndex = Number(fishTypeSelect.value);
  const qty = Number(document.getElementById('qtyKg').value);
  const freq = Number(document.getElementById('deliveryFreq').value);

  if (!Number.isFinite(qty) || qty <= 0) {
    resultCard.innerHTML = `
      <h3>Estimasi Belanja</h3>
      <p class="placeholder">Jumlah kg harus lebih dari 0.</p>
    `;
    return;
  }

  const selectedProduct = products[selectedIndex];
  const subtotal = selectedProduct.price * qty;
  const monthlyProjection = subtotal * freq;

  resultCard.innerHTML = `
    <h3>Estimasi Belanja</h3>
    <div class="summary">
      <div><span>Produk</span><strong>${selectedProduct.name}</strong></div>
      <div><span>Harga/Kg</span><strong>${formatRupiah(selectedProduct.price)}</strong></div>
      <div><span>Jumlah Order</span><strong>${qty} kg</strong></div>
      <div><span>Total per Order</span><strong>${formatRupiah(subtotal)}</strong></div>
      <div><span>Proyeksi per Bulan</span><strong>${formatRupiah(monthlyProjection)}</strong></div>
    </div>
    <p><strong>CTA:</strong> Hubungi kami untuk negosiasi harga dan jadwal pengiriman.</p>
    <a class="btn" href="https://wa.me/GANTI_DENGAN_NOMOR_WHATSAPP" target="_blank" rel="noopener noreferrer">Hubungi via WhatsApp</a>
  `;
}

function initMobileMenu() {
  menuToggle?.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mainNav?.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLAnchorElement)) return;

    mainNav.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  });
}

productCards?.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const selectedIndex = target.getAttribute('data-select');
  if (selectedIndex === null) return;

  fishTypeSelect.value = selectedIndex;
  window.location.hash = '#simulasi';
});

calcForm?.addEventListener('submit', calculateEstimate);

renderProducts();
renderProcess();
renderGallery();
renderStats();
renderAdvantages();
initMobileMenu();
