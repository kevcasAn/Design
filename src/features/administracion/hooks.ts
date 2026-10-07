import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";

export function usePropuestas() {
  return useQuery({ queryKey: ["propuestas"], queryFn: api.listarPropuestas });
}

export function useClientes(activo: boolean) {
  return useQuery({ queryKey: ["clientes"], queryFn: api.listarClientes, enabled: activo });
}

/** Directorio de empleados de AndersenCoreAPI. Cambia poco: se conserva media hora. */
export function useEmpleados() {
  return useQuery({ queryKey: ["empleados"], queryFn: api.listarEmpleados, staleTime: 30 * 60 * 1000 });
}

/** Todas las acciones de Administración refrescan las propuestas y lo que depende de ellas. */
export function useAccionesAdministracion() {
  const qc = useQueryClient();
  const refrescar = () => {
    qc.invalidateQueries({ queryKey: ["propuestas"] });
    qc.invalidateQueries({ queryKey: ["tramites"] });
    qc.invalidateQueries({ queryKey: ["expediente"] });
    qc.invalidateQueries({ queryKey: ["equipo"] });
    qc.invalidateQueries({ queryKey: ["clientes"] });
  };
  const opciones = { onSuccess: refrescar };

  return {
    crearPropuesta: useMutation({ mutationFn: api.crearPropuesta, ...opciones }),
    cambiarEquipo: useMutation({ mutationFn: (p: { idProducto: number; equipo: api.PersonaEquipo[] }) => api.cambiarEquipo(p.idProducto, p.equipo), ...opciones }),
    cerrarPropuesta: useMutation({ mutationFn: (p: { idProducto: number; motivo: string }) => api.cerrarPropuesta(p.idProducto, p.motivo), ...opciones }),
    reabrirPropuesta: useMutation({ mutationFn: api.reabrirPropuesta, ...opciones }),
    crearTramites: useMutation({ mutationFn: (p: { idProducto: number; datos: api.CrearTramites }) => api.crearTramites(p.idProducto, p.datos), ...opciones }),
    cerrarTramite: useMutation({ mutationFn: (p: { idTramite: number; motivo: string }) => api.cerrarTramite(p.idTramite, p.motivo), ...opciones }),
    reabrirTramite: useMutation({ mutationFn: api.reabrirTramite, ...opciones }),
    actualizarRol: useMutation({
      mutationFn: (p: { idRol: number; cambio: api.RolCambio }) => api.actualizarRol(p.idRol, p.cambio),
      onSuccess: () => { qc.invalidateQueries({ queryKey: ["mi-rol"] }); refrescar(); }
    })
  };
}
