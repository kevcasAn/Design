import { useState } from "react";
import type { PasoExpediente } from "../api";
import { cargaDeHoja, type Hoja } from "./arbol";
import { ListaCargas } from "./ListaCargas";
import { Acciones, ProcesoAts } from "./analisis/piezas";
import { DetalleDaes } from "./analisis/pantallas";
import type { TablaMuestra } from "./analisis/datos";

function Tabla({ tabla }: { tabla: TablaMuestra }) {
  const { columnas, filas, resaltar } = tabla;
  return (
    <div className="vx-scroll">
      <table className="vx-tabla">
        <thead>
          <tr>{columnas.map((c) => <th key={c}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <tr key={f.join("|")} className={resaltar !== undefined && f[resaltar] === "Revisar" ? "is-falso" : undefined}>
              {f.map((c, i) => <td key={i}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TareaTabla({ tabla }: { tabla: TablaMuestra }) {
  const [hecha, setHecha] = useState(false);
  return (
    <div className="vx-stack">
      <Tabla tabla={tabla} />
      <Acciones hecha={hecha} onGuardar={() => setHecha(true)} onModificar={() => setHecha(false)} />
    </div>
  );
}

/** Lo que se ve al elegir una hoja del tercer nivel. */
export function ContenidoHoja({ hoja, idTramite, editable, paso }: { hoja: Hoja; idTramite: number; editable: boolean; paso: PasoExpediente }) {
  if (hoja.vista.tipo === "archivo") {
    return <ListaCargas cargas={[]} ejemplos={[cargaDeHoja(hoja)]} idTramite={idTramite} editable={editable} paso={paso} />;
  }
  if (hoja.vista.tipo === "factor") return <DetalleDaes parte="factor" />;
  if (hoja.vista.tipo === "asignacion") return <DetalleDaes parte="asignacion" />;
  if (hoja.vista.tipo === "ats") return <ProcesoAts />;
  return <TareaTabla tabla={hoja.vista.tabla} />;
}
