import type { CargaExpediente, FaseExpediente, PasoExpediente } from "./api";
import type { TramiteResumen } from "../tramites/api";

/**
 * Ayuda para soporte: al hacer clic en un título del expediente se imprimen en la
 * consola del navegador (F12) los ids de la base, para ir directo a las tablas.
 *
 * Equivalencias con ComplyTax:
 *   IdTramite        ↔ IdEjecucion
 *   IdTramiteDetalle ↔ IdEjecucionDetalle
 *   IdPaso           ↔ IdCronogramaEjecucion
 *   IdPasoDetalle    ↔ IdCronogramaEjecucionDetalle
 */

/** Un id → número; varios → lista de números; ninguno → null. Así la consola los muestra como números. */
function ids(valores: number[]): number | number[] | null {
  if (valores.length === 0) return null;
  return valores.length === 1 ? valores[0] : valores;
}

function filaCarga(c: CargaExpediente) {
  return {
    Carga: c.Nombre,
    IdTramiteDetalle: c.IdTramiteDetalle,
    IdPasoDetalle: c.IdPasoDetalle,
    IdPaso: c.IdPaso,
    IdAccion: c.IdAccion,
    IdPasoDetalleArchivo: ids(c.ArchivosEsperados.map((a) => a.IdPasoDetalleArchivo)),
    IdCatalogoArchivo: ids(c.ArchivosEsperados.map((a) => a.IdCatalogoArchivo)),
    IdTramiteDetalleArchivo: ids(c.Archivos.map((a) => a.IdTramiteDetalleArchivo)),
    TablaCarga: c.Archivos.map((a) => a.NombreTablaDestino).filter(Boolean).join(", ") || null
  };
}

/** Título del expediente: trámite, fase y paso que se están viendo, y todas sus cargas. */
export function imprimirIdsExpediente(t: TramiteResumen, fase: FaseExpediente | null, paso: PasoExpediente | null) {
  console.group(`%cRefundyTax · ${t.TipoDevolucion} · ${t.Cliente}`, "color:#8b2232;font-weight:bold");
  console.table({
    IdTramite: t.IdTramite,
    IdProducto: t.IdProducto,
    NumeroPropuesta: t.NumeroPropuesta,
    IdTipoDevolucion: t.IdTipoDevolucion,
    IdImpuesto: t.IdImpuesto,
    IdCliente: t.IdCliente,
    IdEstado: t.IdEstado,
    IdFase: fase?.IdFase ?? null,
    Fase: fase?.Nombre ?? null,
    IdPaso: paso?.IdPaso ?? null,
    Paso: paso?.Nombre ?? null
  });
  if (paso?.Cargas.length) console.table(paso.Cargas.map(filaCarga));
  console.groupEnd();
}

/** Título de una carga: solo esa carga. */
export function imprimirIdsCarga(idTramite: number, c: CargaExpediente) {
  console.group(`%cRefundyTax · carga "${c.Nombre}"`, "color:#8b2232;font-weight:bold");
  console.table({ IdTramite: idTramite, ...filaCarga(c) });
  console.groupEnd();
}
