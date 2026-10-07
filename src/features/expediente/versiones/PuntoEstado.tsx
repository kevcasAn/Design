/** Punto de la pastilla: verde si el paso o la sección ya está completa. */
export function PuntoEstado({ lista }: { lista: boolean }) {
  return <span className={`vx-punto ${lista ? "is-ok" : ""}`} aria-hidden="true" />;
}
