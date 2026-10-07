import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useExpediente } from "./hooks";
import { imprimirIdsExpediente } from "./ids";
import { VersionFase } from "./versiones/VersionFase";
import { Mascota } from "../asistente/Mascota";
import { Cargando } from "../../shared/ui/Cargando";
import { useEtiquetas } from "../configuracion/hooks";
import { formatDate } from "../../shared/lib/fechas";
import { colorAvance, deadlineLabel, deadlineTono, numeroLabel, periodoLabel, sriLineas } from "../tramites/textos";

/** Expediente de un trámite: fases arriba, pasos de la fase y las cargas de cada paso. */
export function ExpedientePage() {
  const { idImpuesto, idTipo, idTramite } = useParams();
  const expediente = useExpediente(idTramite ? Number(idTramite) : null);
  const { L, lower } = useEtiquetas();
  const [parametros] = useSearchParams();
  const idFase = parametros.get("fase") ? Number(parametros.get("fase")) : null;
  const [idPaso, setIdPaso] = useState<number | null>(null);
  const [statsAbiertas, setStatsAbiertas] = useState(true);

  const fases = expediente.data?.Fases ?? [];
  const fase = fases.find((f) => f.IdFase === idFase) ?? fases[0] ?? null;
  const paso = fase?.Pasos.find((p) => p.IdPaso === idPaso) ?? fase?.Pasos[0] ?? null;

  // Al cambiar de fase se vuelve al primer paso
  useEffect(() => setIdPaso(null), [idFase]);

  const volver = `/impuestos/${idImpuesto}/tipos/${idTipo}`;

  if (expediente.isPending) return <Cargando texto={`Abriendo el ${lower("tramite")}…`} />;
  if (expediente.isError) {
    return (
      <>
        <div className="alert alert-danger">{expediente.error.message}</div>
        <Link to={volver} className="btn btn-ghost mt-3 no-underline">Volver a {lower("tramites")}</Link>
      </>
    );
  }

  const t = expediente.data.Tramite;
  const enCurso = t.IdEstado === 1;
  const color = colorAvance(t.Avance);

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <h1 className="expediente-linea cursor-pointer" title="Clic: ver los ids en la consola (F12)" onClick={() => imprimirIdsExpediente(t, fase, paso)}>
          {t.Cliente} · {L("propuesta")} {t.NumeroPropuesta} · {L("tramite")} {numeroLabel(t)} · {periodoLabel(t)}
        </h1>
        <span className={`badge ${t.IdEstado === 3 ? "badge-danger" : "badge-ok"}`}>{t.Estado}</span>
      </div>

      <div className="stats-bloque mb-5">
        <button
          type="button"
          className="resumen-toggle"
          aria-expanded={statsAbiertas}
          aria-label={statsAbiertas ? "Contraer" : "Desplegar"}
          onClick={() => setStatsAbiertas((v) => !v)}
        >
          <span>Avance {t.Avance}%</span>
          <span>{t.Deadline ? formatDate(t.Deadline) : "Sin fecha"}</span>
          <span>SRI</span>
          <svg className={statsAbiertas ? "is-open" : ""} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
        </button>
        <div className={`stats-cuerpo ${statsAbiertas ? "is-abierto" : ""}`}>
          <div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="stat">
                <span>Avance</span>
                <strong style={{ color }}>{t.Avance}%</strong>
                <div className="progress-track mt-1 w-full"><div className="progress-bar" style={{ width: `${Math.max(t.Avance, 3)}%`, background: color }} /></div>
              </div>
              <div className="stat">
                <span>Deadline</span>
                <strong className={`due-${deadlineTono(t)}`}>{t.Deadline ? formatDate(t.Deadline) : "Sin fecha"}</strong>
                <small>{deadlineLabel(t)}</small>
              </div>
              <div className="stat">
                <span>SRI</span>
                {sriLineas(t).map((l) => <small key={l}>{l}</small>)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {!enCurso && (
        <div className="alert alert-info mb-4">
          Este {lower("tramite")} está cerrado{t.MotivoCierre ? `: ${t.MotivoCierre}` : ""}. Se puede consultar, no modificar.
        </div>
      )}

      {fases.length === 0 ? (
        <div className="card p-5 text-small text-muted">
          Este tipo de devolución todavía no tiene pasos configurados. Se definen en las tablas Pasos y PasosDetalle.
        </div>
      ) : (
        <>
          {fase && (
            <VersionFase
              key={fase.IdFase}
              fase={fase}
              pasoId={idPaso}
              onPaso={setIdPaso}
              idTramite={t.IdTramite}
              editable={enCurso}
            />
          )}
          {paso?.Mascota && <Mascota idTramite={t.IdTramite} paso={paso} />}
        </>
      )}
    </>
  );
}
