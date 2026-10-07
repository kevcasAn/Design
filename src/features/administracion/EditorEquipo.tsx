import { useState } from "react";
import type { PersonaEquipo } from "./api";
import { useEmpleados } from "./hooks";

interface Props {
  equipo: PersonaEquipo[];
  onCambiar: (equipo: PersonaEquipo[]) => void;
}

/**
 * Editor del equipo: personas con sus roles (Ejecutor · Revisor · Aprobador, los de ComplyTax).
 * Las personas salen del directorio de AndersenCoreAPI; si no responde, se escribe el usuario.
 */
export function EditorEquipo({ equipo, onCambiar }: Props) {
  const empleados = useEmpleados();
  const [nuevo, setNuevo] = useState("");

  const nombreDe = (userName: string) => {
    const e = empleados.data?.find((x) => x.UserName.toLowerCase() === userName.toLowerCase());
    return e ? `${e.Nombres} ${e.Apellidos}` : null;
  };

  const agregar = () => {
    // Acepta "nombre.apellido" o lo elegido de la lista ("Nombre Apellido (usuario)")
    const coincide = /\(([^)]+)\)\s*$/.exec(nuevo);
    const userName = (coincide ? coincide[1] : nuevo).trim();
    if (!userName || equipo.some((p) => p.UserName.toLowerCase() === userName.toLowerCase())) { setNuevo(""); return; }
    onCambiar([...equipo, { UserName: userName, EsEjecutor: true, EsRevisor: false, EsAprobador: false }]);
    setNuevo("");
  };

  const cambiar = (userName: string, campo: "EsEjecutor" | "EsRevisor" | "EsAprobador", valor: boolean) =>
    onCambiar(equipo.map((p) => (p.UserName === userName ? { ...p, [campo]: valor } : p)));

  return (
    <div className="grid gap-3">
      {equipo.length > 0 && (
        <table className="grid-table">
          <thead><tr><th>Persona</th><th>Ejecutor</th><th>Revisor</th><th>Aprobador (responsable)</th><th></th></tr></thead>
          <tbody>
            {equipo.map((p) => (
              <tr key={p.UserName}>
                <td>
                  <div className="font-semibold">{nombreDe(p.UserName) ?? p.UserName}</div>
                  {nombreDe(p.UserName) && <div className="text-tiny text-muted">{p.UserName}</div>}
                </td>
                {(["EsEjecutor", "EsRevisor", "EsAprobador"] as const).map((campo) => (
                  <td key={campo}>
                    <input type="checkbox" checked={p[campo]} onChange={(e) => cambiar(p.UserName, campo, e.target.checked)} aria-label={`${campo} de ${p.UserName}`} />
                  </td>
                ))}
                <td className="text-right">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => onCambiar(equipo.filter((x) => x.UserName !== p.UserName))}>Quitar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {equipo.length === 0 && <p className="m-0 text-small text-muted">Todavía no hay nadie en el equipo.</p>}

      <div className="flex flex-wrap items-end gap-2">
        <label className="field min-w-64 flex-1">
          Agregar persona
          <input
            type="text"
            list="lista-empleados"
            value={nuevo}
            onChange={(e) => setNuevo(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); agregar(); } }}
            placeholder={empleados.isPending ? "Cargando directorio…" : "Escribe el nombre o el usuario de red"}
          />
        </label>
        <datalist id="lista-empleados">
          {empleados.data?.map((e) => <option key={e.UserName} value={`${e.Nombres} ${e.Apellidos} (${e.UserName})`} />)}
        </datalist>
        <button type="button" className="btn btn-ghost" onClick={agregar} disabled={!nuevo.trim()}>Agregar</button>
      </div>
    </div>
  );
}
