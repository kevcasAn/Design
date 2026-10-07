import ExcelJS from "exceljs";
import type { ArchivoEsperado, ColumnaEsperada } from "./api";

const VINO = "FF6B1C28";

function tipoEnPalabras(c: ColumnaEsperada): string {
  switch (c.TipoDato) {
    case "int": return "Número entero";
    case "decimal": return "Número con decimales";
    case "datetime": return "Fecha";
    case "bit": return "Sí / No";
    default: return "Texto";
  }
}

function largo(c: ColumnaEsperada): string {
  const min = c.CantidadCaracteresMinima > 0 ? `mín. ${c.CantidadCaracteresMinima}` : "";
  const max = c.CantidadCaracteresMaxima > 0 ? `máx. ${c.CantidadCaracteresMaxima}` : "";
  return [min, max].filter(Boolean).join(", ") || "Sin límite";
}

/**
 * Genera la plantilla Excel de un archivo del catálogo: hoja "Datos" con los encabezados
 * exactos y hoja "Instrucciones" con las reglas de cada columna. Se descarga directo.
 */
export async function generarPlantilla(archivo: ArchivoEsperado): Promise<void> {
  const columnas = [...archivo.Columnas].sort((a, b) => a.Orden - b.Orden);
  const libro = new ExcelJS.Workbook();
  libro.creator = "RefundyTax";

  // ---- Hoja de datos: solo los encabezados, listos para llenar
  const datos = libro.addWorksheet("Datos", { views: [{ state: "frozen", ySplit: 1 }] });
  const encabezado = datos.addRow(columnas.map((c) => c.Nombre));
  encabezado.height = 24;
  encabezado.eachCell((celda, i) => {
    const c = columnas[i - 1];
    celda.font = { bold: true, color: { argb: "FFFFFFFF" } };
    celda.fill = { type: "pattern", pattern: "solid", fgColor: { argb: VINO } };
    celda.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    celda.note = `${tipoEnPalabras(c)}${c.EsObligatorio ? " · obligatoria" : ""}${c.AceptaVacios ? "" : " · no acepta vacíos"}${c.Formato && c.Formato !== "Sin formato" ? ` · formato ${c.Formato}` : ""}`;
  });
  columnas.forEach((c, i) => {
    const col = datos.getColumn(i + 1);
    col.width = Math.max(14, Math.min(45, c.Nombre.length + 4));
    if (c.TipoDato === "datetime") col.numFmt = "dd/mm/yyyy";
    else if (c.TipoDato === "decimal") col.numFmt = "#,##0.00";
    else if (c.TipoDato === "int") col.numFmt = "0";
    // Lista desplegable cuando la columna tiene valores permitidos
    if (c.Opciones.length > 0 && c.Opciones.join(",").length < 250) {
      for (let fila = 2; fila <= 1000; fila += 1) {
        datos.getCell(fila, i + 1).dataValidation = {
          type: "list",
          allowBlank: c.AceptaVacios,
          formulae: [`"${c.Opciones.join(",")}"`],
          showErrorMessage: true,
          errorTitle: "Valor no permitido",
          error: `Solo se acepta: ${c.Opciones.join(", ")}`
        };
      }
    }
  });

  // ---- Hoja de instrucciones
  const inst = libro.addWorksheet("Instrucciones");
  inst.addRow([`Plantilla: ${archivo.Nombre}`]).font = { bold: true, size: 13 };
  inst.addRow([`Origen de la información: ${archivo.OrigenInformacion}`]);
  inst.addRow(["Llena la hoja \"Datos\". No cambies los encabezados de la primera fila. Las columnas que no estén aquí se ignoran."]);
  inst.addRow([]);
  const cab = inst.addRow(["Columna", "Tipo", "Obligatoria", "Acepta vacíos", "Formato", "Largo", "Duplicados", "Valores permitidos"]);
  cab.eachCell((celda) => {
    celda.font = { bold: true, color: { argb: "FFFFFFFF" } };
    celda.fill = { type: "pattern", pattern: "solid", fgColor: { argb: VINO } };
  });
  columnas.forEach((c) => {
    inst.addRow([
      c.Nombre,
      tipoEnPalabras(c),
      c.EsObligatorio ? "Sí" : "No",
      c.AceptaVacios ? "Sí" : "No",
      c.Formato && c.Formato !== "Sin formato" ? c.Formato : "",
      largo(c),
      c.AceptaDuplicados ? "Permitidos" : "No se repiten",
      c.Opciones.join(", ")
    ]);
  });
  inst.columns = [{ width: 36 }, { width: 22 }, { width: 12 }, { width: 14 }, { width: 18 }, { width: 16 }, { width: 14 }, { width: 40 }];

  const buffer = await libro.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `${archivo.Nombre}.xlsx`;
  enlace.click();
  URL.revokeObjectURL(url);
}
