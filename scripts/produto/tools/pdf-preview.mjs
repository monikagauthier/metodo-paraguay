// Pré-visualização de páginas de PDF (ferramenta de QA interna).
// Requer uma cópia do Chromium completo em /tmp/chr (ver README-PRODUTO, seção QA).
// Uso: node pdf-preview.mjs arquivo.pdf pastaSaida 1,2,5,10
import { createRequire } from "node:module";
import path from "node:path";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_CORE || "/inner_container/opt/toolchains/.nvm/versions/node/v22.23.4/lib/node_modules/@playwright/mcp/node_modules/playwright-core");
const [, , pdf, outDir, pagesArg = "1"] = process.argv;
const b = await chromium.launch({ executablePath: process.env.CHROME_FULL || "/tmp/chr/chrome", args: ["--disable-crash-reporter", "--no-crashpad"] });
const out = [];
for (const n of pagesArg.split(",")) {
  const p = await b.newPage({ viewport: { width: 640, height: 900 } });
  await p.goto("file://" + path.resolve(pdf) + "#page=" + n + "&toolbar=0&view=Fit");
  await p.waitForTimeout(2200);
  const f = path.join(outDir, `p${String(n).padStart(3, "0")}.png`);
  await p.screenshot({ path: f });
  out.push(f);
  await p.close();
}
await b.close();
console.log(out.join("\n"));
