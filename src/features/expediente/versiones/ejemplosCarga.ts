import type { ArchivoEsperado, CargaExpediente, ColumnaEsperada } from "../api";

function columnas(nombres: string[]): ColumnaEsperada[] {
  return nombres.map((Nombre, i) => ({
    IdCatalogoArchivo: 0,
    Nombre,
    TipoDato: "Texto",
    EsObligatorio: true,
    Orden: i + 1,
    Formato: null,
    AceptaVacios: false,
    CantidadCaracteresMinima: 0,
    CantidadCaracteresMaxima: 0,
    AceptaDuplicados: true,
    Opciones: []
  }));
}

function esperado(id: number, nombre: string, cols: string[]): ArchivoEsperado {
  return {
    IdPasoDetalleArchivo: id,
    IdPasoDetalle: id,
    IdCatalogoArchivo: 0,
    Nombre: nombre,
    EsObligatorio: true,
    OrigenInformacion: "Catalogo",
    Columnas: columnas(cols)
  };
}

function carga(id: number, nombre: string, peso: number, cols: string[], archivo?: { nombre: string; fecha: string }): CargaExpediente {
  return {
    IdTramiteDetalle: id,
    IdPasoDetalle: id,
    IdPaso: 0,
    IdSeccion: null,
    Nombre: nombre,
    IdAccion: 1,
    Secuencia: Math.abs(id),
    EsObligatorio: true,
    Peso: peso,
    Completada: Boolean(archivo),
    CompletadaConAdvertencias: false,
    LimitacionAlcance: false,
    JustificacionLimitacionAlcance: null,
    FechaCompletada: archivo ? "2026-10-02" : null,
    UserNameCompletada: archivo ? "toolbox" : null,
    ArchivosEsperados: [esperado(id, nombre, cols)],
    Archivos: archivo
      ? [{
          IdTramiteDetalleArchivo: id,
          IdTramiteDetalle: id,
          IdPasoDetalleArchivo: id,
          NombreArchivoOriginal: archivo.nombre,
          CantidadRegistros: 120,
          FechaCarga: archivo.fecha,
          UserNameCarga: "toolbox",
          NombreTablaDestino: null
        }]
      : []
  };
}

/** Ejemplos para ver la tarjeta: pendientes en Detalles y, en Información SRI, dos ya traídas y una pendiente. */
export const EJEMPLOS_DETALLES: CargaExpediente[] = [
  carga(-1, "Detalle de compras", 10, ["Proveedor", "Factura", "Fecha", "Base", "IVA"]),
  carga(-2, "Retenciones", 10, ["Comprobante", "Agente", "Base", "Porcentaje", "Valor"]),
  carga(-3, "Exportaciones", 10, ["DAE", "Fecha", "Destino", "FOB", "Peso"])
];

export const EJEMPLOS_SRI: CargaExpediente[] = [
  carga(-4, "Intereses", 5, ["Periodo", "Obligación", "Valor", "Tasa", "Interés"], { nombre: "Intereses.csv", fecha: "2026-10-02T12:00:00" }),
  carga(-5, "Gastos", 5, ["Cuenta", "Descripción", "Valor"], { nombre: "Gastos.csv", fecha: "2026-10-05T12:00:00" }),
  carga(-6, "Cruce SRI", 5, ["RUC", "Formulario", "Impuesto", "Diferencia"])
].map((c) => ({
  ...c,
  ArchivosEsperados: c.ArchivosEsperados.map((a) => ({ ...a, OrigenInformacion: "Toolbox" }))
}));

/** Tarjeta de un archivo de la estructura real. En Información SRI se trae; el resto se carga. */
export function archivoEjemplo(id: number, nombre: string, origen: "Catalogo" | "Toolbox" = "Catalogo"): CargaExpediente {
  const item = carga(id, nombre, 10, [nombre]);
  return {
    ...item,
    ArchivosEsperados: item.ArchivosEsperados.map((a) => ({ ...a, OrigenInformacion: origen }))
  };
}

const normalizar = (nombre: string) => nombre.trim().toLowerCase();

/** No repite un ejemplo si el trámite ya tiene una carga con el mismo nombre. */
export function ejemplosNuevos(reales: { Nombre: string }[], ejemplos: CargaExpediente[]) {
  const nombres = new Set(reales.map((c) => normalizar(c.Nombre)));
  return ejemplos.filter((c) => !nombres.has(normalizar(c.Nombre)));
}
