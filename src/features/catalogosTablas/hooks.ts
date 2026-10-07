import { useQuery } from "@tanstack/react-query";
import { obtenerCatalogoTabla } from "./api";

/** Columnas de una tabla según el catálogo. Cambia poco: se conserva 10 minutos. */
export function useCatalogoTabla(idCatalogoTabla: number) {
  return useQuery({
    queryKey: ["catalogo-tabla", idCatalogoTabla],
    queryFn: () => obtenerCatalogoTabla(idCatalogoTabla),
    staleTime: 10 * 60 * 1000
  });
}
