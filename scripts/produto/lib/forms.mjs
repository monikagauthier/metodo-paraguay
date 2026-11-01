// PDFs preenchíveis: layout em HTML paginado por script, impressão pelo Chromium e
// sobreposição de campos AcroForm (caixas de seleção e campos de texto).
import fs from "node:fs";
import path from "node:path";
import { esc, inline } from "./md.mjs";
import { htmlFileToPdf, addFormFields, pdfStats } from "./pdf.mjs";
import { ROOT, EDICAO } from "./doc.mjs";

const IMG = (f) => `../../../assets/produto/img/${f}`;

const CSS = `
@font-face { font-family: "Noto Sans MP"; src: url("../../../assets/produto/fonts/NotoSans-VF.ttf"); font-weight: 100 900; }
@font-face { font-family: "Lato MP"; src: url("../../../assets/produto/fonts/Lato-Light.ttf"); font-weight: 300; }
@page { size: 210mm 297mm; margin: 0; }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin: 0; font-family: "Noto Sans MP", sans-serif; font-size: 9pt; color: #1C2420; background: #ddd; }
.pg { width: 210mm; height: 297mm; position: relative; background: #fff; overflow: hidden; break-after: page; margin: 0 auto; }
.pg .band { height: 13mm; background: #101A17; color: #D8B76E; display: flex; align-items: center; justify-content: space-between; padding: 0 14mm; font: 600 6.8pt "Noto Sans MP"; letter-spacing: 2pt; text-transform: uppercase; }
.pg .band img { height: 8mm; }
.pg .area { position: absolute; top: 20mm; left: 14mm; right: 14mm; bottom: 16mm; }
.pg .foot { position: absolute; bottom: 7mm; left: 14mm; right: 14mm; display: flex; justify-content: space-between; font: 600 6.4pt "Noto Sans MP"; letter-spacing: 1.2pt; color: #8A8F86; text-transform: uppercase; border-top: 0.5pt solid #D9D4C7; padding-top: 2mm; }
.pg .foot b { color: #B8995C; }
.capa .area { top: 30mm; }
.titulo { font: 300 22pt/1.15 "Lato MP"; text-transform: uppercase; color: #101A17; letter-spacing: .6pt; margin: 0 0 3mm; }
.kicker { font: 650 7pt "Noto Sans MP"; letter-spacing: 2.4pt; text-transform: uppercase; color: #B8995C; margin-bottom: 2mm; }
.sub { font-size: 9.6pt; color: #5E6B65; margin-bottom: 5mm; line-height: 1.5; }
.filete { width: 16mm; height: 0.8pt; background: #B8995C; margin: 0 0 6mm; }
h2 { font: 650 10.5pt "Noto Sans MP"; color: #263D33; margin: 5mm 0 2.5mm; padding-bottom: 1.2mm; border-bottom: 0.6pt solid #D8B76E; }
p { margin: 0 0 2.4mm; line-height: 1.5; }
.ck { display: flex; gap: 3mm; align-items: flex-start; padding: 1.6mm 0; border-bottom: 0.4pt solid #ECE8DE; line-height: 1.4; }
.box { flex: 0 0 4.4mm; height: 4.4mm; border: 0.8pt solid #B8995C; border-radius: 0.8mm; margin-top: 0.2mm; background: #FFFDF6; }
.ck .t { flex: 1; }
.ck .nt { flex: 0 0 52mm; height: 5mm; border-bottom: 0.6pt solid #CFC8B6; background: #FFFDF6; }
.fields { display: flex; gap: 4mm; margin: 1.5mm 0 2.5mm; }
.fld { flex: 1; }
.fld label { display: block; font: 650 6.6pt "Noto Sans MP"; letter-spacing: 1pt; text-transform: uppercase; color: #5E6B65; margin-bottom: 1mm; }
.fld .in { height: 7.5mm; border: 0.6pt solid #CFC8B6; border-radius: 0.8mm; background: #FFFDF6; }
.fld .in.ta { height: 24mm; }
.fld .in.ta2 { height: 40mm; }
table { width: 100%; border-collapse: collapse; margin: 1.5mm 0 3mm; font-size: 7.8pt; }
th { background: #101A17; color: #F2EBDA; font-weight: 600; text-align: left; padding: 1.6mm 1.8mm; font-size: 7.2pt; }
td { border-bottom: 0.4pt solid #D9D4C7; padding: 0.9mm 1.8mm; height: 7.4mm; vertical-align: middle; }
td .cin { height: 5.4mm; background: #FFFDF6; border: 0.5pt solid #E3DCCB; border-radius: 0.6mm; }
td .cbx { width: 4.2mm; height: 4.2mm; border: 0.8pt solid #B8995C; border-radius: 0.8mm; margin: 0 auto; background: #FFFDF6; }
.callout { border-left: 1.4pt solid #B8995C; background: #F7F3E9; padding: 2.4mm 3.4mm; margin: 2.5mm 0 3.5mm; font-size: 8.2pt; line-height: 1.5; }
.flow { display: grid; gap: 2mm; margin: 2mm 0 4mm; }
.flow .st { display: flex; gap: 3mm; align-items: flex-start; }
.flow .n { flex: 0 0 6mm; height: 6mm; border-radius: 50%; background: #101A17; color: #F0CC7C; font: 700 7pt/6mm "Noto Sans MP"; text-align: center; }
.flow .st div b { color: #101A17; } .flow .st div span { display: block; color: #47524C; font-size: 8pt; }
a { color: #6F5A2C; }
.legal { font-size: 7.2pt; color: #5E6B65; margin-top: 4mm; line-height: 1.5; }
`;

