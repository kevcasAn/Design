import { useConfiguracion, useEtiquetas } from "../configuracion/hooks";
import { useMiRol } from "../seguridad/hooks";
import { useSesionStore } from "../sesion/sesionStore";

/**
 * Pantalla de entrada. Por ahora muestra lo que la API ya sabe del usuario y
 * de la empresa. A medida que existan los endpoints (impuestos, tipos de
 * devolución, trámites) aquí arranca el flujo Impuesto → Tipo → Trámites.
 */
export function InicioPage() {
  const usuario = useSesionStore((s) => s.usuario);
  const { data: config } = useConfiguracion();
  const miRol = useMiRol();
  const { L, lower } = useEtiquetas();

  return (
    <>
      <p className="eyebrow">Mi acceso</p>
      <h1>Hola, {usuario?.nombre.split(" ")[0]}</h1>
      <p className="lede">
        Estás en RefundyTax de {config?.NombreEmpresa}. Aquí vas a ver tus {lower("tramites")} y las {lower("propuestas")} de cada {lower("cliente")}.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <section className="card p-5">
          <h3>Tu acceso</h3>
          {miRol.isPending && <p className="text-small text-muted">Consultando permisos…</p>}
          {miRol.isError && <div className="alert alert-danger mt-2">{miRol.error.message}</div>}
          {miRol.data && (
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-small">
              <dt className="text-muted">Usuario</dt>
              <dd className="m-0 font-semibold">{miRol.data.UserName}</dd>
              <dt className="text-muted">Administrador</dt>
              <dd className="m-0">
                {miRol.data.EsAdministrador
                  ? <span className="badge badge-ok">Sí</span>
                  : <span className="badge">No</span>}
              </dd>
              <dt className="text-muted">Cargo</dt>
              <dd className="m-0">{usuario?.cargo ?? "—"}</dd>
            </dl>
          )}
        </section>

        <section className="card p-5">
          <h3>Qué puede hacer cada rol</h3>
          <p className="mt-1 text-small text-muted">Sale de la tabla Roles. Lo ajusta un administrador.</p>
          {miRol.data && (
            <table className="grid-table mt-3">
              <thead>
                <tr>
                  <th>Rol</th>
                  <th>Crear {lower("propuestas")}</th>
                  <th>Crear {lower("tramites")}</th>
                  <th>Cambiar equipo</th>
                </tr>
              </thead>
              <tbody>
                {miRol.data.Roles.map((r) => (
                  <tr key={r.IdRol}>
                    <td className="font-semibold">{r.Nombre}</td>
                    <td>{r.PuedeCrearPropuestas ? "Sí" : "No"}</td>
                    <td>{r.PuedeCrearTramites ? "Sí" : "No"}</td>
                    <td>{r.PuedeCambiarEquipo ? "Sí" : "No"}</td>
                  </tr>
                ))}
                {miRol.data.Roles.length === 0 && (
                  <tr><td colSpan={4} className="text-muted">Todavía no hay roles cargados en la base.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </section>

        <section className="card p-5 md:col-span-2">
          <h3>Configuración de {config?.NombreEmpresa}</h3>
          <p className="mt-1 text-small text-muted">Tabla Configuracion. Estas palabras se usan en todas las pantallas.</p>
          <dl className="mt-3 grid gap-x-6 gap-y-2 text-small sm:grid-cols-2 lg:grid-cols-3">
            <div><dt className="text-muted">{`"${L("propuesta")}" / "${L("propuestas")}"`}</dt><dd className="m-0">Cómo llama la empresa a la propuesta</dd></div>
            <div><dt className="text-muted">{`"${L("tramite")}" / "${L("tramites")}"`}</dt><dd className="m-0">Cómo llama al trámite</dd></div>
            <div><dt className="text-muted">{`"${L("cliente")}"`}</dt><dd className="m-0">Cómo llama al cliente</dd></div>
            <div><dt className="text-muted">Modo de acceso</dt><dd className="m-0">{config?.ModoAcceso}</dd></div>
            <div><dt className="text-muted">Asistente de IA</dt><dd className="m-0">{config?.IAActiva ? `Activo · ${config.IAModelo}` : "Apagado"}</dd></div>
          </dl>
        </section>
      </div>
    </>
  );
}
