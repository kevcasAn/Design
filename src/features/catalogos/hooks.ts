import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { actualizarPlazoEstimado, listarTiposDevoluciones, listarTiposTramiteSri } from "./api";

export function useTiposDevoluciones() {
  return useQuery({ queryKey: ["catalogos", "tipos-devoluciones"], queryFn: listarTiposDevoluciones });
}

export function useTiposTramiteSri() {
  return useQuery({ queryKey: ["catalogos", "tipos-tramite-sri"], queryFn: listarTiposTramiteSri });
}

export function useActualizarPlazoEstimado() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, plazo }: { id: number; plazo: number }) => actualizarPlazoEstimado(id, plazo),
    onSettled: () => qc.invalidateQueries({ queryKey: ["catalogos", "tipos-tramite-sri"] })
  });
}
