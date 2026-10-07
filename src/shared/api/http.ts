import { env } from "../../app/env";
import { useSesionStore } from "../../features/sesion/sesionStore";

/** Error de la API con el mensaje que se puede mostrar en pantalla. */
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface Opciones {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  /** Por defecto se llama a RefundyTaxAPI; con "core" se llama a AndersenCoreAPI. */
  destino?: "api" | "core";
  /** false para endpoints públicos (no manda el token). */
  conToken?: boolean;
}

/**
 * Cliente HTTP único. Agrega la URL base, el token Bearer y convierte los
 * errores en ApiError. Si la API responde 401, cierra la sesión.
 */
export async function http<T>(ruta: string, opciones: Opciones = {}): Promise<T> {
  const { method = "GET", body, destino = "api", conToken = true } = opciones;
  const base = destino === "core" ? env.coreApiUrl : env.apiUrl;
  const headers: Record<string, string> = { Accept: "application/json" };
  // Con FormData (subir archivos) el navegador pone el Content-Type con su separador
  const esFormulario = body instanceof FormData;
  if (body !== undefined && !esFormulario) headers["Content-Type"] = "application/json";

  const token = useSesionStore.getState().token;
  if (conToken && token) headers.Authorization = `Bearer ${token}`;

  let respuesta: Response;
  try {
    respuesta = await fetch(`${base}/${ruta.replace(/^\/+/, "")}`, {
      method,
      headers,
      body: body === undefined ? undefined : esFormulario ? (body as FormData) : JSON.stringify(body)
    });
  } catch {
    throw new ApiError(0, "No se pudo conectar con el servidor. Revisa tu conexión o la VPN.");
  }

  if (respuesta.status === 401 && conToken) {
    useSesionStore.getState().cerrarSesion();
    throw new ApiError(401, "Tu sesión terminó. Vuelve a entrar.");
  }

  const texto = await respuesta.text();
  const datos = texto ? (JSON.parse(texto) as unknown) : null;

  if (!respuesta.ok) {
    throw new ApiError(respuesta.status, mensajeDeError(datos) ?? `Error ${respuesta.status} al llamar a ${ruta}`);
  }

  return datos as T;
}

function mensajeDeError(datos: unknown): string | null {
  if (!datos || typeof datos !== "object") return null;
  const d = datos as Record<string, unknown>;
  for (const clave of ["Message", "message", "title", "detail"]) {
    if (typeof d[clave] === "string" && d[clave]) return d[clave] as string;
  }
  return null;
}
