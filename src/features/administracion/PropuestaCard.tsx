import { useState } from "react";
import type { PersonaEquipo, Propuesta, PropuestaTramite } from "./api";
import { useAccionesAdministracion } from "./hooks";
import { useEtiquetas } from "../configuracion/hooks";
import { EditorEquipo } from "./EditorEquipo";
import { FormNuevoTramite } from "./FormNuevoTramite";
import { periodoTramite, rolesDe } from "./textos";
import { confirmar, pedirTexto } from "../../shared/ui/dialogos";
import { useAvisoStore } from "../../shared/ui/avisoStore";
import { formatDate } from "../../shared/lib/fechas";
import { colorAvance } from "../tramites/textos";

interface Props {
  p: Propuesta;
  esAdmin: boolean;
  anteriores: (PropuestaTramite & { NumeroPropuesta: string })[];
}

type Panel = null | "equipo" | "tramite" | "tramites";

/** Una propuesta en Administración: equipo, trámites, agregar trámite y cierre. */
export function PropuestaCard({ p, esAdmin, anteriores }: Props) {
  const { L, lower } = useEtiquetas();
  const acciones = useAccionesAdministracion();
  const avisar = useAvisoStore((s) => s.mostrar);
  const [panel, setPanel] = useState<Panel>(null);
  const [equipo, setEquipo] = useState<PersonaEquipo[]>(p.Equipo);

  const alternar = (x: Exclude<Panel, null>) => { if (x === "equipo") setEquipo(p.Equipo); setPanel((actual) => (actual === x ? null : x)); };

  const cerrar = async () => {
    const motivo = await pedirTexto({
      titulo: `Cerrar ${lower("propuesta")} ${p.NumeroPropuesta}`,
      texto: `Ya no se le podrán agregar ${lower("tramites")}, y los que estén en curso se cierran con ella. Indica el motivo.`,
      confirmar: `Cerrar ${lower("propuesta")}`
    });
    if (motivo) acciones.cerrarPropuesta.mutate({ idProducto: p.IdProducto, motivo }, { onSuccess: () => avisar(`${L("propuesta")} cerrada.`) });
  };

  const reabrir = async () => {
    const ok = await confirmar({ titulo: `¿Reabrir la ${lower("propuesta")} ${p.NumeroPropuesta}?`, texto: `También se reabren los ${lower("tramites")} que se cerraron con ella.`, confirmar: "Sí, reabrir" });
    if (ok) acciones.reabrirPropuesta.mutate(p.IdProducto, { onSuccess: () => avisar(`${L("propuesta")} reabierta.`) });
  };

  const cerrarTramite = async (t: PropuestaTramite) => {
    const motivo = await pedirTexto({
      titulo: `Cerrar ${lower("tramite")} ${String(t.Numero).padStart(3, "0")} · ${periodoTramite(t)}`,
      texto: `El ${lower("tramite")} queda cerrado sin terminar y deja de aparecer entre los pendientes. Indica el motivo.`,
      confirmar: `Cerrar ${lower("tramite")}`
    });
    if (motivo) acciones.cerrarTramite.mutate({ idTramite: t.IdTramite, motivo }, { onSuccess: () => avisar(`${L("tramite")} cerrado.`) });
  };

  const error = acciones.cerrarPropuesta.error ?? acciones.reabrirPropuesta.error ?? acciones.cerrarTramite.error ?? acciones.reabrirTramite.error ?? acciones.cambiarEquipo.error;

  return (
    <article className={`card p-5 ${p.Abierta ? "" : "opacity-90"}`}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex flex-wrap items-center gap-2">
            {p.Cliente} <span className="font-mono text-small text-muted">{p.NumeroPropuesta}</span>
            <span className={`badge ${p.Abierta ? "badge-ok" : ""}`}>{p.Abierta ? "Abierta" : "Cerrada"}</span>
          </h3>
          <p className="mt-1 text-small text-muted">
            {p.Tipos.map((t) => `${t.Impuesto} · ${t.Nombre}`).join("  +  ")}
          </p>
          {p.Tipos.some((t) => !t.EsPrincipal && t.Justificacion) && (
            <p className="mt-1 text-tiny text-warn">Más de un tipo: {p.Tipos.find((t) => !t.EsPrincipal)?.Justificacion}</p>
          )}
          {!p.Abierta && <p className="mt-1 text-tiny text-muted">Cerrada por {p.UserNameCierre}{p.FechaCierre ? ` el ${formatDate(p.FechaCierre)}` : ""}: {p.MotivoCierre}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => alternar("equipo")}>Equipo ({p.Equipo.length})</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => alternar("tramites")}>{L("tramites")} ({p.Tramites.length})</button>
          {p.Abierta && p.PuedeCrearTramites && (
            <button type="button" className="btn btn-primary btn-sm" onClick={() => alternar("tramite")}>+ Agregar {lower("tramite")}</button>
          )}
          {esAdmin && (p.Abierta
            ? <button type="button" className="btn btn-ghost btn-sm" onClick={cerrar}>Cerrar {lower("propuesta")}</button>
            : <button type="button" className="btn btn-ghost btn-sm" onClick={reabrir}>Reabrir</button>)}
        </div>
      </header>

      {error && <div className="alert alert-danger mt-3">{error.message}</div>}

      {panel === "equipo" && (
        <section className="mt-4 grid gap-3">
          {p.PuedeCambiarEquipo ? (
            <>
              <EditorEquipo equipo={equipo} onCambiar={setEquipo} />
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={acciones.cambiarEquipo.isPending}
                  onClick={() => acciones.cambiarEquipo.mutate({ idProducto: p.IdProducto, equipo }, { onSuccess: () => { avisar("Equipo guardado."); setPanel(null); } })}
                >
                  Guardar equipo
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPanel(null)}>Cancelar</button>
              </div>
            </>
          ) : (
            <ul className="m-0 grid gap-1 p-0 text-small">
              {p.Equipo.map((e) => <li key={e.UserName} className="list-none"><b>{e.UserName}</b> · {rolesDe(e)}</li>)}
              {p.Equipo.length === 0 && <li className="list-none text-muted">Sin equipo asignado.</li>}
            </ul>
          )}
        </section>
      )}

      {panel === "tramite" && (
        <section className="mt-4">
          <FormNuevoTramite propuesta={p} anteriores={anteriores} onListo={() => setPanel("tramites")} />
        </section>
      )}

      {panel === "tramites" && (
        <section className="mt-4 overflow-x-auto">
          {p.Tramites.length === 0 ? (
            <p className="m-0 text-small text-muted">Esta {lower("propuesta")} todavía no tiene {lower("tramites")}.</p>
          ) : (
            <table className="grid-table">
              <thead><tr><th>N.º</th><th>Periodo</th><th>Tipo</th><th>Deadline</th><th>Avance</th><th>Estado</th><th></th></tr></thead>
              <tbody>
                {p.Tramites.map((t) => (
                  <tr key={t.IdTramite}>
                    <td className="font-mono">{String(t.Numero).padStart(3, "0")}</td>
                    <td>{periodoTramite(t)}</td>
                    <td className="text-muted">{t.TipoDevolucion}</td>
                    <td>{formatDate(t.Deadline)}</td>
                    <td style={{ color: colorAvance(t.Avance) }}>{t.Avance}%</td>
                    <td>
                      <span className={`badge ${t.IdEstado === 1 ? "badge-info" : t.IdEstado === 3 ? "badge-danger" : ""}`} title={t.MotivoCierre ?? ""}>{t.Estado}</span>
                    </td>
                    <td className="text-right">
                      {esAdmin && t.IdEstado === 1 && <button type="button" className="btn btn-ghost btn-sm" onClick={() => cerrarTramite(t)}>Cerrar</button>}
                      {esAdmin && t.IdEstado === 4 && p.Abierta && (
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => acciones.reabrirTramite.mutate(t.IdTramite, { onSuccess: () => avisar(`${L("tramite")} reabierto.`) })}>Reabrir</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
    </article>
  );
}
