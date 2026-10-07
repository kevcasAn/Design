import { useState } from "react";
import type { CargaExpediente, SeccionExpediente } from "./api";
import { CargaCard } from "./CargaCard";

interface Props {
  seccion: SeccionExpediente;
  cargas: CargaExpediente[];
  idTramite: number;
  editable: boolean;
}

/**
 * Sección de un paso (PasosSecciones): varias cargas juntas en la misma caja.
 * IdTipoSeccion 1 = tarjeta (siempre abierta) · 2 = acordeón (se puede plegar).
 */
export function SeccionCargas({ seccion, cargas, idTramite, editable }: Props) {
  const esAcordeon = seccion.IdTipoSeccion === 2;
  const hechas = cargas.filter((c) => c.Completada).length;
  // El acordeón arranca abierto si todavía le falta algo
  const [abierta, setAbierta] = useState(!esAcordeon || hechas < cargas.length);

  const cabecera = (
    <>
      <h3>{seccion.Nombre}</h3>
      <span className="flex items-center gap-2 text-tiny text-muted">
        {hechas} de {cargas.length} completadas
        {esAcordeon && (
          <svg className="seccion-flecha size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        )}
      </span>
    </>
  );

  return (
    <section className={`seccion ${abierta ? "" : "is-cerrada"}`}>
      {esAcordeon ? (
        <button type="button" className="seccion-cabecera" aria-expanded={abierta} onClick={() => setAbierta((v) => !v)}>
          {cabecera}
        </button>
      ) : (
        <div className="seccion-cabecera">{cabecera}</div>
      )}
      {abierta && (
        <div>
          {cargas.map((c) => <CargaCard key={c.IdTramiteDetalle} carga={c} idTramite={idTramite} editable={editable} />)}
          {cargas.length === 0 && <p className="m-0 p-4 text-small text-muted">Esta sección no tiene cargas.</p>}
        </div>
      )}
    </section>
  );
}
