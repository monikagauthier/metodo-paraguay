// Conversor Markdown -> HTML sem dependências, com o dialeto do Método Paraguay.
// Suporta: títulos, parágrafos, listas (ordenadas, não ordenadas, checklists),
// tabelas GFM, citações e callouts (> [!tipo]), blocos :::fluxo, negrito,
// itálico, código inline e links.
import fs from "node:fs";
import path from "node:path";

export const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function slug(s) {
  return String(s)
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function inline(s) {
  let out = esc(s);
  out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, u) => {
    const ext = /^https?:/.test(u);
    return `<a href="${u}"${ext ? ' target="_blank" rel="noopener"' : ""}>${t}</a>`;
  });
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>");
  return out;
}

const CALLOUTS = {
  atencao: "Atenção",
  verificar: "Verificar na fonte oficial",
  dica: "Dica prática",
  exemplo: "Exemplo",
  importante: "Importante",
  legal: "Informação geral, não é orientação profissional",
};

/** Converte um trecho markdown em HTML. opts.idPrefix para âncoras únicas. */
export function mdToHtml(src, opts = {}) {
  const lines = src.replace(/\r/g, "").split("\n");
  const out = [];
  let i = 0;
  const pfx = opts.idPrefix || "";
  const headings = [];
  let checkCounter = 0;

  const isBlockStart = (l) =>
    /^#{1,6}\s/.test(l) || /^\s*[-*]\s/.test(l) || /^\s*\d+[.)]\s/.test(l) || /^\|/.test(l) || /^>/.test(l) || /^:::/.test(l) || /^---\s*$/.test(l);

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    // Títulos
    let m = /^(#{1,6})\s+(.*)$/.exec(line);
    if (m) {
      const lvl = m[1].length, text = m[2].trim();
      const id = pfx + slug(text);
      headings.push({ lvl, text, id });
      out.push(`<h${lvl} id="${id}">${inline(text)}</h${lvl}>`);
      i++; continue;
    }

    // Régua
    if (/^---\s*$/.test(line)) { out.push("<hr>"); i++; continue; }

    // Fluxograma
    m = /^:::fluxo\s*(.*)$/.exec(line);
    if (m) {
      const title = m[1].trim();
      const steps = [];
      i++;
      while (i < lines.length && !/^:::\s*$/.test(lines[i])) {
        const l = lines[i].trim();
        if (l) { const [a, ...b] = l.split("|"); steps.push({ t: a.trim(), d: b.join("|").trim() }); }
        i++;
      }
      i++;
      out.push(
        `<figure class="fluxo">${title ? `<figcaption>${inline(title)}</figcaption>` : ""}<ol>` +
          steps.map((s, k) => `<li><span class="fluxo-n">${k + 1}</span><div><strong>${inline(s.t)}</strong>${s.d ? `<p>${inline(s.d)}</p>` : ""}</div></li>`).join("") +
          `</ol></figure>`
      );
      continue;
    }

    // Tabela
    if (/^\|/.test(line) && i + 1 < lines.length && /^\|?\s*:?-{2,}/.test(lines[i + 1])) {
      const row = (l) => l.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
      const head = row(line);
      i += 2;
      const body = [];
      while (i < lines.length && /^\|/.test(lines[i])) { body.push(row(lines[i])); i++; }
      out.push(
        `<div class="tabela"><table><thead><tr>${head.map((h) => `<th>${inline(h)}</th>`).join("")}</tr></thead><tbody>` +
          body.map((r) => `<tr>${r.map((c, k) => `<td data-label="${esc(head[k] || "")}">${inline(c)}</td>`).join("")}</tr>`).join("") +
          `</tbody></table></div>`
      );
      continue;
    }

    // Citação / callout
    if (/^>/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, "")); i++; }
      let txt = buf.join("\n");
      const cm = /^\[!(\w+)\]\s*/.exec(txt);
      if (cm && CALLOUTS[cm[1]]) {
        txt = txt.slice(cm[0].length);
        out.push(`<aside class="callout callout-${cm[1]}"><p class="callout-t">${CALLOUTS[cm[1]]}</p>${mdToHtml(txt, opts).html}</aside>`);
      } else out.push(`<blockquote>${mdToHtml(txt, opts).html}</blockquote>`);
      continue;
    }

    // Listas
    if (/^\s*([-*]|\d+[.)])\s/.test(line)) {
      const ordered = /^\s*\d+[.)]\s/.test(line);
      const items = [];
      while (i < lines.length && /^\s*([-*]|\d+[.)])\s/.test(lines[i])) {
        let it = lines[i].replace(/^\s*([-*]|\d+[.)])\s+/, "");
        i++;
        while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !/^\s*([-*]|\d+[.)])\s/.test(lines[i])) { it += " " + lines[i].trim(); i++; }
        items.push(it);
      }
      const isCheck = items.every((t) => /^\[[ xX]\]\s/.test(t));
      if (isCheck) {
        out.push(
          `<ul class="checklist">` +
            items.map((t) => {
              const id = `${pfx}chk-${++checkCounter}`;
              const done = /^\[[xX]\]/.test(t);
              return `<li><label><input type="checkbox" data-check="${id}"${done ? " checked" : ""}><span>${inline(t.replace(/^\[[ xX]\]\s/, ""))}</span></label></li>`;
            }).join("") + `</ul>`
        );
      } else {
        const tag = ordered ? "ol" : "ul";
        out.push(`<${tag}>${items.map((t) => `<li>${inline(t)}</li>`).join("")}</${tag}>`);
      }
      continue;
    }

    // Parágrafo
    const buf = [line.trim()];
    i++;
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) { buf.push(lines[i].trim()); i++; }
    out.push(`<p>${inline(buf.join(" "))}</p>`);
  }
  return { html: out.join("\n"), headings };
}

