/** Ícono de la tarjeta de impuesto (los mismos trazos del mockup). */
export function IconoImpuesto({ nombre }: { nombre: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      {nombre === "IR" ? <path d="M12 3v18M7 8h7a3 3 0 0 1 0 6H9" /> : <path d="M4 7h16M4 12h16M4 17h10" />}
    </svg>
  );
}
