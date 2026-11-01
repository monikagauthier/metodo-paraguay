// Gera os PDFs preenchíveis e registra o relatório de validação.
import fs from "node:fs";
import path from "node:path";
import { buildForm } from "./lib/forms.mjs";
import { closeBrowser } from "./lib/pdf.mjs";
import { FORMS, PLANNER_PDF } from "./forms.config.mjs";
import { ROOT } from "./lib/doc.mjs";

const only = process.argv.slice(2);
const report = [];
for (const f of [...FORMS, PLANNER_PDF]) {
  if (only.length && !only.includes(f.id)) continue;
  const r = await buildForm(f);
  report.push({ id: f.id, ...r });
  console.log(`${r.campos === r.camposDetectados && !r.erros.length ? "✓" : "✗"} ${r.arquivo} — ${r.paginas} p., ${r.campos} campos${r.erros.length ? " ERROS: " + r.erros.join("; ") : ""}`);
}
await closeBrowser();
fs.writeFileSync(path.join(ROOT, "scripts/produto/_relatorio-forms.json"), JSON.stringify(report, null, 2));
