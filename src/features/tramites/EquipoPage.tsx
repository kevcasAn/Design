import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listarEquipo } from "./api";
import { useExpediente } from "../expediente/hooks";
import { useEtiquetas } from "../configuracion/hooks";
import { numeroLabel, periodoLabel } from "./textos";
import { Cargando } from "../../shared/ui/Cargando";

/** Quién trabaja un trámite: su equipo propio o, si no tiene, el de la propuesta. */
export function EquipoPage() {
  const { idImpuesto, idTipo, idTramite } = useParams();
  const id = Number(idTramite);
  const expediente = useExpediente(id);
  const equipo = useQuery({ queryKey: ["equipo", id], queryFn: () => listarEquipo(id) });
  const { L, lower } = useEtiquetas();
  const t = expediente.data?.Tramite;
  const heredado = equipo.data?.length ? equipo.data.every((m) => m.Origen === "Propuesta") : false;

  return (
    <>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Equipo del {lower("tramite")}</p>
          <h1>Quién trabaja este {lower("tramite")}</h1>
          {t && <p className="lede">{t.Cliente} · {L("propuesta")} {t.NumeroPropuesta} · {L("tramite")} {numeroLabel(t)} · {periodoLabel(t)}</p>}
        </div>
        <Link to={`/impuestos/${idImpuesto}/tipos/${idTipo}`} className="btn btn-ghost no-underline">Volver</Link>
      </div>

      {equipo.isPending && <Cargando texto="Cargando el equipo…" />}
      {equipo.isError && <div className="alert alert-danger">{equipo.error.message}</div>}

      {equipo.data && (
        <div className="card overflow-hidden">
          <p className="m-0 p-4 text-small text-muted">
            {equipo.data.length === 0
              ? `Este ${lower("tramite")} no tiene equipo asignado.`
              : heredado
              ? `Este ${lower("tramite")} usa el equipo de la ${lower("propuesta")}.`
              : `Este ${lower("tramite")} tiene su propio equipo.`}
          </p>
          {equipo.data.length > 0 && (
            <table className="grid-table">
              <thead><tr><th>Usuario</th><th>Ejecutor</th><th>Revisor</th><th>Aprobador (responsable)</th></tr></thead>
              <tbody>
                {equipo.data.map((m) => (
                  <tr key={m.UserName}>
                    <td className="font-semibold">{m.UserName}</td>
                    <td>{m.EsEjecutor ? "Sí" : "—"}</td>
                    <td>{m.EsRevisor ? "Sí" : "—"}</td>
                    <td>{m.EsAprobador ? "Sí" : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </>
  );
}
