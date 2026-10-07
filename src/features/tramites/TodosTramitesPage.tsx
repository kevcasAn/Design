import { useMemo } from "react";
import { Cargando } from "../../shared/ui/Cargando";
import { useImpuestos } from "../impuestos/hooks";
import { IconoImpuesto } from "../impuestos/IconoImpuesto";
import { useEtiquetas } from "../configuracion/hooks";
import { useTramitesDeTipos } from "./hooks";
import { FiltrosTramites, KpisTramites, TablaTramites, useFiltrosTramites } from "./listaTramites";
import { SelectorVista } from "./SelectorVista";
import { useVistaStore } from "./vistaStore";
import type { TramiteResumen } from "./api";
import { estaPendiente } from "./textos";
import { daysUntil } from "../../shared/lib/fechas";

const vencidos = (lista: TramiteResumen[]) => lista.filter((t) => estaPendiente(t) && t.Deadline && daysUntil(t.Deadline) < 0).length;

/**
 * Vista "Agrupado": todos los trámites del usuario en una pantalla.
 * Arriba se marcan impuestos y tipos de devolución (sin marcar = todos);
 * abajo salen agrupados en acordeones por impuesto y por tipo.
 */
export function TodosTramitesPage() {
  const { L, lower } = useEtiquetas();
  const impuestos = useImpuestos();
  const v = useVistaStore();

  const todosLosTipos = useMemo(() => (impuestos.data ?? []).flatMap((i) => i.TiposDevoluciones), [impuestos.data]);
  const { lista: todos, cargando, error } = useTramitesDeTipos(todosLosTipos.map((t) => t.IdTipoDevolucion));

  // Impuestos marcados (ninguno = todos) y, dentro de ellos, tipos marcados (ninguno = todos)
  const impuestosVisibles = useMemo(
    () => (impuestos.data ?? []).filter((i) => v.impuestos.length === 0 || v.impuestos.includes(i.IdImpuesto)),
    [impuestos.data, v.impuestos]
  );
  const tiposDisponibles = useMemo(() => impuestosVisibles.flatMap((i) => i.TiposDevoluciones), [impuestosVisibles]);
  const tiposMarcados = useMemo(() => v.tipos.filter((id) => tiposDisponibles.some((t) => t.IdTipoDevolucion === id)), [v.tipos, tiposDisponibles]);
  const tipoVisible = (id: number) => tiposMarcados.length === 0 || tiposMarcados.includes(id);

  const lista = useMemo(
    () => todos.filter((t) => tiposDisponibles.some((x) => x.IdTipoDevolucion === t.IdTipoDevolucion) && (tiposMarcados.length === 0 || tiposMarcados.includes(t.IdTipoDevolucion))),
    [todos, tiposDisponibles, tiposMarcados]
  );
  const c = useFiltrosTramites(lista);

  const cuentaTipo = (id: number) => todos.filter((t) => t.IdTipoDevolucion === id).length;
  const cuentaImpuesto = (id: number) => todos.filter((t) => t.IdImpuesto === id).length;

  // Grupos que tienen algo que mostrar después de los filtros
  const grupos = impuestosVisibles
    .map((i) => ({
      impuesto: i,
      tipos: i.TiposDevoluciones
        .filter((t) => tipoVisible(t.IdTipoDevolucion))
        .map((t) => ({ tipo: t, tramites: c.filtradas.filter((x) => x.IdTipoDevolucion === t.IdTipoDevolucion) }))
        .filter((g) => g.tramites.length > 0)
    }))
    .filter((g) => g.tipos.length > 0);

  const claves = grupos.flatMap((g) => [`i-${g.impuesto.IdImpuesto}`, ...g.tipos.map((t) => `t-${t.tipo.IdTipoDevolucion}`)]);
  const todoCerrado = claves.length > 0 && claves.every((k) => v.cerrados.includes(k));

  if (impuestos.isPending) return <Cargando texto="Cargando impuestos…" />;
  if (impuestos.isError) return <div className="alert alert-danger">{impuestos.error.message}</div>;

  return (
    <>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Todos los impuestos</p>
          <h1>{L("tramites")} asignados</h1>
          <p className="lede">Marca los impuestos y tipos de devolución que quieres ver. Sin marcar ninguno, salen todos.</p>
        </div>
        <SelectorVista />
      </div>

      <div className="card mb-4 grid gap-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="filtro-titulo">Impuesto</span>
          {impuestos.data.map((i) => (
            <button
              key={i.IdImpuesto}
              type="button"
              className={`pastilla pastilla--impuesto ${v.impuestos.includes(i.IdImpuesto) ? "is-active" : ""}`}
              aria-pressed={v.impuestos.includes(i.IdImpuesto)}
              onClick={() => v.alternarImpuesto(i.IdImpuesto)}
            >
              <span className="pastilla-icono"><IconoImpuesto nombre={i.Nombre} /></span>
              {i.Nombre}
              <span className="pastilla-cuenta">{cuentaImpuesto(i.IdImpuesto)}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="filtro-titulo">Tipo de devolución</span>
          {impuestosVisibles.map((i) => i.TiposDevoluciones.map((t) => (
            <button
              key={t.IdTipoDevolucion}
              type="button"
              className={`pastilla ${tiposMarcados.includes(t.IdTipoDevolucion) ? "is-active" : ""} ${cuentaTipo(t.IdTipoDevolucion) === 0 ? "is-vacia" : ""}`}
              aria-pressed={tiposMarcados.includes(t.IdTipoDevolucion)}
              title={`${i.Nombre} · ${t.Nombre}`}
              onClick={() => v.alternarTipo(t.IdTipoDevolucion)}
            >
              {impuestosVisibles.length > 1 && <span className="pastilla-prefijo">{i.Nombre}</span>}
              {t.Nombre}
              <span className="pastilla-cuenta">{cuentaTipo(t.IdTipoDevolucion)}</span>
            </button>
          )))}
          {(v.impuestos.length > 0 || tiposMarcados.length > 0) && (
            <button type="button" className="enlace text-small" onClick={v.limpiarSeleccion}>Ver todos</button>
          )}
        </div>
      </div>

      <KpisTramites c={c} />
      <FiltrosTramites c={c} />

      {cargando && <div className="card p-5"><Cargando texto={`Buscando tus ${lower("tramites")}…`} /></div>}
      {error && <div className="alert alert-danger">{error.message}</div>}

      {!cargando && !error && (
        <>
          {grupos.length > 0 && (
            <div className="mb-2 flex items-center justify-between text-small text-muted">
              <span>{c.filtradas.length} {c.filtradas.length === 1 ? lower("tramite") : lower("tramites")}</span>
              <button type="button" className="enlace" onClick={() => v.setCerrados(todoCerrado ? [] : claves)}>
                {todoCerrado ? "Abrir todo" : "Cerrar todo"}
              </button>
            </div>
          )}

          <div className="grid gap-4">
            {grupos.map((g) => {
              const claveI = `i-${g.impuesto.IdImpuesto}`;
              const abiertoI = !v.cerrados.includes(claveI);
              const delImpuesto = g.tipos.flatMap((t) => t.tramites);
              const venc = vencidos(delImpuesto);
              return (
                <section key={claveI} className="acordeon">
                  <button type="button" className="acordeon-cabecera" aria-expanded={abiertoI} onClick={() => v.alternarAcordeon(claveI)}>
                    <span className="acordeon-icono"><IconoImpuesto nombre={g.impuesto.Nombre} /></span>
                    <span className="acordeon-titulo">{g.impuesto.Nombre}</span>
                    <span className="badge">{delImpuesto.length} {delImpuesto.length === 1 ? lower("tramite") : lower("tramites")}</span>
                    {venc > 0 && <span className="badge badge-danger">{venc} con deadline vencido</span>}
                    <Flecha abierto={abiertoI} />
                  </button>

                  {abiertoI && (
                    <div className="acordeon-cuerpo">
                      {g.tipos.map(({ tipo, tramites }) => {
                        const claveT = `t-${tipo.IdTipoDevolucion}`;
                        const abiertoT = !v.cerrados.includes(claveT);
                        const vencT = vencidos(tramites);
                        return (
                          <div key={claveT} className="subacordeon">
                            <button type="button" className="subacordeon-cabecera" aria-expanded={abiertoT} onClick={() => v.alternarAcordeon(claveT)}>
                              <Flecha abierto={abiertoT} />
                              <span className="font-semibold text-ink">{tipo.Nombre}</span>
                              <span className="text-tiny text-muted">{tramites.length}</span>
                              {vencT > 0 && <span className="punto-alerta" title={`${vencT} con deadline vencido`} />}
                            </button>
                            {abiertoT && <TablaTramites tramites={tramites} />}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              );
            })}
          </div>

          {grupos.length === 0 && (
            <div className="card p-5 text-small text-muted">
              {todos.length === 0
                ? `No tienes ${lower("tramites")} asignados. Se crean desde Administración, dentro de una ${lower("propuesta")}.`
                : lista.length === 0
                  ? `No tienes ${lower("tramites")} en lo que marcaste arriba.`
                  : `No hay ${lower("tramites")} con esos filtros.`}
            </div>
          )}
        </>
      )}
    </>
  );
}

function Flecha({ abierto }: { abierto: boolean }) {
  return (
    <svg className={`acordeon-flecha ${abierto ? "is-open" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}
