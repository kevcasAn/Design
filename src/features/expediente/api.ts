import { expedienteDe } from "../../datos/demo";
import type { TramiteResumen } from "../tramites/api";

export interface ColumnaEsperada {
  IdCatalogoArchivo: number;
  Nombre: string;
  TipoDato: string;
  EsObligatorio: boolean;
  Orden: number;
  Formato: string | null;
  AceptaVacios: boolean;
  CantidadCaracteresMinima: number;
  CantidadCaracteresMaxima: number;
  AceptaDuplicados: boolean;
  /** Valores permitidos (lista cerrada); vacío = cualquiera. */
  Opciones: string[];
}

/** Archivo que pide la carga (PasosDetalleArchivos + CatalogosArchivos). */
export interface ArchivoEsperado {
  IdPasoDetalleArchivo: number;
  IdPasoDetalle: number;
  IdCatalogoArchivo: number;
  Nombre: string;
  EsObligatorio: boolean;
  OrigenInformacion: string;
  Columnas: ColumnaEsperada[];
}

/** Archivo ya cargado (TramitesDetalleArchivos). */
export interface ArchivoSubido {
  IdTramiteDetalleArchivo: number;
  IdTramiteDetalle: number;
  IdPasoDetalleArchivo: number | null;
  NombreArchivoOriginal: string;
  CantidadRegistros: number | null;
  FechaCarga: string;
  UserNameCarga: string;
  NombreTablaDestino: string | null;
}

/** Una carga del trámite. IdAccion: 1 un archivo · 2 varios · 3 proceso · 4 formulario · 5 lista. */
export interface CargaExpediente {
  IdTramiteDetalle: number;
  IdPasoDetalle: number;
  IdPaso: number;
  /** Sección donde va la carga (PasosSecciones). null = sin sección. */
  IdSeccion: number | null;
  Nombre: string;
  IdAccion: number;
  Secuencia: number;
  EsObligatorio: boolean;
  Peso: number;
  Completada: boolean;
  CompletadaConAdvertencias: boolean;
  LimitacionAlcance: boolean;
  JustificacionLimitacionAlcance: string | null;
  FechaCompletada: string | null;
  UserNameCompletada: string | null;
  ArchivosEsperados: ArchivoEsperado[];
  Archivos: ArchivoSubido[];
}

export interface PasoExpediente {
  IdPaso: number;
  IdFase: number;
  Nombre: string;
  Secuencia: number;
  Mascota: string | null;
  MascotaAvatar: string | null;
  ContextoIA: string | null;
  Secciones: SeccionExpediente[];
  Cargas: CargaExpediente[];
}

/** Agrupa cargas en la misma pantalla. IdTipoSeccion: 1 tarjeta · 2 acordeón. */
export interface SeccionExpediente {
  IdSeccion: number;
  IdPaso: number;
  Nombre: string;
  Secuencia: number;
  IdTipoSeccion: number;
}

export interface FaseExpediente {
  IdFase: number;
  Nombre: string;
  Secuencia: number;
  Navegacion: string;
  Pasos: PasoExpediente[];
}

/** RefundyTaxAPI: GET api/tramites/{id}/expediente */
export interface Expediente {
  Tramite: TramiteResumen;
  Fases: FaseExpediente[];
}

export interface ErrorValidacion {
  Regla: string;
  Columna: string;
  Fila: number | null;
  Valor: string | null;
  Mensaje: string;
}

export interface SubirArchivoResultado {
  Aceptado: boolean;
  Mensaje: string;
  Filas: number;
  TotalErrores: number;
  Errores: ErrorValidacion[];
  ColumnasIgnoradas: string[];
}

export const obtenerExpediente = async (idTramite: number) => expedienteDe(idTramite);

export async function subirArchivo(_idTramiteDetalle: number, _archivo: File, _idPasoDetalleArchivo?: number): Promise<SubirArchivoResultado> {
  return {
    Aceptado: false,
    Mensaje: "Esta vista usa datos de ejemplo. El archivo no se envía.",
    Filas: 0,
    TotalErrores: 0,
    Errores: [],
    ColumnasIgnoradas: []
  };
}

export const quitarArchivo = async (_idTramiteDetalleArchivo: number) => {};

export const marcarLimitacion = async (_idTramiteDetalle: number, _justificacion: string) => {};

export const quitarLimitacion = async (_idTramiteDetalle: number) => {};
