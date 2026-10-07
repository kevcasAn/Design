import { GridCatalogo } from "../../shared/grid/GridCatalogo";
import { useActualizarPlazoEstimado, useTiposDevoluciones, useTiposTramiteSri } from "./hooks";
import type { TipoDevolucion, TipoTramiteSri } from "./api";

/** Catálogos de la empresa, mostrados con el grid que se arma desde CatalogosTablas. */
export function CatalogosPage() {
  const tipos = useTiposDevoluciones();
  const sri = useTiposTramiteSri();
  const actualizarPlazo = useActualizarPlazoEstimado();

  return (
    <>
      <p className="eyebrow">Administración</p>
      <h1>Catálogos</h1>
      <p className="lede">
        Lo que se configura una vez y sirve para todos. Cada tabla se muestra como dice el catálogo de tablas: columnas, orden, filtros, totales y qué se puede editar.
      </p>

      <section className="card mt-6 p-5">
        <h2>Tipos de devolución</h2>
        <GridCatalogo<TipoDevolucion>
          idCatalogoTabla={1}
          filas={tipos.data}
          cargando={tipos.isPending}
          error={tipos.error?.message}
          idCampo="IdTipoDevolucion"
          titulo="Tipos de devolución"
          alto={360}
          paginar={false}
        />
      </section>

      <section className="card mt-6 p-5">
        <h2>Tipos de trámite SRI</h2>
        <p className="mb-3 text-small text-muted">El plazo estimado se puede editar en la celda: se guarda al salir de ella.</p>
        <GridCatalogo<TipoTramiteSri>
          idCatalogoTabla={2}
          filas={sri.data}
          cargando={sri.isPending}
          error={sri.error?.message ?? actualizarPlazo.error?.message}
          idCampo="IdTipoTramiteSri"
          titulo="Tipos de trámite SRI"
          subtitulo="Plazos de respuesta del SRI"
          alto={300}
          paginar={false}
          onCeldaEditada={(fila, campo, valor) => {
            if (campo === "PlazoEstimadoDias") actualizarPlazo.mutate({ id: fila.IdTipoTramiteSri, plazo: Number(valor) });
          }}
        />
      </section>
    </>
  );
}
