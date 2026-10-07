
/** Fila de CatalogosTablasCampos: cómo se ve una columna (igual que ComplyTax). */
export interface CatalogoTablaCampo {
  IdCatalogoTablaCampo: number;
  IdCatalogoTabla: number;
  NombreCampoBD: string;
  Alias: string;
  Descripcion: string;
  Visible: boolean;
  MostrarTotal: boolean;
  MostrarFiltro: boolean;
  Excluir: boolean;
  EsEditable: boolean;
  Fijar: boolean;
  EsFiltroGeneral: boolean;
  EsObligatorio: boolean;
  TipoDato: string | null;
  TamanoProporcion: number | null;
  TamanoPixeles: number | null;
  AlineacionTexto: "left" | "center" | "right" | null;
  MostrarMenu: boolean;
  MostrarOrdenar: boolean;
  Orden: number;
  InformacionAdicional: string | null;
  EsResizable: boolean;
  ColorEncabezado: string | null;
  ColorEncabezadoTexto: string | null;
  EncabezadoNegrita: boolean;
  EsPorcentaje: boolean;
}

/** RefundyTaxAPI: GET api/catalogos-tablas/{id} */
export interface CatalogoTabla {
  IdCatalogoTabla: number;
  Nombre: string;
  Campos: CatalogoTablaCampo[];
}

export const obtenerCatalogoTabla = async (idCatalogoTabla: number): Promise<CatalogoTabla> => ({
  IdCatalogoTabla: idCatalogoTabla,
  Nombre: idCatalogoTabla === 1 ? "Tipos de devolución" : "Tipos de trámite SRI",
  Campos: []
});
