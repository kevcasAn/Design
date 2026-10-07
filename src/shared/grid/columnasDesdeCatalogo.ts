import type { ColDef, ValueFormatterParams } from "ag-grid-community";
import type { CatalogoTablaCampo } from "../../features/catalogosTablas/api";

const formatoEntero = new Intl.NumberFormat("es-EC", { maximumFractionDigits: 0 });
const formatoDecimal = new Intl.NumberFormat("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatoPorcentaje = new Intl.NumberFormat("es-EC", { style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const esNumerico = (c: CatalogoTablaCampo) => c.TipoDato === "int" || c.TipoDato === "decimal";

/** Cómo se muestra un valor según el tipo del catálogo. Se usa en el grid y en el Excel. */
export function formatearValor(c: CatalogoTablaCampo, valor: unknown): string {
  if (valor === null || valor === undefined || valor === "") return "";
  if (c.EsPorcentaje) return formatoPorcentaje.format(Number(valor));
  if (c.TipoDato === "int") return formatoEntero.format(Number(valor));
  if (c.TipoDato === "decimal") return formatoDecimal.format(Number(valor));
  if (c.TipoDato === "datetime") return new Date(String(valor)).toLocaleDateString("es-EC");
  if (c.TipoDato === "bit") return valor ? "Sí" : "No";
  return String(valor);
}

/** El alias puede traer "/n" para partir el encabezado en dos líneas (convención de ComplyTax). */
export const aliasEnLineas = (alias: string) => alias.split("/n").map((l) => l.trim());

/**
 * Convierte las columnas del catálogo en definiciones de AG Grid.
 * Solo entran las no excluidas; Visible decide si arrancan ocultas.
 */
export function columnasDesdeCatalogo<T>(campos: CatalogoTablaCampo[]): ColDef<T>[] {
  return [...campos]
    .filter((c) => !c.Excluir)
    .sort((a, b) => a.Orden - b.Orden)
    .map((c) => {
      const numerico = esNumerico(c);
      const col: ColDef<T> = {
        colId: c.NombreCampoBD,
        field: c.NombreCampoBD as ColDef<T>["field"],
        headerName: aliasEnLineas(c.Alias).join("\n"),
        headerTooltip: c.Descripcion || undefined,
        // initialHide (no hide): así el usuario puede mostrar la columna sin que el grid la vuelva a ocultar al re-renderizar
        initialHide: !c.Visible,
        sortable: c.MostrarOrdenar,
        resizable: c.EsResizable,
        suppressHeaderMenuButton: !c.MostrarMenu,
        pinned: c.Fijar ? "left" : undefined,
        editable: c.EsEditable,
        filter: c.MostrarFiltro ? (numerico ? "agNumberColumnFilter" : c.TipoDato === "datetime" ? "agDateColumnFilter" : "agTextColumnFilter") : false,
        floatingFilter: c.MostrarFiltro,
        cellDataType: numerico ? "number" : c.TipoDato === "datetime" ? "dateString" : c.TipoDato === "bit" ? "boolean" : "text",
        valueFormatter: (p: ValueFormatterParams<T>) => formatearValor(c, p.value),
        cellStyle: { textAlign: c.AlineacionTexto ?? (numerico ? "right" : "left") },
        headerClass: [c.EncabezadoNegrita ? "grid-header-bold" : "grid-header-normal", c.EsEditable ? "grid-header-editable" : ""],
        headerStyle: c.ColorEncabezado
          ? { backgroundColor: `#${c.ColorEncabezado}`, ...(c.ColorEncabezadoTexto ? { color: `#${c.ColorEncabezadoTexto}` } : {}) }
          : undefined,
        // Ancho: en píxeles si está; si no, proporcional; si no, según el contenido.
        ...(c.TamanoPixeles ? { width: Number(c.TamanoPixeles) } : c.TamanoProporcion ? { flex: Number(c.TamanoProporcion) } : { flex: 1, minWidth: 120 })
      };
      return col;
    });
}

/** Suma de las columnas con MostrarTotal sobre las filas dadas (las filtradas). */
export function totalesDe<T extends object>(campos: CatalogoTablaCampo[], filas: T[]): Partial<Record<string, number>> {
  const totales: Partial<Record<string, number>> = {};
  campos.filter((c) => c.MostrarTotal && !c.Excluir).forEach((c) => {
    totales[c.NombreCampoBD] = filas.reduce((acc, f) => acc + (Number((f as Record<string, unknown>)[c.NombreCampoBD]) || 0), 0);
  });
  return totales;
}
