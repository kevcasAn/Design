import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { listarTramites } from "./api";
import type { TramiteResumen } from "./api";

export function useTramites(idTipoDevolucion: number | null) {
  return useQuery({
    queryKey: ["tramites", idTipoDevolucion],
    queryFn: () => listarTramites(idTipoDevolucion!),
    enabled: Boolean(idTipoDevolucion)
  });
}

/**
 * Trámites de varios tipos de devolución a la vez (vista "Agrupado").
 * Hace una consulta por tipo y comparte la memoria con useTramites.
 */
export function useTramitesDeTipos(idsTipos: number[]) {
  const consultas = useQueries({
    queries: idsTipos.map((id) => ({ queryKey: ["tramites", id], queryFn: () => listarTramites(id) }))
  });
  const cargando = consultas.some((c) => c.isPending);
  const error = consultas.find((c) => c.isError)?.error ?? null;
  // La lista solo cambia cuando llega una respuesta nueva
  const marca = consultas.map((c) => c.dataUpdatedAt).join("-");
  const lista = useMemo<TramiteResumen[]>(
    () => consultas.flatMap((c) => c.data ?? []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [marca]
  );
  return { lista, cargando, error };
}
