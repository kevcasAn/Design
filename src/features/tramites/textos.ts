import { daysUntil, formatDate, cuandoLabel } from "../../shared/lib/fechas";
import type { TramiteResumen } from "./api";

export const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export const estaCerrado = (t: TramiteResumen) => t.IdEstado !== 1;
export const estaPendiente = (t: TramiteResumen) => !estaCerrado(t);

/** 001, 002… según el orden de creación dentro de la propuesta. */
export const numeroLabel = (t: TramiteResumen) => String(t.Numero).padStart(3, "0");

/** "2026", "Marzo 2026", "Enero a Octubre 2026", "Junio 2026 a Julio 2027". */
export function periodoLabel(t: TramiteResumen): string {
  if (!t.Mes) return String(t.Ano);
  const desde = MESES[t.Mes - 1];
  if (!t.MesHasta) return `${desde} ${t.Ano}`;
  const hasta = MESES[t.MesHasta - 1];
  if (t.AnoHasta && t.AnoHasta !== t.Ano) return `${desde} ${t.Ano} a ${hasta} ${t.AnoHasta}`;
  return `${desde} a ${hasta} ${t.Ano}`;
}

export type Tono = "muted" | "ok" | "warn" | "danger";

export function deadlineTono(t: TramiteResumen): Tono {
  if (estaCerrado(t) || !t.Deadline) return "muted";
  const d = daysUntil(t.Deadline);
  if (d < 0) return "danger";
  if (d <= 7) return "warn";
  return "ok";
}

export function deadlineLabel(t: TramiteResumen): string {
  if (estaCerrado(t)) return "Cerrado";
  if (!t.Deadline) return "Sin deadline";
  const d = daysUntil(t.Deadline);
  if (d < 0) return `Deadline vencido hace ${Math.abs(d)} días`;
  if (d === 0) return "Deadline: hoy";
  if (d === 1) return "Deadline: mañana";
  return `Deadline en ${d} días`;
}

/** Vencimiento y plazo máximo del SRI, una línea cada uno. */
export function sriLineas(t: TramiteResumen): string[] {
  if (!t.FechaVencimiento) return ["Vencimiento SRI: sin fecha aún"];
  const lineas = [`Vencimiento SRI: ${formatDate(t.FechaVencimiento)} · ${cuandoLabel(t.FechaVencimiento)}`];
  if (t.FechaMaximaRespuestaSri) lineas.push(`Plazo máx. SRI: ${formatDate(t.FechaMaximaRespuestaSri)} · ${cuandoLabel(t.FechaMaximaRespuestaSri)}`);
  return lineas;
}

/** Color del semáforo: 0 % rojo → 100 % verde. */
export const colorAvance = (pct: number) => `hsl(${Math.round(pct * 1.2)} 70% 40%)`;
