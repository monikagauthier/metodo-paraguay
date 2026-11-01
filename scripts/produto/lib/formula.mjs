// Avaliador de fórmulas no estilo Excel (subconjunto usado nas planilhas do produto).
// Serve para (1) gravar valores em cache nas células e (2) testar as planilhas.

export const colToNum = (c) => c.split("").reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0);
export const numToCol = (n) => { let s = ""; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; };
export function parseRef(ref) {
  const m = /^\$?([A-Z]{1,3})\$?(\d+)$/.exec(ref);
  if (!m) throw new Error("Referência inválida: " + ref);
  return { c: colToNum(m[1]), r: Number(m[2]) };
}

class ErrorValue { constructor(code) { this.code = code; } toString() { return this.code; } }
export const ERR = { DIV0: new ErrorValue("#DIV/0!"), VALUE: new ErrorValue("#VALUE!"), REF: new ErrorValue("#REF!"), NA: new ErrorValue("#N/A"), NAME: new ErrorValue("#NAME?") };
export const isErr = (v) => v instanceof ErrorValue;

// ---------- Tokenizador ----------
function tokenize(src) {
  const t = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch)) { i++; continue; }
    if (ch === '"') { let j = i + 1, s = ""; while (j < src.length) { if (src[j] === '"' && src[j + 1] === '"') { s += '"'; j += 2; continue; } if (src[j] === '"') break; s += src[j++]; } t.push({ k: "str", v: s }); i = j + 1; continue; }
    if (ch === "'") { const j = src.indexOf("'!", i + 1); const sheet = src.slice(i + 1, j); i = j + 2; const m = /^\$?[A-Z]{1,3}\$?\d+(:\$?[A-Z]{1,3}\$?\d+)?/.exec(src.slice(i)); t.push({ k: "ref", sheet, v: m[0].replace(/\$/g, "") }); i += m[0].length; continue; }
    let m = /^[A-Za-z_][A-Za-z0-9_.]*!\$?[A-Z]{1,3}\$?\d+(:\$?[A-Z]{1,3}\$?\d+)?/.exec(src.slice(i));
    if (m) { const [sheet, r] = m[0].split("!"); t.push({ k: "ref", sheet, v: r.replace(/\$/g, "") }); i += m[0].length; continue; }
    m = /^\$?[A-Z]{1,3}\$?\d+(:\$?[A-Z]{1,3}\$?\d+)?(?![A-Za-z0-9_(])/.exec(src.slice(i));
    if (m) { t.push({ k: "ref", v: m[0].replace(/\$/g, "") }); i += m[0].length; continue; }
    m = /^\d+(\.\d+)?([eE][+-]?\d+)?/.exec(src.slice(i));
    if (m) { t.push({ k: "num", v: Number(m[0]) }); i += m[0].length; continue; }
    m = /^[A-Za-z_][A-Za-z0-9_.]*/.exec(src.slice(i));
    if (m) { const name = m[0].toUpperCase(); i += m[0].length; if (name === "TRUE" || name === "FALSE") t.push({ k: "bool", v: name === "TRUE" }); else t.push({ k: "fn", v: name }); continue; }
    m = /^(<>|<=|>=|[-+*/^&=<>(),;:%])/.exec(src.slice(i));
    if (m) { t.push({ k: "op", v: m[0] === ";" ? "," : m[0] }); i += m[0].length; continue; }
    throw new Error("Caractere inesperado na fórmula: " + src.slice(i));
  }
  return t;
}

// ---------- Parser (precedência estilo Excel) ----------
function parse(tokens) {
  let p = 0;
  const peek = () => tokens[p];
  const eat = (v) => { const tk = tokens[p]; if (v && (!tk || tk.v !== v)) throw new Error("Esperado " + v); p++; return tk; };
  const PREC = { "=": 1, "<>": 1, "<": 1, ">": 1, "<=": 1, ">=": 1, "&": 2, "+": 3, "-": 3, "*": 4, "/": 4, "^": 5 };
  function primary() {
    const tk = eat();
    if (!tk) throw new Error("Fórmula incompleta");
    if (tk.k === "num" || tk.k === "str" || tk.k === "bool") return { t: "lit", v: tk.v };
    if (tk.k === "ref") return { t: "ref", sheet: tk.sheet, v: tk.v };
    if (tk.k === "fn") { eat("("); const args = []; if (peek().v !== ")") { do { args.push(expr(0)); } while (peek().v === "," && eat(",")); } eat(")"); return { t: "fn", name: tk.v, args }; }
    if (tk.v === "(") { const e = expr(0); eat(")"); return e; }
    if (tk.v === "-") return { t: "neg", e: unary() };
    if (tk.v === "+") return unary();
    throw new Error("Token inesperado: " + tk.v);
  }
  function unary() { let e = primary(); while (peek() && peek().v === "%") { eat(); e = { t: "bin", op: "/", a: e, b: { t: "lit", v: 100 } }; } return e; }
  function expr(minP) {
    let a = unary();
    while (peek() && peek().k === "op" && PREC[peek().v] && PREC[peek().v] > minP) {
      const op = eat().v;
      const b = expr(op === "^" ? PREC[op] - 1 : PREC[op]);
      a = { t: "bin", op, a, b };
    }
    return a;
  }
  const e = expr(0);
  if (p < tokens.length) throw new Error("Sobrou texto na fórmula");
  return e;
}

