import { useNavigate } from "react-router-dom";
import type { TramiteResumen } from "./api";
import { useAvisoStore } from "../../shared/ui/avisoStore";
import { useEtiquetas } from "../configuracion/hooks";

/** Íconos de cada fase (los mismos del mockup). Fase nueva sin ícono propio → documento. */
function IconoFase({ idFase }: { idFase: number }) {
  if (idFase === 2) {
    // el triángulo rojo del logo del SRI
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path className="sri-tri" d="M6.5 6 L19.5 12.5 L6.5 19 Z" strokeWidth="4" strokeLinejoin="round" />
      </svg>
    );
  }
  if (idFase === 3) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.1 2.1-2.8-.7-.7-2.8 2.1-2.1z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M7 3.5h7l4 4V20.5H7z" /><path d="M14 3.5V7.5h4" /><path d="M10 11h5M10 14.5h3.5" />
    </svg>
  );
}

/**
 * Accesos de un trámite en la lista: un ícono por fase (bloqueado si todavía no se
 * puede abrir; un clic dice qué falta) y el ícono del equipo.
 */
export function AccesosFases({ t }: { t: TramiteResumen }) {
  const navigate = useNavigate();
  const avisar = useAvisoStore((s) => s.mostrar);
  const { L } = useEtiquetas();
  const base = `/impuestos/${t.IdImpuesto}/tipos/${t.IdTipoDevolucion}/tramites/${t.IdTramite}`;

  return (
    <span className="flex items-center justify-end whitespace-nowrap">
      {t.Fases.map((f) => {
        const titulo = f.Disponible ? f.Nombre : `${f.Nombre} · falta: ${f.Falta}`;
        return (
          <button
            key={f.IdFase}
            type="button"
            className={`fase-icon-btn ${f.Disponible ? "" : "is-locked"}`}
            title={titulo}
            aria-label={titulo}
            onClick={() => (f.Disponible ? navigate(`${base}?fase=${f.IdFase}`) : avisar(`${f.Nombre} se habilita cuando termine: ${f.Falta}.`))}
          >
            <IconoFase idFase={f.IdFase} />
          </button>
        );
      })}
      <button type="button" className="fase-icon-btn" title={`Equipo del ${L("tramite").toLowerCase()}`} aria-label={`Equipo del ${L("tramite").toLowerCase()}`} onClick={() => navigate(`${base}/equipo`)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
          <circle cx="9" cy="8" r="3" /><path d="M3.5 19c0-3 2.5-5.3 5.5-5.3s5.5 2.3 5.5 5.3" /><circle cx="17" cy="8.6" r="2.3" /><path d="M15.3 14.1c2.3.4 4 2.2 4 4.9" />
        </svg>
      </button>
    </span>
  );
}
