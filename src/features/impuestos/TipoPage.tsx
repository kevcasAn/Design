import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useImpuestoYTipo } from "./hooks";
import { useEtiquetas } from "../configuracion/hooks";
import { Cargando } from "../../shared/ui/Cargando";
import { SelectorVista } from "../tramites/SelectorVista";

/** Paso 2 de 2: elegir el tipo de devolución del impuesto (tabla TiposDevoluciones). */
export function TipoPage() {
  const { idImpuesto } = useParams();
  const { impuesto, isPending, isError, error } = useImpuestoYTipo(idImpuesto);
  const navigate = useNavigate();
  const { lower } = useEtiquetas();

  if (isPending) return <Cargando />;
  if (isError) return <div className="alert alert-danger">{error.message}</div>;
  if (!impuesto) return <Navigate to="/" replace />;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Paso 2 de 2</p>
          <h1>Tipo de devolución</h1>
          <p className="lede">Elige el esquema de {impuesto.Nombre}. Si cada {lower("tramite")} es de un mes o de un año se define al crearlo, no aquí.</p>
        </div>
        <SelectorVista />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {impuesto.TiposDevoluciones.map((t) => (
          <button
            key={t.IdTipoDevolucion}
            type="button"
            className="choice"
            onClick={() => navigate(`/impuestos/${impuesto.IdImpuesto}/tipos/${t.IdTipoDevolucion}`)}
          >
            <span className="choice-kicker">{impuesto.Nombre}</span>
            <strong>{t.Nombre}</strong>
            <span className="choice-hint">Ver {lower("tramites")} de este tipo</span>
          </button>
        ))}
        {impuesto.TiposDevoluciones.length === 0 && (
          <p className="text-small text-muted">Este impuesto no tiene tipos de devolución activos.</p>
        )}
      </div>
    </>
  );
}
