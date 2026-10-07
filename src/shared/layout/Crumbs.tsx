import { Link, useParams } from "react-router-dom";
import { useImpuestoYTipo } from "../../features/impuestos/hooks";
import { useEtiquetas } from "../../features/configuracion/hooks";

/**
 * Migas del flujo Impuesto → Tipo de devolución → Trámites.
 * Solo aparece cuando ya se eligió al menos el impuesto.
 */
export function Crumbs() {
  const { idImpuesto, idTipo, idTramite } = useParams();
  const { impuesto, tipo } = useImpuestoYTipo(idImpuesto, idTipo);
  const { L } = useEtiquetas();

  if (!impuesto) return null;

  const pasos = [
    { to: "/", label: impuesto.Nombre, activo: false, deshabilitado: false },
    { to: `/impuestos/${impuesto.IdImpuesto}`, label: tipo?.Nombre ?? "Tipo de devolución", activo: !tipo, deshabilitado: false },
    // Dentro de un trámite, "Trámites" sigue resaltado y un clic vuelve a la lista
    { to: `/impuestos/${impuesto.IdImpuesto}/tipos/${tipo?.IdTipoDevolucion ?? ""}`, label: L("tramites"), activo: Boolean(tipo) && !idTramite, deshabilitado: !tipo, resaltado: Boolean(idTramite) }
  ];

  return (
    <div className="crumbbar">
      <nav className="crumbs" aria-label="Ruta de navegación">
        {pasos.map((p, i) => (
          <span key={p.to} className="contents">
            {i > 0 && <span className="text-line-strong">|</span>}
            {p.activo || p.deshabilitado
              ? <span className={`crumb ${p.activo ? "is-current" : "is-disabled"}`}>{p.label}</span>
              : <Link to={p.to} className={`crumb ${"resaltado" in p && p.resaltado ? "is-current" : "is-done"}`}>{p.label}</Link>}
          </span>
        ))}
      </nav>
    </div>
  );
}
