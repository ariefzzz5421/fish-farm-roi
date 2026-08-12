/**
 * Generator ilustrasi SVG untuk Aquaculture Hub.
 *
 * Semua gambar di situs ini adalah ilustrasi vektor yang dibuat ulang dari
 * script ini (bukan foto), supaya ukurannya kecil, konsisten, dan mudah diganti.
 * Jalankan: node tools/generate-art.mjs
 *
 *   public/images/species/<slug>.svg      -> potret 10 komoditas
 *   public/images/aquaculture/<slug>.svg  -> foto kegiatan / sistem budidaya
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const W = 1200;
const H = 800;

// ── palet dasar (senada dengan tema situs) ────────────────────────────────
const INK = '#0a0f0b';
const FOAM = 'rgba(255,255,255,0.14)';

const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const svg = (defs, body, label) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">\n<defs>${defs}</defs>\n${body}\n</svg>\n`;

const waterGradient = (id, top, bottom) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0%" stop-color="${top}"/><stop offset="100%" stop-color="${bottom}"/></linearGradient>`;

const bodyGradient = (id, a, b) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="0.2" y2="1"><stop offset="0%" stop-color="${a}"/><stop offset="100%" stop-color="${b}"/></linearGradient>`;

/** Garis-garis riak air horizontal, dipakai di semua ilustrasi. */
function ripples(y0, count = 7, opacity = 0.09) {
  let out = '';
  for (let i = 0; i < count; i++) {
    const y = y0 + i * 46;
    const x = 60 + ((i * 137) % 220);
    const w = 180 + ((i * 91) % 260);
    out += `<path d="M${x} ${y} q ${w / 4} -14 ${w / 2} 0 q ${w / 4} 14 ${w / 2} 0" fill="none" stroke="rgba(255,255,255,${opacity})" stroke-width="6" stroke-linecap="round"/>`;
  }
  return out;
}

/** Gelembung udara. */
function bubbles(cx, cy, n = 12, spread = 150) {
  let out = '';
  for (let i = 0; i < n; i++) {
    const x = cx + (((i * 73) % spread) - spread / 2);
    const y = cy - ((i * 57) % 300);
    const r = 4 + ((i * 31) % 11);
    out += `<circle cx="${x}" cy="${y}" r="${r}" fill="rgba(255,255,255,0.20)"/>`;
  }
  return out;
}

// ── bentuk hewan ──────────────────────────────────────────────────────────

