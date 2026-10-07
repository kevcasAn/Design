import { create } from "zustand";
import { persist } from "zustand/middleware";
import { USUARIO } from "../../datos/demo";

/** Datos del usuario que devuelve AndersenCoreAPI al iniciar sesión. */
export interface Usuario {
  userName: string;
  nombre: string;
  apellido: string;
  email: string | null;
  cargo: string | null;
}

interface SesionState {
  token: string | null;
  usuario: Usuario | null;
  iniciarSesion: (token: string, usuario: Usuario) => void;
  cerrarSesion: () => void;
}

/**
 * Sesión del usuario: el token JWT que emite AndersenCoreAPI y sus datos.
 * Se guarda en localStorage para que al recargar la página siga adentro.
 */
export const useSesionStore = create<SesionState>()(
  persist(
    (set) => ({
      token: "demo",
      usuario: USUARIO,
      iniciarSesion: (token, usuario) => set({ token, usuario }),
      cerrarSesion: () => set({ token: null, usuario: null })
    }),
    { name: "refundytax.demo" }
  )
);

export const useEstaAutenticado = () => useSesionStore((s) => Boolean(s.token));

/** Iniciales para el avatar: "Edgar Daniel" + "Leon" → "EL". */
export function iniciales(u: Usuario | null): string {
  if (!u) return "";
  return `${u.nombre.trim()[0] ?? ""}${u.apellido.trim()[0] ?? ""}`.toUpperCase();
}
