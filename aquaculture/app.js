/* ══════════════════════════════════════════════════════════════════════════
   AQUACULTURE HUB — router + halaman + mesin ROI
   Mesin perhitungan diambil dari fishfarm-roi-calculator-v2.html supaya angka
   di situs ini identik dengan kalkulator yang sudah dipakai.
   Tanpa framework, tanpa build step — cukup buka index.html.
   ══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const { SPECIES, SYSTEMS, STAGES, REGIONS, GALLERY, GLOSSARY } = window.AQUA;

  /* ── util ─────────────────────────────────────────────────────────────── */
  const $ = (id) => document.getElementById(id);
  const fmt = (v) => 'Rp ' + Math.round(v).toLocaleString('id-ID');
  const fmtS = (v) => {
    const a = Math.abs(v);
    if (a >= 1e9) return (v < 0 ? '-' : '') + 'Rp ' + (Math.abs(v) / 1e9).toFixed(1) + ' M';
    if (a >= 1e6) return (v < 0 ? '-' : '') + 'Rp ' + (Math.abs(v) / 1e6).toFixed(1) + ' jt';
    if (a >= 1e3) return (v < 0 ? '-' : '') + 'Rp ' + (Math.abs(v) / 1e3).toFixed(0) + ' rb';
    return fmt(v);
  };
  const num = (v, d = 1) => Number(v).toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d });
  const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const img = (name) => '../public/images/' + name + '.svg';
  const bySlug = (slug) => SPECIES.find((s) => s.slug === slug);
  const SCEN_LABEL = { base: 'Base', optimistic: 'Optimis', pessimistic: 'Pesimis' };

  const PARAM_KEYS = ['fishCount', 'survivalRate', 'harvestWeight', 'sellPrice', 'fingerlingCost', 'fcr', 'feedPrice', 'cycleDays', 'laborCost', 'otherCost', 'totalCapital'];

  /* warna data (lolos uji keterbacaan buta warna di atas permukaan gelap) */
  const COST_COLORS = [
    { key: 'benih', label: 'Benih', color: 'var(--c1)', hex: '#26ab58' },
    { key: 'pakan', label: 'Pakan', color: 'var(--c2)', hex: '#4f97e8' },
    { key: 'labor', label: 'Tenaga kerja & listrik', color: 'var(--c3)', hex: '#bc8317' },
    { key: 'lain', label: 'Lain-lain', color: 'var(--c4)', hex: '#9578dd' },
  ];

  /* ── state ────────────────────────────────────────────────────────────── */
  const DEFAULT_PARTNERS = [
    { id: 1, name: 'Pengelola', type: 'pengelola', pct: 70 },
    { id: 2, name: 'Investor A', type: 'investor', pct: 30 },
  ];
  const TYPES = { pengelola: 'Pengelola', investor: 'Investor', mitra: 'Mitra Bisnis', bank: 'Bank / Kreditur', lainnya: 'Lainnya' };
  const STORE_KEY = 'aquaHub.v1';

  const state = {
    slug: 'nila',
    scenario: 'base',
    params: Object.assign({}, bySlug('nila').params),
    partners: DEFAULT_PARTNERS.map((p) => Object.assign({}, p)),
    ownerName: 'Ariefz',
    nextPartnerId: 3,
  };

  function saveState() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({
        slug: state.slug, scenario: state.scenario, params: state.params,
        partners: state.partners, ownerName: state.ownerName, nextPartnerId: state.nextPartnerId,
      }));
    } catch (e) { /* localStorage dimatikan — abaikan */ }
  }
  function loadState() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      if (s && bySlug(s.slug)) {
        state.slug = s.slug;
        state.scenario = s.scenario || 'base';
        state.params = Object.assign({}, bySlug(s.slug).params, s.params || {});
        if (Array.isArray(s.partners) && s.partners.length) state.partners = s.partners;
        state.ownerName = s.ownerName || state.ownerName;
        state.nextPartnerId = s.nextPartnerId || state.partners.length + 1;
      }
    } catch (e) { /* data rusak — pakai default */ }
  }

  /** Ambil parameter satu komoditas pada skenario tertentu. */
  function paramsFor(slug, scenario) {
    const sp = bySlug(slug);
    const base = Object.assign({}, sp.params);
    if (scenario === 'base' || !sp.scen[scenario]) return base;
    return Object.assign(base, sp.scen[scenario]);
  }

  function applyScenario(slug, scenario) {
    state.slug = slug;
    state.scenario = scenario;
    state.params = paramsFor(slug, scenario);
    saveState();
  }

  /* ── mesin ROI (sama persis dengan kalkulator v2) ──────────────────────── */
  function calcROI(p, partners) {
    const fish = +p.fishCount || 0;
    const surv = (+p.survivalRate || 0) / 100;
    const hw = +p.harvestWeight || 0;
    const sp = +p.sellPrice || 0;
    const fp = +p.fingerlingCost || 0;
    const fcr = +p.fcr || 0;
    const feedP = +p.feedPrice || 0;
    const labor = +p.laborCost || 0;
    const other = +p.otherCost || 0;
    const cycle = +p.cycleDays || 1;
    const cap = +p.totalCapital || 0;

    const harvestFish = fish * surv;
    const totalKg = harvestFish * hw;
    const revenue = totalKg * sp;

    const fingerlingT = fish * fp;
    const feedNeeded = totalKg * fcr;
    const feedCost = feedNeeded * feedP;
    const laborT = labor * (cycle / 30);
    const totalCost = fingerlingT + feedCost + laborT + other;

    const netProfit = revenue - totalCost;
    const roi = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;
    const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
    const cyclesPerYr = 365 / cycle;
    const annualProfit = netProfit * cyclesPerYr;

    /* titik impas: harga jual & volume minimum agar tidak rugi */
    const bepPrice = totalKg > 0 ? totalCost / totalKg : 0;
    const bepKg = sp > 0 ? totalCost / sp : 0;
    const costPerKg = bepPrice;

    const list = partners || state.partners;
    const splits = list.map((x) => Object.assign({}, x, {
      profit: netProfit * (x.pct / 100),
      annualProfit: annualProfit * (x.pct / 100),
    }));
    const ownerShare = (list.find((x) => x.type === 'pengelola') || { pct: 100 }).pct / 100;
    const ownerProfit = netProfit * ownerShare;
    const paybackCycles = ownerProfit > 0 ? cap / ownerProfit : Infinity;
    const paybackMonths = isFinite(paybackCycles) ? paybackCycles * (cycle / 30) : Infinity;

    return {
      harvestFish, totalKg, revenue, fingerlingT, feedNeeded, feedCost, laborT, other,
      totalCost, netProfit, roi, margin, cyclesPerYr, annualProfit, splits,
      paybackCycles, paybackMonths, bepPrice, bepKg, costPerKg, cycle, cap,
    };
  }

  const healthOf = (roi) => (roi > 30 ? ['Profitable', 'good'] : roi > 0 ? ['Marginal', 'warn'] : ['Rugi', 'bad']);

  /* ── komponen bersama ─────────────────────────────────────────────────── */

  /** Batang peringkat satu warna (data besaran, bukan identitas). */
  function barChart(rows, opts) {
    const o = opts || {};
    const max = Math.max(...rows.map((r) => Math.abs(r.value)), 1);
    return '<div class="chart">' + rows.map((r) => {
      const w = (Math.abs(r.value) / max) * 100;
      const color = r.value < 0 ? 'var(--red)' : (r.color || 'var(--green-dim)');
      return `<div class="bar-row" data-tip="${esc(r.tip || '')}">
        <span class="bar-lbl">${esc(r.label)}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${w.toFixed(1)}%;background:${color}"></div></div>
        <span class="bar-val ${r.value < 0 ? 'neg' : ''}">${esc(r.display != null ? r.display : num(r.value, o.dp == null ? 1 : o.dp))}</span>
      </div>`;
    }).join('') + '</div>';
  }

  /** Batang komposisi bertumpuk + legenda berlabel angka. */
  function stackedCost(c) {
    const segs = [
      { label: 'Benih', value: c.fingerlingT, hex: COST_COLORS[0].hex },
      { label: 'Pakan', value: c.feedCost, hex: COST_COLORS[1].hex },
      { label: 'Tenaga kerja & listrik', value: c.laborT, hex: COST_COLORS[2].hex },
      { label: 'Lain-lain', value: c.other, hex: COST_COLORS[3].hex },
    ];
    const total = segs.reduce((s, x) => s + x.value, 0) || 1;
    return '<div class="stack">' + segs.map((s) => {
      const pct = (s.value / total) * 100;
      return `<div class="stack-seg" style="flex:${pct};background:${s.hex}" data-tip="${esc(s.label)}|${fmt(s.value)} · ${pct.toFixed(1)}% dari total biaya"></div>`;
    }).join('') + '</div>' +
      '<div class="legend">' + segs.map((s) => `
        <span class="legend-item"><span class="legend-swatch" style="background:${s.hex}"></span>${esc(s.label)}
        <span class="legend-val">${((s.value / total) * 100).toFixed(0)}%</span></span>`).join('') + '</div>';
  }

  const statCard = (k, v, sub, cls, tone) =>
    `<div class="stat ${cls || ''}"><div class="k">${esc(k)}</div><div class="v ${tone || ''}">${v}</div>${sub ? `<div class="s">${esc(sub)}</div>` : ''}</div>`;

  const speciesCard = (s, i) => {
    const c = calcROI(paramsFor(s.slug, 'base'), DEFAULT_PARTNERS);
    const [label, cls] = healthOf(c.roi);
    return `<a class="card" href="#/komoditas/${s.slug}">
      <div class="card-img"><img src="${img('species/' + s.slug)}" alt="Ilustrasi ${esc(s.name)}" loading="lazy" /></div>
      <div class="card-body">
        <div class="card-title"><span class="card-rank">#${i + 1}</span>${esc(s.name)}</div>
        <div class="card-text">${esc(s.tagline)}</div>
        <div class="card-meta">
          <span class="tag ${cls}">ROI ${c.roi.toFixed(0)}%</span>
          <span class="tag">${esc(s.lamaPanen)}</span>
          <span class="tag">${esc(s.kesulitan)}</span>
        </div>
      </div>
    </a>`;
  };

  /* ── halaman: beranda ─────────────────────────────────────────────────── */
  function pageHome() {
    const ranked = SPECIES.map((s) => {
      const c = calcROI(paramsFor(s.slug, 'base'), DEFAULT_PARTNERS);
      return { s, c };
    }).sort((a, b) => b.c.roi - a.c.roi);

    const fastest = SPECIES.slice().sort((a, b) => a.params.cycleDays - b.params.cycleDays)[0];
    const priciest = SPECIES.slice().sort((a, b) => b.params.sellPrice - a.params.sellPrice)[0];
    const cheapest = SPECIES.slice().sort((a, b) => a.params.totalCapital - b.params.totalCapital)[0];

    return `
      <div class="eyebrow">Aquaculture Division · 2026</div>
      <h1>Peta lengkap <em>budidaya ikan</em><br />dari kolam sampai hitungan untung</h1>
      <p class="lead">Sepuluh komoditas budidaya paling relevan di Indonesia, lengkap dengan skenario base–optimis–pesimis, galeri sistem kolam, peta sentra produksi, dan kalkulator ROI yang memakai mesin hitung yang sama dengan kalkulator v2.</p>

      <div class="section">
        <div class="stat-grid">
          ${statCard('Komoditas dipetakan', '10', 'air tawar & payau')}
          ${statCard('Skenario per komoditas', '3', 'base · optimis · pesimis', 'b')}
          ${statCard('Siklus tercepat', fastest.params.cycleDays + ' hari', fastest.name, 'a')}
          ${statCard('Harga tertinggi', fmtS(priciest.params.sellPrice) + '/kg', priciest.name, 'p')}
        </div>
      </div>

      <div class="section">
        <div class="section-hd">
          <div><h2>Peringkat ROI per siklus</h2><p>Skenario base, satu unit produksi standar per komoditas.</p></div>
          <a class="btn" href="#/skenario">Bandingkan detail</a>
        </div>
        ${barChart(ranked.map((r) => ({
          label: r.s.name,
          value: r.c.roi,
          display: r.c.roi.toFixed(0) + '%',
          tip: r.s.name + '|Laba ' + fmt(r.c.netProfit) + ' per siklus ' + r.c.cycle + ' hari · modal kerja ' + fmtS(r.c.totalCost),
        })), { dp: 0 })}
        <div class="note green" style="margin-top:14px">
          <b>Cara membaca:</b> ROI di sini adalah laba bersih dibagi biaya produksi satu siklus — bukan per tahun.
          Komoditas dengan siklus pendek seperti lele mengulang siklus 4x setahun, jadi bandingkan juga kolom laba per tahun di halaman skenario.
        </div>
      </div>

      <div class="section">
        <div class="section-hd">
          <div><h2>Mulai dari mana?</h2><p>Tiga jalur masuk sesuai kondisi modal dan lahan.</p></div>
        </div>
        <div class="grid c3">
          <div class="card hoverable"><div class="card-body">
            <div class="card-title">Modal paling kecil</div>
            <div class="card-text">${esc(cheapest.name)} — perkiraan modal unit ${fmtS(cheapest.params.totalCapital)} dengan siklus ${cheapest.params.cycleDays} hari.</div>
            <div class="card-meta"><a class="btn" href="#/komoditas/${cheapest.slug}">Lihat profil</a></div>
          </div></div>
          <div class="card hoverable"><div class="card-body">
            <div class="card-title">Perputaran tercepat</div>
            <div class="card-text">${esc(fastest.name)} — panen ${fastest.params.cycleDays} hari, ${(365 / fastest.params.cycleDays).toFixed(1)}x siklus per tahun.</div>
            <div class="card-meta"><a class="btn" href="#/komoditas/${fastest.slug}">Lihat profil</a></div>
          </div></div>
          <div class="card hoverable"><div class="card-body">
            <div class="card-title">Nilai jual tertinggi</div>
            <div class="card-text">${esc(priciest.name)} — ${fmt(priciest.params.sellPrice)}/kg, tapi menuntut kontrol teknis paling ketat.</div>
            <div class="card-meta"><a class="btn" href="#/komoditas/${priciest.slug}">Lihat profil</a></div>
          </div></div>
        </div>
      </div>

      <div class="section">
        <div class="section-hd">
          <div><h2>Galeri aquaculture</h2><p>Sistem kolam, kegiatan harian, dan pasca panen.</p></div>
          <a class="btn" href="#/galeri">Semua galeri</a>
        </div>
        <div class="gal-grid">
          ${GALLERY.slice(0, 6).map((g, i) => galItem(g, i)).join('')}
        </div>
      </div>

      <div class="section">
        <div class="note amber">
          <div><b>Catatan angka.</b> Seluruh harga adalah estimasi pasar 2026 untuk skala usaha kecil dan berbeda antar daerah.
          Sebelum mengambil keputusan, ganti harga benih, pakan, dan harga jual dengan harga di lokasi kamu langsung di
          <a href="#/roi" style="color:var(--green)">kalkulator ROI</a>.</div>
        </div>
      </div>`;
  }

  /* ── halaman: galeri ──────────────────────────────────────────────────── */
  const galItem = (g, i) =>
    `<figure class="gal-item" data-gal="${i}">
      <img src="${img(g.img)}" alt="${esc(g.judul)}" loading="lazy" />
      <figcaption class="gal-cap"><span>${esc(g.kategori)}</span><b>${esc(g.judul)}</b></figcaption>
    </figure>`;

  let galFilter = 'Semua';
  function pageGallery() {
    const kategori = ['Semua'].concat([...new Set(GALLERY.map((g) => g.kategori))]);
    const items = GALLERY.map((g, i) => ({ g, i })).filter((x) => galFilter === 'Semua' || x.g.kategori === galFilter);
    return `
      <div class="eyebrow">Galeri</div>
      <h1>Galeri <em>Aquaculture</em></h1>
      <p class="lead">Semua gambar adalah ilustrasi vektor yang dibuat khusus untuk situs ini, jadi ukurannya ringan dan tetap tajam di layar apa pun. Ganti dengan foto asli farm kapan saja — cukup timpa berkas di <code>public/images/</code>.</p>

      <div class="section">
        <div class="chip-row" id="galFilters">
          ${kategori.map((k) => `<button class="chip ${k === galFilter ? 'active' : ''}" data-gal-filter="${esc(k)}">${esc(k)}</button>`).join('')}
        </div>
        <div class="gal-grid" style="margin-top:16px">
          ${items.map((x) => galItem(x.g, x.i)).join('')}
        </div>
      </div>`;
  }

  /* ── halaman: daftar komoditas ────────────────────────────────────────── */
  let sortKey = 'roi';
  let sortDir = -1;
  function pageSpeciesList() {
    const rows = SPECIES.map((s) => {
      const c = calcROI(paramsFor(s.slug, 'base'), DEFAULT_PARTNERS);
      return {
        s, c,
        nama: s.name, roi: c.roi, siklus: s.params.cycleDays, harga: s.params.sellPrice,
        modal: s.params.totalCapital, laba: c.netProfit, tahun: c.annualProfit,
      };
    }).sort((a, b) => (a[sortKey] > b[sortKey] ? 1 : -1) * sortDir);

    const th = (key, label, cls) =>
      `<th class="sortable ${cls || ''} ${sortKey === key ? 'sorted' : ''}" data-sort="${key}">${label}${sortKey === key ? (sortDir === 1 ? ' ↑' : ' ↓') : ''}</th>`;

    return `
      <div class="eyebrow">Komoditas</div>
      <h1>Top 10 <em>budidaya ikan</em> Indonesia</h1>
      <p class="lead">Dipilih dari komoditas dengan produksi terbesar dan permintaan pasar paling stabil: nila, lele, patin, vaname, dan bandeng menjadi penopang produksi nasional, sisanya masuk karena nilai jual atau ceruk pasar yang kuat.</p>

      <div class="section">
        <div class="grid c3">${SPECIES.map(speciesCard).join('')}</div>
      </div>

      <div class="section">
        <div class="section-hd"><div><h2>Tabel perbandingan</h2><p>Skenario base · klik judul kolom untuk mengurutkan.</p></div></div>
        <div class="table-wrap">
          <table id="specTable">
            <thead><tr>
              ${th('nama', 'Komoditas')}
              ${th('roi', 'ROI / siklus', 'num')}
              ${th('laba', 'Laba / siklus', 'num')}
              ${th('tahun', 'Laba / tahun', 'num')}
              ${th('siklus', 'Siklus', 'num')}
              ${th('harga', 'Harga jual', 'num')}
              ${th('modal', 'Modal unit', 'num')}
              <th>Kesulitan</th>
            </tr></thead>
            <tbody>
              ${rows.map((r) => `<tr>
                <td><a href="#/komoditas/${r.s.slug}" style="color:var(--text);font-weight:600">${esc(r.nama)}</a><div class="muted">${esc(r.s.latin)}</div></td>
                <td class="num ${r.roi >= 0 ? 'pos' : 'neg'}">${r.roi.toFixed(0)}%</td>
                <td class="num ${r.laba >= 0 ? 'pos' : 'neg'}">${fmtS(r.laba)}</td>
                <td class="num">${fmtS(r.tahun)}</td>
                <td class="num">${r.siklus} hr</td>
                <td class="num">${fmtS(r.harga)}</td>
                <td class="num">${fmtS(r.modal)}</td>
                <td><span class="tag ${r.s.kesulitan === 'Mudah' ? 'good' : r.s.kesulitan === 'Sedang' ? 'warn' : 'bad'}">${esc(r.s.kesulitan)}</span></td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
  }

  /* ── halaman: detail komoditas ────────────────────────────────────────── */
  function pageSpecies(slug) {
    const s = bySlug(slug);
    if (!s) return pageNotFound();
    const scenRows = ['pessimistic', 'base', 'optimistic'].map((k) => {
      const p = paramsFor(slug, k);
      return { k, p, c: calcROI(p, DEFAULT_PARTNERS) };
    });
    const base = scenRows.find((r) => r.k === 'base');
    const [label, cls] = healthOf(base.c.roi);

    return `
      <div class="eyebrow">Komoditas · ${esc(s.air)}</div>
      <h1>${esc(s.name)} <em style="font-size:.5em;font-family:var(--mono)">${esc(s.latin)}</em></h1>
      <p class="lead">${esc(s.ringkas)}</p>

      <div class="section grid c2" style="align-items:start">
        <div class="card"><div class="card-img" style="aspect-ratio:3/2"><img src="${img('species/' + slug)}" alt="Ilustrasi ${esc(s.name)}" /></div></div>
        <div>
          <div class="stat-grid" style="grid-template-columns:1fr 1fr">
            ${statCard('ROI / siklus', base.c.roi.toFixed(0) + '%', 'skenario base', '', base.c.roi >= 0 ? 'pos' : 'neg')}
            ${statCard('Laba / siklus', fmtS(base.c.netProfit), base.p.cycleDays + ' hari', 'b')}
            ${statCard('Laba / tahun', fmtS(base.c.annualProfit), num(base.c.cyclesPerYr, 1) + 'x siklus', 'a')}
            ${statCard('Balik modal', isFinite(base.c.paybackMonths) ? num(base.c.paybackMonths, 0) + ' bln' : '∞', 'porsi pengelola 70%', 'p')}
          </div>
          <div class="chip-row" style="margin-top:12px">
            <span class="tag ${cls}">${label}</span>
            <span class="tag">${esc(s.kesulitan)}</span>
            <span class="tag info">${esc(s.pasar)}</span>
          </div>
          <div style="margin-top:12px" class="chip-row">
            <button class="btn primary" data-load-species="${slug}">Muat ke kalkulator ROI →</button>
          </div>
        </div>
      </div>

      <div class="section grid c2" style="align-items:start">
        <div class="panel">
          <div class="panel-hd"><span class="panel-title">Parameter Teknis</span></div>
          <div class="panel-body">
            <div class="brow"><span class="blabel">Sistem yang cocok</span><span class="bval" style="font-family:var(--sans);text-align:right">${esc(s.sistem.join(', '))}</span></div>
            <div class="brow"><span class="blabel">Padat tebar</span><span class="bval">${esc(s.padatTebar)}</span></div>
            <div class="brow"><span class="blabel">Suhu ideal</span><span class="bval">${esc(s.suhu)}</span></div>
            <div class="brow"><span class="blabel">pH air</span><span class="bval">${esc(s.ph)}</span></div>
            <div class="brow"><span class="blabel">Ukuran panen</span><span class="bval">${esc(s.ukuranPanen)}</span></div>
            <div class="brow"><span class="blabel">Lama panen</span><span class="bval">${esc(s.lamaPanen)}</span></div>
            <div class="brow"><span class="blabel">FCR acuan</span><span class="bval">${num(s.params.fcr, 2)}</span></div>
            <div class="brow btotal"><span class="blabel">Biaya produksi per kg</span><span class="bval">${fmt(base.c.costPerKg)}</span></div>
            <div class="brow"><span class="blabel">Harga impas (BEP)</span><span class="bval warn">${fmt(base.c.bepPrice)} / kg</span></div>
          </div>
        </div>

        <div class="panel">
          <div class="panel-hd"><span class="panel-title">Tiga Skenario</span></div>
          <div class="panel-body">
            <div class="table-wrap" style="border:none">
              <table style="min-width:0">
                <thead><tr><th>Skenario</th><th class="num">SR</th><th class="num">Harga</th><th class="num">FCR</th><th class="num">ROI</th><th class="num">Laba</th></tr></thead>
                <tbody>
                  ${scenRows.map((r) => `<tr>
                    <td>${SCEN_LABEL[r.k]}</td>
                    <td class="num">${r.p.survivalRate}%</td>
                    <td class="num">${fmtS(r.p.sellPrice)}</td>
                    <td class="num">${num(r.p.fcr, 2)}</td>
                    <td class="num ${r.c.roi >= 0 ? 'pos' : 'neg'}">${r.c.roi.toFixed(0)}%</td>
                    <td class="num ${r.c.netProfit >= 0 ? 'pos' : 'neg'}">${fmtS(r.c.netProfit)}</td>
                  </tr>`).join('')}
                </tbody>
              </table>
            </div>
            <div class="slabel" style="margin-top:16px"><span class="sdot"></span>Komposisi biaya (base)</div>
            ${stackedCost(base.c)}
          </div>
        </div>
      </div>

      <div class="section grid c3" style="align-items:start">
        <div class="panel"><div class="panel-hd"><span class="panel-title">Keunggulan</span></div>
          <div class="panel-body"><ul class="list plus">${s.keunggulan.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div></div>
        <div class="panel"><div class="panel-hd"><span class="panel-title">Risiko Utama</span></div>
          <div class="panel-body"><ul class="list minus">${s.risiko.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div></div>
        <div class="panel"><div class="panel-hd"><span class="panel-title">Tips Lapangan</span></div>
          <div class="panel-body"><ul class="list">${s.tips.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div></div>
      </div>

      <div class="section">
        <div class="section-hd"><div><h2>Sentra produksi</h2><p>Daerah dengan ekosistem pasar dan pasokan benih paling matang.</p></div>
        <a class="btn" href="#/peta">Buka peta</a></div>
        <div class="chip-row">${s.sentra.map((x) => `<span class="pill">${esc(x)}</span>`).join('')}</div>
      </div>`;
  }

  /* ── halaman: kalkulator ROI ──────────────────────────────────────────── */
  function pageROI() {
    const p = state.params;
    const f = (id, label, unit, step) =>
      `<div class="field"><label>${label}</label>
        <input type="number" id="${id}" value="${p[id]}" min="0" ${step ? `step="${step}"` : ''} data-param="${id}" />
        <span class="unit">${unit}</span></div>`;

    return `
      <div class="eyebrow">Analisis</div>
      <h1>Kalkulator <em>ROI</em> budidaya ikan</h1>
      <p class="lead">Mesin hitung sama dengan kalkulator v2, ditambah preset 10 komoditas dan tiga skenario. Ubah angka mana pun — hasil, komposisi biaya, dan bagi hasil mitra ikut berubah seketika.</p>

      <div class="section roi-layout" id="roiLayout">
        <div class="panel">
          <div class="panel-hd">
            <span class="panel-title">Parameter Input</span>
            <div class="chip-row">
              ${['base', 'optimistic', 'pessimistic'].map((k) =>
                `<button class="chip ${state.scenario === k ? 'active' : ''}" data-scen="${k}">${SCEN_LABEL[k]}</button>`).join('')}
              <button class="btn danger" id="resetBtn">Reset</button>
            </div>
          </div>
          <div class="panel-body">
            <div class="slabel"><span class="sdot"></span>Komoditas</div>
            <div class="g2">
              <div class="field"><label>Pilih komoditas</label>
                <select id="speciesSel" style="font-family:var(--sans)">
                  ${SPECIES.map((s) => `<option value="${s.slug}" ${s.slug === state.slug ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}
                </select>
                <span class="unit">preset akan mengganti semua angka di bawah</span></div>
              <div class="field"><label>Nama pengelola</label>
                <input type="text" id="ownerName" value="${esc(state.ownerName)}" style="font-family:var(--sans)" />
                <span class="unit">dipakai di ringkasan cetak</span></div>
            </div>

            <div class="slabel"><span class="sdot"></span>Produksi</div>
            <div class="g3">
              ${f('fishCount', 'Jumlah benih', 'ekor')}
              ${f('survivalRate', 'Tingkat hidup', '%')}
              ${f('harvestWeight', 'Bobot panen', 'kg / ekor', '0.01')}
            </div>

            <div class="slabel"><span class="sdot"></span>Harga &amp; Pakan</div>
            <div class="g3">
              ${f('sellPrice', 'Harga jual', 'IDR / kg')}
              ${f('fcr', 'FCR pakan', 'kg pakan / kg ikan', '0.05')}
              ${f('feedPrice', 'Harga pakan', 'IDR / kg')}
            </div>

            <div class="slabel"><span class="sdot"></span>Biaya Operasional</div>
            <div class="g2">
              ${f('fingerlingCost', 'Harga benih', 'IDR / ekor')}
              ${f('cycleDays', 'Durasi siklus', 'hari / siklus')}
              ${f('laborCost', 'Tenaga kerja &amp; listrik', 'IDR / bulan')}
              ${f('otherCost', 'Biaya lain-lain', 'IDR / siklus')}
            </div>

            <div class="slabel"><span class="sdot"></span>Struktur Kemitraan</div>
            <div id="partnerBox"></div>

            <div class="slabel"><span class="sdot"></span>Modal</div>
            <div class="g2">
              ${f('totalCapital', 'Modal investasi unit', 'IDR')}
            </div>
          </div>
        </div>

        <div class="roi-side">
          <div class="panel">
            <div class="panel-hd"><span class="panel-title">Hasil Kalkulasi</span><span class="tag" id="roiHealth">—</span></div>
            <div class="panel-body" id="roiResult"></div>
          </div>
        </div>
      </div>`;
  }

  function renderPartners() {
    const box = $('partnerBox');
    if (!box) return;
    const total = state.partners.reduce((s, p) => s + (+p.pct || 0), 0);
    box.innerHTML = `
      <div class="table-wrap" style="border:none">
        <table style="min-width:0">
          <thead><tr><th>Nama mitra</th><th>Tipe</th><th class="num">Porsi %</th><th></th></tr></thead>
          <tbody>
            ${state.partners.map((p) => `<tr>
              <td><input type="text" value="${esc(p.name)}" data-pt="name" data-pid="${p.id}" style="font-family:var(--sans);padding:6px 9px;font-size:12px;background:var(--bg2);border:1px solid var(--border);border-radius:6px;color:var(--text);width:100%" /></td>
              <td><select data-pt="type" data-pid="${p.id}" style="padding:6px 9px;font-size:12px;background:var(--bg2);border:1px solid var(--border);border-radius:6px;color:var(--text);width:100%">
                ${Object.entries(TYPES).map(([k, v]) => `<option value="${k}" ${p.type === k ? 'selected' : ''}>${v}</option>`).join('')}
              </select></td>
              <td class="num"><input type="number" value="${p.pct}" min="0" max="100" step="0.5" data-pt="pct" data-pid="${p.id}" style="text-align:right;font-family:var(--mono);padding:6px 9px;font-size:12px;background:var(--bg2);border:1px solid var(--border);border-radius:6px;color:var(--text);width:80px" /></td>
              <td><button class="btn danger" data-del-partner="${p.id}" style="padding:5px 9px">✕</button></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
      ${Math.abs(total - 100) > 0.5 ? `<div class="note amber" style="margin-top:9px">Total porsi <b>${num(total, 1)}%</b> — seharusnya tepat 100%.</div>` : ''}
      <button class="btn" id="addPartner" style="margin-top:9px;width:100%;justify-content:center">+ Tambah mitra</button>`;
  }

  function renderROIResult() {
    const box = $('roiResult');
    if (!box) return;
    const c = calcROI(state.params, state.partners);
    const [label, cls] = healthOf(c.roi);
    const tag = $('roiHealth');
    if (tag) { tag.textContent = label; tag.className = 'tag ' + cls; }

    box.innerHTML = `
      <div class="stat-grid" style="grid-template-columns:1fr 1fr">
        ${statCard('Revenue', fmtS(c.revenue), num(c.totalKg, 0) + ' kg panen', 'b', 'info')}
        ${statCard('Laba bersih', fmtS(c.netProfit), 'per siklus', '', c.netProfit >= 0 ? 'pos' : 'neg')}
        ${statCard('ROI', c.roi.toFixed(1) + '%', 'terhadap biaya produksi', 'a', c.roi > 30 ? 'pos' : c.roi > 0 ? 'warn' : 'neg')}
        ${statCard('Margin', c.margin.toFixed(1) + '%', 'terhadap omzet', 'p', c.margin > 20 ? 'pos' : c.margin > 0 ? 'warn' : 'neg')}
      </div>

      <div class="slabel" style="margin-top:16px"><span class="sdot"></span>Rincian</div>
      <div class="brow"><span class="blabel">Pendapatan kotor</span><span class="bval pos">${fmt(c.revenue)}</span></div>
      <div class="brow"><span class="blabel">− Benih</span><span class="bval neg">${fmt(c.fingerlingT)}</span></div>
      <div class="brow"><span class="blabel">− Pakan (${num(c.feedNeeded, 0)} kg)</span><span class="bval neg">${fmt(c.feedCost)}</span></div>
      <div class="brow"><span class="blabel">− Tenaga kerja &amp; listrik</span><span class="bval neg">${fmt(c.laborT)}</span></div>
      <div class="brow"><span class="blabel">− Lain-lain</span><span class="bval neg">${fmt(c.other)}</span></div>
      <div class="brow btotal"><span class="blabel">Laba per siklus</span><span class="bval ${c.netProfit >= 0 ? 'pos' : 'neg'}">${c.netProfit >= 0 ? '+' : ''}${fmt(c.netProfit)}</span></div>
      <div class="brow"><span class="blabel">Laba per tahun</span><span class="bval ${c.annualProfit >= 0 ? 'pos' : 'neg'}">${fmt(c.annualProfit)} (${num(c.cyclesPerYr, 1)}x)</span></div>

      <div class="slabel"><span class="sdot"></span>Komposisi Biaya</div>
      ${stackedCost(c)}

      <div class="slabel"><span class="sdot"></span>Titik Impas</div>
      <div class="brow"><span class="blabel">Biaya produksi per kg</span><span class="bval">${fmt(c.costPerKg)}</span></div>
      <div class="brow"><span class="blabel">Harga jual minimum</span><span class="bval warn">${fmt(c.bepPrice)} / kg</span></div>
      <div class="brow"><span class="blabel">Volume impas</span><span class="bval">${num(c.bepKg, 0)} kg dari ${num(c.totalKg, 0)} kg</span></div>
      <div class="brow"><span class="blabel">Balik modal (pengelola)</span><span class="bval">${isFinite(c.paybackCycles) ? num(c.paybackCycles, 1) + ' siklus · ' + num(c.paybackMonths, 0) + ' bln' : '∞'}</span></div>

      <div class="slabel"><span class="sdot"></span>Bagi Hasil Mitra</div>
      ${c.splits.map((s) => `<div class="brow"><span class="blabel">${esc(s.name)} <span class="muted">· ${TYPES[s.type] || s.type} ${s.pct}%</span></span>
        <span class="bval ${s.profit >= 0 ? 'pos' : 'neg'}">${fmt(s.profit)}</span></div>`).join('')}

      <div class="chip-row no-print" style="margin-top:14px">
        <button class="btn primary" id="printBtn" style="flex:1;justify-content:center">Cetak / Simpan PDF</button>
        <button class="btn" id="copyBtn">Salin ringkasan</button>
      </div>`;

    updateSideRoi(c);
  }

  function summaryText() {
    const c = calcROI(state.params, state.partners);
    const s = bySlug(state.slug);
    const p = state.params;
    return [
      `RINGKASAN ROI — ${s.name} (${SCEN_LABEL[state.scenario]})`,
      `Pengelola: ${state.ownerName}`,
      '',
      `Benih ${p.fishCount} ekor · SR ${p.survivalRate}% · bobot ${p.harvestWeight} kg/ekor`,
      `Siklus ${p.cycleDays} hari · FCR ${p.fcr} · pakan ${fmt(p.feedPrice)}/kg`,
      `Harga jual ${fmt(p.sellPrice)}/kg`,
      '',
      `Panen        : ${num(c.totalKg, 0)} kg`,
      `Omzet        : ${fmt(c.revenue)}`,
      `Biaya        : ${fmt(c.totalCost)}`,
      `Laba/siklus  : ${fmt(c.netProfit)}`,
      `ROI          : ${c.roi.toFixed(1)}%  ·  Margin ${c.margin.toFixed(1)}%`,
      `Laba/tahun   : ${fmt(c.annualProfit)} (${num(c.cyclesPerYr, 1)}x siklus)`,
      `Harga impas  : ${fmt(c.bepPrice)}/kg`,
      '',
      'Bagi hasil:',
      ...c.splits.map((x) => `  ${x.name} (${x.pct}%): ${fmt(x.profit)}`),
    ].join('\n');
  }

  /* ── halaman: bandingkan skenario ─────────────────────────────────────── */
  let compareMetric = 'roi';
  let compareScen = 'base';
  let compareTable = false;
  function pageCompare() {
    const METRICS = {
      roi: { label: 'ROI per siklus', fmt: (v) => v.toFixed(0) + '%', get: (c) => c.roi },
      netProfit: { label: 'Laba per siklus', fmt: (v) => fmtS(v), get: (c) => c.netProfit },
      annualProfit: { label: 'Laba per tahun', fmt: (v) => fmtS(v), get: (c) => c.annualProfit },
      margin: { label: 'Margin', fmt: (v) => v.toFixed(0) + '%', get: (c) => c.margin },
    };
    const m = METRICS[compareMetric];
    const rows = SPECIES.map((s) => {
      const c = calcROI(paramsFor(s.slug, compareScen), DEFAULT_PARTNERS);
      return { s, c, value: m.get(c) };
    }).sort((a, b) => b.value - a.value);

    /* langkah warna satu hue: makin gelap makin rendah peringkat */
    const shade = (i, n) => `hsl(147 60% ${Math.round(46 - (i / Math.max(n - 1, 1)) * 20)}%)`;

    const scenBars = SPECIES.map((s) => {
      const vals = ['pessimistic', 'base', 'optimistic'].map((k) => calcROI(paramsFor(s.slug, k), DEFAULT_PARTNERS).roi);
      return { s, vals };
    });
    const maxAbs = Math.max(...scenBars.flatMap((x) => x.vals.map(Math.abs)), 1);

    return `
      <div class="eyebrow">Analisis</div>
      <h1>Bandingkan <em>skenario</em> 10 komoditas</h1>
      <p class="lead">Semua komoditas dihitung dengan mesin ROI yang sama, memakai satu unit produksi standar per komoditas. Bandingkan pada skenario yang sama supaya adil — lalu cek seberapa jauh jarak antara pesimis dan optimis, karena di situlah risiko sebenarnya terlihat.</p>

      <div class="section">
        <div class="section-hd">
          <div><h2>${esc(m.label)}</h2><p>Skenario ${SCEN_LABEL[compareScen].toLowerCase()} · diurutkan dari yang tertinggi.</p></div>
          <div class="chip-row">
            ${Object.entries(METRICS).map(([k, v]) => `<button class="chip ${compareMetric === k ? 'active' : ''}" data-metric="${k}">${v.label}</button>`).join('')}
          </div>
        </div>
        <div class="chip-row" style="margin-bottom:14px">
          ${['pessimistic', 'base', 'optimistic'].map((k) => `<button class="chip ${compareScen === k ? 'active' : ''}" data-cscen="${k}">${SCEN_LABEL[k]}</button>`).join('')}
          <button class="chip" id="toggleTable">${compareTable ? 'Tampilkan grafik' : 'Tampilkan tabel'}</button>
        </div>

        ${compareTable ? `
          <div class="table-wrap"><table>
            <thead><tr><th>Komoditas</th><th class="num">ROI</th><th class="num">Margin</th><th class="num">Laba / siklus</th><th class="num">Laba / tahun</th><th class="num">Panen</th></tr></thead>
            <tbody>${rows.map((r) => `<tr>
              <td>${esc(r.s.name)}</td>
              <td class="num ${r.c.roi >= 0 ? 'pos' : 'neg'}">${r.c.roi.toFixed(0)}%</td>
              <td class="num">${r.c.margin.toFixed(0)}%</td>
              <td class="num ${r.c.netProfit >= 0 ? 'pos' : 'neg'}">${fmtS(r.c.netProfit)}</td>
              <td class="num">${fmtS(r.c.annualProfit)}</td>
              <td class="num">${num(r.c.totalKg, 0)} kg</td>
            </tr>`).join('')}</tbody>
          </table></div>`
        : barChart(rows.map((r, i) => ({
            label: r.s.name,
            value: r.value,
            display: m.fmt(r.value),
            color: shade(i, rows.length),
            tip: r.s.name + '|ROI ' + r.c.roi.toFixed(0) + '% · laba ' + fmt(r.c.netProfit) + ' per siklus ' + r.c.cycle + ' hari',
          })))}
      </div>

      <div class="section">
        <div class="section-hd"><div><h2>Rentang risiko tiap komoditas</h2><p>Jarak ROI pesimis → optimis. Makin lebar, makin besar taruhannya.</p></div></div>
        <div class="chart">
          ${scenBars.map((x) => {
            const [pes, base, opt] = x.vals;
            const lo = Math.min(pes, opt, 0);
            const hi = Math.max(pes, opt, 0);
            const span = maxAbs * 2;
            const toPct = (v) => ((v + maxAbs) / span) * 100;
            const left = toPct(lo);
            const width = toPct(hi) - toPct(lo);
            return `<div class="bar-row" data-tip="${esc(x.s.name)}|Pesimis ${pes.toFixed(0)}% · Base ${base.toFixed(0)}% · Optimis ${opt.toFixed(0)}%">
              <span class="bar-lbl">${esc(x.s.name)}</span>
              <div class="bar-track" style="position:relative">
                <div style="position:absolute;left:50%;top:0;bottom:0;width:1px;background:var(--border2)"></div>
                <div style="position:absolute;left:${left}%;width:${width}%;top:3px;bottom:3px;background:linear-gradient(90deg,rgba(240,96,96,.55),rgba(52,211,112,.55));border-radius:3px"></div>
                <div style="position:absolute;left:${toPct(base)}%;top:1px;bottom:1px;width:2px;background:var(--text)"></div>
              </div>
              <span class="bar-val">${pes.toFixed(0)} → ${opt.toFixed(0)}%</span>
            </div>`;
          }).join('')}
        </div>
        <div class="legend">
          <span class="legend-item"><span class="legend-swatch" style="background:rgba(240,96,96,.55)"></span>Sisi pesimis</span>
          <span class="legend-item"><span class="legend-swatch" style="background:rgba(52,211,112,.55)"></span>Sisi optimis</span>
          <span class="legend-item"><span class="legend-swatch" style="background:var(--text)"></span>Skenario base</span>
          <span class="legend-item"><span class="legend-swatch" style="background:var(--border2)"></span>Garis nol (impas)</span>
        </div>
      </div>

      <div class="section">
        <div class="note amber"><div><b>Baca hati-hati.</b> Skenario pesimis sengaja dibuat realistis: sebagian besar komoditas <i>rugi</i> bila tingkat hidup jatuh, FCR membengkak, dan harga jual turun bersamaan. Itulah kondisi normal saat gagal panen — jadi siapkan dana cadangan minimal satu siklus.</div></div>
      </div>`;
  }

  /* ── halaman: peta sentra ─────────────────────────────────────────────── */
  let activeRegion = 'jawa';
  function pageMap() {
    const r = REGIONS.find((x) => x.id === activeRegion) || REGIONS[0];
    /* Peta skematis — bukan peta geografis presisi, hanya untuk orientasi. */
    const shapes = {
      sumatera: 'M78 62 L132 48 L252 212 L300 288 L268 306 L210 232 L92 94 Z',
      jawa: 'M248 330 L302 320 L362 328 L420 320 L472 332 L464 350 L400 344 L340 352 L280 348 Z',
      kalimantan: 'M336 104 L420 86 L486 118 L510 176 L492 234 L430 260 L364 244 L328 196 L320 144 Z',
      sulawesi: 'M566 108 L598 102 L594 168 L628 172 L658 110 L684 122 L648 212 L610 234 L596 302 L568 298 L586 214 L550 176 Z',
      'bali-nusra': 'M486 366 L514 358 L522 376 L492 382 Z M540 360 L590 354 L600 372 L546 380 Z M616 362 L670 356 L678 376 L622 382 Z',
      'maluku-papua': 'M706 158 L736 148 L738 196 L712 204 Z M700 240 L728 230 L732 258 L704 266 Z M762 180 L832 158 L878 206 L866 278 L800 298 L752 258 L772 212 Z',
    };
    const labels = {
      sumatera: [168, 186], jawa: [360, 378], kalimantan: [414, 182],
      sulawesi: [618, 330], 'bali-nusra': [582, 406], 'maluku-papua': [814, 326],
    };

    return `
      <div class="eyebrow">Panduan</div>
      <h1>Peta <em>sentra budidaya</em> Indonesia</h1>
      <p class="lead">Lokasi menentukan tiga hal yang tidak bisa diperbaiki oleh manajemen kolam: harga benih, harga pakan sampai di lokasi, dan siapa yang membeli hasil panen. Klik wilayah untuk melihat komoditas yang ekosistemnya sudah matang di sana.</p>

      <div class="section map-wrap">
        <svg class="map-svg" viewBox="0 0 900 430" role="img" aria-label="Peta skematis sentra budidaya Indonesia">
          <rect width="900" height="430" fill="none" />
          ${REGIONS.map((x) => `<path class="region ${x.id === activeRegion ? 'active' : ''}" d="${shapes[x.id]}" data-region="${x.id}"><title>${esc(x.nama)} — ${esc(x.fokus)}</title></path>`).join('')}
          ${REGIONS.map((x) => `<text class="region-label" x="${labels[x.id][0]}" y="${labels[x.id][1]}" text-anchor="middle">${esc(x.nama)}</text>`).join('')}
        </svg>

        <div class="panel">
          <div class="panel-hd"><span class="panel-title">${esc(r.nama)}</span><span class="tag good">${esc(r.fokus)}</span></div>
          <div class="panel-body">
            <p style="font-size:12.5px;color:var(--text2);line-height:1.7">${esc(r.catatan)}</p>
            <div class="slabel"><span class="sdot"></span>Daerah kunci</div>
            <ul class="list">${r.daerah.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>
            <div class="slabel"><span class="sdot"></span>Komoditas unggulan</div>
            <div class="chip-row">
              ${r.komoditas.map((k) => {
                const s = bySlug(k);
                return s ? `<a class="pill" href="#/komoditas/${k}">${esc(s.name)} →</a>` : '';
              }).join('')}
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-hd"><div><h2>Semua wilayah</h2><p>Peta di atas bersifat skematis untuk orientasi, bukan peta geografis presisi.</p></div></div>
        <div class="table-wrap"><table>
          <thead><tr><th>Wilayah</th><th>Fokus komoditas</th><th>Daerah kunci</th></tr></thead>
          <tbody>${REGIONS.map((x) => `<tr>
            <td><button class="btn" data-region="${x.id}" style="padding:4px 10px">${esc(x.nama)}</button></td>
            <td>${esc(x.fokus)}</td>
            <td class="muted">${esc(x.daerah.join(' · '))}</td>
          </tr>`).join('')}</tbody>
        </table></div>
      </div>`;
  }

  /* ── halaman: alur & sistem ───────────────────────────────────────────── */
  function pageFlow() {
    return `
      <div class="eyebrow">Panduan</div>
      <h1>Alur &amp; <em>sistem budidaya</em></h1>
      <p class="lead">Tujuh tahap yang sama berlaku untuk hampir semua komoditas — yang berbeda hanya durasi dan jenis pakan. Setiap tahap punya satu indikator yang wajib dicatat; catatan inilah yang nanti membuat kalkulator ROI berisi angka nyata, bukan tebakan.</p>

      <div class="section">
        <div class="section-hd"><div><h2>Alur satu siklus</h2><p>Dari kolam kosong sampai uang masuk.</p></div></div>
        <div class="flow">
          ${STAGES.map((s, i) => `
            <div class="flow-step">
              <div class="flow-rail">
                <div class="flow-no">${s.no}</div>
                ${i < STAGES.length - 1 ? '<div class="flow-line"></div>' : ''}
              </div>
              <div class="flow-body">
                <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:8px">
                  <h3>${esc(s.nama)}</h3><span class="tag">${esc(s.durasi)}</span>
                </div>
                <ul class="list" style="margin-bottom:10px">${s.isi.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
                <div class="grid c2">
                  <div class="note green"><div><b>Indikator:</b> ${esc(s.kpi)}</div></div>
                  <div class="note amber"><div><b>Kesalahan umum:</b> ${esc(s.risiko)}</div></div>
                </div>
              </div>
            </div>`).join('')}
        </div>
      </div>

      <div class="section">
        <div class="section-hd"><div><h2>Pilih sistem kolam</h2><p>Modal, padat tebar, dan kebutuhan air setiap sistem berbeda jauh.</p></div></div>
        <div class="grid c3">
          ${SYSTEMS.map((s) => `
            <div class="card hoverable">
              <div class="card-img"><img src="${img('aquaculture/' + s.img)}" alt="${esc(s.nama)}" loading="lazy" /></div>
              <div class="card-body">
                <div class="card-title">${esc(s.nama)}</div>
                <div class="card-text"><b style="color:var(--text)">${esc(s.modal)}</b> · padat tebar ${esc(s.padat.toLowerCase())} · air ${esc(s.air.toLowerCase())}</div>
                <div class="slabel" style="margin:10px 0 8px">Cocok untuk</div>
                <div class="chip-row">${s.cocok.map((k) => `<span class="pill">${esc(k)}</span>`).join('')}</div>
                <ul class="list plus" style="margin-top:12px">${s.plus.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
                <ul class="list minus" style="margin-top:8px">${s.minus.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
              </div>
            </div>`).join('')}
        </div>
      </div>`;
  }

  /* ── halaman: glosarium & 404 ─────────────────────────────────────────── */
  function pageGlossary() {
    return `
      <div class="eyebrow">Panduan</div>
      <h1><em>Glosarium</em> istilah budidaya</h1>
      <p class="lead">Istilah yang dipakai di seluruh situs ini dan di kalkulator ROI.</p>
      <div class="section"><div class="table-wrap"><table>
        <thead><tr><th style="width:220px">Istilah</th><th>Arti</th></tr></thead>
        <tbody>${GLOSSARY.map(([k, v]) => `<tr><td><b>${esc(k)}</b></td><td class="muted" style="color:var(--text2)">${esc(v)}</td></tr>`).join('')}</tbody>
      </table></div></div>`;
  }

  const pageNotFound = () => `
    <div class="eyebrow">404</div>
    <h1>Halaman <em>tidak ditemukan</em></h1>
    <p class="lead">Alamat yang kamu buka tidak ada di situs ini.</p>
    <div class="section"><a class="btn primary" href="#/">Kembali ke beranda</a></div>`;

  /* ── sidebar ROI ringkas ──────────────────────────────────────────────── */
  function updateSideRoi(calc) {
    const c = calc || calcROI(state.params, state.partners);
    const s = bySlug(state.slug);
    const [label, cls] = healthOf(c.roi);
    $('sideSpecies').textContent = s.name;
    $('sideScen').textContent = SCEN_LABEL[state.scenario] + ' · ' + state.params.cycleDays + ' hari/siklus';
    const roiEl = $('sideRoiVal');
    roiEl.textContent = c.roi.toFixed(0) + '%';
    roiEl.className = 'v ' + (c.roi > 30 ? 'pos' : c.roi > 0 ? 'warn' : 'neg');
    const pEl = $('sideProfit');
    pEl.textContent = fmtS(c.netProfit);
    pEl.className = 'v ' + (c.netProfit >= 0 ? 'pos' : 'neg');
    const tag = $('sideTag');
    tag.textContent = label;
    tag.className = 'tag ' + cls;
  }

  /* ── router ───────────────────────────────────────────────────────────── */
  const ROUTES = [
    { path: '/', title: 'Beranda', render: pageHome },
    { path: '/galeri', title: 'Galeri Aquaculture', render: pageGallery },
    { path: '/komoditas', title: 'Top 10 Komoditas', render: pageSpeciesList },
    { path: '/komoditas/:slug', title: 'Komoditas', render: (m) => pageSpecies(m) },
    { path: '/roi', title: 'Kalkulator ROI', render: pageROI },
    { path: '/skenario', title: 'Bandingkan Skenario', render: pageCompare },
    { path: '/peta', title: 'Peta Sentra Budidaya', render: pageMap },
    { path: '/alur', title: 'Alur & Sistem Budidaya', render: pageFlow },
    { path: '/glosarium', title: 'Glosarium', render: pageGlossary },
  ];

  function currentPath() {
    const h = location.hash.replace(/^#/, '');
    return h && h.startsWith('/') ? h : '/';
  }

  function render() {
    const path = currentPath();
    const view = $('view');
    let html = null;
    let title = 'Halaman';
    let navRoute = path;

    for (const r of ROUTES) {
      if (r.path === path) { html = r.render(); title = r.title; break; }
      if (r.path.includes(':')) {
        const base = r.path.split('/:')[0];
        if (path.startsWith(base + '/')) {
          const slug = path.slice(base.length + 1);
          const sp = bySlug(slug);
          html = r.render(slug);
          title = sp ? sp.name : 'Komoditas';
          navRoute = base;
          break;
        }
      }
    }
    if (html === null) { html = pageNotFound(); title = '404'; }

    view.innerHTML = html;
    $('crumb').innerHTML = '<span class="crumb-root">Aquaculture Hub / </span><b>' + esc(title) + '</b>';
    document.title = title + ' — Aquaculture Hub';
    document.querySelectorAll('.nav-item').forEach((a) => {
      a.classList.toggle('active', a.dataset.route === navRoute);
    });
    window.scrollTo(0, 0);
    closeSidebar();

    if (path === '/roi') { renderPartners(); renderROIResult(); }
    updateSideRoi();
  }

  /* ── interaksi global (delegasi event) ────────────────────────────────── */
  function openSidebar() { $('sidebar').classList.add('open'); $('scrim').classList.add('show'); }
  function closeSidebar() { $('sidebar').classList.remove('open'); $('scrim').classList.remove('show'); }

  function toast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._t);
    t._t = setTimeout(() => t.classList.remove('show'), 2200);
  }

  document.addEventListener('click', (e) => {
    const t = e.target;

    if (t.closest('#menuBtn')) { openSidebar(); return; }
    if (t.id === 'scrim') { closeSidebar(); return; }

    /* galeri */
    const filter = t.closest('[data-gal-filter]');
    if (filter) { galFilter = filter.dataset.galFilter; render(); return; }
    const gal = t.closest('[data-gal]');
    if (gal) { openLightbox(+gal.dataset.gal); return; }
    if (t.closest('#lbClose') || t.id === 'lightbox') { $('lightbox').classList.remove('open'); return; }

    /* tabel komoditas: urutkan */
    const sortTh = t.closest('th[data-sort]');
    if (sortTh) {
      const k = sortTh.dataset.sort;
      if (sortKey === k) sortDir *= -1; else { sortKey = k; sortDir = k === 'nama' ? 1 : -1; }
      render();
      return;
    }

    /* halaman bandingkan */
    const metric = t.closest('[data-metric]');
    if (metric) { compareMetric = metric.dataset.metric; render(); return; }
    const cscen = t.closest('[data-cscen]');
    if (cscen) { compareScen = cscen.dataset.cscen; render(); return; }
    if (t.id === 'toggleTable') { compareTable = !compareTable; render(); return; }

    /* peta */
    const region = t.closest('[data-region]');
    if (region) { activeRegion = region.dataset.region; render(); return; }

    /* muat preset komoditas ke kalkulator */
    const load = t.closest('[data-load-species]');
    if (load) {
      applyScenario(load.dataset.loadSpecies, 'base');
      location.hash = '#/roi';
      toast('Preset ' + bySlug(state.slug).name + ' dimuat');
      return;
    }

    /* kalkulator: skenario & reset */
    const scen = t.closest('[data-scen]');
    if (scen) {
      applyScenario(state.slug, scen.dataset.scen);
      render();
      return;
    }
    if (t.id === 'resetBtn') {
      applyScenario(state.slug, 'base');
      state.partners = DEFAULT_PARTNERS.map((p) => Object.assign({}, p));
      state.nextPartnerId = 3;
      saveState();
      render();
      toast('Parameter dikembalikan ke preset');
      return;
    }

    /* kalkulator: mitra */
    if (t.id === 'addPartner') {
      state.partners.push({ id: state.nextPartnerId++, name: 'Mitra Baru', type: 'mitra', pct: 0 });
      saveState(); renderPartners(); renderROIResult();
      return;
    }
    const del = t.closest('[data-del-partner]');
    if (del) {
      if (state.partners.length <= 1) return;
      state.partners = state.partners.filter((p) => p.id !== +del.dataset.delPartner);
      saveState(); renderPartners(); renderROIResult();
      return;
    }

    if (t.id === 'printBtn') { window.print(); return; }
    if (t.id === 'copyBtn') {
      const text = summaryText();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => toast('Ringkasan disalin')).catch(() => toast('Gagal menyalin'));
      } else {
        const ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); toast('Ringkasan disalin'); } catch (err) { toast('Gagal menyalin'); }
        ta.remove();
      }
    }
  });

  /* input kalkulator */
  document.addEventListener('input', (e) => {
    const t = e.target;
    if (t.dataset && t.dataset.param) {
      state.params[t.dataset.param] = t.value === '' ? 0 : +t.value;
      saveState();
      renderROIResult();
      return;
    }
    if (t.id === 'ownerName') { state.ownerName = t.value; saveState(); return; }
    if (t.dataset && t.dataset.pt) {
      const p = state.partners.find((x) => x.id === +t.dataset.pid);
      if (!p) return;
      p[t.dataset.pt] = t.dataset.pt === 'pct' ? +t.value || 0 : t.value;
      saveState();
      renderROIResult();
      if (t.dataset.pt === 'pct') {
        /* hanya perbarui peringatan total porsi, jangan render ulang input yang sedang diketik */
        const total = state.partners.reduce((s, x) => s + (+x.pct || 0), 0);
        const box = $('partnerBox');
        const note = box && box.querySelector('.note');
        if (Math.abs(total - 100) > 0.5) {
          if (note) note.innerHTML = `Total porsi <b>${num(total, 1)}%</b> — seharusnya tepat 100%.`;
          else if (box) box.querySelector('table').insertAdjacentHTML('afterend',
            `<div class="note amber" style="margin-top:9px">Total porsi <b>${num(total, 1)}%</b> — seharusnya tepat 100%.</div>`);
        } else if (note) note.remove();
      }
    }
  });

  document.addEventListener('change', (e) => {
    if (e.target.id === 'speciesSel') {
      applyScenario(e.target.value, 'base');
      render();
      toast('Preset ' + bySlug(state.slug).name + ' dimuat');
    }
  });

  /* tooltip untuk grafik */
  const tip = () => $('tooltip');
  document.addEventListener('mouseover', (e) => {
    const el = e.target.closest('[data-tip]');
    if (!el) return;
    const [title, body] = el.dataset.tip.split('|');
    const box = tip();
    box.innerHTML = `<div class="t-title">${esc(title)}</div>${body ? `<div class="t-val">${esc(body)}</div>` : ''}`;
    box.style.opacity = '1';
  });
  document.addEventListener('mousemove', (e) => {
    const box = tip();
    if (box.style.opacity !== '1') return;
    const pad = 14;
    let x = e.clientX + pad;
    let y = e.clientY + pad;
    if (x + box.offsetWidth > window.innerWidth - 8) x = e.clientX - box.offsetWidth - pad;
    if (y + box.offsetHeight > window.innerHeight - 8) y = e.clientY - box.offsetHeight - pad;
    box.style.left = x + 'px';
    box.style.top = y + 'px';
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('[data-tip]')) tip().style.opacity = '0';
  });

  /* lightbox galeri */
  function openLightbox(i) {
    const g = GALLERY[i];
    if (!g) return;
    $('lbImg').src = img(g.img);
    $('lbImg').alt = g.judul;
    $('lbTitle').textContent = g.judul;
    $('lbText').textContent = g.teks;
    $('lbTag').textContent = g.kategori;
    $('lightbox').classList.add('open');
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { $('lightbox').classList.remove('open'); closeSidebar(); }
  });

  /* ── mulai ────────────────────────────────────────────────────────────── */
  loadState();
  $('navGalCount').textContent = GALLERY.length;
  window.addEventListener('hashchange', render);
  render();
})();
