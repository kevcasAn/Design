import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { CellValueChangedEvent, GridApi, GridReadyEvent } from "ag-grid-community";
import { AG_GRID_LOCALE_ES } from "@ag-grid-community/locale";
import { useCatalogoTabla } from "../../features/catalogosTablas/hooks";
import { useConfiguracion } from "../../features/configuracion/hooks";
import { useSesionStore } from "../../features/sesion/sesionStore";
import { columnasDesdeCatalogo, totalesDe } from "./columnasDesdeCatalogo";
import { exportarExcel } from "./exportarExcel";
import { temaGrid } from "./temaGrid";
import { BotonColumnas } from "./BotonColumnas";
import { elegir } from "../ui/dialogos";

interface Props<T extends object> {
  /** Id en CatalogosTablas: de ahí salen las columnas. */
  idCatalogoTabla: number;
  filas: T[] | undefined;
  cargando?: boolean;
  error?: string | null;
  /** Campo que identifica cada fila (para edición y selección). */
  idCampo: keyof T & string;
  /** Título del bloque de cabecera del Excel y nombre del archivo. */
  titulo: string;
  subtitulo?: string;
  /** Se llama al editar una celda (columnas con EsEditable en el catálogo). */
  onCeldaEditada?: (fila: T, campo: string, valorNuevo: unknown, valorAnterior: unknown) => void;
  /** Clases por fila, por ejemplo para marcar errores en rojo. */
  claseFila?: (fila: T) => string | undefined;
  alto?: number | string;
  paginar?: boolean;
}

/**
 * Grid de la aplicación. Las columnas salen del catálogo de tablas
 * (alias, orden, visible, filtros, totales, edición); los datos los pone la pantalla.
 * Incluye botón de columnas, fila de totales y descarga a Excel.
 */
export function GridCatalogo<T extends object>({
  idCatalogoTabla, filas, cargando, error, idCampo, titulo, subtitulo, onCeldaEditada, claseFila, alto = 480, paginar = true
}: Props<T>) {
  const catalogo = useCatalogoTabla(idCatalogoTabla);
  const { data: config } = useConfiguracion();
  const usuario = useSesionStore((s) => s.usuario);
  const apiRef = useRef<GridApi<T> | null>(null);
  const campos = useMemo(() => catalogo.data?.Campos ?? [], [catalogo.data]);

  const columnas = useMemo(() => columnasDesdeCatalogo<T>(campos), [campos]);
  // Opciones estables: si cambian de referencia en cada render, AG Grid vuelve a aplicar
  // las columnas y deshace lo que el usuario ocultó o mostró.
  const defaultColDef = useMemo(() => ({ sortable: true, resizable: true, minWidth: 80 }), []);
  const rowClassRules = useMemo(
    () => (claseFila ? { "grid-fila-marcada": (p: { data?: T }) => Boolean(p.data && claseFila(p.data)) } : undefined),
    [claseFila]
  );
  const [visibles, setVisibles] = useState<Set<string>>(new Set());
  const [filtradas, setFiltradas] = useState<T[]>([]);

  const visiblesDelCatalogo = useCallback(
    () => new Set(campos.filter((c) => c.Visible && !c.Excluir).map((c) => c.NombreCampoBD)),
    [campos]
  );

  useEffect(() => setVisibles(visiblesDelCatalogo()), [visiblesDelCatalogo]);

  // Filas que quedan después de los filtros del grid: alimentan totales y Excel.
  const recalcularFiltradas = useCallback(() => {
    const api = apiRef.current;
    if (!api) return;
    const lista: T[] = [];
    api.forEachNodeAfterFilter((n) => { if (n.data) lista.push(n.data); });
    setFiltradas(lista);
  }, []);

  const onGridReady = (e: GridReadyEvent<T>) => {
    apiRef.current = e.api;
    recalcularFiltradas();
  };

  const totales = useMemo(() => totalesDe(campos, filtradas), [campos, filtradas]);
  const filaTotales = useMemo(() => {
    if (!Object.keys(totales).length) return [];
    const primera = campos.filter((c) => !c.Excluir).sort((a, b) => a.Orden - b.Orden).find((c) => visibles.has(c.NombreCampoBD));
    return [{ ...(primera ? { [primera.NombreCampoBD]: "Total" } : {}), ...totales } as unknown as T];
  }, [totales, campos, visibles]);

  const cambiarVisible = (campo: string, visible: boolean) => {
    apiRef.current?.setColumnsVisible([campo], visible);
    setVisibles((prev) => { const s = new Set(prev); if (visible) s.add(campo); else s.delete(campo); return s; });
  };

  const restablecer = () => {
    const base = visiblesDelCatalogo();
    campos.filter((c) => !c.Excluir).forEach((c) => apiRef.current?.setColumnsVisible([c.NombreCampoBD], base.has(c.NombreCampoBD)));
    setVisibles(base);
  };

  const descargar = async () => {
    const todas = filas ?? [];
    let usarFiltradas = false;
    if (filtradas.length > 0 && filtradas.length < todas.length) {
      const r = await elegir({
        titulo: "Descargar Excel",
        texto: `Hay filtros aplicados: se ven ${filtradas.length} de ${todas.length} filas. ¿Qué quieres descargar?`,
        opcionA: "Solo lo filtrado",
        opcionB: "Todo"
      });
      if (r === null) return;
      usarFiltradas = r === "a";
    }
    await exportarExcel(campos, usarFiltradas ? filtradas : todas, {
      empresa: config?.NombreEmpresa ?? "",
      titulo,
      subtitulo,
      descargadoPor: usuario ? `${usuario.nombre} ${usuario.apellido}` : ""
    }, titulo.replace(/[^\p{L}\p{N}]+/gu, "_"));
  };

  const onCellValueChanged = (e: CellValueChangedEvent<T>) => {
    if (e.newValue === e.oldValue) return;
    onCeldaEditada?.(e.data, e.colDef.colId ?? String(e.colDef.field), e.newValue, e.oldValue);
    recalcularFiltradas();
  };

  if (catalogo.isError) return <div className="alert alert-danger">No se pudo leer el catálogo de la tabla: {catalogo.error.message}</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <span className="mr-auto text-small text-muted">
          {cargando || catalogo.isPending ? "Cargando…" : `${filtradas.length} de ${filas?.length ?? 0} filas`}
        </span>
        <BotonColumnas campos={campos} visibles={visibles} onCambiar={cambiarVisible} onRestablecer={restablecer} />
        <button type="button" className="btn btn-primary btn-sm" onClick={descargar} disabled={!filas?.length}>
          Descargar Excel
        </button>
      </div>
      <div style={{ height: alto }}>
        <AgGridReact<T>
          theme={temaGrid}
          localeText={AG_GRID_LOCALE_ES}
          rowData={filas ?? []}
          columnDefs={columnas}
          defaultColDef={defaultColDef}
          getRowId={(p) => String(p.data[idCampo])}
          pinnedBottomRowData={filaTotales}
          pagination={paginar}
          paginationPageSize={25}
          paginationPageSizeSelector={[15, 25, 50, 100]}
          animateRows
          suppressCellFocus={!onCeldaEditada}
          stopEditingWhenCellsLoseFocus
          singleClickEdit
          tooltipShowDelay={300}
          rowClassRules={rowClassRules}
          onGridReady={onGridReady}
          onFilterChanged={recalcularFiltradas}
          onRowDataUpdated={recalcularFiltradas}
          onCellValueChanged={onCellValueChanged}
          loading={Boolean(cargando)}
        />
      </div>
    </div>
  );
}
