import type { CargaExpediente, PasoExpediente } from "../api";

export interface GrupoCargas {
  id: string;
  nombre: string;
  cargas: CargaExpediente[];
}

/** Secciones del paso, y al final las cargas que no caen en ninguna. */
export function gruposDe(paso: PasoExpediente): GrupoCargas[] {
  const secciones = [...(paso.Secciones ?? [])].sort((a, b) => a.Secuencia - b.Secuencia);
  const grupos = secciones
    .map((s) => ({
      id: String(s.IdSeccion),
      nombre: s.Nombre,
      cargas: paso.Cargas.filter((c) => c.IdSeccion === s.IdSeccion).sort((a, b) => a.Secuencia - b.Secuencia)
    }))
    .filter((g) => g.cargas.length > 0);

  const ids = new Set(secciones.map((s) => s.IdSeccion));
  const sueltas = paso.Cargas
    .filter((c) => c.IdSeccion == null || !ids.has(c.IdSeccion))
    .sort((a, b) => a.Secuencia - b.Secuencia);
  if (sueltas.length) grupos.push({ id: "sueltas", nombre: grupos.length ? "Otras" : paso.Nombre, cargas: sueltas });
  return grupos;
}

export const hechasDe = (cargas: CargaExpediente[]) => cargas.filter((c) => c.Completada).length;

export const listaDe = (cargas: CargaExpediente[]) => cargas.length > 0 && hechasDe(cargas) === cargas.length;
