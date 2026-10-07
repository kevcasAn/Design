import { MESES } from "../tramites/textos";

/** "2026", "Marzo 2026", "Enero a Octubre 2026", "Junio 2026 a Julio 2027". */
export function periodoTramite(t: { Ano: number; Mes: number | null; MesHasta: number | null; AnoHasta: number | null }): string {
  if (!t.Mes) return String(t.Ano);
  const desde = MESES[t.Mes - 1];
  if (!t.MesHasta) return `${desde} ${t.Ano}`;
  const hasta = MESES[t.MesHasta - 1];
  if (t.AnoHasta && t.AnoHasta !== t.Ano) return `${desde} ${t.Ano} a ${hasta} ${t.AnoHasta}`;
  return `${desde} a ${hasta} ${t.Ano}`;
}

export function rolesDe(p: { EsEjecutor: boolean; EsRevisor: boolean; EsAprobador: boolean }): string {
  return [p.EsEjecutor && "Ejecutor", p.EsRevisor && "Revisor", p.EsAprobador && "Aprobador"].filter(Boolean).join(" · ");
}
