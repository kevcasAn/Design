import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { login } from "./api";
import { useEstaAutenticado, useSesionStore } from "./sesionStore";
import { useConfiguracion } from "../configuracion/hooks";
import { Logo } from "../../shared/ui/Logo";

export function LoginPage() {
  const autenticado = useEstaAutenticado();
  const iniciarSesion = useSesionStore((s) => s.iniciarSesion);
  const navigate = useNavigate();
  const location = useLocation();
  const { data: config } = useConfiguracion();

  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");

  const entrar = useMutation({
    mutationFn: () => login(usuario.trim(), contrasena),
    onSuccess: (r) => {
      iniciarSesion(r.token, r.usuario);
      const desde = (location.state as { desde?: string } | null)?.desde;
      navigate(desde && desde !== "/login" ? desde : "/", { replace: true });
    }
  });

  if (autenticado) return <Navigate to="/" replace />;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!usuario.trim() || !contrasena) return;
    entrar.mutate();
  };

  return (
    <div className="grid min-h-screen place-items-center p-6">
      <form onSubmit={onSubmit} className="card grid w-full max-w-sm gap-4 p-7">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-burgundy text-white">
            <Logo className="size-6" />
          </span>
          <div className="leading-tight">
            <strong className="block text-h3">RefundyTax</strong>
            <span className="block text-small text-muted">{config?.NombreEmpresa ?? ""}</span>
          </div>
        </div>

        <p className="lede text-small">
          {config?.ModoAcceso === "usuarios"
            ? "Entra con tu usuario y contraseña del sistema."
            : "Entra con tu usuario y contraseña de la red."}
        </p>

        <label className="field">
          Usuario
          <input
            type="text"
            autoComplete="username"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            autoFocus
            required
          />
        </label>

        <label className="field">
          Contraseña
          <input
            type="password"
            autoComplete="current-password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
          />
        </label>

        {entrar.isError && <div className="alert alert-danger">{entrar.error.message}</div>}

        <button type="submit" className="btn btn-primary" disabled={entrar.isPending}>
          {entrar.isPending ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
