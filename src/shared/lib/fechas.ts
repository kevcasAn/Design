export function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function toISO(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseISO(value: string): Date {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function hoy(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function daysUntil(iso: string): number {
  return Math.round((parseISO(iso).getTime() - hoy().getTime()) / 86400000);
}

export function formatDate(iso: string): string {
  return parseISO(iso).toLocaleDateString("es-EC", { day: "2-digit", month: "short", year: "numeric" });
}

/** "faltan 3 días", "hoy", "mañana", "hace 2 días". */
export function cuandoLabel(iso: string): string {
  const days = daysUntil(iso);
  if (days < 0) return `hace ${Math.abs(days)} días`;
  if (days === 0) return "hoy";
  if (days === 1) return "mañana";
  return `faltan ${days} días`;
}
