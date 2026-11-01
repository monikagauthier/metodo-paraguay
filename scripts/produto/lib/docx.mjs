// Gravador DOCX mínimo (WordprocessingML) com estilos da marca, listas, tabelas,
// campos destacados para preenchimento e rodapé.
import { zipBuffer } from "./zip.mjs";
import fs from "node:fs";

const x = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Converte texto com [campos] e **negrito** em runs. Campos entre colchetes ficam destacados. */
function runs(text, base = {}) {
  const out = [];
  const re = /(\*\*[^*]+\*\*|\[[^\]]+\])/g;
  let last = 0, m;
  const run = (t, o = {}) => {
    const rpr = [o.b || base.b ? "<w:b/>" : "", o.i || base.i ? "<w:i/>" : "", base.color ? `<w:color w:val="${base.color}"/>` : o.color ? `<w:color w:val="${o.color}"/>` : "", base.sz ? `<w:sz w:val="${base.sz}"/>` : "", o.hl ? '<w:shd w:val="clear" w:color="auto" w:fill="FFF6D6"/>' : ""].join("");
    out.push(`<w:r>${rpr ? `<w:rPr>${rpr}</w:rPr>` : ""}<w:t xml:space="preserve">${x(t)}</w:t></w:r>`);
  };
  while ((m = re.exec(text))) {
    if (m.index > last) run(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) run(tok.slice(2, -2), { b: true });
    else run(tok, { hl: true, color: "6F5A2C" });
    last = m.index + tok.length;
  }
  if (last < text.length) run(text.slice(last));
  return out.join("");
}

const h = (t) => x(t).replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>").replace(/(\[[^\]]+\])/g, '<span class="campo">$1</span>');

export class Docx {
  constructor(meta = {}) { this.meta = meta; this.body = []; this.html = []; }
  p(text, style = "Normal", opts = {}) {
    const ppr = `<w:pPr><w:pStyle w:val="${style}"/>${opts.keepNext ? "<w:keepNext/>" : ""}${opts.align ? `<w:jc w:val="${opts.align}"/>` : ""}</w:pPr>`;
    this.body.push(`<w:p>${ppr}${runs(text, opts)}</w:p>`);
    const tag = { Title: "h1", Subtitle: "p class=\"sub\"", Heading1: "h2", Heading2: "h3", Nota: "p class=\"nota\"" }[style] || "p";
    this.html.push(`<${tag}>${h(text)}</${tag.split(" ")[0]}>`); return this;
  }
  title(t) { return this.p(t, "Title"); }
  sub(t) { return this.p(t, "Subtitle"); }
  h1(t) { return this.p(t, "Heading1"); }
  h2(t) { return this.p(t, "Heading2"); }
  note(t) { return this.p(t, "Nota"); }
  bullets(items) { this.html.push(`<ul>${items.map((t) => `<li>${h(t)}</li>`).join("")}</ul>`); for (const t of items) this.body.push(`<w:p><w:pPr><w:pStyle w:val="ListParagraph"/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr>${runs(t)}</w:p>`); return this; }
  numbered(items) { this.html.push(`<ol>${items.map((t) => `<li>${h(t)}</li>`).join("")}</ol>`); for (const t of items) this.body.push(`<w:p><w:pPr><w:pStyle w:val="ListParagraph"/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="2"/></w:numPr></w:pPr>${runs(t)}</w:p>`); return this; }
  pageBreak() { this.html.push('<div style="break-before:page"></div>'); this.body.push('<w:p><w:r><w:br w:type="page"/></w:r></w:p>'); return this; }
  rule() { this.html.push('<hr>'); this.body.push('<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="B8995C"/></w:pBdr><w:spacing w:after="120"/></w:pPr></w:p>'); return this; }
  /** rows: array de arrays; header: primeira linha é cabeçalho; widths em twips */
  table(rows, { header = true, widths } = {}) {
    this.html.push(`<table>${rows.map((r, i) => `<tr>${r.map((c) => (i === 0 && header ? `<th>${h(String(c ?? ""))}</th>` : `<td>${h(String(c ?? ""))}</td>`)).join("")}</tr>`).join("")}</table>`);
    const cols = rows[0].length;
    const total = 9360;
    const w = widths || Array(cols).fill(Math.floor(total / cols));
    const grid = `<w:tblGrid>${w.map((v) => `<w:gridCol w:w="${v}"/>`).join("")}</w:tblGrid>`;
    const tr = rows.map((r, i) => `<w:tr>${i === 0 && header ? "<w:trPr><w:tblHeader/></w:trPr>" : ""}${r.map((c, k) => {
      const hd = i === 0 && header;
      return `<w:tc><w:tcPr><w:tcW w:w="${w[k]}" w:type="dxa"/>${hd ? '<w:shd w:val="clear" w:color="auto" w:fill="101A17"/>' : i % 2 === 0 ? '<w:shd w:val="clear" w:color="auto" w:fill="FAF8F3"/>' : ""}</w:tcPr><w:p><w:pPr><w:pStyle w:val="Tabela"/></w:pPr>${runs(String(c ?? ""), hd ? { b: true, color: "F2EBDA" } : {})}</w:p></w:tc>`;
    }).join("")}</w:tr>`).join("");
    this.body.push(`<w:tbl><w:tblPr><w:tblW w:w="${total}" w:type="dxa"/><w:tblBorders><w:top w:val="single" w:sz="4" w:color="D9D4C7"/><w:left w:val="single" w:sz="4" w:color="D9D4C7"/><w:bottom w:val="single" w:sz="4" w:color="D9D4C7"/><w:right w:val="single" w:sz="4" w:color="D9D4C7"/><w:insideH w:val="single" w:sz="4" w:color="D9D4C7"/><w:insideV w:val="single" w:sz="4" w:color="D9D4C7"/></w:tblBorders><w:tblCellMar><w:top w:w="60" w:type="dxa"/><w:left w:w="100" w:type="dxa"/><w:bottom w:w="60" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tblCellMar></w:tblPr>${grid}${tr}</w:tbl>`);
    this.body.push('<w:p><w:pPr><w:spacing w:after="60"/></w:pPr></w:p>');
    return this;
  }

