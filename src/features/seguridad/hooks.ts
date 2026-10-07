import { useQuery } from "@tanstack/react-query";
import { useSesionStore } from "../sesion/sesionStore";
import { obtenerMiRol } from "./api";

/** Quién soy en RefundyTax: administrador o no, y qué puede cada rol. Solo con sesión. */
export function useMiRol() {
  const token = useSesionStore((s) => s.token);
  return useQuery({
    queryKey: ["mi-rol", token],
    queryFn: obtenerMiRol,
    enabled: Boolean(token),
    staleTime: 5 * 60 * 1000
  });
}
