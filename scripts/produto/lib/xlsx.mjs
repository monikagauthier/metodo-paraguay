// Gravador XLSX sem dependências (SpreadsheetML), com estilos, fórmulas com valores em cache,
// validação de dados, proteção de planilha sem senha, células mescladas, congelamento e gráficos.
import { zipBuffer } from "./zip.mjs";
import { evaluateWorkbook, parseRef, numToCol, isErr } from "./formula.mjs";
import fs from "node:fs";

const x = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Paleta da marca (ARGB)
export const C = { verde: "FF101A17", verde2: "FF263D33", ouro: "FFB8995C", ouroClaro: "FFD8B76E", marfim: "FFF5F1E8", input: "FFFFF6D6", branco: "FFFFFFFF", cinza: "FF5E6B65", linha: "FFD9D4C7", ok: "FFDDEFD9", alerta: "FFFBE3C8", perigo: "FFF6D3CC", tinta: "FF1C2420" };

const FMT = { gs: '#,##0" Gs."', brl: '"R$" #,##0.00', usd: '"US$" #,##0.00', int: "#,##0", dec2: "#,##0.00", pct: "0.0%", data: "dd/mm/yyyy", rate: "#,##0.00", num4: "0.0000" };

/** Definição de estilos nomeados. */
const STYLES = {
  default: {},
  titulo: { font: { sz: 18, b: true, color: C.verde }, },
  subtitulo: { font: { sz: 10, color: C.cinza, i: true }, wrap: true },
  faixa: { font: { sz: 9, b: true, color: C.ouroClaro }, fill: C.verde },
  cab: { font: { sz: 10, b: true, color: C.marfim }, fill: C.verde, border: true, wrap: true, valign: "center" },
  rot: { font: { sz: 10, color: C.tinta }, border: true, wrap: true, valign: "center" },
  rotB: { font: { sz: 10, b: true, color: C.tinta }, border: true, wrap: true },
  nota: { font: { sz: 9, i: true, color: C.cinza }, wrap: true, valign: "top" },
  texto: { font: { sz: 10 }, wrap: true, valign: "top" },
  secao: { font: { sz: 12, b: true, color: C.verde2 }, bottomGold: true },
  // entradas (desbloqueadas)
  inTxt: { font: { sz: 10 }, fill: C.input, border: true, unlocked: true, wrap: true },
  inGs: { font: { sz: 10 }, fill: C.input, border: true, unlocked: true, fmt: FMT.gs },
  inBrl: { font: { sz: 10 }, fill: C.input, border: true, unlocked: true, fmt: FMT.brl },
  inUsd: { font: { sz: 10 }, fill: C.input, border: true, unlocked: true, fmt: FMT.usd },
  inInt: { font: { sz: 10 }, fill: C.input, border: true, unlocked: true, fmt: FMT.int, align: "center" },
  inDec: { font: { sz: 10 }, fill: C.input, border: true, unlocked: true, fmt: FMT.rate },
  inPct: { font: { sz: 10 }, fill: C.input, border: true, unlocked: true, fmt: FMT.pct },
  inData: { font: { sz: 10 }, fill: C.input, border: true, unlocked: true, fmt: FMT.data, align: "center" },
  // cálculos (bloqueados)
  cGs: { font: { sz: 10 }, border: true, fmt: FMT.gs, fill: "FFF7F5EF" },
  cBrl: { font: { sz: 10 }, border: true, fmt: FMT.brl, fill: "FFF7F5EF" },
  cUsd: { font: { sz: 10 }, border: true, fmt: FMT.usd, fill: "FFF7F5EF" },
  cInt: { font: { sz: 10 }, border: true, fmt: FMT.int, fill: "FFF7F5EF", align: "center" },
  cDec: { font: { sz: 10 }, border: true, fmt: FMT.dec2, fill: "FFF7F5EF" },
  cPct: { font: { sz: 10 }, border: true, fmt: FMT.pct, fill: "FFF7F5EF", align: "center" },
  cData: { font: { sz: 10 }, border: true, fmt: FMT.data, fill: "FFF7F5EF", align: "center" },
  cTxt: { font: { sz: 10 }, border: true, fill: "FFF7F5EF", wrap: true },
  tGs: { font: { sz: 11, b: true, color: C.verde }, border: true, fmt: FMT.gs, fill: C.marfim },
  tBrl: { font: { sz: 11, b: true, color: C.verde }, border: true, fmt: FMT.brl, fill: C.marfim },
  tUsd: { font: { sz: 11, b: true, color: C.verde }, border: true, fmt: FMT.usd, fill: C.marfim },
  tInt: { font: { sz: 11, b: true, color: C.verde }, border: true, fmt: FMT.int, fill: C.marfim, align: "center" },
  tDec: { font: { sz: 11, b: true, color: C.verde }, border: true, fmt: FMT.dec2, fill: C.marfim, align: "center" },
  tPct: { font: { sz: 11, b: true, color: C.verde }, border: true, fmt: FMT.pct, fill: C.marfim, align: "center" },
  tTxt: { font: { sz: 11, b: true, color: C.verde }, border: true, fill: C.marfim, wrap: true },
  kpiV: { font: { sz: 16, b: true, color: C.verde }, fill: C.marfim, fmt: FMT.brl, align: "center", border: true },
  kpiVGs: { font: { sz: 16, b: true, color: C.verde }, fill: C.marfim, fmt: FMT.gs, align: "center", border: true },
  kpiVInt: { font: { sz: 16, b: true, color: C.verde }, fill: C.marfim, fmt: "0.0", align: "center", border: true },
  kpiVPct: { font: { sz: 16, b: true, color: C.verde }, fill: C.marfim, fmt: FMT.pct, align: "center", border: true },
  kpiL: { font: { sz: 9, b: true, color: C.cinza }, align: "center", wrap: true },
  link: { font: { sz: 10, color: "FF6F5A2C", u: true } },
};

