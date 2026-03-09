function parseInput(id) {
  const rawValue = Number(document.getElementById(id).value);
  if (!Number.isFinite(rawValue) || rawValue < 0) {
    return 0;
  }
  return rawValue;
}

function formatRupiah(value) {
  return 'Rp' + Number(value).toLocaleString('id-ID', { maximumFractionDigits: 0 });
}

function formatPercent(value) {
  return Number(value).toLocaleString('id-ID', { maximumFractionDigits: 2 }) + '%';
}

function setRatePair(changedField) {
  const mortalityInput = document.getElementById('mortalityRate');
  const survivalInput = document.getElementById('survivalRate');

  let mortality = parseInput('mortalityRate');
  let survival = parseInput('survivalRate');

  if (changedField === 'mortality') {
    mortality = Math.min(100, mortality);
    survival = 100 - mortality;
    survivalInput.value = survival.toFixed(1);
  }

  if (changedField === 'survival') {
    survival = Math.min(100, survival);
    mortality = 100 - survival;
    mortalityInput.value = mortality.toFixed(1);
  }
}

function renderBreakdown(totalBiaya, biayaItems) {
  const container = document.getElementById('biayaBreakdown');
  if (totalBiaya <= 0) {
    container.innerHTML = '<p>Belum ada biaya yang bisa dianalisa.</p>';
    return;
  }

  const rows = biayaItems.map((item) => {
    const percentage = (item.value / totalBiaya) * 100;
    return `
      <div class="breakdown-item">
        <div class="breakdown-label">
          <span>${item.label}</span>
          <span>${formatRupiah(item.value)} (${percentage.toFixed(1)}%)</span>
        </div>
        <div class="breakdown-bar">
          <div class="breakdown-fill" style="width: ${Math.max(0, Math.min(100, percentage))}%;"></div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = rows;
}

function hitungROI() {
  const jumlahBibit = parseInput('jumlahBibit');
  const hargaBibit = parseInput('hargaBibit');
  const mortalityRate = Math.min(100, parseInput('mortalityRate'));
  const survivalRate = Math.max(0, 100 - mortalityRate);
  const beratPanen = parseInput('beratPanen');
  const hargaJual = parseInput('hargaJual');
  const biayaPakan = parseInput('biayaPakan');
  const biayaObat = parseInput('biayaObat');
  const biayaListrik = parseInput('biayaListrik');
  const biayaTenaga = parseInput('biayaTenaga');
  const biayaLain = parseInput('biayaLain');

  document.getElementById('survivalRate').value = survivalRate.toFixed(1);

  const biayaBibit = jumlahBibit * hargaBibit;
  const ikanHidup = jumlahBibit * (survivalRate / 100);
  const totalBerat = ikanHidup * beratPanen;
  const omzet = totalBerat * hargaJual;
  const totalBiaya = biayaBibit + biayaPakan + biayaObat + biayaListrik + biayaTenaga + biayaLain;
  const labaBersih = omzet - totalBiaya;
  const roi = totalBiaya > 0 ? (labaBersih / totalBiaya) * 100 : 0;
  const bepHarga = totalBerat > 0 ? totalBiaya / totalBerat : 0;
  const marginBersih = omzet > 0 ? (labaBersih / omzet) * 100 : 0;
  const labaPerEkor = ikanHidup > 0 ? labaBersih / ikanHidup : 0;
  const paybackSiklus = labaBersih > 0 ? (totalBiaya / labaBersih) : 0;

  document.getElementById('totalBiaya').textContent = formatRupiah(totalBiaya);
  document.getElementById('omzet').textContent = formatRupiah(omzet);

  const labaEl = document.getElementById('labaBersih');
  labaEl.textContent = formatRupiah(labaBersih);
  labaEl.className = 'value ' + (labaBersih >= 0 ? 'good' : 'bad');

  const roiEl = document.getElementById('roi');
  roiEl.textContent = formatPercent(roi);
  roiEl.className = 'value ' + (roi >= 0 ? 'good' : 'bad');

  document.getElementById('ikanHidup').textContent = Math.round(ikanHidup).toLocaleString('id-ID') + ' ekor';
  document.getElementById('totalBerat').textContent = totalBerat.toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' kg';
  document.getElementById('bepHarga').textContent = formatRupiah(bepHarga) + ' / kg';
  document.getElementById('marginBersih').textContent = formatPercent(marginBersih);
  document.getElementById('labaPerEkor').textContent = formatRupiah(labaPerEkor);
  document.getElementById('payback').textContent = paybackSiklus > 0
    ? paybackSiklus.toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' siklus'
    : 'Belum balik modal';

  renderBreakdown(totalBiaya, [
    { label: 'Bibit', value: biayaBibit },
    { label: 'Pakan', value: biayaPakan },
    { label: 'Obat & Vitamin', value: biayaObat },
    { label: 'Listrik/Air', value: biayaListrik },
    { label: 'Tenaga Kerja', value: biayaTenaga },
    { label: 'Lain-lain', value: biayaLain }
  ]);

  const catatan = [];
  if (roi > 30) {
    catatan.push('ROI sangat baik. Lanjutkan dengan kontrol biaya pakan agar margin terjaga.');
  } else if (roi > 0) {
    catatan.push('Usaha masih untung, tapi sensitif terhadap perubahan harga jual dan kematian ikan.');
  } else {
    catatan.push('Simulasi masih rugi. Perlu koreksi harga jual, mortalitas, atau biaya pakan.');
  }

  if (mortalityRate > 20) {
    catatan.push('Mortality rate di atas 20% cukup tinggi. Evaluasi kualitas air, padat tebar, dan manajemen kesehatan ikan.');
  }

  if (bepHarga > hargaJual) {
    catatan.push('Harga jual belum menutup BEP. Cari saluran pasar dengan harga lebih baik atau turunkan biaya produksi.');
  }

  if (marginBersih < 10 && labaBersih > 0) {
    catatan.push('Margin tipis (<10%). Siapkan skenario cadangan bila ada kenaikan harga pakan.');
  }

  document.getElementById('catatan').innerHTML = catatan.map((item) => `<li>${item}</li>`).join('');
}

function resetForm() {
  document.getElementById('jumlahBibit').value = 5000;
  document.getElementById('hargaBibit').value = 350;
  document.getElementById('mortalityRate').value = 15;
  document.getElementById('survivalRate').value = 85;
  document.getElementById('beratPanen').value = 0.45;
  document.getElementById('hargaJual').value = 28000;
  document.getElementById('biayaPakan').value = 18000000;
  document.getElementById('biayaObat').value = 1200000;
  document.getElementById('biayaListrik').value = 800000;
  document.getElementById('biayaTenaga').value = 1500000;
  document.getElementById('biayaLain').value = 1000000;
  hitungROI();
}

document.getElementById('calculateBtn').addEventListener('click', hitungROI);
document.getElementById('resetBtn').addEventListener('click', resetForm);
document.getElementById('mortalityRate').addEventListener('input', () => setRatePair('mortality'));
document.getElementById('survivalRate').addEventListener('input', () => setRatePair('survival'));

hitungROI();
