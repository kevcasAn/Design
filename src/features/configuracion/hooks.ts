import { useQuery } from "@tanstack/react-query";
import { obtenerConfiguracion } from "./api";
import type { Configuracion } from "./api";

/** Configuración de la empresa. Se pide una vez y se conserva toda la sesión. */
export function useConfiguracion() {
  return useQuery({
    queryKey: ["configuracion"],
    queryFn: obtenerConfiguracion,
    staleTime: Infinity
  });
}

export type ClaveEtiqueta = "propuesta" | "propuestas" | "tramite" | "tramites" | "cliente";

/**
 * Cómo llama la empresa a cada cosa (propuesta, trámite, cliente).
 * L("tramite") → "Trámite"; lower("tramite") → "trámite".
 */
export function etiquetas(c: Configuracion | undefined) {
  const mapa: Record<ClaveEtiqueta, string> = {
    propuesta: c?.EtiquetaPropuesta || "Propuesta",
    propuestas: c?.EtiquetaPropuestaPlural || "Propuestas",
    tramite: c?.EtiquetaTramite || "Trámite",
    tramites: c?.EtiquetaTramitePlural || "Trámites",
    cliente: c?.EtiquetaCliente || "Cliente"
  };
  const L = (clave: ClaveEtiqueta) => mapa[clave];
  const lower = (clave: ClaveEtiqueta) => mapa[clave].toLowerCase();
  return { L, lower };
}

export function useEtiquetas() {
  const { data } = useConfiguracion();
  return etiquetas(data);
}
