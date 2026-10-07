import { useAvisoStore } from "./avisoStore";

/** Pinta el aviso flotante. Va una sola vez, en AppShell. */
export function Aviso() {
  const mensaje = useAvisoStore((s) => s.mensaje);
  if (!mensaje) return null;
  return <div className="toast" role="status">{mensaje}</div>;
}
