// Único lugar que lee las variables de ambiente (.env.development / .env.production).
function requerida(nombre: string): string {
  const valor = import.meta.env[nombre] as string | undefined;
  if (!valor) throw new Error(`Falta la variable ${nombre} en el archivo .env`);
  return valor.replace(/\/+$/, "");
}

export const env = {
  apiUrl: requerida("VITE_API_URL"),        // RefundyTaxAPI
  coreApiUrl: requerida("VITE_CORE_API_URL") // AndersenCoreAPI (login)
};

/** Archivo de `public/`, con el prefijo de publicación (`/` o `/Design/`). */
export function archivoPublico(ruta: string): string {
  return `${import.meta.env.BASE_URL}${ruta.replace(/^\/+/, "")}`;
}
