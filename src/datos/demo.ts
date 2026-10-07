import type { Configuracion } from "../features/configuracion/api";
import type { Expediente, FaseExpediente } from "../features/expediente/api";
import type { Impuesto } from "../features/impuestos/api";
import type { MiRol } from "../features/seguridad/api";
import type { Usuario } from "../features/sesion/sesionStore";
import type { FaseAcceso, MiembroEquipo, TramiteResumen } from "../features/tramites/api";

/** Datos fijos de la vista. Nada de esto sale de una API. */

export const USUARIO: Usuario = {
  userName: "kevin.castro",
  nombre: "Kevin Alejandro",
  apellido: "Castro Ortiz",
  email: null,
  cargo: null
};

export const CONFIGURACION: Configuracion = {
  IdConfiguracion: 1,
  NombreEmpresa: "Andersen Ecuador",
  EtiquetaPropuesta: "Propuesta",
  EtiquetaPropuestaPlural: "Propuestas",
  EtiquetaTramite: "Trámite",
  EtiquetaTramitePlural: "Trámites",
  EtiquetaCliente: "Cliente",
  ModoAcceso: "usuarios",
  IAActiva: false,
  IAModelo: null
};

export const MI_ROL: MiRol = {
  UserName: USUARIO.userName,
  EsAdministrador: false,
  Roles: []
};

export const IMPUESTOS: Impuesto[] = [
  {
    IdImpuesto: 1,
    Nombre: "IVA",
    TiposDevoluciones: [
      {
        IdTipoDevolucion: 1,
        IdImpuesto: 1,
        Nombre: "Proveedor directo de exportador de bienes",
        Secuencia: 1
      }
    ]
  }
];

const TIPO = IMPUESTOS[0].TiposDevoluciones[0];

function fasesDe(idTramite: number): FaseAcceso[] {
  return [
    { IdTramite: idTramite, IdFase: 1, Nombre: "Carga de información", Disponible: true, Falta: null },
    { IdTramite: idTramite, IdFase: 3, Nombre: "Análisis", Disponible: true, Falta: null },
    { IdTramite: idTramite, IdFase: 4, Nombre: "Entregable", Disponible: true, Falta: null }
  ];
}

function tramite(id: number, mes: number, numero: number, avance: number): TramiteResumen {
  return {
    IdTramite: id,
    IdProducto: 1,
    NumeroPropuesta: "DEMO-2610-003",
    PropuestaAbierta: true,
    IdCliente: 1,
    Cliente: "DEMO Camaronera Pacifico",
    IdTipoDevolucion: TIPO.IdTipoDevolucion,
    TipoDevolucion: TIPO.Nombre,
    IdImpuesto: 1,
    IdPeriodicidad: 1,
    Ano: 2026,
    Mes: mes,
    MesHasta: null,
    AnoHasta: null,
    Deadline: "2026-10-30",
    FechaVencimiento: null,
    FechaMaximaRespuestaSri: null,
    IdEstado: 1,
    Estado: "En curso",
    MotivoCierre: null,
    IdTramiteOrigen: null,
    Numero: numero,
    TotalEnPropuesta: 3,
    Avance: avance,
    Fases: fasesDe(id)
  };
}

export const TRAMITES: TramiteResumen[] = [
  tramite(1, 1, 1, 4),
  tramite(2, 2, 2, 0),
  tramite(3, 3, 3, 0)
];

export const EQUIPO: MiembroEquipo[] = [
  {
    UserName: USUARIO.userName,
    EsEjecutor: true,
    EsRevisor: false,
    EsAprobador: false,
    Origen: "Propuesta"
  }
];

function fase(id: number, nombre: string, secuencia: number): FaseExpediente {
  return {
    IdFase: id,
    Nombre: nombre,
    Secuencia: secuencia,
    Navegacion: "",
    Pasos: [
      {
        IdPaso: id,
        IdFase: id,
        Nombre: nombre,
        Secuencia: 1,
        Mascota: null,
        MascotaAvatar: null,
        ContextoIA: null,
        Secciones: [],
        Cargas: []
      }
    ]
  };
}

const FASES: FaseExpediente[] = [
  fase(1, "Carga de información", 1),
  fase(3, "Análisis", 2),
  fase(4, "Entregable", 3)
];

export function expedienteDe(idTramite: number): Expediente {
  const encontrado = TRAMITES.find((t) => t.IdTramite === idTramite) ?? TRAMITES[0];
  return { Tramite: encontrado, Fases: FASES };
}
