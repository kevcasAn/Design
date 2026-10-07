import { useMemo, useState } from "react";
import { AccesosFases } from "./AccesosFases";
import { useEtiquetas } from "../configuracion/hooks";
import type { TramiteResumen } from "./api";
import { daysUntil, formatDate } from "../../shared/lib/fechas";
import { colorAvance, deadlineLabel, deadlineTono, estaCerrado, estaPendiente, MESES, numeroLabel, periodoLabel, sriLineas } from "./textos";

/*
 * Piezas de la lista de trámites que comparten las dos vistas
 * ("Paso a paso" y "Agrupado"): indicadores, filtros y tabla.
 */

type Kpi = "" | "asignados" | "ejecutar" | "semana" | "vencidos";

interface Filtros {
  q: string;
  anio: string;
  mes: string;
  estado: "" | "ejecutar" | "completo";
  vence: "" | "vencido" | "7" | "15" | "30";
  kpi: Kpi;
}

const FILTROS_INICIALES: Filtros = { q: "", anio: "", mes: "", estado: "ejecutar", vence: "", kpi: "" };

/** Estado de los filtros y la lista ya filtrada y ordenada. */
export function useFiltrosTramites(lista: TramiteResumen[]) {
  const { L } = useEtiquetas();
  const [f, setF] = useState<Filtros>(FILTROS_INICIALES);

  const kpis = useMemo(() => {
    const dias = (t: TramiteResumen) => (t.Deadline ? daysUntil(t.Deadline) : Number.POSITIVE_INFINITY);
    return [
      { id: "asignados" as Kpi, label: "Asignados", value: lista.length, hint: `${L("tramites")} en tu cartera`, color: "var(--color-navy)" },
      { id: "ejecutar" as Kpi, label: "Por ejecutar", value: lista.filter(estaPendiente).length, hint: "Todavía no están cerrados", color: "var(--color-burgundy)" },
      { id: "semana" as Kpi, label: "Deadline en 7 días", value: lista.filter((t) => estaPendiente(t) && dias(t) >= 0 && dias(t) <= 7).length, hint: "El deadline se cumple esta semana", color: "var(--color-warn)" },
      { id: "vencidos" as Kpi, label: "Deadline vencido", value: lista.filter((t) => estaPendiente(t) && dias(t) < 0).length, hint: "Pasaron el deadline sin terminar", color: "var(--color-danger)" }
    ];
  }, [lista, L]);

  const anios = useMemo(() => [...new Set(lista.map((t) => t.Ano))].sort((a, b) => b - a), [lista]);

  const filtradas = useMemo(() => {
    const term = f.q.trim().toLowerCase();
    return lista
      .filter((t) => {
        if (term && !`${t.Cliente} ${t.NumeroPropuesta}`.toLowerCase().includes(term)) return false;
        if (f.anio && String(t.Ano) !== f.anio) return false;
        if (f.mes && String(t.Mes ?? "") !== f.mes) return false;
        if (f.kpi !== "asignados") {
          if (f.estado === "ejecutar" && estaCerrado(t)) return false;
          if (f.estado === "completo" && !estaCerrado(t)) return false;
        }
        const d = t.Deadline ? daysUntil(t.Deadline) : Number.POSITIVE_INFINITY;
        if (f.vence === "vencido" && (estaCerrado(t) || d >= 0)) return false;
        if (["7", "15", "30"].includes(f.vence) && (estaCerrado(t) || d < 0 || d > Number(f.vence))) return false;
        if (f.kpi === "ejecutar" && estaCerrado(t)) return false;
        if (f.kpi === "semana" && (estaCerrado(t) || d < 0 || d > 7)) return false;
        if (f.kpi === "vencidos" && (estaCerrado(t) || d >= 0)) return false;
        return true;
      })
      .sort((a, b) => a.Cliente.localeCompare(b.Cliente) || a.NumeroPropuesta.localeCompare(b.NumeroPropuesta) || a.Ano - b.Ano || (a.Mes ?? 0) - (b.Mes ?? 0));
  }, [lista, f]);

  const elegirKpi = (id: Kpi) =>
    setF((prev) => (prev.kpi === id ? { ...prev, kpi: "", estado: "ejecutar" } : { ...prev, kpi: id, estado: id === "asignados" ? "" : "ejecutar" }));

  return { f, setF, kpis, anios, filtradas, elegirKpi, limpiar: () => setF(FILTROS_INICIALES) };
}

type Control = ReturnType<typeof useFiltrosTramites>;

