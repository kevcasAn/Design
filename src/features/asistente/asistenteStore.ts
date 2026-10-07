import { create } from "zustand";
import type { MensajeAsistente, RechazoArchivo } from "./api";

export interface Burbuja extends MensajeAsistente {
  id: number;
  /** true mientras se espera la respuesta. */
  pensando?: boolean;
}

interface AsistenteState {
  abierto: boolean;
  /** Conversación por trámite y paso: clave "idTramite:idPaso". */
  conversaciones: Record<string, Burbuja[]>;
  sugerencias: string[];
  /** Un archivo rechazado que la mascota debe explicar apenas pueda. */
  rechazoPendiente: { idPaso: number; rechazo: RechazoArchivo } | null;
  /** Mensajes nuevos que el usuario no ha visto (panel cerrado). */
  sinLeer: number;
  abrir: () => void;
  cerrar: () => void;
  alternar: () => void;
  agregar: (clave: string, mensaje: Omit<Burbuja, "id">) => number;
  reemplazar: (clave: string, id: number, texto: string) => void;
  quitar: (clave: string, id: number) => void;
  setSugerencias: (s: string[]) => void;
  registrarRechazo: (idPaso: number, rechazo: RechazoArchivo) => void;
  limpiarRechazo: () => void;
}

let siguienteId = 1;

/** Estado de la mascota: conversación, si está abierta y qué archivo rechazado debe explicar. */
export const useAsistenteStore = create<AsistenteState>((set) => ({
  abierto: false,
  conversaciones: {},
  sugerencias: [],
  rechazoPendiente: null,
  sinLeer: 0,
  abrir: () => set({ abierto: true, sinLeer: 0 }),
  cerrar: () => set({ abierto: false }),
  alternar: () => set((s) => ({ abierto: !s.abierto, sinLeer: s.abierto ? s.sinLeer : 0 })),
  agregar: (clave, mensaje) => {
    const id = siguienteId++;
    set((s) => ({
      conversaciones: { ...s.conversaciones, [clave]: [...(s.conversaciones[clave] ?? []), { ...mensaje, id }] },
      sinLeer: !s.abierto && mensaje.Rol === "asistente" && !mensaje.pensando ? s.sinLeer + 1 : s.sinLeer
    }));
    return id;
  },
  reemplazar: (clave, id, texto) =>
    set((s) => ({
      conversaciones: {
        ...s.conversaciones,
        [clave]: (s.conversaciones[clave] ?? []).map((m) => (m.id === id ? { ...m, Texto: texto, pensando: false } : m))
      },
      sinLeer: s.abierto ? s.sinLeer : s.sinLeer + 1
    })),
  quitar: (clave, id) =>
    set((s) => ({ conversaciones: { ...s.conversaciones, [clave]: (s.conversaciones[clave] ?? []).filter((m) => m.id !== id) } })),
  setSugerencias: (sugerencias) => set({ sugerencias }),
  registrarRechazo: (idPaso, rechazo) => set({ rechazoPendiente: { idPaso, rechazo } }),
  limpiarRechazo: () => set({ rechazoPendiente: null })
}));
