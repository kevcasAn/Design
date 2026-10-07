import { useState } from "react";
import { COLUMNAS, COL_VALIDAR, ERRORES_ATS, ERRORES_RESTANTES, FILAS, PASOS_ATS, type Empresa } from "./datos";
import { useTrabajo } from "./estado";

type NombreIcono = "subir" | "traer" | "seguir" | "listo";

function Icono({ nombre }: { nombre: NombreIcono }) {
  const comun = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, "aria-hidden": true as const };
  if (nombre === "subir") return <svg {...comun}><path d="M12 16V5M8 8.5 12 4.5 16 8.5" /><path d="M5 19h14" /></svg>;
  if (nombre === "traer") return <svg {...comun}><path d="M12 4v11M8 11.5 12 15.5 16 11.5" /><path d="M5 19h14" /></svg>;
  if (nombre === "seguir") return <svg {...comun}><path d="M9 6l6 6-6 6" /></svg>;
  return <svg {...comun}><path d="M5 12.5 9.2 17 19 7" /></svg>;
}

function BotonIcono({ nombre, etiqueta, hecho, onClick }: { nombre: NombreIcono; etiqueta: string; hecho?: boolean; onClick: () => void }) {
  return (
    <button type="button" className={`btn btn-sm vx-icono ${hecho ? "is-ok" : "btn-primary"}`} title={etiqueta} aria-label={etiqueta} onClick={onClick}>
      <Icono nombre={hecho ? "listo" : nombre} />
    </button>
  );
}

export function Acciones({ hecha, onGuardar, onModificar }: { hecha: boolean; onGuardar: () => void; onModificar: () => void }) {
  return (
    <div className="vx-acciones">
      <button type="button" className="btn btn-primary btn-sm" onClick={hecha ? onModificar : onGuardar}>
        {hecha ? "Modificar" : "Guardar"}
      </button>
    </div>
  );
}

function TablaErrores({ filas }: { filas: string[][] }) {
  return (
    <div className="vx-scroll">
      <table className="vx-tabla">
        <thead>
          <tr><th>Fila</th><th>Campo</th><th>Error</th></tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <tr key={f[0]} className="is-falso">
              {f.map((c) => <td key={c}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Subida del ATS: círculos unidos por una línea y el paso abierto debajo. */
export function ProcesoAts() {
  const { pasoAts, avanzarAts } = useTrabajo();
  const total = PASOS_ATS.length;
  const [abierto, setAbierto] = useState(Math.min(pasoAts, total - 1));
  const listo = pasoAts >= total;
  const ir = (n: number) => {
    avanzarAts(n);
    setAbierto(Math.min(n, total - 1));
  };
  const elegir = (i: number) => setAbierto((prev) => (prev === i ? -1 : i));
  const clase = (i: number) => (i === abierto ? "is-on" : listo || i < pasoAts ? "is-ok" : "");

  return (
    <div className="vx-ats">
      <ol className="vx-pasos">
        {PASOS_ATS.map((titulo, i) => (
          <li key={titulo} className={clase(i)}>
            <button type="button" onClick={() => elegir(i)}>
              <span>{i + 1}</span>
              <small>{titulo}</small>
            </button>
          </li>
        ))}
      </ol>
      {abierto >= 0 && (
        <div className="vx-ats-form">
          {abierto === 0 && (
            <div className="vx-ats-fila">
              <span>{pasoAts > 0 ? "ATS.xml" : "Sin archivo"}</span>
              <BotonIcono nombre="subir" etiqueta="Cargar ATS" hecho={pasoAts > 0} onClick={() => ir(1)} />
            </div>
          )}
          {abierto === 1 && (
            <>
              <div className="vx-ats-fila">
                <strong>Errores encontrados</strong>
                <BotonIcono nombre="seguir" etiqueta="Seguir" onClick={() => ir(2)} />
              </div>
              <TablaErrores filas={ERRORES_ATS} />
            </>
          )}
          {abierto === 2 && (
            <>
              <div className="vx-ats-fila">
                <strong>Errores restantes</strong>
                <BotonIcono nombre="seguir" etiqueta="Seguir" onClick={() => ir(3)} />
              </div>
              <TablaErrores filas={ERRORES_RESTANTES} />
            </>
          )}
          {abierto === 3 && (
            <div className="vx-ats-fila">
              <span>ATS corregido</span>
              <BotonIcono nombre="traer" etiqueta="Descargar ATS corregido" hecho={listo} onClick={() => ir(total)} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Asignación de DAES de una empresa; las filas con días en FALSO se resaltan. */
export function TablaAsignacion({ empresa }: { empresa: Empresa }) {
  return (
    <div className="tabla-scroll">
      <table className="grid-table">
        <thead>
          <tr>{COLUMNAS.map((c) => <th key={c}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {(FILAS[empresa.id] ?? []).map((fila) => (
            <tr key={fila[0]} className={fila[COL_VALIDAR] === "FALSO" ? "vx-fila-falso" : undefined}>
              {fila.map((celda, i) => (
                <td key={COLUMNAS[i]} className={i > 9 ? "font-mono" : undefined}>
                  {i === COL_VALIDAR && celda === "VERDADERO" && <span className="badge badge-ok">Verdadero</span>}
                  {i === COL_VALIDAR && celda === "FALSO" && <span className="badge badge-warn">Falso</span>}
                  {i === COL_VALIDAR ? null : celda}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
