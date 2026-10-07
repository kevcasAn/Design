import { useNavigate } from "react-router-dom";
import { useVistaStore } from "./vistaStore";
import type { Vista } from "./vistaStore";

const OPCIONES: { id: Vista; label: string; titulo: string; icono: React.ReactNode }[] = [
  {
    id: "pasos",
    label: "Paso a paso",
    titulo: "Elegir primero el impuesto y luego el tipo de devolución",
    icono: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="5" cy="12" r="2.2" /><circle cx="12" cy="12" r="2.2" /><circle cx="19" cy="12" r="2.2" /><path d="M7.2 12h2.6M14.2 12h2.6" /></svg>
  },
  {
    id: "todo",
    label: "Agrupado",
    titulo: "Ver todos los trámites en una sola pantalla, agrupados",
    icono: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
  }
];

/** Cambia entre las dos formas de ver los trámites. La elección se recuerda. */
export function SelectorVista() {
  const vista = useVistaStore((s) => s.vista);
  const setVista = useVistaStore((s) => s.setVista);
  const navigate = useNavigate();

  return (
    <div className="segmento" role="group" aria-label="Forma de ver los trámites">
      {OPCIONES.map((o) => (
        <button
          key={o.id}
          type="button"
          className={`segmento-opcion ${vista === o.id ? "is-active" : ""}`}
          aria-pressed={vista === o.id}
          title={o.titulo}
          onClick={() => { setVista(o.id); navigate("/"); }}
        >
          {o.icono}
          {o.label}
        </button>
      ))}
    </div>
  );
}
