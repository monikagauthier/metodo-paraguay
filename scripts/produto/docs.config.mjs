// Definição de todos os PDFs editoriais do produto.
const guia = (id, n, arquivo, titulo, subtitulo, capa, extra = []) => ({
  id, arquivo, titulo, subtitulo, kicker: `Guia ${id} · Módulo ${n}`, rodape: titulo, capa,
  sobre: `Este guia reúne o conteúdo integral do **Módulo ${n}** do Método Paraguay, com aulas, exemplos, procedimentos, checklists e referências oficiais. Leia na ordem ou use o sumário clicável para ir direto ao tema. Os materiais de apoio citados (planilhas, checklists e modelos) estão na Biblioteca da área de membros.`,
  blocos: [{ tipo: "modulo", n }, ...extra],
});

export const DOCS = [
  guia("02", "01", "entregaveis/guias/02-guia-de-introducao-ao-paraguai.pdf", "Guia de Introdução ao Paraguai", "Economia, moeda, cultura, cidades e o perfil de quem se adapta", "capa-cidade.jpg"),
];