  htmlDoc() {
    return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${x(this.meta.title || "")}</title><style>
@font-face { font-family: "Noto Sans MP"; src: url("../../../assets/produto/fonts/NotoSans-VF.ttf"); font-weight: 100 900; }
@font-face { font-family: "Lato MP"; src: url("../../../assets/produto/fonts/Lato-Light.ttf"); font-weight: 300; }
@page { size: 210mm 297mm; margin: 20mm 20mm 20mm 20mm; @bottom-left { content: "MÉTODO PARAGUAY  ·  ${x(this.meta.rodape || "")}  ·  VERSÃO PDF"; font: 600 6.4pt "Noto Sans MP"; letter-spacing: 1.4pt; color: #8A8F86; } @bottom-right { content: counter(page); font: 600 7.5pt "Noto Sans MP"; color: #B8995C; } }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; } body { margin: 0; font: 400 10pt/1.55 "Noto Sans MP", sans-serif; color: #1C2420; }
h1 { font: 300 24pt/1.15 "Lato MP"; color: #101A17; margin: 4mm 0 2mm; } .sub { color: #5E6B65; font-size: 10.5pt; } .nota { font-style: italic; color: #5E6B65; font-size: 8.6pt; }
h2 { font-size: 13pt; color: #101A17; border-bottom: 0.8pt solid #B8995C; padding-bottom: 1.4mm; margin: 7mm 0 3mm; break-after: avoid; } h3 { font-size: 11pt; color: #263D33; margin: 5mm 0 1.5mm; break-after: avoid; }
hr { border: 0; border-top: 0.8pt solid #B8995C; margin: 4mm 0; } li { margin-bottom: 1.2mm; } li::marker { color: #B8995C; }
table { width: 100%; border-collapse: collapse; margin: 2mm 0 4mm; font-size: 9pt; } th { background: #101A17; color: #F2EBDA; text-align: left; padding: 1.8mm 2.2mm; font-weight: 600; } td { border: 0.4pt solid #D9D4C7; padding: 1.8mm 2.2mm; vertical-align: top; } tr { break-inside: avoid; }
.campo { background: #FFF6D6; color: #6F5A2C; padding: 0 0.6mm; border-radius: 0.6mm; }
.topo { display: flex; justify-content: space-between; align-items: center; border-bottom: 0.5pt solid #D9D4C7; padding-bottom: 3mm; margin-bottom: 4mm; font: 650 6.8pt "Noto Sans MP"; letter-spacing: 2pt; text-transform: uppercase; color: #B8995C; } .topo img { height: 12mm; }
.aviso { background: #FBF4E4; border-left: 1.4pt solid #C08B2C; padding: 2.4mm 3.4mm; font-size: 8.4pt; margin-bottom: 4mm; }
</style></head><body><div class="topo"><span>Método Paraguay · Modelo editável · versão PDF</span><img src="../../../assets/produto/img/emblema.png" alt=""></div>
<div class="aviso"><b>Versão PDF para leitura e impressão.</b> Os trechos destacados entre colchetes são os campos a preencher. Para editar no computador, use o arquivo DOCX correspondente (Word, Google Docs ou LibreOffice).</div>
${this.html.join("\n")}</body></html>`;
  }

  save(path) {
    const font = "Calibri";
    const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="${font}" w:hAnsi="${font}" w:eastAsia="${font}" w:cs="${font}"/><w:color w:val="1C2420"/><w:sz w:val="21"/><w:szCs w:val="21"/><w:lang w:val="pt-BR"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>
<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:after="60"/></w:pPr><w:rPr><w:color w:val="101A17"/><w:spacing w:val="10"/><w:sz w:val="44"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:basedOn w:val="Normal"/><w:qFormat/><w:rPr><w:color w:val="5E6B65"/><w:sz w:val="22"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="2" w:color="B8995C"/></w:pBdr><w:spacing w:before="320" w:after="120"/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:color w:val="101A17"/><w:sz w:val="28"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="200" w:after="80"/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:b/><w:color w:val="263D33"/><w:sz w:val="23"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="ListParagraph"><w:name w:val="List Paragraph"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="60"/><w:ind w:left="720"/></w:pPr></w:style>
<w:style w:type="paragraph" w:styleId="Tabela"><w:name w:val="Tabela"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr><w:rPr><w:sz w:val="19"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Nota"><w:name w:val="Nota"/><w:basedOn w:val="Normal"/><w:rPr><w:i/><w:color w:val="5E6B65"/><w:sz w:val="18"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Rodape"><w:name w:val="footer"/><w:basedOn w:val="Normal"/><w:rPr><w:color w:val="8A8F86"/><w:spacing w:val="20"/><w:sz w:val="16"/></w:rPr></w:style>
</w:styles>`;
    const numbering = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:abstractNum w:abstractNumId="0"><w:multiLevelType w:val="hybridMultilevel"/><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="•"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr><w:rPr><w:color w:val="B8995C"/></w:rPr></w:lvl></w:abstractNum><w:abstractNum w:abstractNumId="1"><w:multiLevelType w:val="hybridMultilevel"/><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="decimal"/><w:lvlText w:val="%1."/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr></w:lvl></w:abstractNum><w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num><w:num w:numId="2"><w:abstractNumId w:val="1"/></w:num></w:numbering>`;
    const footer = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:pPr><w:pStyle w:val="Rodape"/><w:tabs><w:tab w:val="right" w:pos="9360"/></w:tabs></w:pPr><w:r><w:t xml:space="preserve">MÉTODO PARAGUAY · ${x(this.meta.rodape || "")}</w:t></w:r><w:r><w:tab/></w:r><w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:t>1</w:t></w:r><w:r><w:fldChar w:fldCharType="end"/></w:r></w:p></w:ftr>`;
    const doc = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>${this.body.join("")}<w:sectPr><w:footerReference w:type="default" r:id="rId3"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1300" w:right="1270" w:bottom="1300" w:left="1270" w:header="700" w:footer="600" w:gutter="0"/></w:sectPr></w:body></w:document>`;
    const files = [
      { name: "[Content_Types].xml", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>` },
      { name: "_rels/.rels", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>` },
      { name: "docProps/core.xml", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${x(this.meta.title || "")}</dc:title><dc:creator>Método Paraguay</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">2026-11-01T12:00:00Z</dcterms:created></cp:coreProperties>` },
      { name: "docProps/app.xml", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>Método Paraguay</Application></Properties>` },
      { name: "word/document.xml", data: doc },
      { name: "word/styles.xml", data: styles },
      { name: "word/numbering.xml", data: numbering },
      { name: "word/footer1.xml", data: footer },
      { name: "word/_rels/document.xml.rels", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/></Relationships>` },
    ];
    fs.writeFileSync(path, zipBuffer(files));
  }
}
