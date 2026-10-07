import { EQUIPO, TRAMITES } from "../../datos/demo";

/** RefundyTaxAPI: GET api/tramites?idTipoDevolucion= (una fila por trámite que el usuario puede ver). */
export interface TramiteResumen {
  IdTramite: number;
  IdProducto: number;
  NumeroPropuesta: string;
  PropuestaAbierta: boolean;
  IdCliente: number;
  Cliente: string;
  IdTipoDevolucion: number;
  TipoDevolucion: string;
  IdImpuesto: number;
  IdPeriodicidad: number;
  Ano: number;
  Mes: number | null;
  MesHasta: number | null;
  AnoHasta: number | null;
  Deadline: string | null;
  FechaVencimiento: string | null;
  FechaMaximaRespuestaSri: string | null;
  IdEstado: number; // 1 en curso · 2 cerrado favorable · 3 rechazado por el SRI · 4 cerrado por administración
  Estado: string;
  MotivoCierre: string | null;
  IdTramiteOrigen: number | null;
  Numero: number;
  TotalEnPropuesta: number;
  Avance: number;
  Fases: FaseAcceso[];
}

/** Acceso a una fase desde la lista: disponible, o qué falta para que se abra. */
export interface FaseAcceso {
  IdTramite: number;
  IdFase: number;
  Nombre: string;
  Disponible: boolean;
  Falta: string | null;
}

/** Persona del equipo del trámite. Origen: "Tramite" (propio) o "Propuesta" (heredado). */
export interface MiembroEquipo {
  UserName: string;
  EsEjecutor: boolean;
  EsRevisor: boolean;
  EsAprobador: boolean;
  Origen: string;
}

export const listarTramites = async (idTipoDevolucion: number) =>
  TRAMITES.filter((t) => t.IdTipoDevolucion === idTipoDevolucion);

export const listarEquipo = async (_idTramite: number) => EQUIPO;
