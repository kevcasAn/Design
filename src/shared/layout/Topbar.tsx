import { Link, useNavigate } from "react-router-dom";
import { useConfiguracion } from "../../features/configuracion/hooks";
import { useMiRol } from "../../features/seguridad/hooks";
import { iniciales, useSesionStore } from "../../features/sesion/sesionStore";
import { Logo } from "../ui/Logo";

export function Topbar() {
  const { data: config } = useConfiguracion();
  const { data: miRol } = useMiRol();
  const usuario = useSesionStore((s) => s.usuario);
  const cerrarSesion = useSesionStore((s) => s.cerrarSesion);
  const navigate = useNavigate();

  const salir = () => {
    cerrarSesion();
    navigate("/login", { replace: true });
  };

  return (
    <header className="topbar">
      <Link to="/" className="flex items-center gap-3 text-white no-underline">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/15">
          <Logo className="size-[22px]" />
        </span>
        <span className="leading-tight">
          <strong className="block">RefundyTax</strong>
          <span className="block text-tiny opacity-80">{config?.NombreEmpresa}</span>
        </span>
      </Link>

      <div className="flex flex-wrap items-center gap-2">
        <Link to="/administracion" className="topbar-link no-underline">Administración</Link>
        <Link to="/catalogos" className="topbar-link no-underline">Catálogos</Link>
        {miRol?.EsAdministrador && (
          <span className="badge bg-white/15 text-white">Administrador</span>
        )}
        <Link to="/mi-acceso" className="flex items-center gap-2 pl-2 text-small text-white no-underline" title="Tu acceso y roles">
          <span>{usuario ? `${usuario.nombre} ${usuario.apellido}` : ""}</span>
          <span className="grid size-8 place-items-center rounded-full bg-white/20 text-tiny font-bold" aria-hidden="true">
            {iniciales(usuario)}
          </span>
        </Link>
        <button type="button" className="topbar-link" onClick={salir}>
          Salir
        </button>
      </div>
    </header>
  );
}
