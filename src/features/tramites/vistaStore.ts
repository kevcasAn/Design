import { create } from "zustand";
import { persist } from "zustand/middleware";

/** "pasos": impuesto → tipo → trámites. "todo": todos los trámites en una sola pantalla. */
export type Vista = "pasos" | "todo";

interface VistaState {
  vista: Vista;
  /** Botones marcados en la vista "todo". Vacío = todos. */
  impuestos: number[];
  tipos: number[];
  /** Acordeones que el usuario cerró (claves "i-1", "t-3"). */
  cerrados: string[];
  setVista: (vista: Vista) => void;
  alternarImpuesto: (id: number) => void;
  alternarTipo: (id: number) => void;
  alternarAcordeon: (clave: string) => void;
  setCerrados: (claves: string[]) => void;
  limpiarSeleccion: () => void;
}

const alternar = <T,>(lista: T[], x: T) => (lista.includes(x) ? lista.filter((y) => y !== x) : [...lista, x]);

/** Preferencia de cada usuario: cómo quiere ver sus trámites. Se recuerda en su navegador. */
export const useVistaStore = create<VistaState>()(
  persist(
    (set) => ({
      vista: "pasos",
      impuestos: [],
      tipos: [],
      cerrados: [],
      setVista: (vista) => set({ vista }),
      alternarImpuesto: (id) => set((s) => ({ impuestos: alternar(s.impuestos, id) })),
      alternarTipo: (id) => set((s) => ({ tipos: alternar(s.tipos, id) })),
      alternarAcordeon: (clave) => set((s) => ({ cerrados: alternar(s.cerrados, clave) })),
      setCerrados: (cerrados) => set({ cerrados }),
      limpiarSeleccion: () => set({ impuestos: [], tipos: [] })
    }),
    { name: "refundytax.vista" }
  )
);