export class Sheet {
  constructor(wb, name, opts = {}) {
    this.wb = wb; this.name = name; this.opts = opts;
    this.cells = new Map(); this.merges = []; this.validations = []; this.charts = []; this.links = []; this.cond = [];
    this.cols = opts.cols || []; this.rowHeights = {};
  }
  set(ref, v, style = "default") {
    const cell = { s: style };
    if (v && typeof v === "object" && "f" in v) cell.f = v.f.replace(/^=/, "");
    else if (v instanceof Date) cell.v = (Date.UTC(v.getFullYear(), v.getMonth(), v.getDate()) - Date.UTC(1899, 11, 30)) / 86400000;
    else cell.v = v;
    this.cells.set(ref, cell);
    return this;
  }
  /** Linha a partir de uma célula: valores e estilos */
  row(ref, values, styles) {
    const { c, r } = parseRef(ref);
    values.forEach((v, i) => { if (v === undefined) return; this.set(numToCol(c + i) + r, v, Array.isArray(styles) ? styles[i] : styles); });
    return this;
  }
  merge(range) { this.merges.push(range); return this; }
  height(r, h) { this.rowHeights[r] = h; return this; }
  list(range, items) { this.validations.push({ type: "list", sqref: range, f1: `"${items.join(",")}"` }); return this; }
  listRef(range, ref) { this.validations.push({ type: "list", sqref: range, f1: ref }); return this; }
  decimal(range, min = 0, max = 1e15) { this.validations.push({ type: "decimal", sqref: range, op: "between", f1: String(min), f2: String(max) }); return this; }
  whole(range, min = 0, max = 1e9) { this.validations.push({ type: "whole", sqref: range, op: "between", f1: String(min), f2: String(max) }); return this; }
  date(range) { this.validations.push({ type: "date", sqref: range, op: "greaterThan", f1: "36526" }); return this; }
  link(ref, url, text) { this.set(ref, text || url, "link"); this.links.push({ ref, url }); return this; }
  chart(def) { def._sheet = this; this.charts.push(def); return this; }
  /** Formatação condicional: cor de fundo conforme expressão */
  condFill(range, formula, color) { this.cond.push({ range, formula, color }); return this; }
}

export class Workbook {
  constructor(meta = {}) { this.sheets = []; this.meta = meta; this.names = []; }
  sheet(name, opts) { const s = new Sheet(this, name, opts); this.sheets.push(s); return s; }
  defineName(name, ref) { this.names.push({ name, ref }); }

  evaluate() {
    const map = {};
    for (const s of this.sheets) map[s.name] = s.cells;
    return evaluateWorkbook(map);
  }

