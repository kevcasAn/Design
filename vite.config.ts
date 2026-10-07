import { copyFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type Plugin } from "vite";

/** `/` en local e IIS. En GitHub Pages, `VITE_BASE_PATH=/Design/`. */
function basePublica(): string {
  const cruda = process.env.VITE_BASE_PATH?.trim();
  if (!cruda || cruda === "/") return "/";
  const conBarra = cruda.startsWith("/") ? cruda : `/${cruda}`;
  return conBarra.endsWith("/") ? conBarra : `${conBarra}/`;
}

/** GitHub Pages no reescribe rutas: 404.html es el mismo index para que el router responda. */
function paginasEstaticas(): Plugin {
  return {
    name: "github-pages",
    apply: "build",
    closeBundle() {
      if (basePublica() === "/") return;
      const dist = resolve("dist");
      copyFileSync(resolve(dist, "index.html"), resolve(dist, "404.html"));
      writeFileSync(resolve(dist, ".nojekyll"), "");
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: basePublica(),
  plugins: [react(), tailwindcss(), paginasEstaticas()],
  server: {
    port: 5174,
    strictPort: true
  }
});
