import { CONFIGURACION } from "../../datos/demo";

/** Fila de la tabla Configuracion (RefundyTaxAPI: GET api/configuracion, pública). */
export interface Configuracion {
  IdConfiguracion: number;
  NombreEmpresa: string;
  EtiquetaPropuesta: string;
  EtiquetaPropuestaPlural: string;
  EtiquetaTramite: string;
  EtiquetaTramitePlural: string;
  EtiquetaCliente: string;
  ModoAcceso: string;
  IAActiva: boolean;
  IAModelo: string | null;
}

export const obtenerConfiguracion = async () => CONFIGURACION;
