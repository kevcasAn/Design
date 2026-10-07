import { useEffect, useRef, useState } from "react";
import type { CatalogoTablaCampo } from "../../features/catalogosTablas/api";
import { aliasEnLineas } from "./columnasDesdeCatalogo";

interface Props {
  campos: CatalogoTablaCampo[];
  visibles: Set<string>;
  onCambiar: (campo: string, visible: boolean) => void;
  onRestablecer: () => void;
}

/**
 * Botón "Columnas": una casilla por columna del catálogo para mostrarla u ocultarla.
 * Reemplaza el panel de columnas de AG Grid, que es de pago.
 */
export function BotonColumnas({ campos, visibles, onCambiar, onRestablecer }: Props) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const cerrar = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAbierto(false);
    };
    document.addEventListener("mousedown", cerrar);
    return () => document.removeEventListener("mousedown", cerrar);
  }, [abierto]);

  const lista = campos.filter((c) => !c.Excluir).sort((a, b) => a.Orden - b.Orden);

  return (
    <div ref={ref} className="relative">
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAbierto((v) => !v)} aria-expanded={abierto}>
        Columnas
      </button>
      {abierto && (
        <div className="card absolute right-0 z-20 mt-1 grid w-64 gap-1 p-3 text-small">
          {lista.map((c) => (
            <label key={c.NombreCampoBD} className="flex cursor-pointer items-center gap-2 py-0.5">
              <input
                type="checkbox"
                checked={visibles.has(c.NombreCampoBD)}
                onChange={(e) => onCambiar(c.NombreCampoBD, e.target.checked)}
              />
              <span>{aliasEnLineas(c.Alias).join(" ")}</span>
            </label>
          ))}
          <button type="button" className="btn btn-ghost btn-sm mt-2" onClick={onRestablecer}>
            Restablecer
          </button>
        </div>
      )}
    </div>
  );
}
