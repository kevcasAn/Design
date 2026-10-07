import { createContext, useContext, useState, type ReactNode } from "react";
import { ANALISIS, SUBITEMS, UNIDADES_INICIALES, type IdAnalisis, type PatchUnidad, type Unidad } from "./datos";

export interface EstadoTarea {
  texto: string;
  tono: "ok" | "muted";
}

interface Trabajo {
  unidades: Unidad[];
  cambiarUnidad: (id: string, patch: PatchUnidad) => void;
  pasoAts: number;
  avanzarAts: (n: number) => void;
  hecha: (id: IdAnalisis) => boolean;
  guardar: (id: IdAnalisis) => void;
  modificar: (id: IdAnalisis) => void;
  subHecha: (tarea: IdAnalisis, item: string) => boolean;
  guardarSub: (tarea: IdAnalisis, item: string) => void;
  modificarSub: (tarea: IdAnalisis, item: string) => void;
  estadoAnalisis: (id: IdAnalisis) => EstadoTarea;
}

const TrabajoCtx = createContext<Trabajo | null>(null);
const clave = (tarea: IdAnalisis, item: string) => `${tarea}:${item}`;

/** El avance del análisis se comparte entre las dos versiones. */
export function TrabajoProvider({ children }: { children: ReactNode }) {
  const [unidades, setUnidades] = useState(UNIDADES_INICIALES);
  const [pasoAts, setPasoAts] = useState(0);
  const [completadas, setCompletadas] = useState<Partial<Record<IdAnalisis, boolean>>>({ iva: true, ventas: true });
  const [subHechas, setSubHechas] = useState<Record<string, boolean>>({
    "prevalidacion:estructura": true,
    "daes:ocean:asignacion": true,
    "daes:nirsa:asignacion": true,
    "daes:salica:asignacion": true
  });

  const subHecha = (tarea: IdAnalisis, item: string) => !!subHechas[clave(tarea, item)];
  const hecha = (id: IdAnalisis) => {
    const items = SUBITEMS[id];
    return items ? items.every((item) => subHecha(id, item)) : !!completadas[id];
  };

  const valor: Trabajo = {
    unidades,
    cambiarUnidad: (id, patch) => setUnidades((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f))),
    pasoAts,
    avanzarAts: (n) => setPasoAts((actual) => Math.max(actual, n)),
    hecha,
    guardar: (id) => setCompletadas((prev) => ({ ...prev, [id]: true })),
    modificar: (id) => setCompletadas((prev) => ({ ...prev, [id]: false })),
    subHecha,
    guardarSub: (tarea, item) => setSubHechas((prev) => ({ ...prev, [clave(tarea, item)]: true })),
    modificarSub: (tarea, item) => setSubHechas((prev) => ({ ...prev, [clave(tarea, item)]: false })),
    estadoAnalisis: (id) => (hecha(id) ? { texto: "Completada", tono: "ok" } : { texto: "Pendiente", tono: "muted" })
  };

  return <TrabajoCtx.Provider value={valor}>{children}</TrabajoCtx.Provider>;
}

export function useTrabajo() {
  const valor = useContext(TrabajoCtx);
  if (!valor) throw new Error("useTrabajo fuera de TrabajoProvider");
  return valor;
}

export function analisisListo(estado: (id: IdAnalisis) => EstadoTarea) {
  return ANALISIS.every((t) => estado(t.id).tono === "ok");
}
