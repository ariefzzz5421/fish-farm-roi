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

const formatRupiah = (value) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

const productCards = document.getElementById('productCards');
const fishTypeSelect = document.getElementById('fishType');
const calcForm = document.getElementById('calcForm');
const resultCard = document.getElementById('resultCard');
const year = document.getElementById('year');

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

productCards?.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const selectedIndex = target.getAttribute('data-select');
  if (selectedIndex === null) return;

  fishTypeSelect.value = selectedIndex;
  window.location.hash = '#simulasi';
});

calcForm.addEventListener('submit', calculateEstimate);
renderProducts();
