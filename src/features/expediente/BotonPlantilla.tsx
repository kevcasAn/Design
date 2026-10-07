import { useEffect, useState } from "react";
import { archivoPublico } from "../../app/env";
import type { ArchivoEsperado } from "./api";
import { generarPlantilla } from "./plantilla";

/**
 * "Descargar plantilla" de un archivo del catálogo. Igual que ComplyTax: si existe un Excel
 * en public/plantillas ({IdCatalogoArchivo}.xlsx o {Nombre}.xlsx) se descarga ese; si no,
 * se genera uno con los encabezados del catálogo y una hoja de instrucciones.
 */
export function BotonPlantilla({ archivo }: { archivo: ArchivoEsperado }) {
  const [urlFija, setUrlFija] = useState<string | null | undefined>(undefined);
  const [generando, setGenerando] = useState(false);

  useEffect(() => {
    let vigente = true;
    const candidatos = [
      archivoPublico(`plantillas/${archivo.IdCatalogoArchivo}.xlsx`),
      archivoPublico(`plantillas/${encodeURIComponent(archivo.Nombre)}.xlsx`)
    ];
    (async () => {
      for (const url of candidatos) {
        try {
          const r = await fetch(url, { method: "HEAD" });
          // El servidor de desarrollo devuelve el index.html para rutas que no existen: hay que mirar el tipo
          const tipo = r.headers.get("content-type") ?? "";
          if (r.ok && !tipo.includes("text/html")) { if (vigente) setUrlFija(url); return; }
        } catch { /* se prueba el siguiente */ }
      }
      if (vigente) setUrlFija(null);
    })();
    return () => { vigente = false; };
  }, [archivo.IdCatalogoArchivo, archivo.Nombre]);

  const descargarGenerada = async () => {
    setGenerando(true);
    try { await generarPlantilla(archivo); } finally { setGenerando(false); }
  };

  if (urlFija === undefined) return null;

  if (urlFija) {
    return (
      <a href={urlFija} download={`${archivo.Nombre}.xlsx`} className="btn btn-ghost btn-sm no-underline" title="Plantilla preparada por la empresa">
        <IconoDescarga /> Descargar plantilla
      </a>
    );
  }

  return (
    <button type="button" className="btn btn-ghost btn-sm" onClick={descargarGenerada} disabled={generando} title="Se genera con las columnas del catálogo">
      <IconoDescarga /> {generando ? "Generando…" : "Descargar plantilla"}
    </button>
  );
}

function IconoDescarga() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 4v11M7 10l5 5 5-5M5 19h14" />
    </svg>
  );
}