/** Ikan bersirip standar (nila, mas, bawal, gurame, bandeng, gabus). */
function finFish({ cx, cy, len, depth, fill, stroke, belly, tail = 'fork', pattern }) {
  const half = len / 2;
  const nose = cx + half;
  const back = cx - half;
  const b = `M${nose} ${cy} C ${cx + half * 0.55} ${cy - depth} ${cx - half * 0.35} ${cy - depth} ${back} ${cy - depth * 0.34} ` +
    `C ${cx - half * 0.35} ${cy + depth} ${cx + half * 0.55} ${cy + depth} ${nose} ${cy} Z`;

  const tailShape = tail === 'fork'
    ? `M${back} ${cy - depth * 0.34} L${back - len * 0.3} ${cy - depth * 0.85} L${back - len * 0.18} ${cy} L${back - len * 0.3} ${cy + depth * 0.85} L${back} ${cy + depth * 0.3} Z`
    : `M${back} ${cy - depth * 0.34} L${back - len * 0.26} ${cy - depth * 0.7} Q ${back - len * 0.32} ${cy} ${back - len * 0.26} ${cy + depth * 0.7} L${back} ${cy + depth * 0.3} Z`;

  const dorsal = `M${cx + half * 0.28} ${cy - depth * 0.82} Q ${cx} ${cy - depth * 1.6} ${cx - half * 0.42} ${cy - depth * 0.62} Z`;
  const anal = `M${cx + half * 0.1} ${cy + depth * 0.86} Q ${cx - half * 0.1} ${cy + depth * 1.42} ${cx - half * 0.5} ${cy + depth * 0.6} Z`;
  const pectoral = `M${cx + half * 0.42} ${cy + depth * 0.18} Q ${cx + half * 0.2} ${cy + depth * 0.95} ${cx - half * 0.02} ${cy + depth * 0.34} Z`;

  let marks = '';
  if (pattern === 'stripes') {
    for (let i = 0; i < 6; i++) {
      const x = cx - half * 0.42 + i * (len * 0.13);
      marks += `<path d="M${x} ${cy - depth * 0.74} q 10 ${depth * 0.74} 0 ${depth * 1.48}" fill="none" stroke="rgba(10,15,11,0.22)" stroke-width="9" stroke-linecap="round"/>`;
    }
  } else if (pattern === 'spots') {
    for (let i = 0; i < 9; i++) {
      const x = cx - half * 0.55 + ((i * 97) % Math.round(len * 0.85));
      const y = cy - depth * 0.45 + ((i * 53) % Math.round(depth * 0.9));
      marks += `<circle cx="${x}" cy="${y}" r="${7 + (i % 3) * 3}" fill="rgba(10,15,11,0.20)"/>`;
    }
  } else if (pattern === 'mottle') {
    for (let i = 0; i < 7; i++) {
      const x = cx - half * 0.6 + ((i * 113) % Math.round(len * 0.9));
      const y = cy - depth * 0.3 + ((i * 67) % Math.round(depth * 0.7));
      marks += `<ellipse cx="${x}" cy="${y}" rx="${22 + (i % 3) * 8}" ry="12" fill="rgba(10,15,11,0.18)"/>`;
    }
  }

  return `<g>
    <path d="${tailShape}" fill="${stroke}"/>
    <path d="${dorsal}" fill="${stroke}"/>
    <path d="${anal}" fill="${stroke}"/>
    <path d="${b}" fill="${fill}"/>
    <path d="M${nose} ${cy} C ${cx + half * 0.4} ${cy + depth * 0.72} ${cx - half * 0.3} ${cy + depth * 0.62} ${back} ${cy + depth * 0.14} L${nose} ${cy} Z" fill="${belly}" opacity="0.55"/>
    ${marks}
    <path d="${pectoral}" fill="${stroke}" opacity="0.85"/>
    <circle cx="${nose - len * 0.11}" cy="${cy - depth * 0.24}" r="${depth * 0.1}" fill="#f4fbf6"/>
    <circle cx="${nose - len * 0.105}" cy="${cy - depth * 0.24}" r="${depth * 0.05}" fill="${INK}"/>
    <path d="M${nose - len * 0.2} ${cy - depth * 0.6} q -6 ${depth * 0.6} 0 ${depth * 1.05}" fill="none" stroke="rgba(10,15,11,0.18)" stroke-width="7"/>
  </g>`;
}

/** Lele / patin: badan memanjang + sungut. */
function catfish({ cx, cy, len, depth, fill, stroke, belly, barbels = 4 }) {
  const half = len / 2;
  const nose = cx + half;
  const back = cx - half;
  const b = `M${nose} ${cy} C ${cx + half * 0.6} ${cy - depth} ${cx - half * 0.2} ${cy - depth * 0.9} ${back} ${cy - depth * 0.28} ` +
    `C ${cx - half * 0.2} ${cy + depth * 0.95} ${cx + half * 0.6} ${cy + depth} ${nose} ${cy} Z`;
  const tailShape = `M${back} ${cy - depth * 0.28} Q ${back - len * 0.26} ${cy} ${back} ${cy + depth * 0.28} Z`;
  const dorsal = `M${cx + half * 0.3} ${cy - depth * 0.8} L ${cx - half * 0.8} ${cy - depth * 1.05} L ${back + len * 0.02} ${cy - depth * 0.3} Z`;
  const anal = `M${cx + half * 0.15} ${cy + depth * 0.88} L ${cx - half * 0.8} ${cy + depth * 1.0} L ${back + len * 0.02} ${cy + depth * 0.3} Z`;

  let whiskers = '';
  for (let i = 0; i < barbels; i++) {
    const dir = i % 2 === 0 ? -1 : 1;
    const lift = (Math.floor(i / 2) + 1) * depth * 0.22;
    whiskers += `<path d="M${nose - 8} ${cy + dir * depth * 0.1} q ${len * 0.22} ${dir * lift} ${len * 0.34} ${dir * lift * 2.1}" fill="none" stroke="${stroke}" stroke-width="7" stroke-linecap="round"/>`;
  }

  return `<g>
    <path d="${tailShape}" fill="${stroke}"/>
    <path d="${dorsal}" fill="${stroke}" opacity="0.9"/>
    <path d="${anal}" fill="${stroke}" opacity="0.9"/>
    ${whiskers}
    <path d="${b}" fill="${fill}"/>
    <path d="M${nose} ${cy} C ${cx + half * 0.4} ${cy + depth * 0.78} ${cx - half * 0.2} ${cy + depth * 0.7} ${back} ${cy + depth * 0.1} L${nose} ${cy} Z" fill="${belly}" opacity="0.5"/>
    <circle cx="${nose - len * 0.1}" cy="${cy - depth * 0.3}" r="${depth * 0.09}" fill="#f4fbf6"/>
    <circle cx="${nose - len * 0.098}" cy="${cy - depth * 0.3}" r="${depth * 0.045}" fill="${INK}"/>
  </g>`;
}

