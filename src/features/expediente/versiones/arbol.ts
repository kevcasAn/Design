import type { CargaExpediente } from "../api";
import { archivoEjemplo } from "./ejemplosCarga";
import { ERRORES_ATS, ERRORES_RESTANTES, TABLAS_ANALISIS, type TablaMuestra } from "./analisis/datos";

export type VistaHoja =
  | { tipo: "archivo"; origen?: "Catalogo" | "Toolbox" }
  | { tipo: "factor" }
  | { tipo: "asignacion" }
  | { tipo: "ats" }
  | { tipo: "tabla"; tabla: TablaMuestra };

export interface Hoja {
  id: string;
  nombre: string;
  vista: VistaHoja;
}

export interface Rama {
  id: string;
  nombre: string;
  hojas: Hoja[];
}

export interface Nivel {
  id: string;
  nombre: string;
  ramas: Rama[];
}

const archivo = (id: string, nombre: string, origen?: "Catalogo" | "Toolbox"): Hoja => ({
  id, nombre, vista: { tipo: "archivo", origen }
});

const tabla = (id: string, nombre: string, tablaHoja: TablaMuestra): Hoja => ({
  id, nombre, vista: { tipo: "tabla", tabla: tablaHoja }
});

const errores = (titulo: string, filas: string[][]): TablaMuestra => ({
  columnas: ["Paso", "Fila", "Campo", "Error"],
  resaltar: 0,
  filas: filas.map((f) => [titulo, ...f])
});

