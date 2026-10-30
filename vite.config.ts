import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// index-react.html é o entry da versão React (o index.html da raiz é a
// versão vanilla sem build, que roda direto no navegador).
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: "index-react.html",
    },
  },
});
