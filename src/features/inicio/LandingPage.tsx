import { useNavigate } from "react-router-dom";

/** Entrada estática. No hay animación de carga: el recorrido empieza con un clic. */
export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto grid max-w-2xl gap-6 py-6">
      <div>
        <p className="eyebrow">Andersen Ecuador</p>
        <h1>Devolución de IVA</h1>
        <p className="lede">
          Recorrido del proveedor directo de exportador de bienes: el tipo de devolución, los trámites de la cartera y el trabajo dentro de cada expediente.
        </p>
      </div>
      <button type="button" className="choice text-left" onClick={() => navigate("/impuestos/1/tipos/1")}>
        <span className="choice-kicker">IVA</span>
        <strong>Proveedor directo de exportador de bienes</strong>
        <span className="choice-hint">Entrar a los trámites</span>
      </button>
    </div>
  );
}