/** Niveles del trámite de proveedor directo, en el orden de la estructura real. */
export const NIVELES: Nivel[] = [
  {
    id: "carga",
    nombre: "Carga de información",
    ramas: [
      {
        id: "contable",
        nombre: "Información contable",
        hojas: [
          archivo("mayor-ingresos", "Mayor contable - Ingresos"),
          archivo("mayor-ventas", "Mayor contable - IVA en ventas"),
          archivo("mayor-compras", "Mayor contable - IVA en compras")
        ]
      },
      {
        id: "sri",
        nombre: "Información SRI",
        hojas: [
          archivo("declaracion-iva", "Declaración de IVA", "Toolbox"),
          archivo("emitidos-facturas", "Comprobantes emitidos - Facturas", "Toolbox"),
          archivo("emitidos-nc", "Comprobantes emitidos - Notas de crédito", "Toolbox"),
          archivo("emitidos-lcbps", "Comprobantes emitidos - LCBPS", "Toolbox"),
          archivo("emitidos-retenciones", "Comprobantes emitidos - Retenciones", "Toolbox"),
          archivo("recibidos-facturas", "Comprobantes recibidos - Facturas", "Toolbox"),
          archivo("recibidos-nc", "Comprobantes recibidos - Notas de crédito", "Toolbox"),
          archivo("recibidos-anulados", "Comprobantes recibidos - Anulados", "Toolbox"),
          archivo("xml-ats", "Xml Anexo Transaccional Simplificado", "Toolbox"),
          archivo("prevalidacion-ats-archivo", "Prevalidación ATS", "Toolbox")
        ]
      },
      {
        id: "detalles-carga",
        nombre: "Detalles",
        hojas: [
          archivo("det-ventas", "Detalle de ventas"),
          archivo("det-exportaciones", "Detalle de exportaciones"),
          archivo("det-daes", "Detalle de DAES")
        ]
      }
    ]
  },
  {
    id: "analisis",
    nombre: "Análisis",
    ramas: [
      {
        id: "cruces",
        nombre: "Cruces con contabilidad",
        hojas: [
          tabla("mayores", "Análisis de mayores contables", {
            columnas: ["Mayor", "Contabilidad", "Declarado", "Diferencia"],
            filas: [
              ["Ingresos", "1.428.230,00", "1.428.230,00", "0,00"],
              ["IVA en ventas", "27.364,50", "27.364,50", "0,00"],
              ["IVA en compras", "144.631,50", "144.631,50", "0,00"]
            ]
          }),
          tabla("f104", "F104 vs mayores contables", {
            columnas: ["Casillero", "F104", "Mayor", "Diferencia"],
            filas: [
              ["401 - Ventas", "1.428.230,00", "1.428.230,00", "0,00"],
              ["411 - IVA ventas", "27.364,50", "27.364,50", "0,00"],
              ["500 - IVA compras", "144.631,50", "144.631,50", "0,00"]
            ]
          })
        ]
      },
      {
        id: "prevalidacion",
        nombre: "Prevalidación ATS",
        hojas: [
          { id: "ats-errores", nombre: "Errores", vista: { tipo: "ats" } },
          tabla("ats-vs", "Prevalidación vs ATS", errores("Prevalidación", ERRORES_ATS)),
          tabla("ats-sri", "Información SRI vs ATS", errores("SRI", ERRORES_ATS.slice(0, 2))),
          tabla("ats-nocorregibles", "Errores no corregibles", errores("No corregible", ERRORES_RESTANTES)),
          tabla("ats-resumen", "Resumen", {
            columnas: ["Concepto", "Cantidad"],
            filas: [
              ["Errores encontrados", "3"],
              ["Corregidos", "2"],
              ["No corregibles", "1"]
            ]
          })
        ]
      },
      {
        id: "daes",
        nombre: "Análisis de DAES",
        hojas: [
          { id: "daes-factor", nombre: "Factor de proporcionalidad", vista: { tipo: "factor" } },
          { id: "daes-asignacion", nombre: "Asignación de DAEs", vista: { tipo: "asignacion" } },
          tabla("daes-resumen", "Resumen", {
            columnas: ["Empresa", "Por revisar", "Asignado"],
            filas: [
              ["Santa Priscila", "3", "Parcial"],
              ["Oceanexport", "1", "Sí"],
              ["Nirsa", "1", "Sí"]
            ]
          })
        ]
      },
      {
        id: "detalles-analisis",
        nombre: "Detalles",
        hojas: [
          tabla("adquisiciones", "Adquisiciones e importaciones", TABLAS_ANALISIS.compras),
          tabla("ventas-analisis", "Ventas", TABLAS_ANALISIS.ventas)
        ]
      },
      {
        id: "liquidacion",
        nombre: "Liquidación",
        hojas: [
          tabla("liq-ventas", "Ventas", TABLAS_ANALISIS.ventas),
          tabla("liq-factor", "Factor de proporcionalidad", {
            columnas: ["Empresa", "Factor", "Días"],
            filas: [
              ["Santa Priscila", "1,58", "70"],
              ["Oceanexport", "1,00", "45"],
              ["Nirsa", "1,20", "60"]
            ]
          }),
          tabla("liq-daes", "DAES", {
            columnas: ["Empresa", "DAE", "Peso utilizado"],
            filas: [
              ["Santa Priscila", "02820254002318324", "1.028,48"],
              ["Oceanexport", "02820254003001122", "4.200,00"]
            ]
          }),
          tabla("liq-compras", "Compras", TABLAS_ANALISIS.compras),
          tabla("liq-iva", "IVA a devolver", TABLAS_ANALISIS.iva)
        ]
      }
    ]
  },
  {
    id: "entregable",
    nombre: "Entregable",
    ramas: [
      {
        id: "solicitud",
        nombre: "Solicitud",
        hojas: [
          tabla("solicitud-datos", "Datos", TABLAS_ANALISIS.solicitud),
          archivo("formato-sri", "Formato SRI"),
          archivo("formato-andersen", "Formato Andersen")
        ]
      },
      {
        id: "anexos",
        nombre: "Anexos",
        hojas: [
          archivo("anexo-adquisiciones", "Detalle de adquisiciones"),
          archivo("anexo-ventas", "Detalle de ventas"),
          archivo("anexo-daes", "Detalle DAES")
        ]
      }
    ]
  }
];

export const nivelPorNombre = (nombre: string) => NIVELES.find((n) => n.nombre === nombre) ?? NIVELES[0];

const cargaIds = new Map<string, number>();

export function cargaDeHoja(hoja: Hoja): CargaExpediente {
  let id = cargaIds.get(hoja.id);
  if (!id) {
    id = cargaIds.size + 1;
    cargaIds.set(hoja.id, id);
  }
  const origen = hoja.vista.tipo === "archivo" ? hoja.vista.origen : undefined;
  return archivoEjemplo(id, hoja.nombre, origen);
}
