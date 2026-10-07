import { useMemo, useState } from "react";
import { usePropuestas, useAccionesAdministracion } from "./hooks";
import { useMiRol } from "../seguridad/hooks";
import { useEtiquetas } from "../configuracion/hooks";
import { Cargando } from "../../shared/ui/Cargando";
import { FormNuevaPropuesta } from "./FormNuevaPropuesta";
import { PropuestaCard } from "./PropuestaCard";

/**
 * Administración: crear propuestas, armar equipos, agregar trámites y cerrar.
 * El administrador ve todo; los demás ven las propuestas donde están en el equipo
 * y pueden lo que su rol permite (tabla Roles).
 */
export function AdministracionPage() {
  const { L, lower } = useEtiquetas();
  const propuestas = usePropuestas();
  const miRol = useMiRol();
  const { actualizarRol } = useAccionesAdministracion();
  const [creando, setCreando] = useState(false);
  const [buscar, setBuscar] = useState("");
  const [verCerradas, setVerCerradas] = useState(false);

  const datos = propuestas.data;
  const esAdmin = Boolean(datos?.EsAdministrador);

  const lista = useMemo(() => {
    const t = buscar.trim().toLowerCase();
    return (datos?.Propuestas ?? []).filter((p) => (verCerradas || p.Abierta) && (!t || `${p.Cliente} ${p.NumeroPropuesta}`.toLowerCase().includes(t)));
  }, [datos, buscar, verCerradas]);

  // Trámites por cliente: para "continúa otro trámite"
  const tramitesPorCliente = useMemo(() => {
    const mapa = new Map<number, ReturnType<typeof aplanar>>();
    function aplanar(idCliente: number) {
      return (datos?.Propuestas ?? []).filter((p) => p.IdCliente === idCliente).flatMap((p) => p.Tramites.map((t) => ({ ...t, NumeroPropuesta: p.NumeroPropuesta })));
    }
    (datos?.Propuestas ?? []).forEach((p) => { if (!mapa.has(p.IdCliente)) mapa.set(p.IdCliente, aplanar(p.IdCliente)); });
    return mapa;
  }, [datos]);

  if (propuestas.isPending) return <Cargando texto={`Cargando ${lower("propuestas")}…`} />;
  if (propuestas.isError) return <div className="alert alert-danger">{propuestas.error.message}</div>;

  const cerradas = (datos?.Propuestas ?? []).filter((p) => !p.Abierta).length;

  return (
    <>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Administración</p>
          <h1>{L("propuestas")} y {lower("tramites")}</h1>
          <p className="lede">
            {esAdmin
              ? `Aquí se crean las ${lower("propuestas")}, se arma su equipo y se agregan sus ${lower("tramites")}. Solo se pueden agregar ${lower("tramites")} mientras la ${lower("propuesta")} está abierta.`
              : `Estas son las ${lower("propuestas")} donde estás en el equipo. Agregar ${lower("tramites")} se puede a partir de Revisor; cambiar el equipo, el Aprobador.`}
          </p>
        </div>
        {esAdmin && !creando && <button type="button" className="btn btn-primary" onClick={() => setCreando(true)}>+ Crear {lower("propuesta")}</button>}
      </div>

      {esAdmin && creando && <div className="mb-5"><FormNuevaPropuesta onListo={() => setCreando(false)} /></div>}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.2-3.2" /></svg>
          <input type="search" placeholder={`Buscar ${lower("cliente")} o ${lower("propuesta")}`} value={buscar} onChange={(e) => setBuscar(e.target.value)} />
        </label>
        {cerradas > 0 && (
          <label className="flex items-center gap-2 text-small">
            <input type="checkbox" checked={verCerradas} onChange={(e) => setVerCerradas(e.target.checked)} /> Ver también las cerradas ({cerradas})
          </label>
        )}
      </div>

      <div className="grid gap-4">
        {lista.map((p) => (
          <PropuestaCard key={p.IdProducto} p={p} esAdmin={esAdmin} anteriores={(tramitesPorCliente.get(p.IdCliente) ?? [])} />
        ))}
        {lista.length === 0 && (
          <div className="card p-5 text-small text-muted">
            {(datos?.Propuestas.length ?? 0) === 0
              ? esAdmin ? `Todavía no hay ${lower("propuestas")}. Crea la primera con el botón de arriba.` : `No estás en el equipo de ninguna ${lower("propuesta")}.`
              : `No hay ${lower("propuestas")} con ese filtro.`}
          </div>
        )}
      </div>

      {esAdmin && miRol.data && (
        <section className="card mt-8 p-5">
          <h2>Roles y permisos</h2>
          <p className="mb-3 text-small text-muted">
            Qué puede hacer cada rol. Administrador es quien está en la tabla Permisos; los demás roles salen del equipo de cada {lower("propuesta")}.
          </p>
          <table className="grid-table">
            <thead><tr><th>Rol</th><th>Crear {lower("propuestas")}</th><th>Crear {lower("tramites")}</th><th>Cambiar equipo</th></tr></thead>
            <tbody>
              {miRol.data.Roles.map((r) => {
                const fijo = r.Nombre.toLowerCase().startsWith("administrador");
                const cambiar = (campo: "PuedeCrearPropuestas" | "PuedeCrearTramites" | "PuedeCambiarEquipo", valor: boolean) =>
                  actualizarRol.mutate({ idRol: r.IdRol, cambio: { PuedeCrearPropuestas: r.PuedeCrearPropuestas, PuedeCrearTramites: r.PuedeCrearTramites, PuedeCambiarEquipo: r.PuedeCambiarEquipo, [campo]: valor } });
                return (
                  <tr key={r.IdRol}>
                    <td className="font-semibold">{r.Nombre}</td>
                    {(["PuedeCrearPropuestas", "PuedeCrearTramites", "PuedeCambiarEquipo"] as const).map((campo) => (
                      <td key={campo}>
                        <input type="checkbox" checked={r[campo]} disabled={fijo || actualizarRol.isPending || campo === "PuedeCrearPropuestas"} onChange={(e) => cambiar(campo, e.target.checked)} aria-label={`${campo} de ${r.Nombre}`} />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="mt-2 text-tiny text-muted">Crear {lower("propuestas")} es solo del administrador.</p>
          {actualizarRol.isError && <div className="alert alert-danger mt-2">{actualizarRol.error.message}</div>}
        </section>
      )}
    </>
  );
}