const num = (v) => { if (isErr(v)) throw v; if (v === null || v === undefined || v === "") return 0; if (typeof v === "boolean") return v ? 1 : 0; if (typeof v === "number") return v; const n = Number(v); if (Number.isNaN(n)) throw ERR.VALUE; return n; };
const flat = (args) => args.flat(Infinity);
const truthy = (v) => { if (isErr(v)) throw v; return typeof v === "string" ? v.length > 0 && v.toUpperCase() !== "FALSE" : !!num(v); };
function criteria(crit) {
  if (typeof crit === "number") return (v) => v === crit;
  const m = /^(<=|>=|<>|<|>|=)?(.*)$/.exec(String(crit));
  const op = m[1] || "=", rhs = m[2], rn = Number(rhs), isN = rhs !== "" && !Number.isNaN(rn);
  return (v) => {
    if (isN && typeof v !== "number") return op === "<>";
    const L = isN ? (typeof v === "number" ? v : Number(v)) : String(v ?? "").toLowerCase();
    const R = isN ? rn : rhs.toLowerCase();
    switch (op) { case "=": return L === R; case "<>": return L !== R; case "<": return L < R; case ">": return L > R; case "<=": return L <= R; case ">=": return L >= R; }
  };
}

const FN = {
  SUM: (a) => flat(a).reduce((s, v) => s + (typeof v === "number" ? v : 0), 0),
  AVERAGE: (a) => { const n = flat(a).filter((v) => typeof v === "number"); if (!n.length) throw ERR.DIV0; return n.reduce((s, v) => s + v, 0) / n.length; },
  MIN: (a) => { const n = flat(a).filter((v) => typeof v === "number"); return n.length ? Math.min(...n) : 0; },
  MAX: (a) => { const n = flat(a).filter((v) => typeof v === "number"); return n.length ? Math.max(...n) : 0; },
  COUNT: (a) => flat(a).filter((v) => typeof v === "number").length,
  COUNTA: (a) => flat(a).filter((v) => v !== null && v !== undefined && v !== "").length,
  COUNTIF: ([r, c]) => flat([r]).filter(criteria(c)).length,
  SUMIF: ([r, c, s]) => { const R = flat([r]), S = flat([s ?? r]), f = criteria(c); return R.reduce((acc, v, i) => acc + (f(v) && typeof S[i] === "number" ? S[i] : 0), 0); },
  SUMPRODUCT: (a) => { const arrs = a.map((x) => flat([x])); return arrs[0].reduce((s, _, i) => s + arrs.reduce((p, arr) => p * (typeof arr[i] === "number" ? arr[i] : 0), 1), 0); },
  ROUND: ([v, d]) => { const f = 10 ** num(d); return Math.round(num(v) * f + Math.sign(num(v)) * 1e-9) / f; },
  ROUNDUP: ([v, d]) => { const f = 10 ** num(d); const x = num(v) * f; return (x < 0 ? -Math.ceil(-x - 1e-9) : Math.ceil(x - 1e-9)) / f; },
  ROUNDDOWN: ([v, d]) => { const f = 10 ** num(d); return Math.trunc(num(v) * f) / f; },
  ABS: ([v]) => Math.abs(num(v)),
  AND: (a) => flat(a).every(truthy),
  OR: (a) => flat(a).some(truthy),
  NOT: ([v]) => !truthy(v),
  INDEX: ([r, i, j]) => { const rows = r; if (Array.isArray(rows) && rows.length === 1 && j === undefined && Array.isArray(rows[0]) && rows[0].length > 1) return rows[0][num(i) - 1]; const row = rows[num(i) - 1]; if (!row) throw ERR.REF; return Array.isArray(row) ? row[(j ? num(j) : 1) - 1] : row; },
  MATCH: ([v, r, t]) => { const arr = flat([r]); const idx = arr.findIndex((x) => (typeof v === "string" ? String(x).toLowerCase() === v.toLowerCase() : x === v)); if (idx < 0) throw ERR.NA; return idx + 1; },
  CHOOSE: ([i, ...opts]) => opts[num(i) - 1],
  SUMIFS: ([s, ...pairs]) => { const S = flat([s]); const conds = []; for (let k = 0; k < pairs.length; k += 2) conds.push({ R: flat([pairs[k]]), f: criteria(pairs[k + 1]) }); return S.reduce((acc, v, i) => acc + (conds.every((c) => c.f(c.R[i])) && typeof v === "number" ? v : 0), 0); },
  COUNTIFS: (pairs) => { const conds = []; for (let k = 0; k < pairs.length; k += 2) conds.push({ R: flat([pairs[k]]), f: criteria(pairs[k + 1]) }); return conds[0].R.reduce((acc, _, i) => acc + (conds.every((c) => c.f(c.R[i])) ? 1 : 0), 0); },
  MONTH: ([d]) => { const dt = new Date(Date.UTC(1899, 11, 30) + num(d) * 86400000); return dt.getUTCMonth() + 1; },
  YEAR: ([d]) => { const dt = new Date(Date.UTC(1899, 11, 30) + num(d) * 86400000); return dt.getUTCFullYear(); },
  DATE: ([y, m, d]) => (Date.UTC(num(y), num(m) - 1, num(d)) - Date.UTC(1899, 11, 30)) / 86400000,
  ISBLANK: ([v]) => v === null || v === undefined || v === "",
};
const LAZY = {
  IF: (args, ev) => (truthy(ev(args[0])) ? ev(args[1]) : args.length > 2 ? ev(args[2]) : false),
  IFERROR: (args, ev) => { try { const v = ev(args[0]); if (isErr(v)) return ev(args[1]); return v; } catch (e) { if (isErr(e)) return ev(args[1]); throw e; } },
};