/** Los cuatro indicadores de arriba. Un clic filtra la lista. */
export function KpisTramites({ c }: { c: Control }) {
  return (
    <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {c.kpis.map((k) => (
        <button key={k.id} type="button" className={`kpi ${c.f.kpi === k.id ? "is-active" : ""}`} style={{ "--kpi": k.color } as React.CSSProperties} onClick={() => c.elegirKpi(k.id)}>
          <span className="kpi-label">{k.label}</span>
          <span className="kpi-value">{k.value}</span>
          <span className="kpi-hint">{k.hint}</span>
        </button>
      ))}
    </div>
  );
}

/** Buscador y filtros de año, mes, estado y deadline. */
export function FiltrosTramites({ c, alLimpiar }: { c: Control; alLimpiar?: () => void }) {
  const { lower } = useEtiquetas();
  const { f, setF } = c;
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <label className="search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.2-3.2" /></svg>
        <input type="search" placeholder={`Buscar ${lower("cliente")} o ${lower("propuesta")}`} value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} />
      </label>
      <select className="filtro" value={f.anio} onChange={(e) => setF({ ...f, anio: e.target.value })} aria-label="Año">
        <option value="">Todos los años</option>
        {c.anios.map((a) => <option key={a} value={a}>{a}</option>)}
      </select>
      <select className="filtro" value={f.mes} onChange={(e) => setF({ ...f, mes: e.target.value })} aria-label="Mes">
        <option value="">Todos los meses</option>
        {MESES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
      </select>
      <select className="filtro" value={f.estado} onChange={(e) => setF({ ...f, estado: e.target.value as Filtros["estado"], kpi: "" })} aria-label="Estado">
        <option value="">Todos los estados</option>
        <option value="ejecutar">Por ejecutar</option>
        <option value="completo">Cerrados</option>
      </select>
      <select className="filtro" value={f.vence} onChange={(e) => setF({ ...f, vence: e.target.value as Filtros["vence"] })} aria-label="Deadline">
        <option value="">Cualquier deadline</option>
        <option value="vencido">Deadline vencido</option>
        <option value="7">Deadline en 7 días</option>
        <option value="15">Deadline en 15 días</option>
        <option value="30">Deadline en 30 días</option>
      </select>
      <button type="button" className="btn btn-ghost" onClick={() => { c.limpiar(); alLimpiar?.(); }}>Limpiar</button>
    </div>
  );
}

/** La tabla de trámites: una fila por trámite con sus accesos a cada fase. */
export function TablaTramites({ tramites }: { tramites: TramiteResumen[] }) {
  const { L, lower } = useEtiquetas();
  return (
    <div className="overflow-x-auto">
      <table className="grid-table">
        <thead>
          <tr>
            <th>{L("cliente")}</th>
            <th>N.º {lower("propuesta")} · Periodo</th>
            <th>Progreso</th>
            <th>Deadline · Vencimiento SRI</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {tramites.map((t) => <FilaTramite key={t.IdTramite} t={t} />)}
        </tbody>
      </table>
    </div>
  );
}

function FilaTramite({ t }: { t: TramiteResumen }) {
  const tono = deadlineTono(t);
  const color = colorAvance(t.Avance);
  return (
    <tr>
      <td>
        <div className="font-semibold">{t.Cliente}</div>
        <div className="text-tiny text-muted">{numeroLabel(t)} de {t.TotalEnPropuesta}</div>
      </td>
      <td>
        <div className="font-mono font-semibold">{t.NumeroPropuesta}</div>
        <div className="text-muted">{periodoLabel(t)}</div>
      </td>
      <td>
        <div className="flex items-center gap-2" title={`${t.Avance}% completado, según el peso de cada carga`}>
          <div className="progress-track"><div className="progress-bar" style={{ width: `${Math.max(t.Avance, 3)}%`, background: color }} /></div>
          <span style={{ color }}>{t.Avance}%</span>
          {t.IdEstado === 3 && <span className="badge badge-danger">Rechazado por el SRI</span>}
          {t.IdEstado === 4 && <span className="badge" title={t.MotivoCierre ?? ""}>Cerrado · admin</span>}
          {t.IdEstado === 2 && <span className="badge badge-ok">Cerrado</span>}
        </div>
      </td>
      <td>
        <div className={`due due-${tono}`}>Deadline: {t.Deadline ? formatDate(t.Deadline) : "sin fecha"}</div>
        <div className={`text-tiny due-${tono}`}>{deadlineLabel(t)}</div>
        {sriLineas(t).map((l) => <div key={l} className="text-tiny text-muted">{l}</div>)}
      </td>
      <td><AccesosFases t={t} /></td>
    </tr>
  );
}