function blockHtml(b, doc) {
  const F = (type, label, cls = "", extra = "") => `<div class="${cls}" data-field="${doc.id}_${++doc._n}" data-type="${type}" data-label="${esc(label)}"${extra}></div>`;
  switch (b.t) {
    case "h": return `<h2>${inline(b.text)}</h2>`;
    case "p": return `<p>${inline(b.text)}</p>`;
    case "callout": return `<div class="callout">${inline(b.text)}</div>`;
    case "check": return `<div class="ck">${F("check", b.text, "box")}<div class="t">${inline(b.text)}</div>${b.nota ? F("text", "Anotação: " + b.text, "nt") : ""}</div>`;
    case "fields": return `<div class="fields">${b.items.map((it) => `<div class="fld" style="flex:${it.flex || 1}"><label>${esc(it.label)}</label>${F("text", it.label, "in" + (it.area ? " ta" : "") + (it.area2 ? " ta2" : ""), it.area || it.area2 ? ' data-multiline="1"' : "")}</div>`).join("")}</div>`;
    case "flow": return `<div class="flow">${b.steps.map((s, i) => `<div class="st"><span class="n">${i + 1}</span><div><b>${inline(s[0])}</b><span>${inline(s[1] || "")}</span></div></div>`).join("")}</div>`;
    case "table": {
      const head = `<tr>${b.cols.map((c) => `<th style="width:${c.w || ""}">${esc(c.label)}</th>`).join("")}</tr>`;
      const rows = (b.rows || Array.from({ length: b.n || 5 }, () => [])).map((row, ri) => `<tr>${b.cols.map((c, ci) => {
        if (c.type === "label") return `<td>${inline(row[ci] ?? "")}</td>`;
        const label = `${b.nome || "Tabela"} — linha ${ri + 1} — ${c.label}`;
        if (c.type === "check") return `<td>${F("check", label, "cbx")}</td>`;
        return `<td>${F("text", label, "cin")}</td>`;
      }).join("")}</tr>`).join("");
      return `<table><thead>${head}</thead><tbody>${rows}</tbody></table>`;
    }
    case "html": return b.html;
  }
  return "";
}

/** Gera um PDF preenchível a partir de uma definição. */
export async function buildForm(doc) {
  doc._n = 0;
  const grupos = [];
  for (const b of doc.blocos) { const prev = grupos[grupos.length - 1]; if (prev && prev.length === 1 && prev[0].t === "h") prev.push(b); else grupos.push([b]); }
  const blocks = grupos.map((g) => `<div class="blk">${g.map((b) => blockHtml(b, doc)).join("")}</div>`).join("\n");
  const capa = `<div class="blk"><div class="kicker">${esc(doc.kicker)}</div><div class="titulo">${esc(doc.titulo)}</div><div class="sub">${inline(doc.subtitulo)}</div><div class="filete"></div></div>`;
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${esc(doc.titulo)}</title><style>${CSS}</style></head><body>
<div id="src" style="display:none">${capa}${blocks}<div class="blk"><p class="legal">Material educativo do Método Paraguay. Não substitui orientação profissional. Confira requisitos e valores vigentes nas fontes oficiais. ${EDICAO.rotulo}.</p></div></div>
<div id="out"></div>
<script>
document.fonts.ready.then(function(){
  const src=[...document.querySelectorAll('#src > .blk')]; const out=document.getElementById('out');
  const rodape=${JSON.stringify(("Método Paraguay · " + (doc.rodape || doc.titulo)).toUpperCase())};
  function novaPagina(){const pg=document.createElement('div');pg.className='pg';pg.innerHTML='<div class="band"><span>Método Paraguay · Inteligência sem fronteiras</span><img src="${IMG("emblema.png")}" alt=""></div><div class="area"></div><div class="foot"><span>'+rodape+'</span><b class="pn"></b></div>';out.appendChild(pg);return pg.querySelector('.area');}
  let area=novaPagina();
  for(const b of src){ if(b.querySelector('[style*="break-before"]')){ if(area.children.length>0) area=novaPagina(); continue; } area.appendChild(b); if(area.scrollHeight>area.clientHeight+1 && area.children.length>1){ area.removeChild(b); area=novaPagina(); area.appendChild(b);} }
  const pgs=[...document.querySelectorAll('.pg')]; pgs.forEach((p,i)=>p.querySelector('.pn').textContent=(i+1)+' / '+pgs.length);
  document.body.style.background='#fff'; window.__paginated=true;
});
</script></body></html>`;
  const htmlDir = path.join(ROOT, "scripts/produto/_html");
  fs.mkdirSync(htmlDir, { recursive: true });
  const hp = path.join(htmlDir, `form-${doc.id}.html`);
  fs.writeFileSync(hp, html);
  const out = path.join(ROOT, doc.arquivo);
  const { errors, fieldRects } = await htmlFileToPdf(hp, out, { width: "210mm", height: "297mm", fields: true });
  const rects = fieldRects.map((r) => ({ ...r, label: r.label }));
  // rótulos (tooltip) a partir do atributo data-label
  const n = addFormFields(out, rects);
  const st = pdfStats(fs.readFileSync(out));
  return { arquivo: doc.arquivo, paginas: st.paginas, campos: n, camposDetectados: st.campos, erros: errors, tamanhoKB: Math.round(fs.statSync(out).size / 1024) };
}
