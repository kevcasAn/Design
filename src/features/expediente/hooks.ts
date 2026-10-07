import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { marcarLimitacion, obtenerExpediente, quitarArchivo, quitarLimitacion, subirArchivo } from "./api";

export function useExpediente(idTramite: number | null) {
  return useQuery({
    queryKey: ["expediente", idTramite],
    queryFn: () => obtenerExpediente(idTramite!),
    enabled: Boolean(idTramite)
  });
}

/** Después de cualquier cambio se vuelve a pedir el expediente y la lista de trámites (cambia el avance). */
function useRefrescar(idTramite: number) {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["expediente", idTramite] });
    qc.invalidateQueries({ queryKey: ["tramites"] });
  };
}

export function useSubirArchivo(idTramite: number) {
  const refrescar = useRefrescar(idTramite);
  return useMutation({
    mutationFn: (p: { idTramiteDetalle: number; archivo: File; idPasoDetalleArchivo?: number }) =>
      subirArchivo(p.idTramiteDetalle, p.archivo, p.idPasoDetalleArchivo),
    onSuccess: (r) => { if (r.Aceptado) refrescar(); }
  });
}

export function useQuitarArchivo(idTramite: number) {
  const refrescar = useRefrescar(idTramite);
  return useMutation({ mutationFn: quitarArchivo, onSuccess: refrescar });
}

export function useLimitacion(idTramite: number) {
  const refrescar = useRefrescar(idTramite);
  const marcar = useMutation({
    mutationFn: (p: { idTramiteDetalle: number; justificacion: string }) => marcarLimitacion(p.idTramiteDetalle, p.justificacion),
    onSuccess: refrescar
  });
  const quitar = useMutation({ mutationFn: quitarLimitacion, onSuccess: refrescar });
  return { marcar, quitar };
}
