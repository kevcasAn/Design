import type { ErrorValidacion } from "../expediente/api";

export interface MensajeAsistente {
  Rol: "usuario" | "asistente";
  Texto: string;
}

/** Archivo rechazado que la mascota explica. */
export interface RechazoArchivo {
  IdTramiteDetalle: number;
  NombreArchivo: string;
  Mensaje: string;
  TotalErrores: number;
  Errores: ErrorValidacion[];
  ColumnasIgnoradas: string[];
}

export interface PreguntarRequest {
  IdPaso: number;
  Pregunta: string;
  Historial: MensajeAsistente[];
  Rechazo?: RechazoArchivo;
}

/** RefundyTaxAPI: POST api/tramites/{id}/asistente */
export interface PreguntarResponse {
  Mascota: string;
  Avatar: string | null;
  Respuesta: string;
  ConIA: boolean;
  Sugerencias: string[];
}

export const preguntar = async (_idTramite: number, _cuerpo: PreguntarRequest): Promise<PreguntarResponse> => ({
  Mascota: "León",
  Avatar: null,
  Respuesta: "En esta vista las respuestas están de ejemplo.",
  ConIA: false,
  Sugerencias: []
});
