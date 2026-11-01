/* Área de membros — Método Paraguay
 * Aplicação estática (sem dependências), roteamento por hash, progresso salvo no
 * localStorage do navegador, com exportação/importação para levar a outro aparelho.
 */
(function () {
  "use strict";
  const D = window.MP_DADOS;
  const main = document.getElementById("conteudo");
  const CHAVE = "mp-progresso-v1";

  // ------------------------------------------------------------ utilitários
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmtBRL = (n) => (isFinite(n) ? n : 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  const fmtGs = (n) => "Gs. " + Math.round(isFinite(n) ? n : 0).toLocaleString("pt-BR");
  const fmtTam = (b) => (b > 1048576 ? (b / 1048576).toFixed(1).replace(".", ",") + " MB" : Math.max(1, Math.round(b / 1024)) + " KB");
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
  const ICONES = {
    inicio: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    modulos: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 4v16"/>',
    biblioteca: '<path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>',
    ferramentas: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 12h2M14 12h2M8 16h2M14 16h2"/>',
    plano: '<path d="M4 12l5 5L20 6"/>',
    progresso: '<circle cx="12" cy="12" r="9"/><path d="M12 3v9l6 4"/>',
    ajuda: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5v.5"/>',
  };
  const svg = (k) => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONES[k] || ""}</svg>`;
  document.querySelectorAll("[data-icon]").forEach((el) => (el.innerHTML = svg(el.dataset.icon)));

  function toast(msg) {
    const t = document.createElement("div");
    t.className = "toast"; t.setAttribute("role", "status"); t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2400);
  }

  // ------------------------------------------------------------ estado
  function lerEstado() {
    try { const e = JSON.parse(localStorage.getItem(CHAVE) || "{}"); return { aulas: e.aulas || {}, checks: e.checks || {}, tarefas: e.tarefas || {}, ultima: e.ultima || null, calc: e.calc || {} }; }
    catch { return { aulas: {}, checks: {}, tarefas: {}, ultima: null, calc: {} }; }
  }
  let E = lerEstado();
  let armazenamentoOk = true;
  function salvar() {
    try { localStorage.setItem(CHAVE, JSON.stringify(E)); }
    catch { if (armazenamentoOk) { armazenamentoOk = false; toast("Não foi possível salvar o progresso neste navegador (modo privado?)."); } }
  }

  // ------------------------------------------------------------ índices
  const todasAulas = [];
  const porAula = {};
  D && D.modulos.forEach((m) => m.aulas.forEach((a, i) => { const x = { ...a, modulo: m, indice: i }; todasAulas.push(x); porAula[a.id] = x; }));
  const porArquivo = {}; D && D.biblioteca.forEach((b) => (porArquivo[b.id] = b));
  const progressoModulo = (m) => { const f = m.aulas.filter((a) => E.aulas[a.id]).length; return { feitas: f, total: m.aulas.length, p: pct(f, m.aulas.length) }; };
  const progressoGeral = () => { const f = todasAulas.filter((a) => E.aulas[a.id]).length; return { feitas: f, total: todasAulas.length, p: pct(f, todasAulas.length) }; };
  const proximaAula = () => (E.ultima && porAula[E.ultima] && !E.aulas[E.ultima] ? porAula[E.ultima] : todasAulas.find((a) => !E.aulas[a.id]) || null);

  // ------------------------------------------------------------ componentes
  const barra = (p) => `<div class="barra" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p}" aria-label="${p}% concluído"><i style="width:${p}%"></i></div>`;
  const anel = (p, claro) => `<div class="anel${claro ? " claro" : ""}" style="--p:${p}" role="img" aria-label="${p}% concluído"><span>${p}%</span></div>`;
  function fmtClasse(f) { return f === "XLSX" ? "xlsx" : f === "DOCX" ? "docx" : /preench/.test(f) ? "form" : ""; }
  function cartaoArquivo(b) {
    return `<article class="cartao arquivo"><span class="fmt ${fmtClasse(b.formato)}">${esc(b.formato)}</span><h3>${esc(b.nome)}</h3><p>${esc(b.descricao)}</p>
      <div class="rodape"><small>${fmtTam(b.tamanho)}</small><a class="btn btn-escuro btn-peq" href="${esc(b.href)}" download aria-label="Baixar ${esc(b.nome)} (${esc(b.formato)}, ${fmtTam(b.tamanho)})">Baixar</a></div></article>`;
  }
  function cartaoModulo(m) {
    const pg = progressoModulo(m);
    const min = m.aulas.reduce((s, a) => s + a.minutos, 0);
    return `<a class="cartao" href="#/modulo/${m.numero}"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px"><span class="mod-num">${m.numero}</span>${pg.p === 100 ? '<span class="selo ok">Concluído</span>' : `<span class="selo">${esc(m.nivel)}</span>`}</div>
      <h3>${esc(m.titulo)}</h3><p>${esc(m.subtitulo)}</p><div class="meta"><span>${m.aulas.length} aulas</span><span>~${min} min de leitura</span><span>${pg.feitas}/${pg.total} concluídas</span></div>${barra(pg.p)}</a>`;
  }
  const topoMobile = `<div class="topo-mob"><img src="../assets/produto/img/emblema.png" alt=""><span>MÉTODO PARAGUAY</span></div>`;

  // ------------------------------------------------------------ páginas
  const paginas = {
    inicio() {
      const g = progressoGeral();
      const prox = proximaAula();
      const btn = prox ? `<a class="btn btn-ouro" href="#/aula/${prox.id}">${g.feitas ? "Continuar estudando" : "Começar pelo Módulo 1"}</a><span style="color:#CFC6B2;font-size:14px">${g.feitas ? "Próxima: " : ""}Aula ${esc(prox.codigo)} — ${esc(prox.titulo)}</span>` : `<a class="btn btn-ouro" href="#/plano">Ir para o plano de ação</a><span style="color:#CFC6B2">Você concluiu todas as aulas.</span>`;
      return `${topoMobile}
      <section class="hero entra"><div class="kicker">Inteligência sem fronteiras</div><h1>Bem-vindo ao Método Paraguay</h1>
        <p>12 módulos, ${todasAulas.length} aulas, ${D.biblioteca.length} materiais para download e um plano de ação de 90 dias. Estude no seu ritmo: o seu progresso fica salvo neste navegador.</p>
        <div class="hero-linha">${anel(g.p)}<div style="display:grid;gap:10px;flex:1;min-width:220px"><div>${g.feitas} de ${g.total} aulas concluídas</div><div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center">${btn}</div></div></div></section>
      <div class="atalhos">
        <a class="atalho" href="#/biblioteca"><b>Biblioteca</b><small>Manuais, guias, checklists, planilhas e modelos</small></a>
        <a class="atalho" href="#/ferramentas"><b>Ferramentas</b><small>Calculadora rápida e planilhas</small></a>
        <a class="atalho" href="#/plano"><b>Plano de ação</b><small>13 semanas com tarefas marcáveis</small></a>
        <a class="atalho" href="#/ajuda"><b>Central de ajuda</b><small>Uso, downloads e perguntas frequentes</small></a>
      </div>
      <h2 class="secao">Módulos</h2><div class="grade tres">${D.modulos.map(cartaoModulo).join("")}</div>
      <h2 class="secao">Comece por aqui</h2><div class="grade">${["01", "30", "21"].map((id) => porArquivo[id]).filter(Boolean).map(cartaoArquivo).join("")}</div>`;
    },
    modulos() {
      return `${topoMobile}<div class="kicker">Curso completo</div><h1 class="titulo">Módulos</h1><p class="lead">Cada módulo tem aulas completas em texto, exemplos, checklists marcáveis e referências oficiais com data de consulta.</p><div class="grade tres">${D.modulos.map(cartaoModulo).join("")}</div>`;
    },
    modulo(num) {
      const m = D.modulos.find((x) => x.numero === num);
      if (!m) return naoEncontrado();
      const pg = progressoModulo(m);
      const materiais = D.biblioteca.filter((b) => b.modulos.includes(m.numero) && b.id !== "01");
      const minutos = m.aulas.reduce((s, a) => s + a.minutos, 0);
      const prox = m.aulas.find((a) => !E.aulas[a.id]) || m.aulas[0];
      return `${topoMobile}<nav class="migalhas" aria-label="Você está em"><a href="#/">Início</a> / <a href="#/modulos">Módulos</a> / <span>Módulo ${m.numero}</span></nav>
      <div class="kicker">Módulo ${m.numero} · ${esc(m.nivel)}</div><h1 class="titulo">${esc(m.titulo)}</h1><p class="lead">${esc(m.descricao)}</p>
      <div class="cartao" style="flex-direction:row;align-items:center;gap:18px;flex-wrap:wrap">${anel(pg.p, true)}<div style="flex:1;min-width:200px"><b>${pg.feitas} de ${pg.total} aulas concluídas</b><div class="meta" style="margin-top:4px;color:var(--cinza);font-size:13.5px">${m.aulas.length} aulas · cerca de ${minutos} minutos de leitura</div></div><a class="btn btn-ouro" href="#/aula/${prox.id}">${pg.feitas ? "Continuar" : "Começar"} o módulo</a></div>
      <h2 class="secao">Objetivos</h2><ul class="objetivos">${m.objetivos.map((o) => `<li>${esc(o)}</li>`).join("")}</ul>
      <h2 class="secao">Aulas</h2><ol class="aulas">${m.aulas.map((a) => `<li class="${E.aulas[a.id] ? "feita" : ""}"><a href="#/aula/${a.id}"><span class="st" aria-hidden="true">✓</span><span class="tt"><b>${esc(a.codigo)} · ${esc(a.titulo)}</b><small>${a.minutos} min de leitura${E.aulas[a.id] ? " · concluída" : ""}</small></span></a></li>`).join("")}</ol>
      <h2 class="secao">Materiais complementares</h2>${materiais.length ? `<div class="grade">${materiais.map(cartaoArquivo).join("")}</div>` : '<p class="vazio">Sem materiais específicos.</p>'}
      <h2 class="secao">Referências</h2><p>As referências oficiais de cada tema estão ao final de cada aula, com a data de consulta. A lista completa está no <a href="${esc(porArquivo["18"].href)}" download>Diretório de Links Oficiais</a> e na seção de referências do <a href="${esc(porArquivo["01"].href)}" download>Manual Mestre</a>.</p>`;
    },
    aula(id) {
      const a = porAula[id];
      if (!a) return naoEncontrado();
      E.ultima = id; salvar();
      const m = a.modulo;
      const ant = todasAulas[todasAulas.indexOf(a) - 1], prox = todasAulas[todasAulas.indexOf(a) + 1];
      const feita = !!E.aulas[id];
      const secoes = [...a.html.matchAll(/<h2 id="([^"]+)">(.*?)<\/h2>/g)].map((x) => `<a href="#/aula/${id}" data-alvo="${x[1]}">${x[2]}</a>`).join("");
      return `<nav class="migalhas" aria-label="Você está em"><a href="#/">Início</a> / <a href="#/modulo/${m.numero}">Módulo ${m.numero}</a> / <span>Aula ${esc(a.codigo)}</span></nav>
      <div class="kicker">Aula ${esc(a.codigo)} · ${esc(m.titulo)}</div><h1 class="titulo" style="text-transform:none;font-family:'Noto Sans MP';font-weight:600;font-size:clamp(23px,4.4vw,32px)">${esc(a.titulo)}</h1>
      <p class="lead" style="margin-bottom:16px">Leitura estimada: ${a.minutos} min ${feita ? '· <span class="selo ok">Concluída</span>' : ""}</p>
      <div class="aula-wrap"><article class="aula entra" id="corpo-aula">${a.html}
        <div class="acoes-aula">${ant ? `<a class="btn btn-linha btn-peq" href="#/aula/${ant.id}">← Anterior</a>` : "<span></span>"}
          <button class="btn ${feita ? "btn-linha" : "btn-ok"}" id="concluir" aria-pressed="${feita}">${feita ? "Marcar como não concluída" : "Concluir aula"}</button>
          ${prox ? `<a class="btn btn-linha btn-peq" href="#/aula/${prox.id}">Próxima →</a>` : `<a class="btn btn-linha btn-peq" href="#/plano">Plano de ação →</a>`}</div>
      </article><aside class="indice" aria-label="Nesta aula"><b>Nesta aula</b>${secoes}</aside></div>`;
    },
    biblioteca(params) {
      const cat = params.get("c") || "Todos";
      const q = (params.get("q") || "").toLowerCase();
      const cats = ["Todos", ...D.categorias];
      const filtra = (b) => (cat === "Todos" || b.categoria === cat || (cat === "Ferramentas" && b.formato === "XLSX")) && (!q || (b.nome + " " + b.descricao).toLowerCase().includes(q));
      const lista = D.biblioteca.filter(filtra);
      const bonus = cat === "Bônus" ? `<h2 class="secao">Os cinco bônus</h2><div class="grade">${D.bonus.map((bn) => `<article class="cartao"><span class="kicker">${bn.id.replace("B", "Bônus 0")}</span><h3>${esc(bn.nome)}</h3><p>${esc(bn.descricao)}</p><ul style="margin:0;padding-left:18px;font-size:14px">${bn.itens.map((i) => porArquivo[i]).filter(Boolean).map((b) => `<li><a href="${esc(b.href)}" download>${esc(b.nome)}</a> <small>(${esc(b.formato)})</small></li>`).join("")}</ul></article>`).join("")}</div><h2 class="secao">Arquivos</h2>` : "";
      return `${topoMobile}<div class="kicker">${D.biblioteca.length} arquivos</div><h1 class="titulo">Biblioteca</h1><p class="lead">Todos os materiais do método para baixar. PDFs preenchíveis funcionam no Adobe Acrobat Reader, no navegador e em leitores de PDF no celular. Planilhas abrem no Excel e no Google Sheets.</p>
      <div class="filtros" role="group" aria-label="Filtrar por categoria">${cats.map((c) => `<button class="chip" data-cat="${esc(c)}" aria-pressed="${c === cat}">${esc(c)}</button>`).join("")}</div>
      <div class="campo" style="max-width:420px"><label for="filtro-q">Procurar arquivo</label><input id="filtro-q" type="search" value="${esc(q)}" placeholder="Ex.: aluguel, câmbio, currículo"></div>
      ${bonus}${lista.length ? `<div class="grade tres">${lista.map(cartaoArquivo).join("")}</div>` : '<p class="vazio">Nenhum arquivo encontrado com esse filtro.</p>'}`;
    },
    ferramentas() {
      const c = Object.assign({ gs: D.cambio.gsPorReal, moradia: 3900000, servicos: 550000, alimentacao: 2400000, transporte: 800000, saude: 700000, educacao: 0, lazer: 600000, outros: 200000, brasil: 400, meses: 6, margem: 10, reserva: 60000, renda: 9000 }, E.calc);
      const campo = (k, rot, ajuda, passo = "any") => `<div class="campo"><label for="c-${k}">${rot}</label><input id="c-${k}" data-k="${k}" type="number" inputmode="decimal" min="0" step="${passo}" value="${esc(c[k])}">${ajuda ? `<small>${ajuda}</small>` : ""}</div>`;
      const planilhas = D.biblioteca.filter((b) => b.formato === "XLSX");
      return `${topoMobile}<div class="kicker">Ferramentas financeiras</div><h1 class="titulo">Ferramentas</h1><p class="lead">Use a calculadora rápida para uma primeira estimativa. Para análises completas, com cenários, teste de estresse e registro de fontes, baixe as planilhas.</p>
      <h2 class="secao">Calculadora rápida de custo de vida e reserva</h2>
      <div class="grade" style="align-items:start"><form class="cartao" id="calc" novalidate>
        ${campo("gs", "Guaranis por 1 real", `Exemplo: referência de ${esc(D.cambio.data)}. Atualize com a cotação do dia (BCP e BCB).`)}
        <div class="duas">${campo("moradia", "Moradia (Gs./mês)")}${campo("servicos", "Energia, água, internet (Gs./mês)")}${campo("alimentacao", "Alimentação (Gs./mês)")}${campo("transporte", "Transporte (Gs./mês)")}${campo("saude", "Saúde (Gs./mês)")}${campo("educacao", "Educação (Gs./mês)")}${campo("lazer", "Lazer (Gs./mês)")}${campo("outros", "Outros (Gs./mês)")}</div>
        <div class="duas">${campo("brasil", "Compromissos no Brasil (R$/mês)")}${campo("margem", "Margem de imprevistos (%)", "", "1")}${campo("meses", "Meses de reserva desejados", "", "1")}${campo("renda", "Renda mensal garantida (R$)")}</div>
        ${campo("reserva", "Reserva disponível após custos únicos (R$)")}
        <button type="button" class="btn btn-linha btn-peq" id="calc-limpar">Restaurar exemplo</button>
      </form><div class="resultado" id="calc-res" aria-live="polite"></div></div>
      <p class="aviso alerta" style="margin-top:12px">Os valores iniciais são um <b>exemplo ilustrativo</b> (pessoa em Assunção, Módulo 4). Substitua pelos seus preços pesquisados. Ferramenta educativa.</p>
      <h2 class="secao">Planilhas completas</h2><div class="grade tres">${planilhas.map(cartaoArquivo).join("")}</div>`;
    },
    plano() {
      const total = D.plano.reduce((s, w) => s + w.tarefas.length, 0);
      const feitas = D.plano.reduce((s, w) => s + w.tarefas.filter((t) => E.tarefas[t.id]).length, 0);
      const fases = [...new Set(D.plano.map((w) => w.fase))];
      return `${topoMobile}<div class="kicker">Módulo 12</div><h1 class="titulo">Plano de ação de 90 dias</h1><p class="lead">As 52 tarefas do método em 13 semanas. Marque o que concluir; o progresso fica salvo neste navegador. Para datas calculadas e responsáveis, use o Planner XLSX.</p>
      <div class="cartao" style="flex-direction:row;align-items:center;gap:18px;flex-wrap:wrap">${anel(pct(feitas, total), true)}<div style="flex:1;min-width:200px"><b>${feitas} de ${total} tarefas concluídas</b>${fases.map((f) => { const ts = D.plano.filter((w) => w.fase === f).flatMap((w) => w.tarefas); const p = pct(ts.filter((t) => E.tarefas[t.id]).length, ts.length); return `<div style="margin-top:8px;font-size:13.5px">${esc(f)} · ${p}%${barra(p)}</div>`; }).join("")}</div></div>
      <div style="display:flex;flex-wrap:wrap;gap:10px;margin:16px 0"><a class="btn btn-escuro btn-peq" href="${esc(porArquivo["30"].href)}" download>Baixar Meu Plano Paraguay</a><a class="btn btn-linha btn-peq" href="${esc(porArquivo["26"].href)}" download>Planner (XLSX)</a><a class="btn btn-linha btn-peq" href="${esc(porArquivo["26P"].href)}" download>Planner (PDF)</a></div>
      ${D.plano.map((w) => { const f = w.tarefas.filter((t) => E.tarefas[t.id]).length; return `<details class="semana"${f < w.tarefas.length && (w.semana === 1 || D.plano[w.semana - 2].tarefas.every((t) => E.tarefas[t.id])) ? " open" : ""}><summary><span class="selo${f === w.tarefas.length ? " ok" : ""}">${f}/${w.tarefas.length}</span><b>Semana ${w.semana}</b><small style="color:var(--cinza)">${esc(w.fase)}</small></summary><div class="corpo">${w.tarefas.map((t) => `<label class="tarefa"><input type="checkbox" data-tarefa="${t.id}"${E.tarefas[t.id] ? " checked" : ""}><span>${esc(t.texto)}<small>${esc(t.ferramenta)}</small></span></label>`).join("")}</div></details>`; }).join("")}`;
    },
    progresso() {
      const g = progressoGeral();
      const nChecks = Object.values(E.checks).filter(Boolean).length;
      const nTarefas = Object.values(E.tarefas).filter(Boolean).length;
      return `${topoMobile}<div class="kicker">Seu avanço</div><h1 class="titulo">Progresso</h1>
      <div class="cartao" style="flex-direction:row;align-items:center;gap:18px;flex-wrap:wrap">${anel(g.p, true)}<div style="flex:1"><b>${g.feitas} de ${g.total} aulas concluídas</b><div style="color:var(--cinza);font-size:14px">${nChecks} itens de checklist marcados nas aulas · ${nTarefas} tarefas do plano concluídas</div></div></div>
      <h2 class="secao">Por módulo</h2><table class="tabela-prog"><thead><tr><th>Módulo</th><th>Aulas</th><th style="width:38%">Progresso</th></tr></thead><tbody>${D.modulos.map((m) => { const p = progressoModulo(m); return `<tr><td><a href="#/modulo/${m.numero}">${m.numero} · ${esc(m.titulo)}</a></td><td>${p.feitas}/${p.total}</td><td>${barra(p.p)}</td></tr>`; }).join("")}</tbody></table>
      <h2 class="secao">Levar o progresso para outro aparelho</h2><p>O progresso fica salvo apenas neste navegador. Exporte um arquivo e importe no outro aparelho.</p>
      <div style="display:flex;flex-wrap:wrap;gap:10px"><button class="btn btn-escuro btn-peq" id="exportar">Exportar progresso</button><label class="btn btn-linha btn-peq" for="importar">Importar progresso</label><input type="file" id="importar" accept="application/json,.json" class="sr"><button class="btn btn-linha btn-peq" id="zerar">Apagar progresso</button></div>`;
    },
    ajuda() {
      return `${topoMobile}<div class="kicker">Central de ajuda</div><h1 class="titulo">Como usar</h1>
      <div class="grade"><article class="cartao"><h3>Estudo</h3><p>Siga os módulos na ordem. Em cada aula, marque os itens do checklist e clique em <b>Concluir aula</b> ao terminar. O botão <b>Continuar estudando</b> na página inicial leva à próxima aula.</p></article>
      <article class="cartao"><h3>Progresso</h3><p>Fica salvo no navegador deste aparelho. Para outro aparelho, use <a href="#/progresso">Exportar / Importar</a>. Limpar os dados do navegador apaga o progresso.</p></article>
      <article class="cartao"><h3>PDFs preenchíveis</h3><p>Abra no Adobe Acrobat Reader (computador ou celular) ou no navegador, preencha e use <b>Salvar</b>. Alguns visualizadores simples não salvam campos: nesse caso, use o Acrobat Reader.</p></article>
      <article class="cartao"><h3>Planilhas</h3><p>Funcionam no Excel e no Google Sheets. Campos amarelos são editáveis; fórmulas estão protegidas sem senha (Revisão &gt; Desproteger Planilha). Os valores iniciais são exemplos ilustrativos.</p></article>
      <article class="cartao"><h3>Atualização das informações</h3><p>Edição revisada em ${esc(D.edicao.data)}. Regras e valores mudam: antes de agir, confira as fontes oficiais citadas em cada aula e no Diretório de Links Oficiais.</p></article>
      <article class="cartao"><h3>Limites do material</h3><p>Conteúdo educativo. Não substitui advogado, contador, despachante habilitado ou instituição financeira. Este produto não inclui consultoria individual.</p></article></div>
      <h2 class="secao">Perguntas frequentes</h2><div class="faq prosa" id="faq">${D.faq}</div>
      <h2 class="secao">Sobre o método</h2><div class="prosa">${D.apresentacao}</div>`;
    },
    busca(params) {
      const q = (params.get("q") || "").trim();
      const termos = q.toLowerCase().split(/\s+/).filter(Boolean);
      const res = termos.length ? todasAulas.filter((a) => termos.every((t) => (a.titulo + " " + a.texto).toLowerCase().includes(t))) : [];
      return `${topoMobile}<div class="kicker">Busca</div><h1 class="titulo">Resultados</h1><form class="campo" id="busca-pagina" style="max-width:520px"><label for="bq">Buscar nas aulas</label><input id="bq" type="search" value="${esc(q)}" placeholder="Ex.: apostila, IOF, aluguel"></form>
      <p class="lead">${termos.length ? `${res.length} aula(s) encontrada(s) para “${esc(q)}”.` : "Digite um termo para buscar."}</p>
      ${res.length ? `<ol class="aulas">${res.slice(0, 60).map((a) => `<li class="${E.aulas[a.id] ? "feita" : ""}"><a href="#/aula/${a.id}"><span class="st" aria-hidden="true">✓</span><span class="tt"><b>${esc(a.codigo)} · ${esc(a.titulo)}</b><small>Módulo ${a.modulo.numero} · ${esc(a.modulo.titulo)}</small></span></a></li>`).join("")}</ol>` : ""}`;
    },
  };
  function naoEncontrado() { return `<div class="estado"><h1 class="titulo">Página não encontrada</h1><p>O endereço não corresponde a nenhuma página da área de membros.</p><a class="btn btn-ouro" href="#/">Voltar ao início</a></div>`; }

  // ------------------------------------------------------------ comportamento por página
  function ligar(rota) {
    if (rota === "aula") {
      const corpo = document.getElementById("corpo-aula");
      corpo.querySelectorAll("input[data-check]").forEach((cb) => {
        cb.checked = !!E.checks[cb.dataset.check];
        cb.addEventListener("change", () => { E.checks[cb.dataset.check] = cb.checked; salvar(); });
      });
      const id = location.hash.split("/")[2];
      document.getElementById("concluir").addEventListener("click", () => {
        E.aulas[id] = !E.aulas[id]; if (!E.aulas[id]) delete E.aulas[id]; salvar();
        toast(E.aulas[id] ? "Aula concluída. Progresso salvo." : "Aula marcada como não concluída.");
        if (E.aulas[id]) { const a = porAula[id]; const prox = todasAulas[todasAulas.indexOf(a) + 1]; if (prox) { E.ultima = prox.id; salvar(); } }
        render();
      });
      document.querySelectorAll(".indice a").forEach((l) => l.addEventListener("click", (ev) => { ev.preventDefault(); document.getElementById(l.dataset.alvo)?.scrollIntoView({ behavior: "smooth", block: "start" }); }));
    }
    if (rota === "biblioteca") {
      const p = new URLSearchParams(location.hash.split("?")[1] || "");
      document.querySelectorAll(".chip").forEach((b) => b.addEventListener("click", () => { p.set("c", b.dataset.cat); location.hash = "#/biblioteca?" + p.toString(); }));
      const fq = document.getElementById("filtro-q"); let t;
      fq.addEventListener("input", () => { clearTimeout(t); t = setTimeout(() => { p.set("q", fq.value); history.replaceState(null, "", "#/biblioteca?" + p.toString()); render(true); const n = document.getElementById("filtro-q"); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 250); });
    }
    if (rota === "ferramentas") {
      const form = document.getElementById("calc");
      const calcular = () => {
        const v = {}; form.querySelectorAll("input[data-k]").forEach((i) => (v[i.dataset.k] = Math.max(0, parseFloat(i.value.replace(",", ".")) || 0)));
        E.calc = v; salvar();
        const gs = v.gs || 1;
        const sub = v.moradia + v.servicos + v.alimentacao + v.transporte + v.saude + v.educacao + v.lazer + v.outros + v.brasil * gs;
        const total = sub * (1 + v.margem / 100);
        const brl = total / gs;
        const reservaRec = brl * v.meses;
        const meses = brl ? v.reserva / brl : 0;
        const cobertura = brl ? v.renda / brl : 0;
        const aviso = meses < 3 ? ["perigo", "Reserva cobre menos de 3 meses de despesa."] : meses < 6 ? ["alerta", "Reserva abaixo de 6 meses de despesa (Aula 2.7)."] : ["ok", "Reserva de 6 meses ou mais."];
        document.getElementById("calc-res").innerHTML = `<div class="linha"><span>Custo mensal (com margem)</span><b>${fmtGs(total)}</b></div><div class="linha destaque"><span>Equivalente em reais</span><b>${fmtBRL(brl)}</b></div><div class="linha"><span>Custo anual</span><b>${fmtBRL(brl * 12)}</b></div><div class="linha"><span>Reserva recomendada (${v.meses} meses)</span><b>${fmtBRL(reservaRec)}</b></div><div class="linha"><span>Meses cobertos pela sua reserva</span><b>${meses.toFixed(1).replace(".", ",")}</b></div><div class="linha"><span>Cobertura da despesa pela renda</span><b>${Math.round(cobertura * 100)}%</b></div><p class="aviso ${aviso[0]}" style="margin:6px 0 0">${aviso[1]}</p>`;
      };
      form.addEventListener("input", calcular);
      document.getElementById("calc-limpar").addEventListener("click", () => { E.calc = {}; salvar(); render(); });
      calcular();
    }
    if (rota === "plano") {
      document.querySelectorAll("input[data-tarefa]").forEach((cb) => cb.addEventListener("change", () => { if (cb.checked) E.tarefas[cb.dataset.tarefa] = true; else delete E.tarefas[cb.dataset.tarefa]; salvar(); render(true); }));
    }
    if (rota === "progresso") {
      document.getElementById("exportar").addEventListener("click", () => {
        const blob = new Blob([JSON.stringify({ produto: "metodo-paraguay", versao: 1, data: new Date().toISOString(), estado: E }, null, 2)], { type: "application/json" });
        const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "progresso-metodo-paraguay.json"; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      });
      document.getElementById("importar").addEventListener("change", (ev) => {
        const f = ev.target.files[0]; if (!f) return;
        f.text().then((t) => { const j = JSON.parse(t); if (j.produto !== "metodo-paraguay" || !j.estado) throw new Error(); E = Object.assign(lerEstado(), j.estado); salvar(); toast("Progresso importado."); render(); }).catch(() => toast("Arquivo inválido: use um arquivo exportado por esta área de membros."));
      });
      document.getElementById("zerar").addEventListener("click", () => { if (confirm("Apagar todo o progresso salvo neste navegador? Esta ação não pode ser desfeita.")) { E = { aulas: {}, checks: {}, tarefas: {}, ultima: null, calc: {} }; salvar(); toast("Progresso apagado."); render(); } });
    }
    if (rota === "busca") {
      document.getElementById("busca-pagina").addEventListener("submit", (ev) => { ev.preventDefault(); location.hash = "#/busca?q=" + encodeURIComponent(document.getElementById("bq").value); });
    }
  }

  // ------------------------------------------------------------ roteador
  function rotaAtual() {
    const h = location.hash.replace(/^#\/?/, "");
    const [caminho, qs] = h.split("?");
    const partes = caminho.split("/").filter(Boolean);
    return { nome: partes[0] || "inicio", arg: partes[1], params: new URLSearchParams(qs || "") };
  }
  function render(manterRolagem) {
    const r = rotaAtual();
    const fn = paginas[r.nome];
    let html;
    try { html = fn ? (r.nome === "modulo" || r.nome === "aula" ? fn(r.arg) : fn(r.params)) : naoEncontrado(); }
    catch (e) { console.error(e); html = `<div class="estado erro"><p>Não foi possível exibir esta página.</p><a class="btn btn-linha" href="#/">Voltar ao início</a></div>`; }
    main.innerHTML = html;
    const navAtiva = r.nome === "modulo" || r.nome === "aula" ? "modulos" : r.nome === "busca" ? "" : r.nome;
    document.querySelectorAll("[data-nav]").forEach((a) => (a.dataset.nav === navAtiva ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")));
    const titulos = { inicio: "Início", modulos: "Módulos", biblioteca: "Biblioteca", ferramentas: "Ferramentas", plano: "Plano de ação", progresso: "Progresso", ajuda: "Central de ajuda", busca: "Busca" };
    const t = r.nome === "aula" && porAula[r.arg] ? `Aula ${porAula[r.arg].codigo}` : r.nome === "modulo" ? `Módulo ${r.arg}` : titulos[r.nome] || "Página";
    document.title = `${t} — Método Paraguay`;
    ligar(r.nome);
    if (!manterRolagem) { window.scrollTo(0, 0); main.focus({ preventScroll: true }); }
  }

  if (!D || !D.modulos) {
    main.innerHTML = '<div class="estado erro"><p>Não foi possível carregar o conteúdo do curso (arquivo data/dados.js ausente ou corrompido).</p><p>Verifique se a pasta <code>plataforma/data</code> foi publicada junto com a área de membros.</p></div>';
    return;
  }
  document.getElementById("edicao").textContent = `${D.edicao.rotulo}. Progresso salvo neste navegador.`;
  document.getElementById("form-busca").addEventListener("submit", (ev) => { ev.preventDefault(); location.hash = "#/busca?q=" + encodeURIComponent(document.getElementById("campo-busca").value); });
  window.addEventListener("hashchange", () => render());
  render();
})();
