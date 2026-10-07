import { useMemo } from "react";
import { Navigate, useParams } from "react-router-dom";
import { Cargando } from "../../shared/ui/Cargando";
import { useImpuestoYTipo } from "../impuestos/hooks";
import { useEtiquetas } from "../configuracion/hooks";
import { useTramites } from "./hooks";
import { FiltrosTramites, KpisTramites, TablaTramites, useFiltrosTramites } from "./listaTramites";
import { SelectorVista } from "./SelectorVista";

/** Vista "Paso a paso": trámites del tipo elegido, con indicadores, filtros y semáforo de avance. */
export function TramitesPage() {
  const { idImpuesto, idTipo } = useParams();
  const { impuesto, tipo, isPending: cargandoTipos } = useImpuestoYTipo(idImpuesto, idTipo);
  const tramites = useTramites(tipo?.IdTipoDevolucion ?? null);
  const { L, lower } = useEtiquetas();

  const lista = useMemo(() => tramites.data ?? [], [tramites.data]);
  const c = useFiltrosTramites(lista);

  if (cargandoTipos) return <Cargando />;
  if (!impuesto || !tipo) return <Navigate to="/" replace />;

  return (
    <>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{impuesto.Nombre} · {tipo.Nombre}</p>
          <h1>{L("tramites")} asignados</h1>
          <p className="lede">Controla avance, deadline y lo que falta por hacer.</p>
        </div>
        <SelectorVista />
      </div>

      <KpisTramites c={c} />
      <FiltrosTramites c={c} />

      <div className="card overflow-hidden">
        {tramites.isPending && <div className="p-5"><Cargando texto={`Buscando tus ${lower("tramites")}…`} /></div>}
        {tramites.isError && <div className="alert alert-danger m-5">{tramites.error.message}</div>}
        {tramites.data && (
          <>
            <TablaTramites tramites={c.filtradas} />
            {c.filtradas.length === 0 && (
              <p className="p-5 text-small text-muted">
                {lista.length === 0
                  ? `No tienes ${lower("tramites")} de ${tipo.Nombre}. Se crean desde Administración, dentro de una ${lower("propuesta")}.`
                  : `No hay ${lower("tramites")} con esos filtros.`}
              </p>
            )}
          </>
        )}
      </div>
    </>
  );
}
