// Converte uma pasta de trabalho (modelo em memória + valores calculados) em HTML
// paginável, para gerar a versão PDF de cada planilha.
import { STYLES } from "./xlsx.mjs";
import { parseRef, numToCol, isErr } from "./formula.mjs";
import { esc } from "./md.mjs";
import { EDICAO } from "./doc.mjs";

const argb = (c) => (c ? "#" + c.slice(2) : "");
const serialParaData = (n) => { const d = new Date(Date.UTC(1899, 11, 30) + Math.round(n) * 86400000); return `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${d.getUTCFullYear()}`; };
const num = (n, dec) => n.toLocaleString("pt-BR", { minimumFractionDigits: dec, maximumFractionDigits: dec });

export function formatar(v, fmt) {
  if (v === null || v === undefined || v === "") return "";
  if (isErr(v)) return v.code;
  if (typeof v === "boolean") return v ? "VERDADEIRO" : "FALSO";
  if (typeof v !== "number") return String(v);
  if (!fmt) return Number.isInteger(v) ? num(v, 0) : num(v, 2);
  if (fmt.includes("Gs.")) return num(v, 0) + " Gs.";
  if (fmt.includes("R$")) return "R$ " + num(v, 2);
  if (fmt.includes("US$")) return "US$ " + num(v, 2);
  if (fmt.includes("%")) return num(v * 100, 1) + "%";
  if (fmt.includes("dd/mm")) return serialParaData(v);
  if (fmt === "0.0") return num(v, 1);
  if (fmt === "#,##0") return num(v, 0);
  return num(v, 2);
}

function grafico(ch, sheet, values) {
  const pts = (range, numeric) => {
    const [a, b] = range.split(":"); const A = parseRef(a), B = parseRef(b || a); const out = [];
    for (let r = A.r; r <= B.r; r++) for (let c = A.c; c <= B.c; c++) {
      const ref = numToCol(c) + r; let v = values.get(sheet.name + "!" + ref); if (v === undefined) v = sheet.cells.get(ref)?.v;
      out.push(numeric ? (typeof v === "number" ? v : 0) : String(v ?? ""));
    }
    return out;
  };
  const cats = pts(ch.cats, false);
  const series = ch.series.map((s) => ({ nome: s.name, v: pts(s.vals, true) }));
  const max = Math.max(1e-9, ...series.flatMap((s) => s.v.map(Math.abs)));
  const cores = ["#101A17", "#B8995C", "#3B5A4C", "#D8B76E"];
  const pctFmt = series.every((s) => s.v.every((x) => Math.abs(x) <= 1.5));
  const linhas = cats.map((c, i) => `<div class="gl"><span class="gc">${esc(c)}</span><span class="gb">${series.map((s, k) => `<span class="gbar" style="width:${(Math.abs(s.v[i]) / max) * 100}%;background:${cores[k % 4]}"></span><span class="gv">${pctFmt ? num(s.v[i] * 100, 1) + "%" : num(s.v[i], 0)}</span>`).join("<br>")}</span></div>`).join("");
  return `<div class="grafico"><div class="gt">${esc(ch.title)}</div>${series.length > 1 ? `<div class="gleg">${series.map((s, k) => `<span><i style="background:${cores[k % 4]}"></i>${esc(s.nome)}</span>`).join("")}</div>` : ""}${linhas}</div>`;
}