  build() {
    const values = this.evaluate();
    // ---- estilos ----
    const fonts = ['<font><sz val="10"/><name val="Calibri"/><family val="2"/></font>'];
    const fills = ['<fill><patternFill patternType="none"/></fill>', '<fill><patternFill patternType="gray125"/></fill>'];
    const borders = ['<border><left/><right/><top/><bottom/><diagonal/></border>',
      `<border><left style="thin"><color rgb="${C.linha}"/></left><right style="thin"><color rgb="${C.linha}"/></right><top style="thin"><color rgb="${C.linha}"/></top><bottom style="thin"><color rgb="${C.linha}"/></bottom><diagonal/></border>`,
      `<border><left/><right/><top/><bottom style="medium"><color rgb="${C.ouro}"/></bottom><diagonal/></border>`];
    const numFmts = [];
    const xfs = ['<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'];
    const styleIdx = {};
    const dxfs = [];
    for (const [name, st] of Object.entries(STYLES)) {
      if (name === "default") { styleIdx[name] = 0; continue; }
      const f = st.font || {};
      fonts.push(`<font>${f.b ? "<b/>" : ""}${f.i ? "<i/>" : ""}${f.u ? '<u/>' : ""}<sz val="${f.sz || 10}"/>${f.color ? `<color rgb="${f.color}"/>` : ""}<name val="Calibri"/><family val="2"/></font>`);
      let fillId = 0;
      if (st.fill) { fills.push(`<fill><patternFill patternType="solid"><fgColor rgb="${st.fill}"/><bgColor indexed="64"/></patternFill></fill>`); fillId = fills.length - 1; }
      let fmtId = 0;
      if (st.fmt) { let i = numFmts.findIndex((n) => n === st.fmt); if (i < 0) { numFmts.push(st.fmt); i = numFmts.length - 1; } fmtId = 164 + i; }
      const borderId = st.border ? 1 : st.bottomGold ? 2 : 0;
      const align = (st.wrap || st.align || st.valign) ? `<alignment${st.align ? ` horizontal="${st.align}"` : ""} vertical="${st.valign || "center"}"${st.wrap ? ' wrapText="1"' : ""}/>` : "";
      const prot = st.unlocked ? '<protection locked="0"/>' : "";
      xfs.push(`<xf numFmtId="${fmtId}" fontId="${fonts.length - 1}" fillId="${fillId}" borderId="${borderId}" xfId="0"${fmtId ? ' applyNumberFormat="1"' : ""} applyFont="1"${fillId ? ' applyFill="1"' : ""}${borderId ? ' applyBorder="1"' : ""}${align ? ' applyAlignment="1"' : ""}${prot ? ' applyProtection="1"' : ""}>${align}${prot}</xf>`);
      styleIdx[name] = xfs.length - 1;
    }
    const dxfColors = [...new Set(this.sheets.flatMap((s) => s.cond.map((c) => c.color)))];
    for (const col of dxfColors) dxfs.push(`<dxf><fill><patternFill patternType="solid"><fgColor rgb="${col}"/><bgColor rgb="${col}"/></patternFill></fill></dxf>`);
    const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">${numFmts.length ? `<numFmts count="${numFmts.length}">${numFmts.map((f, i) => `<numFmt numFmtId="${164 + i}" formatCode="${x(f)}"/>`).join("")}</numFmts>` : ""}<fonts count="${fonts.length}">${fonts.join("")}</fonts><fills count="${fills.length}">${fills.join("")}</fills><borders count="${borders.length}">${borders.join("")}</borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="${xfs.length}">${xfs.join("")}</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles><dxfs count="${dxfs.length}">${dxfs.join("")}</dxfs></styleSheet>`;

    // ---- strings compartilhadas ----
    const sst = []; const sstIdx = new Map();
    const si = (s) => { if (!sstIdx.has(s)) { sstIdx.set(s, sst.length); sst.push(s); } return sstIdx.get(s); };

    const files = [];
    const sheetRels = [];
    let chartN = 0, drawingN = 0;
    const contentOverrides = [];
    this.sheets.forEach((s, idx) => {
      const n = idx + 1;
      const rows = new Map();
      for (const [ref, cell] of s.cells) { const { r, c } = parseRef(ref); if (!rows.has(r)) rows.set(r, []); rows.get(r).push({ ref, c, cell }); }
      const rowXml = [...rows.keys()].sort((a, b) => a - b).map((r) => {
        const cells = rows.get(r).sort((a, b) => a.c - b.c).map(({ ref, cell }) => {
          const sIdx = styleIdx[cell.s] ?? 0;
          if (cell.f !== undefined) {
            const v = values.get(s.name + "!" + ref);
            if (isErr(v)) return `<c r="${ref}" s="${sIdx}" t="e"><f>${x(cell.f)}</f><v>${x(v.code)}</v></c>`;
            if (typeof v === "string") return `<c r="${ref}" s="${sIdx}" t="str"><f>${x(cell.f)}</f><v>${x(v)}</v></c>`;
            if (typeof v === "boolean") return `<c r="${ref}" s="${sIdx}" t="b"><f>${x(cell.f)}</f><v>${v ? 1 : 0}</v></c>`;
            return `<c r="${ref}" s="${sIdx}"><f>${x(cell.f)}</f>${v === null || v === undefined ? "<v>0</v>" : `<v>${v}</v>`}</c>`;
          }
          const v = cell.v;
          if (v === null || v === undefined || v === "") return `<c r="${ref}" s="${sIdx}"/>`;
          if (typeof v === "number") return `<c r="${ref}" s="${sIdx}"><v>${v}</v></c>`;
          if (typeof v === "boolean") return `<c r="${ref}" s="${sIdx}" t="b"><v>${v ? 1 : 0}</v></c>`;
          if (v instanceof Date) { const serial = (Date.UTC(v.getFullYear(), v.getMonth(), v.getDate()) - Date.UTC(1899, 11, 30)) / 86400000; return `<c r="${ref}" s="${sIdx}"><v>${serial}</v></c>`; }
          return `<c r="${ref}" s="${sIdx}" t="s"><v>${si(String(v))}</v></c>`;
        }).join("");
        const h = s.rowHeights[r];
        return `<row r="${r}"${h ? ` ht="${h}" customHeight="1"` : ""}>${cells}</row>`;
      }).join("");
      const cols = s.cols.length ? `<cols>${s.cols.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join("")}</cols>` : "";
      const freeze = s.opts.freeze ? (() => { const { r, c } = parseRef(s.opts.freeze); const xs = c - 1, ys = r - 1; return `<pane${xs ? ` xSplit="${xs}"` : ""}${ys ? ` ySplit="${ys}"` : ""} topLeftCell="${s.opts.freeze}" activePane="${xs && ys ? "bottomRight" : ys ? "bottomLeft" : "topRight"}" state="frozen"/>`; })() : "";
      const sheetView = `<sheetViews><sheetView workbookViewId="0"${s.opts.grid === false ? ' showGridLines="0"' : ""}${idx === 0 ? ' tabSelected="1"' : ""} zoomScale="${s.opts.zoom || 100}">${freeze}</sheetView></sheetViews>`;
      const prot = s.opts.protect === false ? "" : '<sheetProtection sheet="1" objects="1" scenarios="1" formatCells="0" formatColumns="0" formatRows="0" insertRows="1" deleteRows="1" sort="0" autoFilter="0" selectLockedCells="0" selectUnlockedCells="0"/>';
      const merges = s.merges.length ? `<mergeCells count="${s.merges.length}">${s.merges.map((m) => `<mergeCell ref="${m}"/>`).join("")}</mergeCells>` : "";
      const condXml = s.cond.map((c, i) => `<conditionalFormatting sqref="${c.range}"><cfRule type="expression" dxfId="${dxfColors.indexOf(c.color)}" priority="${i + 1}"><formula>${x(c.formula)}</formula></cfRule></conditionalFormatting>`).join("");
      const dv = s.validations.length ? `<dataValidations count="${s.validations.length}">${s.validations.map((v) => `<dataValidation type="${v.type}"${v.op ? ` operator="${v.op}"` : ""} allowBlank="1" showInputMessage="1" showErrorMessage="1" errorTitle="Valor inválido" error="${v.type === "list" ? "Escolha uma opção da lista." : "Digite um número válido (não negativo)."}" sqref="${v.sqref}"><formula1>${x(v.f1)}</formula1>${v.f2 ? `<formula2>${v.f2}</formula2>` : ""}</dataValidation>`).join("")}</dataValidations>` : "";
      const rels = [];
      const hyper = s.links.length ? `<hyperlinks>${s.links.map((l, i) => { rels.push(`<Relationship Id="rIdL${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${x(l.url)}" TargetMode="External"/>`); return `<hyperlink ref="${l.ref}" r:id="rIdL${i + 1}"/>`; }).join("")}</hyperlinks>` : "";
      let drawing = "";
      if (s.charts.length) {
        drawingN++;
        rels.push(`<Relationship Id="rIdD1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing${drawingN}.xml"/>`);
        drawing = '<drawing r:id="rIdD1"/>';
        const anchors = []; const drels = [];
        s.charts.forEach((ch, k) => {
          chartN++;
          drels.push(`<Relationship Id="rIdC${k + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="../charts/chart${chartN}.xml"/>`);
          const [fc, fr] = ch.from, [tc, tr] = ch.to;
          anchors.push(`<xdr:twoCellAnchor><xdr:from><xdr:col>${fc}</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>${fr}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from><xdr:to><xdr:col>${tc}</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>${tr}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:to><xdr:graphicFrame macro=""><xdr:nvGraphicFramePr><xdr:cNvPr id="${k + 2}" name="Gráfico ${k + 1}"/><xdr:cNvGraphicFramePr/></xdr:nvGraphicFramePr><xdr:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/></xdr:xfrm><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart"><c:chart xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" r:id="rIdC${k + 1}"/></a:graphicData></a:graphic></xdr:graphicFrame><xdr:clientData/></xdr:twoCellAnchor>`);
          files.push({ name: `xl/charts/chart${chartN}.xml`, data: chartXml(ch, s.name, values) });
          contentOverrides.push(`<Override PartName="/xl/charts/chart${chartN}.xml" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>`);
        });
        files.push({ name: `xl/drawings/drawing${drawingN}.xml`, data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">${anchors.join("")}</xdr:wsDr>` });
        files.push({ name: `xl/drawings/_rels/drawing${drawingN}.xml.rels`, data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${drels.join("")}</Relationships>` });
        contentOverrides.push(`<Override PartName="/xl/drawings/drawing${drawingN}.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>`);
      }
      const tab = s.opts.tab ? `<sheetPr><tabColor rgb="${s.opts.tab}"/></sheetPr>` : "";
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">${tab}${sheetView}<sheetFormatPr defaultRowHeight="16"/>${cols}<sheetData>${rowXml}</sheetData>${prot}${merges}${condXml}${dv}${hyper}<pageMargins left="0.5" right="0.5" top="0.6" bottom="0.6" header="0.3" footer="0.3"/><pageSetup paperSize="9" orientation="${s.opts.landscape ? "landscape" : "portrait"}" fitToHeight="0"/>${drawing}</worksheet>`;
      files.push({ name: `xl/worksheets/sheet${n}.xml`, data: xml });
      if (rels.length) files.push({ name: `xl/worksheets/_rels/sheet${n}.xml.rels`, data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${rels.join("")}</Relationships>` });
      sheetRels.push(`<Relationship Id="rId${n}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${n}.xml"/>`);
    });

    const N = this.sheets.length;
    const definedNames = this.names.length ? `<definedNames>${this.names.map((d) => `<definedName name="${d.name}">${x(d.ref)}</definedName>`).join("")}</definedNames>` : "";
    files.unshift(
      { name: "[Content_Types].xml", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${this.sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("")}<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>${contentOverrides.join("")}</Types>` },
      { name: "_rels/.rels", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>` },
      { name: "docProps/core.xml", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${x(this.meta.title || "")}</dc:title><dc:creator>Método Paraguay</dc:creator><dc:description>${x(this.meta.description || "")}</dc:description><dcterms:created xsi:type="dcterms:W3CDTF">2026-11-01T12:00:00Z</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">2026-11-01T12:00:00Z</dcterms:modified></cp:coreProperties>` },
      { name: "docProps/app.xml", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>Método Paraguay</Application><Company>Método Paraguay</Company></Properties>` },
      { name: "xl/workbook.xml", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><workbookPr date1904="0"/><bookViews><workbookView xWindow="0" yWindow="0" windowWidth="28800" windowHeight="16000" activeTab="0"/></bookViews><sheets>${this.sheets.map((s, i) => `<sheet name="${x(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("")}</sheets>${definedNames}<calcPr calcId="191029" fullCalcOnLoad="1"/></workbook>` },
      { name: "xl/_rels/workbook.xml.rels", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheetRels.join("")}<Relationship Id="rId${N + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId${N + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/></Relationships>` },
      { name: "xl/styles.xml", data: stylesXml },
    );
    files.push({ name: "xl/sharedStrings.xml", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${sst.length}" uniqueCount="${sst.length}">${sst.map((s) => `<si><t xml:space="preserve">${x(s)}</t></si>`).join("")}</sst>` });
    return { buffer: zipBuffer(files), values };
  }

  save(path) { const { buffer, values } = this.build(); fs.writeFileSync(path, buffer); return values; }
}

function chartXml(ch, sheetName, values) {
  const q = (r) => `'${sheetName.replace(/'/g, "''")}'!${r.replace(/([A-Z]+)(\d+)/g, "$$$1$$$2")}`;
  const cache = (range, isNum) => {
    const [a, b] = range.split(":"); const A = parseRef(a), B = parseRef(b || a);
    const pts = []; let k = 0;
    for (let r = A.r; r <= B.r; r++) for (let c = A.c; c <= B.c; c++) {
      const ref = numToCol(c) + r; const cell = ch._sheet?.cells?.get(ref);
      let v = values.get(sheetName + "!" + ref);
      if (v === undefined) v = cell ? cell.v : "";
      pts.push(`<c:pt idx="${k++}"><c:v>${x(isNum ? Number(v) || 0 : v ?? "")}</c:v></c:pt>`);
    }
    return isNum ? `<c:numCache><c:formatCode>General</c:formatCode><c:ptCount val="${k}"/>${pts.join("")}</c:numCache>` : `<c:strCache><c:ptCount val="${k}"/>${pts.join("")}</c:strCache>`;
  };
  const colors = ["101A17", "B8995C", "3B5A4C", "D8B76E", "7A8B83", "E6D5A8", "263D33", "9C7F45"];
  const series = ch.series.map((s, i) => `<c:ser><c:idx val="${i}"/><c:order val="${i}"/><c:tx><c:v>${x(s.name)}</c:v></c:tx>${ch.type === "pie" ? ch.series[0] && `${ch._pts ? "" : ""}` : `<c:spPr><a:solidFill><a:srgbClr val="${colors[i % colors.length]}"/></a:solidFill></c:spPr>`}${ch.type === "pie" ? Array.from({ length: 12 }, (_, k) => `<c:dPt><c:idx val="${k}"/><c:bubble3D val="0"/><c:spPr><a:solidFill><a:srgbClr val="${colors[k % colors.length]}"/></a:solidFill></c:spPr></c:dPt>`).join("") : ""}<c:cat><c:strRef><c:f>${q(ch.cats)}</c:f>${cache(ch.cats, false)}</c:strRef></c:cat><c:val><c:numRef><c:f>${q(s.vals)}</c:f>${cache(s.vals, true)}</c:numRef></c:val></c:ser>`).join("");
  const plot = ch.type === "pie"
    ? `<c:pieChart><c:varyColors val="1"/>${series}<c:firstSliceAng val="0"/></c:pieChart>`
    : `<c:barChart><c:barDir val="${ch.type === "bar" ? "bar" : "col"}"/><c:grouping val="clustered"/><c:varyColors val="0"/>${series}<c:gapWidth val="80"/><c:axId val="1001"/><c:axId val="1002"/></c:barChart><c:catAx><c:axId val="1001"/><c:scaling><c:orientation val="${ch.type === "bar" ? "maxMin" : "minMax"}"/></c:scaling><c:delete val="0"/><c:axPos val="${ch.type === "bar" ? "l" : "b"}"/><c:numFmt formatCode="General" sourceLinked="0"/><c:tickLblPos val="nextTo"/><c:crossAx val="1002"/><c:crosses val="autoZero"/><c:auto val="1"/><c:lblAlgn val="ctr"/><c:lblOffset val="100"/></c:catAx><c:valAx><c:axId val="1002"/><c:scaling><c:orientation val="minMax"/></c:scaling><c:delete val="0"/><c:axPos val="${ch.type === "bar" ? "b" : "l"}"/><c:majorGridlines><c:spPr><a:ln w="3175"><a:solidFill><a:srgbClr val="E5E1D6"/></a:solidFill></a:ln></c:spPr></c:majorGridlines><c:numFmt formatCode="#,##0" sourceLinked="0"/><c:tickLblPos val="nextTo"/><c:crossAx val="1001"/><c:crosses val="autoZero"/><c:crossBetween val="between"/></c:valAx>`;
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><c:roundedCorners val="0"/><c:chart><c:title><c:tx><c:rich><a:bodyPr/><a:p><a:pPr><a:defRPr sz="1200" b="1"><a:solidFill><a:srgbClr val="101A17"/></a:solidFill></a:defRPr></a:pPr><a:r><a:rPr lang="pt-BR" sz="1200" b="1"><a:solidFill><a:srgbClr val="101A17"/></a:solidFill></a:rPr><a:t>${x(ch.title)}</a:t></a:r></a:p></c:rich></c:tx><c:overlay val="0"/></c:title><c:autoTitleDeleted val="0"/><c:plotArea><c:layout/>${plot}</c:plotArea><c:legend><c:legendPos val="b"/><c:overlay val="0"/></c:legend><c:plotVisOnly val="1"/><c:dispBlanksAs val="gap"/></c:chart></c:chartSpace>`;
}
