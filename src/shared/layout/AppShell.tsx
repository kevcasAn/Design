import { Outlet } from "react-router-dom";
import { Topbar } from "./Topbar";
import { Crumbs } from "./Crumbs";
import { Aviso } from "../ui/Aviso";
import { Cargando } from "../ui/Cargando";
import { useConfiguracion } from "../../features/configuracion/hooks";

/** Estructura de toda pantalla con sesión: barra superior + contenido. */
export function AppShell() {
  const config = useConfiguracion();

  if (config.isPending) {
    return <Cargando modo="pantalla" texto="Preparando tu espacio de trabajo…" />;
  }

  if (config.isError) {
    return (
      <div className="stage">
        <div className="alert alert-danger">
          No se pudo leer la configuración de la empresa: {config.error.message}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="app-cabeza">
        <Topbar />
        <Crumbs />
      </div>
      <main className="stage">
        <Outlet />
      </main>
      <Aviso />
    </>
  );
}