/** Udang vaname. */
function shrimp({ cx, cy, len, fill, stroke }) {
  const segs = [];
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    const x = cx - len * 0.32 + t * len * 0.52;
    const y = cy - 40 + Math.sin(t * 2.1) * 70;
    segs.push(`<ellipse cx="${x}" cy="${y}" rx="${58 - i * 5}" ry="${74 - i * 8}" fill="${fill}" transform="rotate(${-24 + i * 9} ${x} ${y})"/>` +
      `<ellipse cx="${x}" cy="${y}" rx="${58 - i * 5}" ry="${74 - i * 8}" fill="none" stroke="${stroke}" stroke-width="5" transform="rotate(${-24 + i * 9} ${x} ${y})"/>`);
  }
  const head = `<path d="M${cx - len * 0.36} ${cy - 96} q -150 40 -186 168 q 96 92 196 62 q 34 -110 -10 -230 Z" fill="${fill}" stroke="${stroke}" stroke-width="5"/>`;
  const rostrum = `<path d="M${cx - len * 0.5} ${cy - 66} l -150 -66" fill="none" stroke="${stroke}" stroke-width="9" stroke-linecap="round"/>`;
  const antenna = `<path d="M${cx - len * 0.5} ${cy - 20} q -220 90 -300 250" fill="none" stroke="${stroke}" stroke-width="8" stroke-linecap="round"/>` +
    `<path d="M${cx - len * 0.5} ${cy + 20} q -190 150 -206 300" fill="none" stroke="${stroke}" stroke-width="6" stroke-linecap="round" opacity="0.75"/>`;
  const tail = `<path d="M${cx + len * 0.22} ${cy + 118} l 150 -34 l -34 96 l 96 24 l -170 40 Z" fill="${stroke}"/>`;
  let legs = '';
  for (let i = 0; i < 5; i++) {
    const x = cx - len * 0.28 + i * 62;
    legs += `<path d="M${x} ${cy + 34} q 18 74 -22 116" fill="none" stroke="${stroke}" stroke-width="6" stroke-linecap="round" opacity="0.8"/>`;
  }
  return `<g>${tail}${legs}${segs.join('')}${head}${rostrum}${antenna}<circle cx="${cx - len * 0.44}" cy="${cy - 24}" r="20" fill="#f4fbf6"/><circle cx="${cx - len * 0.44}" cy="${cy - 24}" r="10" fill="${INK}"/></g>`;
}

/** Belut: badan panjang berkelok. */
function eel({ cx, cy, fill, stroke }) {
  const path = `M${cx + 330} ${cy - 40} C ${cx + 150} ${cy - 210} ${cx - 20} ${cy + 150} ${cx - 200} ${cy - 20} C ${cx - 300} ${cy - 110} ${cx - 380} ${cy + 40} ${cx - 430} ${cy + 120}`;
  return `<g>
    <path d="${path}" fill="none" stroke="${stroke}" stroke-width="86" stroke-linecap="round"/>
    <path d="${path}" fill="none" stroke="${fill}" stroke-width="66" stroke-linecap="round"/>
    <path d="${path}" fill="none" stroke="rgba(255,255,255,0.16)" stroke-width="18" stroke-linecap="round" transform="translate(0,-16)"/>
    <circle cx="${cx + 306}" cy="${cy - 62}" r="17" fill="#f4fbf6"/>
    <circle cx="${cx + 308}" cy="${cy - 62}" r="8" fill="${INK}"/>
  </g>`;
}

