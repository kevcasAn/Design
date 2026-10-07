import { USUARIO } from "../../datos/demo";
import type { Usuario } from "./sesionStore";

export interface LoginResultado {
  token: string;
  usuario: Usuario;
}

/** Entra con el usuario de la vista. No llama a ningún servicio. */
export async function login(_usuario: string, _contrasena: string): Promise<LoginResultado> {
  return { token: "demo", usuario: USUARIO };
}