/** Gera o HTML de todas as abas. */
export function workbookHtml(wb, values, { titulo, subtitulo, kicker }) {
  const abas = wb.sheets.map((s) => {
    let maxR = 0, maxC = 0;
    for (const ref of s.cells.keys()) { const { r, c } = parseRef(ref); maxR = Math.max(maxR, r); maxC = Math.max(maxC, c); }
    // linhas totalmente vazias no fim de tabelas longas são omitidas
    const ocupada = new Set();
    for (const [ref, cell] of s.cells) {
      const v = cell.f !== undefined ? values.get(s.name + "!" + ref) : cell.v;
      if (v !== null && v !== undefined && v !== "" && !(cell.f !== undefined && v === "")) ocupada.add(parseRef(ref).r);
    }
    const merges = new Map(); const cobertas = new Set();
    for (const m of s.merges) { const [a, b] = m.split(":"); const A = parseRef(a), B = parseRef(b); merges.set(a, { cs: B.c - A.c + 1, rs: B.r - A.r + 1 }); for (let r = A.r; r <= B.r; r++) for (let c = A.c; c <= B.c; c++) if (r !== A.r || c !== A.c) cobertas.add(numToCol(c) + r); }
    const oculta = (c) => (s.cols[c - 1] || 10) <= 2 || (s.name === "Tarefas" && c === 11);
    const larg = Array.from({ length: maxC }, (_, i) => (oculta(i + 1) ? 0 : s.cols[i] || 10));
    const tot = larg.reduce((a, b) => a + b, 0);
    let vaziasSeguidas = 0;
    const linhas = [];
    for (let r = 1; r <= maxR; r++) {
      if (!ocupada.has(r)) { vaziasSeguidas++; if (vaziasSeguidas > 1) continue; } else vaziasSeguidas = 0;
      if (r <= 1) continue; // faixa de marca já está no cabeçalho da página
      const tds = [];
      for (let c = 1; c <= maxC; c++) {
        const ref = numToCol(c) + r; if (cobertas.has(ref) || oculta(c)) continue;
        const cell = s.cells.get(ref); const m = merges.get(ref);
        const st = STYLES[cell?.s] || {};
        let v = cell ? (cell.f !== undefined ? values.get(s.name + "!" + ref) : cell.v) : "";
        const txt = formatar(v, st.fmt);
        const css = [st.fill ? `background:${argb(st.fill)}` : "", st.font?.color ? `color:${argb(st.font.color)}` : "", st.font?.b ? "font-weight:650" : "", st.font?.i ? "font-style:italic" : "", st.font?.sz ? `font-size:${Math.max(6.4, st.font.sz * 0.7)}pt` : "", st.border ? "border:0.4pt solid #D9D4C7" : "", st.bottomGold ? "border-bottom:1pt solid #B8995C" : "", typeof v === "number" || st.align === "center" ? "text-align:" + (st.align === "center" ? "center" : "right") : ""].filter(Boolean).join(";");
        tds.push(`<td${m ? ` colspan="${m.cs}" rowspan="${m.rs}"` : ""}${css ? ` style="${css}"` : ""}${st.unlocked ? ' class="in"' : ""}>${esc(txt)}</td>`);
      }
      linhas.push(`<tr>${tds.join("")}</tr>`);
    }
    const cols = `<colgroup>${larg.filter((w) => w > 0).map((w) => `<col style="width:${((w / tot) * 100).toFixed(2)}%">`).join("")}</colgroup>`;
    const graficos = s.charts.map((ch) => grafico(ch, s, values)).join("");
    return `<section class="aba"><div class="aba-t">Aba: ${esc(s.name)}</div><table>${cols}<tbody>${linhas.join("")}</tbody></table>${graficos}</section>`;
  }).join("");
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${esc(titulo)}</title><style>
@font-face { font-family: "Noto Sans MP"; src: url("../../../assets/produto/fonts/NotoSans-VF.ttf"); font-weight: 100 900; }
@font-face { font-family: "Lato MP"; src: url("../../../assets/produto/fonts/Lato-Light.ttf"); font-weight: 300; }
@page { size: 297mm 210mm; margin: 14mm 12mm 14mm 12mm;
  @bottom-left { content: "MÉTODO PARAGUAY  ·  ${esc(titulo).toUpperCase()}  ·  VERSÃO PDF"; font: 600 6.4pt "Noto Sans MP"; letter-spacing: 1.4pt; color: #8A8F86; }
  @bottom-right { content: counter(page) " / " counter(pages); font: 600 7pt "Noto Sans MP"; color: #B8995C; } }
* { box-sizing: border-box; } html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin: 0; font: 400 7.6pt/1.35 "Noto Sans MP", sans-serif; color: #1C2420; }
.capa { display: flex; gap: 10mm; align-items: center; border-bottom: 0.8pt solid #B8995C; padding-bottom: 5mm; margin-bottom: 5mm; }
.capa img { width: 18mm; } .capa .k { font: 650 6.8pt "Noto Sans MP"; letter-spacing: 2.2pt; text-transform: uppercase; color: #B8995C; }
.capa h1 { font: 300 20pt/1.1 "Lato MP"; text-transform: uppercase; color: #101A17; margin: 1mm 0 2mm; } .capa p { margin: 0; color: #5E6B65; font-size: 8.4pt; max-width: 210mm; }
.aviso { background: #FBF4E4; border-left: 1.4pt solid #C08B2C; padding: 2.4mm 3.4mm; font-size: 7.8pt; margin-bottom: 4mm; line-height: 1.5; }
.aba { break-before: page; } .aba:first-of-type { break-before: auto; }
.aba-t { font: 650 7pt "Noto Sans MP"; letter-spacing: 1.8pt; text-transform: uppercase; color: #B8995C; margin-bottom: 2mm; }
table { width: 100%; border-collapse: collapse; table-layout: fixed; } tr { break-inside: avoid; }
td { padding: 1mm 1.4mm; vertical-align: middle; overflow-wrap: anywhere; } td.in { box-shadow: inset 0 0 0 0.6pt #E3C77E; }
.grafico { break-inside: avoid; margin-top: 5mm; border: 0.5pt solid #D9D4C7; padding: 3mm 4mm; width: 60%; }
.gt { font-weight: 650; color: #101A17; margin-bottom: 2mm; } .gleg span { margin-right: 4mm; font-size: 7pt; } .gleg i { display: inline-block; width: 3mm; height: 3mm; margin-right: 1mm; vertical-align: -0.4mm; }
.gl { display: flex; gap: 3mm; align-items: center; margin: 1mm 0; } .gc { flex: 0 0 34%; text-align: right; color: #5E6B65; } .gb { flex: 1; }
.gbar { display: inline-block; height: 3mm; vertical-align: middle; border-radius: 0.6mm; min-width: 0.4mm; } .gv { font-size: 6.8pt; margin-left: 1.5mm; color: #1C2420; }
</style></head><body>
<div class="capa"><img src="../../../assets/produto/img/emblema.png" alt=""><div><div class="k">${esc(kicker)}</div><h1>${esc(titulo)}</h1><p>${esc(subtitulo)}</p></div></div>
<div class="aviso"><b>Versão PDF para consulta e impressão.</b> Mostra a planilha com o exemplo ilustrativo já calculado. Os campos com contorno dourado são os que você preenche. Para que os cálculos se atualizem automaticamente com os seus dados, use o arquivo XLSX correspondente (Excel ou Google Sheets). ${EDICAO.rotulo}.</div>
${abas}</body></html>`;
}