// ── 10 komoditas ──────────────────────────────────────────────────────────
const SPECIES = [
  { slug: 'nila', name: 'Ikan Nila', latin: 'Oreochromis niloticus', water: ['#0e5e7a', '#06303f'], fill: '#7fa8b5', stroke: '#4c7688', belly: '#e6d2a8', kind: 'fin', pattern: 'stripes' },
  { slug: 'lele', name: 'Ikan Lele', latin: 'Clarias gariepinus', water: ['#2a4130', '#101c14'], fill: '#5b5348', stroke: '#39332c', belly: '#c9b894', kind: 'catfish' },
  { slug: 'patin', name: 'Ikan Patin', latin: 'Pangasius hypophthalmus', water: ['#2f5566', '#12242d'], fill: '#9aa8ad', stroke: '#5c6b72', belly: '#eef2f0', kind: 'catfish', barbels: 2 },
  { slug: 'vaname', name: 'Udang Vaname', latin: 'Litopenaeus vannamei', water: ['#146070', '#062f3a'], fill: '#e7d9c4', stroke: '#a9836a', kind: 'shrimp' },
  { slug: 'bandeng', name: 'Ikan Bandeng', latin: 'Chanos chanos', water: ['#1c5f6b', '#0a2f36'], fill: '#c9d6dc', stroke: '#7d939c', belly: '#f2f7f8', kind: 'fin', pattern: null },
  { slug: 'gurame', name: 'Ikan Gurame', latin: 'Osphronemus goramy', water: ['#1d4c3a', '#0a2119'], fill: '#8e8f6d', stroke: '#5d5f45', belly: '#d9cfa6', kind: 'fin', pattern: 'mottle', depthRatio: 0.62 },
  { slug: 'ikan-mas', name: 'Ikan Mas', latin: 'Cyprinus carpio', water: ['#28536b', '#0d2432'], fill: '#d99a3c', stroke: '#a4671f', belly: '#f2ddad', kind: 'fin', pattern: 'spots' },
  { slug: 'bawal', name: 'Bawal Air Tawar', latin: 'Colossoma macropomum', water: ['#204d55', '#0a2429'], fill: '#8f9aa0', stroke: '#5a656b', belly: '#e0a17a', kind: 'fin', pattern: null, depthRatio: 0.66 },
  { slug: 'gabus', name: 'Ikan Gabus', latin: 'Channa striata', water: ['#33482a', '#141d10'], fill: '#6d7a55', stroke: '#414c31', belly: '#cdc79a', kind: 'fin', pattern: 'mottle', tail: 'round' },
  { slug: 'belut', name: 'Belut Sawah', latin: 'Monopterus albus', water: ['#3b3320', '#171208'], fill: '#a8823f', stroke: '#6d5323', kind: 'eel' },
];

function speciesArt(s) {
  const defs = waterGradient('w', s.water[0], s.water[1]) + bodyGradient('b', s.fill, s.stroke);
  const cx = 600;
  const cy = 360;
  let creature;
  if (s.kind === 'catfish') {
    creature = catfish({ cx, cy, len: 720, depth: 120, fill: 'url(#b)', stroke: s.stroke, belly: s.belly, barbels: s.barbels ?? 4 });
  } else if (s.kind === 'shrimp') {
    creature = shrimp({ cx: cx + 60, cy, len: 640, fill: s.fill, stroke: s.stroke });
  } else if (s.kind === 'eel') {
    creature = eel({ cx, cy, fill: s.fill, stroke: s.stroke });
  } else {
    creature = finFish({
      cx, cy, len: 700, depth: 700 * (s.depthRatio ?? 0.5) * 0.52,
      fill: 'url(#b)', stroke: s.stroke, belly: s.belly, tail: s.tail ?? 'fork', pattern: s.pattern,
    });
  }
  const body = `<rect width="${W}" height="${H}" fill="url(#w)"/>` +
    ripples(70, 8, 0.07) +
    bubbles(210, 700, 14, 260) +
    `<g opacity="0.28"><path d="M120 800 q 40 -230 -10 -330 q 90 120 96 330 Z" fill="#0d2a1c"/><path d="M1090 800 q -30 -260 26 -360 q -104 150 -96 360 Z" fill="#0d2a1c"/></g>` +
    creature;
  return svg(defs, body, `Ilustrasi ${s.name}`);
}

