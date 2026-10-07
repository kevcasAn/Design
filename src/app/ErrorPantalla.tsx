import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom";
import { Logo } from "../shared/ui/Logo";

/**
 * Pantalla que aparece si algo falla al dibujar una página. Reemplaza la página
 * técnica de React Router. El detalle queda en la consola (F12) para soporte.
 */
export function ErrorPantalla() {
  const error = useRouteError();
  const noExiste = isRouteErrorResponse(error) && error.status === 404;
  console.error("RefundyTax · error en la pantalla:", error);

  return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="card grid w-full max-w-md gap-3 p-7 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-xl bg-burgundy text-white">
          <Logo className="size-7" />
        </span>
        <h2 className="m-0">{noExiste ? "Esta página no existe" : "Algo salió mal"}</h2>
        <p className="lede mx-auto text-small">
          {noExiste
            ? "Revisa la dirección o vuelve al inicio."
            : "No se pudo mostrar esta pantalla. Recarga la página; si sigue pasando, avisa a soporte. El detalle quedó en la consola del navegador (F12)."}
        </p>
        <div className="mt-2 flex justify-center gap-2">
          <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>Recargar</button>
          <Link to="/" className="btn btn-ghost no-underline">Ir al inicio</Link>
        </div>
      </div>
    </div>
  );
}
