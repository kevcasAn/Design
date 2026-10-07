import { create } from "zustand";

interface AvisoState {
  mensaje: string | null;
  mostrar: (mensaje: string) => void;
  cerrar: () => void;
}

let temporizador: ReturnType<typeof setTimeout> | undefined;

/** Aviso flotante corto (abajo, al centro). Se cierra solo a los 4 segundos. */
export const useAvisoStore = create<AvisoState>((set) => ({
  mensaje: null,
  mostrar: (mensaje) => {
    clearTimeout(temporizador);
    set({ mensaje });
    temporizador = setTimeout(() => set({ mensaje: null }), 4000);
  },
  cerrar: () => set({ mensaje: null })
}));