// ── ilustrasi kegiatan & sistem ───────────────────────────────────────────
const pondBase = (top, bottom) => `<rect width="${W}" height="${H}" fill="url(#sky)"/>` +
  `<rect y="300" width="${W}" height="${H - 300}" fill="url(#w)"/>` + ripples(360, 8, 0.08);

const SCENES = {
  'kolam-terpal': {
    title: 'Kolam Terpal Bundar',
    sub: 'SISTEM · TERPAL D3',
    defs: waterGradient('sky', '#12301f', '#0b1d13') + waterGradient('w', '#1d6a58', '#0b2f2a'),
    body: () => pondBase() +
      `<g>
        <ellipse cx="600" cy="470" rx="430" ry="190" fill="#123a2c"/>
        <ellipse cx="600" cy="440" rx="430" ry="190" fill="#1f7f63"/>
        <ellipse cx="600" cy="440" rx="380" ry="158" fill="#2aa27c"/>
        <ellipse cx="600" cy="440" rx="380" ry="158" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="8"/>
        ${[0, 1, 2, 3, 4, 5].map(i => `<path d="M${300 + i * 120} 380 q 30 -12 60 0" fill="none" stroke="${FOAM}" stroke-width="7" stroke-linecap="round"/>`).join('')}
        ${finFish({ cx: 520, cy: 430, len: 190, depth: 48, fill: '#8fb9a6', stroke: '#3d6b58', belly: '#dfeee6', pattern: 'stripes' })}
        ${finFish({ cx: 760, cy: 480, len: 150, depth: 38, fill: '#8fb9a6', stroke: '#3d6b58', belly: '#dfeee6', pattern: 'stripes' })}
        <rect x="150" y="425" width="900" height="30" fill="rgba(255,255,255,0.05)"/>
      </g>`,
  },
  'bioflok': {
    title: 'Kolam Bioflok',
    sub: 'SISTEM · BIOFLOK',
    defs: waterGradient('sky', '#10261c', '#0a1711') + waterGradient('w', '#155e57', '#08282a'),
    body: () => pondBase() +
      `<g>
        <ellipse cx="600" cy="430" rx="400" ry="176" fill="#0f4f4a"/>
        <ellipse cx="600" cy="410" rx="400" ry="176" fill="#17756a"/>
        <ellipse cx="600" cy="410" rx="352" ry="146" fill="#1f9585"/>
        ${bubbles(600, 620, 26, 620)}
        <rect x="575" y="150" width="50" height="270" rx="14" fill="#25352c" stroke="rgba(255,255,255,0.14)" stroke-width="5"/>
        <rect x="500" y="110" width="200" height="60" rx="18" fill="#2f4a3a" stroke="rgba(255,255,255,0.16)" stroke-width="5"/>
        <text x="600" y="150" text-anchor="middle" fill="rgba(255,255,255,0.75)" font-family="'IBM Plex Mono',monospace" font-size="26">AERATOR</text>
      </g>`,
  },
  'tambak-vaname': {
    title: 'Tambak Udang Vaname',
    sub: 'SISTEM · TAMBAK INTENSIF',
    defs: waterGradient('sky', '#123244', '#0a1d27') + waterGradient('w', '#14647a', '#072b38'),
    body: () => pondBase() +
      `<g>
        <rect x="90" y="360" width="1020" height="330" rx="26" fill="#0d4b5d"/>
        <rect x="120" y="384" width="960" height="282" rx="20" fill="#14748c"/>
        ${[0, 1, 2].map(i => `<g transform="translate(${260 + i * 340},470)">
          <circle cx="0" cy="0" r="66" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="10"/>
          ${[0, 45, 90, 135].map(a => `<line x1="${-66 * Math.cos(a * Math.PI / 180)}" y1="${-66 * Math.sin(a * Math.PI / 180)}" x2="${66 * Math.cos(a * Math.PI / 180)}" y2="${66 * Math.sin(a * Math.PI / 180)}" stroke="rgba(255,255,255,0.35)" stroke-width="9"/>`).join('')}
          <circle cx="0" cy="0" r="16" fill="#e7f3ef"/>
          <path d="M-120 46 q 60 -26 120 0 q 60 26 120 0" fill="none" stroke="${FOAM}" stroke-width="9" stroke-linecap="round"/>
        </g>`).join('')}
        <g transform="translate(288,246) scale(0.6)">${shrimp({ cx: 720, cy: 615, len: 300, fill: '#e7d9c4', stroke: '#a9836a' })}</g>
      </g>`,
  },
  'keramba-jaring': {
    title: 'Keramba Jaring Apung',
    sub: 'SISTEM · KJA WADUK',
    defs: waterGradient('sky', '#13303f', '#0a1c26') + waterGradient('w', '#155e74', '#07242f'),
    body: () => pondBase() +
      `<g>
        ${[0, 1, 2].map(i => `<g transform="translate(${230 + i * 340},400)">
          <rect x="-140" y="-30" width="280" height="30" rx="10" fill="#33513f" stroke="rgba(255,255,255,0.18)" stroke-width="4"/>
          <path d="M-120 0 L-96 220 L96 220 L120 0 Z" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.3)" stroke-width="4"/>
          ${[1, 2, 3, 4].map(k => `<line x1="${-120 + k * 48}" y1="0" x2="${-96 + k * 38}" y2="220" stroke="rgba(255,255,255,0.18)" stroke-width="3"/>`).join('')}
          ${[1, 2, 3].map(k => `<line x1="${-114 + k * 4}" y1="${k * 55}" x2="${114 - k * 4}" y2="${k * 55}" stroke="rgba(255,255,255,0.18)" stroke-width="3"/>`).join('')}
          <circle cx="-140" cy="-14" r="22" fill="#d7532f"/><circle cx="140" cy="-14" r="22" fill="#d7532f"/>
          ${finFish({ cx: 0, cy: 120, len: 110, depth: 28, fill: '#9fc2b2', stroke: '#436f5c', belly: '#e6f2ec' })}
        </g>`).join('')}
      </g>`,
  },
  'hatchery-benih': {
    title: 'Pendederan Benih',
    sub: 'TAHAP · BENIH & NURSERY',
    defs: waterGradient('sky', '#132a1e', '#0a1810') + waterGradient('w', '#1b6b52', '#093026'),
    body: () => pondBase() +
      `<g>
        <rect x="150" y="330" width="900" height="330" rx="28" fill="#0e4536" stroke="rgba(255,255,255,0.16)" stroke-width="6"/>
        <rect x="176" y="356" width="848" height="278" rx="20" fill="#1a7a5e"/>
        ${Array.from({ length: 16 }, (_, i) => finFish({
          cx: 250 + (i % 8) * 100, cy: 420 + Math.floor(i / 8) * 130, len: 74, depth: 19,
          fill: '#a9cfbc', stroke: '#3e6d59', belly: '#e8f4ee',
        })).join('')}
        <rect x="150" y="330" width="900" height="60" rx="20" fill="rgba(255,255,255,0.06)"/>
      </g>`,
  },
  'pakan': {
    title: 'Manajemen Pakan',
    sub: 'BIAYA TERBESAR · 50-70%',
    defs: waterGradient('sky', '#14301f', '#0a1a12') + waterGradient('w', '#1c6a4f', '#0a2c22'),
    body: () => pondBase() +
      `<g>
        <path d="M180 660 L240 380 q 130 -60 260 0 L560 660 Z" fill="#2c4634" stroke="rgba(255,255,255,0.18)" stroke-width="6"/>
        <rect x="255" y="440" width="230" height="120" rx="12" fill="rgba(255,255,255,0.10)"/>
        <text x="370" y="500" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="'IBM Plex Mono',monospace" font-size="34">PELET</text>
        <text x="370" y="540" text-anchor="middle" fill="rgba(255,255,255,0.55)" font-family="'IBM Plex Mono',monospace" font-size="24">30 KG</text>
        ${Array.from({ length: 34 }, (_, i) => `<circle cx="${620 + ((i * 89) % 460)}" cy="${330 + ((i * 137) % 320)}" r="${8 + (i % 3) * 3}" fill="#c8a25a"/>`).join('')}
        ${finFish({ cx: 880, cy: 620, len: 210, depth: 54, fill: '#8fb9a6', stroke: '#3d6b58', belly: '#dfeee6', pattern: 'stripes' })}
      </g>`,
  },
  'kualitas-air': {
    title: 'Kontrol Kualitas Air',
    sub: 'DO · pH · SUHU · AMONIA',
    defs: waterGradient('sky', '#0f2a33', '#081920') + waterGradient('w', '#126070', '#062730'),
    body: () => pondBase() +
      `<g>
        ${[['DO', '5.8 mg/L', 0], ['pH', '7.4', 1], ['SUHU', '28.5 °C', 2], ['NH3', '0.02 mg/L', 3]].map(([k, v, i]) => `
          <g transform="translate(${140 + i * 240},360)">
            <rect width="200" height="140" rx="18" fill="rgba(6,20,16,0.55)" stroke="rgba(255,255,255,0.22)" stroke-width="4"/>
            <text x="24" y="52" fill="rgba(255,255,255,0.6)" font-family="'IBM Plex Mono',monospace" font-size="24">${k}</text>
            <text x="24" y="106" fill="#7ee2ad" font-family="'IBM Plex Mono',monospace" font-size="38" font-weight="600">${v}</text>
          </g>`).join('')}
        <rect x="520" y="540" width="160" height="200" rx="16" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.3)" stroke-width="5"/>
        <rect x="540" y="600" width="120" height="120" rx="10" fill="#2aa27c"/>
        ${bubbles(900, 760, 12, 220)}
      </g>`,
  },
  'panen': {
    title: 'Panen',
    sub: 'TAHAP · PANEN & TIMBANG',
    defs: waterGradient('sky', '#183020', '#0b1a11') + waterGradient('w', '#1d6d4f', '#0a2d21'),
    body: () => pondBase() +
      `<g>
        <path d="M330 300 L250 620 q 350 130 700 0 L870 300" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.34)" stroke-width="6"/>
        ${Array.from({ length: 9 }, (_, i) => `<line x1="${340 + i * 62}" y1="310" x2="${300 + i * 74}" y2="640" stroke="rgba(255,255,255,0.18)" stroke-width="3"/>`).join('')}
        ${[0, 1, 2].map(k => `<path d="M${290 - k * 6} ${400 + k * 80} q 300 ${60 + k * 14} 620 0" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="3"/>`).join('')}
        ${finFish({ cx: 460, cy: 470, len: 200, depth: 52, fill: '#9fc2b2', stroke: '#3f6d5b', belly: '#e6f2ec', pattern: 'stripes' })}
        ${finFish({ cx: 700, cy: 540, len: 230, depth: 58, fill: '#a9cfbc', stroke: '#3f6d5b', belly: '#e6f2ec', pattern: 'stripes' })}
        ${finFish({ cx: 560, cy: 620, len: 180, depth: 46, fill: '#8fb9a6', stroke: '#3f6d5b', belly: '#e6f2ec', pattern: 'stripes' })}
      </g>`,
  },
  'sortasi': {
    title: 'Sortasi & Grading',
    sub: 'PASCA PANEN · UKURAN SERAGAM',
    defs: waterGradient('sky', '#152c1d', '#0a1810') + waterGradient('w', '#1a5f4c', '#092a22'),
    body: () => pondBase() +
      `<g>
        ${[0, 1, 2].map(i => `<g transform="translate(${120 + i * 340},350)">
          <rect width="300" height="300" rx="22" fill="rgba(6,20,14,0.45)" stroke="rgba(255,255,255,0.22)" stroke-width="5"/>
          <text x="150" y="56" text-anchor="middle" fill="rgba(255,255,255,0.62)" font-family="'IBM Plex Mono',monospace" font-size="26">GRADE ${'ABC'[i]}</text>
          ${Array.from({ length: 3 - i }, (_, k) => finFish({
            cx: 150, cy: 120 + k * 70, len: 200 - i * 40, depth: 46 - i * 9,
            fill: '#9fc2b2', stroke: '#3f6d5b', belly: '#e6f2ec',
          })).join('')}
        </g>`).join('')}
      </g>`,
  },
  'pasca-panen': {
    title: 'Rantai Dingin',
    sub: 'PASCA PANEN · ES & DISTRIBUSI',
    defs: waterGradient('sky', '#122a30', '#08181c') + waterGradient('w', '#12586a', '#06242c'),
    body: () => pondBase() +
      `<g>
        <rect x="220" y="330" width="760" height="330" rx="26" fill="#dbe9ee" opacity="0.14" stroke="rgba(255,255,255,0.3)" stroke-width="6"/>
        <rect x="220" y="330" width="760" height="70" rx="18" fill="rgba(255,255,255,0.16)"/>
        ${Array.from({ length: 22 }, (_, i) => `<rect x="${260 + ((i * 97) % 660)}" y="${430 + ((i * 61) % 180)}" width="42" height="30" rx="6" fill="rgba(255,255,255,0.30)" transform="rotate(${(i * 37) % 40 - 20} ${280 + ((i * 97) % 660)} ${445 + ((i * 61) % 180)})"/>`).join('')}
        ${finFish({ cx: 520, cy: 560, len: 220, depth: 54, fill: '#b9cfc4', stroke: '#4b6b5e', belly: '#eef5f1' })}
        ${finFish({ cx: 760, cy: 590, len: 190, depth: 46, fill: '#b9cfc4', stroke: '#4b6b5e', belly: '#eef5f1' })}
        <text x="600" y="392" text-anchor="middle" fill="rgba(255,255,255,0.72)" font-family="'IBM Plex Mono',monospace" font-size="30">COOL BOX · 0-4 °C</text>
      </g>`,
  },
  'tim-farm': {
    title: 'Tim Farm',
    sub: 'OPERASIONAL HARIAN',
    defs: waterGradient('sky', '#16321f', '#0a1a11') + waterGradient('w', '#1c6a4f', '#0a2c22'),
    body: () => pondBase() +
      `<g>
        ${[0, 1, 2].map(i => `<g transform="translate(${330 + i * 250},300)">
          <circle cx="0" cy="0" r="58" fill="#d8c1a0"/>
          <path d="M-86 210 q 0 -140 86 -140 q 86 0 86 140 Z" fill="${['#2f7d55', '#265f74', '#6b5a2f'][i]}"/>
          <rect x="-96" y="-30" width="192" height="22" rx="11" fill="rgba(10,16,12,0.35)"/>
        </g>`).join('')}
        <rect x="150" y="560" width="900" height="120" rx="26" fill="rgba(6,20,14,0.4)" stroke="rgba(255,255,255,0.18)" stroke-width="5"/>
        <text x="600" y="636" text-anchor="middle" fill="rgba(255,255,255,0.72)" font-family="'IBM Plex Mono',monospace" font-size="30">SUMBER JAYA FARM · KEDIRI</text>
      </g>`,
  },
  'kolam-tanah': {
    title: 'Kolam Tanah',
    sub: 'SISTEM · BIAYA PALING MURAH',
    defs: waterGradient('sky', '#1b2f1c', '#0c1a0f') + waterGradient('w', '#2b6f4a', '#12331f'),
    body: () => pondBase() +
      `<g>
        <path d="M60 420 q 540 -90 1080 0 l 0 320 q -540 90 -1080 0 Z" fill="#6b5836"/>
        <path d="M120 452 q 480 -72 960 0 l 0 250 q -480 74 -960 0 Z" fill="#26794f"/>
        ${ripples(500, 4, 0.1)}
        ${finFish({ cx: 460, cy: 560, len: 190, depth: 48, fill: '#8fb9a6', stroke: '#3d6b58', belly: '#dfeee6', pattern: 'stripes' })}
        ${finFish({ cx: 760, cy: 620, len: 150, depth: 38, fill: '#8fb9a6', stroke: '#3d6b58', belly: '#dfeee6', pattern: 'stripes' })}
        <g opacity="0.5">${[0, 1, 2, 3, 4].map(i => `<path d="M${100 + i * 250} 420 q 20 -70 46 -96 q 8 60 -6 96 Z" fill="#1f4a2c"/>`).join('')}</g>
      </g>`,
  },
};

// ── tulis file ────────────────────────────────────────────────────────────
function write(path, content) {
  const full = resolve(root, path);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content);
  return path;
}

const written = [];
for (const s of SPECIES) written.push(write(`public/images/species/${s.slug}.svg`, speciesArt(s)));
for (const [slug, scene] of Object.entries(SCENES)) {
  written.push(write(`public/images/aquaculture/${slug}.svg`, svg(scene.defs, scene.body(), scene.title)));
}
console.log(`${written.length} ilustrasi dibuat:\n` + written.map(p => '  ' + p).join('\n'));
