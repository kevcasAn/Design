import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEstaAutenticado } from "../features/sesion/sesionStore";

/** Si no hay sesión manda al login y recuerda a dónde quería ir el usuario. */
export function RutaProtegida() {
  const autenticado = useEstaAutenticado();
  const location = useLocation();
  if (!autenticado) return <Navigate to="/login" replace state={{ desde: location.pathname }} />;
  return <Outlet />;
}
