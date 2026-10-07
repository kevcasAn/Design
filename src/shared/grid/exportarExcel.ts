import ExcelJS from "exceljs";
import type { CatalogoTablaCampo } from "../../features/catalogosTablas/api";
import { esNumerico, aliasEnLineas, totalesDe } from "./columnasDesdeCatalogo";

export interface CabeceraExcel {
  empresa: string;
  titulo: string;
  subtitulo?: string;
  descargadoPor: string;
}

/** Color de encabezado por defecto: el vino de la marca (token --color-burgundy). */
const COLOR_ENCABEZADO = "6B1C28";
const COLOR_TEXTO_ENCABEZADO = "FFFFFF";

/**
 * Genera el .xlsx con las mismas columnas del catálogo que muestra el grid:
 * bloque de cabecera, encabezados con color, formato numérico, fila de totales,
 * encabezado fijo y filtros. Descarga directo desde el navegador.
 */
export async function exportarExcel<T extends object>(
  campos: CatalogoTablaCampo[],
  filas: T[],
  cabecera: CabeceraExcel,
  nombreArchivo: string
): Promise<void> {
  const columnas = [...campos].filter((c) => !c.Excluir).sort((a, b) => a.Orden - b.Orden);
  const libro = new ExcelJS.Workbook();
  const hoja = libro.addWorksheet(cabecera.titulo.slice(0, 31));

  // ---- Bloque de cabecera ----
  const lineas = [
    [cabecera.empresa, true],
    [cabecera.titulo, true],
    [cabecera.subtitulo ?? "", false],
    [`Descargado por: ${cabecera.descargadoPor} · ${new Date().toLocaleString("es-EC")}`, false]
  ] as const;
  lineas.forEach(([texto, negrita]) => {
    const fila = hoja.addRow([texto]);
    fila.font = { bold: negrita, size: negrita ? 12 : 10 };
  });
  hoja.addRow([]);

  // ---- Encabezados ----
  const filaEncabezado = hoja.addRow(columnas.map((c) => aliasEnLineas(c.Alias).join("\n")));
  filaEncabezado.height = columnas.some((c) => c.Alias.includes("/n")) ? 32 : 20;
  filaEncabezado.eachCell((celda, i) => {
    const c = columnas[i - 1];
    celda.font = { bold: c.EncabezadoNegrita, color: { argb: `FF${c.ColorEncabezadoTexto ?? COLOR_TEXTO_ENCABEZADO}` } };
    celda.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${c.ColorEncabezado ?? COLOR_ENCABEZADO}` } };
    celda.alignment = { vertical: "middle", horizontal: (c.AlineacionTexto ?? "left") as "left", wrapText: true };
    celda.border = { bottom: { style: "thin", color: { argb: "FFCCCCCC" } } };
  });

  // ---- Datos ----
  filas.forEach((f) => {
    const valores = columnas.map((c) => {
      const v = (f as Record<string, unknown>)[c.NombreCampoBD];
      if (v === null || v === undefined) return "";
      if (esNumerico(c) || c.EsPorcentaje) return Number(v);
      if (c.TipoDato === "datetime") return new Date(String(v));
      if (c.TipoDato === "bit") return v ? "Sí" : "No";
      return String(v);
    });
    hoja.addRow(valores);
  });

  // ---- Totales ----
  const totales = totalesDe(columnas, filas);
  if (Object.keys(totales).length) {
    const filaTotal = hoja.addRow(columnas.map((c, i) => (i === 0 ? "Total" : totales[c.NombreCampoBD] ?? "")));
    filaTotal.font = { bold: true };
    filaTotal.eachCell((celda) => {
      celda.border = { top: { style: "thin" } };
    });
  }

  // ---- Formato por columna ----
  columnas.forEach((c, i) => {
    const col = hoja.getColumn(i + 1);
    col.width = c.TamanoPixeles ? Math.max(10, Number(c.TamanoPixeles) / 7) : Math.max(12, Math.min(50, c.Alias.length + 4));
    col.alignment = { horizontal: (c.AlineacionTexto ?? (esNumerico(c) ? "right" : "left")) as "left" };
    if (c.EsPorcentaje) col.numFmt = "0.00%";
    else if (c.TipoDato === "decimal") col.numFmt = "#,##0.00";
    else if (c.TipoDato === "int") col.numFmt = "#,##0";
    else if (c.TipoDato === "datetime") col.numFmt = "dd/mm/yyyy";
  });

  // Encabezado fijo y filtros sobre la tabla
  const filaEnc = filaEncabezado.number;
  hoja.views = [{ state: "frozen", ySplit: filaEnc }];
  hoja.autoFilter = { from: { row: filaEnc, column: 1 }, to: { row: filaEnc + filas.length, column: columnas.length } };

  const buffer = await libro.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `${nombreArchivo}.xlsx`;
  enlace.click();
  URL.revokeObjectURL(url);
}
