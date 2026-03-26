const products = [
  {
    name: 'Ikan Nila Fresh',
    size: 'Ukuran konsumsi 300-500 gr/ekor',
    price: 36000,
    note: 'Cocok untuk menu bakar, goreng, dan pecak.'
  },
  {
    name: 'Ikan Lele Segar',
    size: 'Ukuran 7-9 ekor/kg',
    price: 28000,
    note: 'Ideal untuk warung pecel lele dan katering.'
  },
  {
    name: 'Ikan Patin Fresh',
    size: 'Ukuran 800 gr - 1.2 kg/ekor',
    price: 34000,
    note: 'Tekstur lembut untuk sup, gulai, dan fillet.'
  }
];

const fishGallery = [
  {
    name: 'Ikan Nila Segar',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Ikan Lele Hasil Budidaya',
    image: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Ikan Patin Berkualitas',
    image: 'https://images.unsplash.com/photo-1611171711914-084e13f2dbb8?auto=format&fit=crop&w=1200&q=80'
  }
];

const defaultTestimonials = [
  {
    name: 'Resto Laut Nusantara',
    role: 'Owner Restoran',
    rating: 5,
    message: 'Pasokan stabil dan kualitas ikan konsisten segar. Cocok untuk kebutuhan harian restoran kami.',
    createdAt: '2026-03-10'
  },
  {
    name: 'CV Boga Sejahtera',
    role: 'Tim Procurement',
    rating: 5,
    message: 'Komunikasi cepat, pengiriman rapi, dan harga grosirnya kompetitif untuk kontrak bulanan.',
    createdAt: '2026-03-18'
  }
];

const TESTIMONIAL_STORAGE_KEY = 'fishFarmTestimonials';

const formatRupiah = (value) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

const formatDate = (isoDate) =>
  new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(isoDate));

const productCards = document.getElementById('productCards');
const fishTypeSelect = document.getElementById('fishType');
const calcForm = document.getElementById('calcForm');
const resultCard = document.getElementById('resultCard');
const year = document.getElementById('year');
const galleryContainer = document.getElementById('fishGallery');
const testimonialForm = document.getElementById('testimonialForm');
const testimonialList = document.getElementById('testimonialList');
const testimonialFeedback = document.getElementById('testimonialFeedback');
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');

year.textContent = new Date().getFullYear();

function renderProducts() {
  productCards.innerHTML = products
    .map(
      (item, index) => `
      <article>
        <h3>${item.name}</h3>
        <p>${item.size}</p>
        <p class="price">${formatRupiah(item.price)} / kg</p>
        <p>${item.note}</p>
        <button class="btn btn-sm" type="button" data-select="${index}">Pilih Produk</button>
      </article>
    `
    )
    .join('');

  fishTypeSelect.innerHTML = products
    .map((item, index) => `<option value="${index}">${item.name} - ${formatRupiah(item.price)}/kg</option>`)
    .join('');
}

function renderGallery() {
  galleryContainer.innerHTML = fishGallery
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
    <p><strong>CTA:</strong> Hubungi kami sekarang untuk negosiasi harga grosir dan jadwal kirim tetap.</p>
    <a class="btn" href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer">Kunci Harga Sekarang</a>
  `;
}

function getTestimonials() {
  const fromStorage = localStorage.getItem(TESTIMONIAL_STORAGE_KEY);
  if (!fromStorage) return [...defaultTestimonials];

  try {
    const parsedTestimonials = JSON.parse(fromStorage);
    if (!Array.isArray(parsedTestimonials)) return [...defaultTestimonials];
    return parsedTestimonials;
  } catch {
    return [...defaultTestimonials];
  }
}

function saveTestimonials(testimonials) {
  localStorage.setItem(TESTIMONIAL_STORAGE_KEY, JSON.stringify(testimonials));
}

function renderTestimonials() {
  const testimonials = getTestimonials();

  testimonialList.innerHTML = testimonials
    .slice()
    .reverse()
    .map(
      (item) => `
        <article class="testimonial-item">
          <div class="testimonial-head">
            <div>
              <strong>${item.name}</strong>
              <div class="testimonial-role">${item.role}</div>
            </div>
            <div class="testimonial-date">${formatDate(item.createdAt)}</div>
          </div>
          <div class="rating" aria-label="Rating ${item.rating} dari 5">${'⭐'.repeat(item.rating)}</div>
          <p>${item.message}</p>
        </article>
      `
    )
    .join('');
}

function handleTestimonialSubmit(event) {
  event.preventDefault();

  const name = document.getElementById('customerName').value.trim();
  const role = document.getElementById('customerRole').value.trim();
  const rating = Number(document.getElementById('customerRating').value);
  const message = document.getElementById('customerMessage').value.trim();

  if (!name || !role || !message || !Number.isFinite(rating)) {
    testimonialFeedback.textContent = 'Mohon isi semua data testimoni dengan lengkap.';
    return;
  }

  const newTestimonial = {
    name,
    role,
    rating,
    message,
    createdAt: new Date().toISOString()
  };

  const testimonials = getTestimonials();
  testimonials.push(newTestimonial);
  saveTestimonials(testimonials);
  renderTestimonials();

  testimonialFeedback.textContent = 'Terima kasih! Testimoni Anda sudah kami terima.';
  testimonialForm.reset();
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
testimonialForm?.addEventListener('submit', handleTestimonialSubmit);

renderProducts();
renderGallery();
renderTestimonials();
initMobileMenu();
