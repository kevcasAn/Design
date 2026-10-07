import { ImpuestoPage } from "../impuestos/ImpuestoPage";
import { TodosTramitesPage } from "./TodosTramitesPage";
import { useVistaStore } from "./vistaStore";

/** Pantalla de entrada: muestra la vista que el usuario eligió la última vez. */
export function PortadaPage() {
  const vista = useVistaStore((s) => s.vista);
  return vista === "todo" ? <TodosTramitesPage /> : <ImpuestoPage />;
}
