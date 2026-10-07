import { Logo } from "./Logo";

interface Props {
  /** Qué se está cargando, en palabras simples. */
  texto?: string;
  /** "pantalla": ocupa toda la ventana (arranque). "bloque": dentro de una pantalla. */
  modo?: "pantalla" | "bloque";
}

/** Indicador de carga con la marca. Una sola pieza para toda la aplicación. */
export function Cargando({ texto = "Cargando…", modo = "bloque" }: Props) {
  if (modo === "pantalla") {
    return (
      <div className="cargando-pantalla" role="status" aria-live="polite">
        <div className="cargando-marca">
          <span className="cargando-logo"><Logo className="size-7" /></span>
          <span className="cargando-anillo" aria-hidden="true" />
        </div>
        <strong className="mt-4 text-h3">RefundyTax</strong>
        <span className="mt-1 text-small text-muted">{texto}</span>
      </div>
    );
  }

  return (
    <div className="cargando-bloque" role="status" aria-live="polite">
      <span className="cargando-anillo cargando-anillo--chico" aria-hidden="true" />
      <span className="text-small text-muted">{texto}</span>
    </div>
  );
}
