// Generates clearly-labeled placeholder SVGs for every asset the page needs.
// These are NOT fake photos/screenshots — each is a labeled slot telling you
// exactly which real file to drop in its place.
//
// Run:  node scripts/gen-placeholders.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PAL = {
  greenDeep: "#101A17",
  greenSecondary: "#263D33",
  gold: "#D8B76E",
  goldLight: "#F0CC7C",
  ivory: "#F5F1E8",
};

function placeholder({ w, h, label, sublabel = "", bg = PAL.greenSecondary, fg = PAL.gold }) {
  const fontMain = Math.round(Math.min(w, h) * 0.05) + 8;
  const fontSub = Math.round(fontMain * 0.62);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}">
  <defs>
    <pattern id="hatch" width="18" height="18" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
      <rect width="18" height="18" fill="${bg}"/>
      <line x1="0" y1="0" x2="0" y2="18" stroke="${fg}" stroke-opacity="0.12" stroke-width="2"/>
    </pattern>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#hatch)"/>
  <rect x="8" y="8" width="${w - 16}" height="${h - 16}" fill="none" stroke="${fg}" stroke-opacity="0.5" stroke-width="3" stroke-dasharray="12 8" rx="14"/>
  <text x="50%" y="46%" fill="${fg}" font-family="Manrope, Arial, sans-serif" font-size="${fontMain}" font-weight="800" text-anchor="middle" letter-spacing="1">${label}</text>
  ${sublabel ? `<text x="50%" y="46%" dy="${fontMain + 6}" fill="${PAL.ivory}" fill-opacity="0.8" font-family="Inter, Arial, sans-serif" font-size="${fontSub}" text-anchor="middle">${sublabel}</text>` : ""}
  <text x="50%" y="${h - 18}" fill="${fg}" fill-opacity="0.65" font-family="Inter, Arial, sans-serif" font-size="${fontSub}" text-anchor="middle">${w}×${h}</text>
</svg>`;
}

function save(relPath, svg) {
  const abs = resolve(ROOT, relPath);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, svg, "utf8");
  console.log("wrote", relPath);
}

const base = "public/assets/paraguay";

// Hero background — Assunção skyline at sunset
save(`${base}/hero-asuncion.svg`, placeholder({
  w: 1200, h: 1600, bg: PAL.greenDeep,
  label: "FOTO: ASSUNÇÃO AO PÔR DO SOL",
  sublabel: "substitua por hero-asuncion.webp",
}));

// Paraguay flag element
save(`${base}/bandeira-paraguai.svg`, placeholder({
  w: 600, h: 360, bg: PAL.greenSecondary,
  label: "BANDEIRA DO PARAGUAI",
  sublabel: "bandeira-paraguai.webp",
}));

// "Por que o Paraguai" photo
save(`${base}/asuncion-crescimento.svg`, placeholder({
  w: 1000, h: 1200, bg: PAL.greenSecondary,
  label: "FOTO: ASSUNÇÃO / CRESCIMENTO",
  sublabel: "asuncion-crescimento.webp",
}));

// Product mockups
save(`${base}/mockups/ebook-3d.svg`, placeholder({
  w: 900, h: 1100, bg: PAL.greenDeep,
  label: "MOCKUP: LIVRO DIGITAL 3D",
  sublabel: "ebook-3d.webp (PNG com transparência)",
}));
save(`${base}/mockups/notebook.svg`, placeholder({
  w: 1200, h: 800, bg: PAL.greenDeep,
  label: "MOCKUP: NOTEBOOK",
  sublabel: "notebook.webp",
}));
save(`${base}/mockups/smartphone.svg`, placeholder({
  w: 600, h: 1100, bg: PAL.greenDeep,
  label: "MOCKUP: SMARTPHONE",
  sublabel: "smartphone.webp",
}));
save(`${base}/mockups/tablet.svg`, placeholder({
  w: 1000, h: 800, bg: PAL.greenDeep,
  label: "MOCKUP: TABLET (opcional)",
  sublabel: "tablet.webp",
}));

// Module thumbnails
const modulos = [
  "Panorama do Paraguai",
  "Residência legal",
  "Tributação",
  "Abrir empresas",
  "Custo de vida",
  "Planejamento financeiro",
];
modulos.forEach((m, i) => {
  const n = String(i + 1).padStart(2, "0");
  save(`${base}/modulo-${n}.svg`, placeholder({
    w: 400, h: 300, bg: PAL.greenSecondary,
    label: `MÓDULO ${n}`,
    sublabel: m,
  }));
});

// Gift box for bonus section
save(`${base}/caixa-presente.svg`, placeholder({
  w: 800, h: 800, bg: PAL.greenDeep,
  label: "CAIXA DE PRESENTE 3D",
  sublabel: "preta e dourada — caixa-presente.webp",
}));

// Offer section skyline
save(`${base}/oferta-skyline.svg`, placeholder({
  w: 1400, h: 1000, bg: PAL.greenDeep,
  label: "SKYLINE DE ASSUNÇÃO (OFERTA)",
  sublabel: "oferta-skyline.webp",
}));

// Guarantee seal
save(`${base}/selo-garantia.svg`, placeholder({
  w: 600, h: 600, bg: PAL.greenDeep,
  label: "SELO DE GARANTIA 7 DIAS",
  sublabel: "selo-garantia.webp (3D dourado)",
}));

// 10 WhatsApp testimonial placeholders (neutral — NOT fake conversations)
for (let i = 1; i <= 10; i++) {
  const n = String(i).padStart(2, "0");
  save(`${base}/depoimentos/depoimento-${n}.svg`, placeholder({
    w: 900, h: 1600, bg: PAL.greenSecondary, fg: PAL.goldLight,
    label: "ADICIONAR PRINT REAL",
    sublabel: `depoimento-${n}.webp`,
  }));
}

console.log("\nAll placeholders generated.");
