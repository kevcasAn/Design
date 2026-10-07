import { MI_ROL } from "../../datos/demo";

/** Fila de la tabla Roles: qué puede hacer cada rol. */
export interface RolPermisos {
  IdRol: number;
  Nombre: string;
  PuedeCrearPropuestas: boolean;
  PuedeCrearTramites: boolean;
  PuedeCambiarEquipo: boolean;
}

/** RefundyTaxAPI: GET api/mi-rol (requiere token). */
export interface MiRol {
  UserName: string;
  EsAdministrador: boolean;
  Roles: RolPermisos[];
}

export const obtenerMiRol = async () => MI_ROL;