/** Lê frontmatter simples (chave: valor, listas com "- "). */
export function parseFrontmatter(src) {
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(src.replace(/\r/g, ""));
  if (!m) return { meta: {}, body: src };
  const meta = {};
  let key = null;
  for (const l of m[1].split("\n")) {
    const kv = /^(\w+):\s*(.*)$/.exec(l);
    if (kv) { key = kv[1]; meta[key] = kv[2].trim() === "" ? [] : kv[2].trim(); continue; }
    const li = /^-\s+(.*)$/.exec(l);
    if (li && key) { if (!Array.isArray(meta[key])) meta[key] = []; meta[key].push(li[1].trim()); }
  }
  return { meta, body: src.replace(/\r/g, "").slice(m[0].length) };
}

export const wordCount = (s) => (s.replace(/[|#>*`\-:[\]()]/g, " ").match(/\S+/g) || []).length;

/** Carrega um módulo: junta todos os .md da pasta e separa as aulas por "# Aula". */
export function loadModule(dir) {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md")).sort();
  const raw = files.map((f) => fs.readFileSync(path.join(dir, f), "utf8")).join("\n\n");
  const { meta, body } = parseFrontmatter(raw);
  const parts = body.split(/^(?=# Aula )/m).filter((p) => p.trim().startsWith("# Aula"));
  const num = String(meta.numero).padStart(2, "0");
  const aulas = parts.map((p, k) => {
    const first = p.split("\n")[0];
    const t = /^# Aula\s+([\d.]+)\s+[—-]\s+(.*)$/.exec(first);
    const codigo = t ? t[1] : `${Number(num)}.${k + 1}`;
    const titulo = t ? t[2].trim() : first.replace(/^#\s*/, "");
    const md = p.split("\n").slice(1).join("\n");
    const words = wordCount(md);
    const id = `m${num}-a${String(k + 1).padStart(2, "0")}`;
    const { html, headings } = mdToHtml(md.replace(/^## /gm, "## ").replace(/^#{2} /gm, "## "), { idPrefix: id + "-" });
    return { id, codigo, titulo, md, html, headings, palavras: words, minutos: Math.max(4, Math.round(words / 180)) };
  });
  return {
    id: `m${num}`,
    numero: num,
    titulo: meta.titulo,
    subtitulo: meta.subtitulo || "",
    nivel: meta.nivel || "",
    descricao: meta.descricao || "",
    objetivos: Array.isArray(meta.objetivos) ? meta.objetivos : [],
    entregaveis: String(meta.entregaveis || "").split(",").map((s) => s.trim()).filter(Boolean),
    aulas,
  };
}