/**
 * Avalia todas as fórmulas de uma pasta de trabalho.
 * getCell(sheet, ref) -> {v} | {f}; retorna Map "sheet!REF" -> valor
 */
export function evaluateWorkbook(sheets) {
  const cache = new Map();
  const visiting = new Set();
  const astCache = new Map();
  function cellValue(sheet, ref) {
    const key = sheet + "!" + ref;
    if (cache.has(key)) return cache.get(key);
    const cell = sheets[sheet]?.get(ref);
    if (!cell) return null;
    if (cell.f === undefined) return cell.v ?? null;
    if (visiting.has(key)) throw new Error("Referência circular em " + key);
    visiting.add(key);
    let v;
    try {
      let ast = astCache.get(cell.f);
      if (!ast) { ast = parse(tokenize(cell.f.replace(/^=/, ""))); astCache.set(cell.f, ast); }
      v = ev(ast, sheet);
      if (Array.isArray(v)) v = flat([v])[0];
    } catch (e) {
      if (isErr(e)) v = e; else throw new Error(`Erro em ${key} (${cell.f}): ${e.message}`);
    }
    visiting.delete(key);
    cache.set(key, v);
    return v;
  }
  function range(sheet, r) {
    const [a, b] = r.split(":");
    const A = parseRef(a), B = parseRef(b);
    const rows = [];
    for (let rr = A.r; rr <= B.r; rr++) { const row = []; for (let cc = A.c; cc <= B.c; cc++) row.push(cellValue(sheet, numToCol(cc) + rr)); rows.push(row); }
    return rows;
  }
  function ev(n, sheet) {
    const E = (x) => ev(x, sheet);
    switch (n.t) {
      case "lit": return n.v;
      case "ref": { const s = n.sheet || sheet; if (!sheets[s]) throw ERR.REF; return n.v.includes(":") ? range(s, n.v) : cellValue(s, n.v); }
      case "neg": { const v = E(n.e); if (isErr(v)) throw v; return -num(v); }
      case "bin": {
        const a = E(n.a), b = E(n.b);
        if (isErr(a)) throw a; if (isErr(b)) throw b;
        switch (n.op) {
          case "+": return num(a) + num(b);
          case "-": return num(a) - num(b);
          case "*": return num(a) * num(b);
          case "/": { if (num(b) === 0) throw ERR.DIV0; return num(a) / num(b); }
          case "^": return num(a) ** num(b);
          case "&": return String(a ?? "") + String(b ?? "");
          default: {
            let A = a, B = b;
            if (A === null || A === undefined) A = typeof B === "string" ? "" : typeof B === "boolean" ? false : 0;
            if (B === null || B === undefined) B = typeof A === "string" ? "" : typeof A === "boolean" ? false : 0;
            const cmpA = typeof A === "string" ? A.toLowerCase() : A, cmpB = typeof B === "string" ? B.toLowerCase() : B;
            switch (n.op) { case "=": return cmpA === cmpB; case "<>": return cmpA !== cmpB; case "<": return cmpA < cmpB; case ">": return cmpA > cmpB; case "<=": return cmpA <= cmpB; case ">=": return cmpA >= cmpB; }
          }
        }
      }
      case "fn": {
        if (LAZY[n.name]) return LAZY[n.name](n.args, E);
        const f = FN[n.name];
        if (!f) throw new Error("Função não suportada: " + n.name);
        const args = n.args.map(E);
        for (const a of flat(args)) if (isErr(a) && !["COUNTA", "COUNT"].includes(n.name)) throw a;
        return f(args);
      }
    }
  }
  const out = new Map();
  for (const [s, cells] of Object.entries(sheets)) for (const [ref, c] of cells) if (c.f !== undefined) out.set(s + "!" + ref, cellValue(s, ref));
  return out;
}
