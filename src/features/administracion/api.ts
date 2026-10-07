import { EQUIPO, IMPUESTOS, TRAMITES, USUARIO } from "../../datos/demo";

export interface PersonaEquipo {
  UserName: string;
  EsEjecutor: boolean;
  EsRevisor: boolean;
  EsAprobador: boolean;
}

export interface PropuestaTipo {
  IdTipoDevolucion: number;
  Nombre: string;
  IdImpuesto: number;
  Impuesto: string;
  EsPrincipal: boolean;
  Justificacion: string | null;
}

export interface PropuestaTramite {
  IdTramite: number;
  IdProducto: number;
  IdTipoDevolucion: number;
  TipoDevolucion: string;
  Numero: number;
  IdPeriodicidad: number;
  Ano: number;
  Mes: number | null;
  MesHasta: number | null;
  AnoHasta: number | null;
  Deadline: string;
  IdEstado: number;
  Estado: string;
  MotivoCierre: string | null;
  CerradoPorPropuesta: boolean;
  IdTramiteOrigen: number | null;
  Avance: number;
  TieneEquipoPropio: boolean;
}

/** Una propuesta (Productos) con lo que el usuario puede hacer en ella. */
export interface Propuesta {
  IdProducto: number;
  NumeroPropuesta: string;
  IdCliente: number;
  Cliente: string;
  IdEstado: number;
  Abierta: boolean;
  MotivoCierre: string | null;
  FechaCierre: string | null;
  UserNameCierre: string | null;
  PuedeCrearTramites: boolean;
  PuedeCambiarEquipo: boolean;
  Tipos: PropuestaTipo[];
  Equipo: PersonaEquipo[];
  Tramites: PropuestaTramite[];
}

/** RefundyTaxAPI: GET api/propuestas */
export interface Administracion {
  EsAdministrador: boolean;
  PuedeCrearPropuestas: boolean;
  Propuestas: Propuesta[];
}

export interface Cliente {
  IdCliente: number;
  NombreCorto: string;
  RazonSocial: string;
  Ruc: string;
}

export interface CrearPropuesta {
  IdCliente?: number;
  ClienteNuevo?: { NombreCorto: string; RazonSocial: string; Ruc: string };
  NumeroPropuesta: string;
  IdTipoDevolucion: number;
  TiposExtra: number[];
  Justificacion?: string;
  Equipo: PersonaEquipo[];
}

export interface CrearTramites {
  IdTipoDevolucion: number;
  Deadline: string;
  EsAnual: boolean;
  Ano: number;
  MesDesde?: number;
  AnoHasta?: number;
  MesHasta?: number;
  UnSolo: boolean;
  IdTramiteOrigen?: number;
}

export interface RolCambio {
  PuedeCrearPropuestas: boolean;
  PuedeCrearTramites: boolean;
  PuedeCambiarEquipo: boolean;
}

const TIPO = IMPUESTOS[0].TiposDevoluciones[0];

export const listarPropuestas = async (): Promise<Administracion> => ({
  EsAdministrador: false,
  PuedeCrearPropuestas: false,
  Propuestas: [
    {
      IdProducto: 1,
      NumeroPropuesta: TRAMITES[0].NumeroPropuesta,
      IdCliente: TRAMITES[0].IdCliente,
      Cliente: TRAMITES[0].Cliente,
      IdEstado: 1,
      Abierta: true,
      MotivoCierre: null,
      FechaCierre: null,
      UserNameCierre: null,
      PuedeCrearTramites: false,
      PuedeCambiarEquipo: false,
      Tipos: [
        {
          IdTipoDevolucion: TIPO.IdTipoDevolucion,
          Nombre: TIPO.Nombre,
          IdImpuesto: TIPO.IdImpuesto,
          Impuesto: IMPUESTOS[0].Nombre,
          EsPrincipal: true,
          Justificacion: null
        }
      ],
      Equipo: EQUIPO.map((p) => ({
        UserName: p.UserName,
        EsEjecutor: p.EsEjecutor,
        EsRevisor: p.EsRevisor,
        EsAprobador: p.EsAprobador
      })),
      Tramites: TRAMITES.map((t) => ({
        IdTramite: t.IdTramite,
        IdProducto: t.IdProducto,
        IdTipoDevolucion: t.IdTipoDevolucion,
        TipoDevolucion: t.TipoDevolucion,
        Numero: t.Numero,
        IdPeriodicidad: t.IdPeriodicidad,
        Ano: t.Ano,
        Mes: t.Mes,
        MesHasta: t.MesHasta,
        AnoHasta: t.AnoHasta,
        Deadline: t.Deadline ?? "",
        IdEstado: t.IdEstado,
        Estado: t.Estado,
        MotivoCierre: t.MotivoCierre,
        CerradoPorPropuesta: false,
        IdTramiteOrigen: t.IdTramiteOrigen,
        Avance: t.Avance,
        TieneEquipoPropio: false
      }))
    }
  ]
});

export const listarClientes = async (): Promise<Cliente[]> => [
  { IdCliente: 1, NombreCorto: TRAMITES[0].Cliente, RazonSocial: TRAMITES[0].Cliente, Ruc: "" }
];

export const crearPropuesta = async (_p: CrearPropuesta) => 0;
export const cambiarEquipo = async (_idProducto: number, _equipo: PersonaEquipo[]) => {};
export const cerrarPropuesta = async (_idProducto: number, _motivo: string) => {};
export const reabrirPropuesta = async (_idProducto: number) => {};
export const crearTramites = async (_idProducto: number, _t: CrearTramites) => ({ Creados: 0, IdsTramites: [] as number[] });
export const cerrarTramite = async (_idTramite: number, _motivo: string) => {};
export const reabrirTramite = async (_idTramite: number) => {};
export const actualizarRol = async (_idRol: number, _r: RolCambio) => {};

// ---- Directorio de empleados (AndersenCoreAPI: GET api/usuarios?ciudad=) para armar equipos
export interface Empleado {
  Nombres: string;
  Apellidos: string;
  UserName: string;
  Cargo: string;
  Ciudad: string;
}

export async function listarEmpleados(): Promise<Empleado[]> {
  return [
    {
      Nombres: USUARIO.nombre,
      Apellidos: USUARIO.apellido,
      UserName: USUARIO.userName,
      Cargo: USUARIO.cargo ?? "",
      Ciudad: "Quito"
    }
  ];
}
