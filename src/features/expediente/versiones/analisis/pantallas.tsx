import { Fragment, useState, type ReactNode } from "react";
import ExcelJS from "exceljs";
import { ANALISIS, COLUMNAS, EMPRESAS, ERRORES_ATS, ERRORES_RESTANTES, FILAS, SUBTAREAS_PREVALIDACION, TABLAS_ANALISIS, UNIDADES_OPC, type IdAnalisis, type TablaMuestra } from "./datos";
import { useTrabajo, type EstadoTarea } from "./estado";
import { archivoPublico } from "../../../../app/env";
import { Acciones, ProcesoAts, TablaAsignacion } from "./piezas";

export const tituloTarea = (id: IdAnalisis) => ANALISIS.find((t) => t.id === id)!.titulo;

async function descargarExcel(nombre: string, columnas: readonly string[], filas: string[][]) {
  const libro = new ExcelJS.Workbook();
  const hoja = libro.addWorksheet(nombre.replace(/[\\/*?:[\]]/g, " ").slice(0, 31) || "Analisis");
  const encabezado = hoja.addRow([...columnas]);
  encabezado.font = { bold: true, color: { argb: "FFFFFFFF" } };
  encabezado.eachCell((celda) => {
    celda.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF6B1C28" } };
  });
  filas.forEach((fila) => hoja.addRow(fila));
  columnas.forEach((_, i) => { hoja.getColumn(i + 1).width = 22; });
  const buffer = await libro.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `${nombre}.xlsx`;
  enlace.click();
  URL.revokeObjectURL(url);
}

function BotonExcel({ titulo, columnas, filas }: { titulo: string; columnas: readonly string[]; filas: string[][] }) {
  return (
    <div className="vx-excel-fila">
      <button type="button" className="vx-excel" title="Descargar Excel" aria-label={`Descargar ${titulo} en Excel`} onClick={() => void descargarExcel(titulo, columnas, filas)}>
        <img src={archivoPublico("excel.svg")} alt="" />
      </button>
    </div>
  );
}

export interface ItemSubnivel {
  id: string;
  titulo: string;
  contenido: ReactNode;
}

function TablaMuestraVista({ tabla }: { tabla: TablaMuestra }) {
  const { columnas, filas, resaltar } = tabla;
  return (
    <div className="vx-scroll">
      <table className="vx-tabla">
        <thead>
          <tr>{columnas.map((c) => <th key={c}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <tr key={f[0]} className={resaltar !== undefined && f[resaltar] === "Revisar" ? "is-falso" : undefined}>
              {f.map((c, i) => <td key={i}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const SUBITEMS_VISTA: Partial<Record<IdAnalisis, ItemSubnivel[]>> = {
  prevalidacion: SUBTAREAS_PREVALIDACION.map((s) => ({
    id: s.id,
    titulo: s.titulo,
    contenido: <TablaMuestraVista tabla={s.tabla} />
  }))
};

export const subitemsDe = (id: IdAnalisis) => SUBITEMS_VISTA[id];

export const PARTES_DAES = [
  { id: "factor", titulo: "Asignación de factor" },
  { id: "asignacion", titulo: "Asignación de DAES" }
] as const;

export type IdParteDaes = (typeof PARTES_DAES)[number]["id"];

const claveDaes = (empresaId: string) => `${empresaId}:asignacion`;

export function estadoParteDaes(subHecha: (tarea: IdAnalisis, item: string) => boolean, parte: IdParteDaes): EstadoTarea {
  const lista = parte === "factor"
    ? subHecha("daes", "factor")
    : EMPRESAS.every((e) => subHecha("daes", claveDaes(e.id)));
  return lista ? { texto: "Completada", tono: "ok" } : { texto: "Pendiente", tono: "muted" };
}

function estadoEmpresa(subHecha: (tarea: IdAnalisis, item: string) => boolean, empresaId: string): EstadoTarea {
  return subHecha("daes", claveDaes(empresaId))
    ? { texto: "Completada", tono: "ok" }
    : { texto: "Pendiente", tono: "muted" };
}

function Marca({ tono }: { tono: EstadoTarea["tono"] }) {
  const comun = { viewBox: "0 0 24 24", fill: "none", "aria-hidden": true as const, className: `vx-rev ${tono === "ok" ? "is-ok" : "is-pendiente"}` };
  if (tono === "ok") {
    return (
      <svg {...comun}>
        <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.7" />
        <path d="M8.2 12.3 10.8 15l5-5.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg {...comun}>
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="2.4" fill="currentColor" />
    </svg>
  );
}

function EstadoLado({ estado }: { estado: EstadoTarea }) {
  return (
    <span className="vx-estado" title={estado.texto} aria-label={estado.texto}>
      <Marca tono={estado.tono} />
    </span>
  );
}

function AsignacionFactor() {
  const { unidades, cambiarUnidad, subHecha, guardarSub, modificarSub } = useTrabajo();
  const hecha = subHecha("daes", "factor");
  const filas = unidades.map((fila) => [fila.empresa, fila.ruc, fila.factor, fila.dias, fila.vendida, fila.exportada]);
  return (
    <div className="vx-stack">
      <BotonExcel titulo="Asignación de factor" columnas={["Empresa", "RUC", "Factor", "Días", "U. vendida", "U. exportada"]} filas={filas} />
      <div className="vx-scroll">
        <table className="vx-tabla">
          <thead>
            <tr>
              <th>Empresa</th>
              <th>Factor</th>
              <th>Días</th>
              <th>U. vendida</th>
              <th>U. exportada</th>
            </tr>
          </thead>
          <tbody>
            {unidades.map((fila) => (
              <tr key={fila.id}>
                <td>
                  <strong>{fila.empresa}</strong>
                  <small>{fila.ruc}</small>
                </td>
                <td><input disabled={hecha} value={fila.factor} onChange={(e) => cambiarUnidad(fila.id, { factor: e.target.value })} /></td>
                <td><input disabled={hecha} value={fila.dias} onChange={(e) => cambiarUnidad(fila.id, { dias: e.target.value })} /></td>
                <td>
                  <select disabled={hecha} value={fila.vendida} onChange={(e) => cambiarUnidad(fila.id, { vendida: e.target.value })}>
                    {UNIDADES_OPC.map((u) => <option key={u}>{u}</option>)}
                  </select>
                </td>
                <td>
                  <select disabled={hecha} value={fila.exportada} onChange={(e) => cambiarUnidad(fila.id, { exportada: e.target.value })}>
                    {UNIDADES_OPC.map((u) => <option key={u}>{u}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Acciones hecha={hecha} onGuardar={() => guardarSub("daes", "factor")} onModificar={() => modificarSub("daes", "factor")} />
    </div>
  );
}

function AsignacionDaes({ empresaId }: { empresaId: string }) {
  const { subHecha, guardarSub, modificarSub } = useTrabajo();
  const empresa = EMPRESAS.find((e) => e.id === empresaId);
  const clave = claveDaes(empresaId);
  if (!empresa) return null;
  return (
    <div className="vx-stack">
      <BotonExcel titulo={`Asignación de DAES ${empresa.corto}`} columnas={COLUMNAS} filas={FILAS[empresa.id] ?? []} />
      <TablaAsignacion empresa={empresa} />
      <Acciones hecha={subHecha("daes", clave)} onGuardar={() => guardarSub("daes", clave)} onModificar={() => modificarSub("daes", clave)} />
    </div>
  );
}

export function DetalleDaes({ parte }: { parte: IdParteDaes }) {
  const { subHecha } = useTrabajo();
  const [empresaId, setEmpresaId] = useState(EMPRESAS[0].id);
  if (parte === "factor") return <AsignacionFactor />;
  return (
    <div className="vx-stack">
      <div className="menu-pasos" role="tablist" aria-label="Empresas">
        {EMPRESAS.map((e) => (
          <button key={e.id} type="button" role="tab" aria-selected={empresaId === e.id} className={`menu-paso ${empresaId === e.id ? "is-current" : ""}`} onClick={() => setEmpresaId(e.id)}>
            <Marca tono={estadoEmpresa(subHecha, e.id).tono} />
            {e.corto}
          </button>
        ))}
      </div>
      <AsignacionDaes key={empresaId} empresaId={empresaId} />
    </div>
  );
}

export function PantallaTarea({ id }: { id: IdAnalisis }) {
  const { hecha, guardar, modificar } = useTrabajo();
  const tabla = id !== "ats" && id !== "prevalidacion" && id !== "daes" ? TABLAS_ANALISIS[id] : null;
  const atsFilas = [
    ...ERRORES_ATS.map((f) => ["Errores encontrados", ...f]),
    ...ERRORES_RESTANTES.map((f) => ["Errores restantes", ...f])
  ];
  let contenido: ReactNode = null;
  if (id === "ats") contenido = <ProcesoAts />;
  else if (tabla) contenido = <TablaMuestraVista tabla={tabla} />;
  return (
    <div className="vx-stack">
      {id === "ats"
        ? <BotonExcel titulo={tituloTarea(id)} columnas={["Paso", "Fila", "Campo", "Error"]} filas={atsFilas} />
        : tabla && <BotonExcel titulo={tituloTarea(id)} columnas={tabla.columnas} filas={tabla.filas} />}
      {contenido}
      <Acciones hecha={hecha(id)} onGuardar={() => guardar(id)} onModificar={() => modificar(id)} />
    </div>
  );
}

export function PantallaSub({ tarea, item }: { tarea: IdAnalisis; item: ItemSubnivel }) {
  const { subHecha, guardarSub, modificarSub } = useTrabajo();
  const tabla = SUBTAREAS_PREVALIDACION.find((s) => s.id === item.id)?.tabla;
  return (
    <div className="vx-stack">
      {tabla && <BotonExcel titulo={item.titulo} columnas={tabla.columnas} filas={tabla.filas} />}
      {item.contenido}
      <Acciones hecha={subHecha(tarea, item.id)} onGuardar={() => guardarSub(tarea, item.id)} onModificar={() => modificarSub(tarea, item.id)} />
    </div>
  );
}

/** Versión 1: las tareas de análisis en el menú lateral, con el círculo a la derecha. */
export function AnalisisEstudio() {
  const { estadoAnalisis, subHecha } = useTrabajo();
  const [abierta, setAbierta] = useState<IdAnalisis | null>(ANALISIS[0].id);
  const [sub, setSub] = useState("");
  const [parte, setParte] = useState<IdParteDaes>("factor");
  const [menuAbierto, setMenuAbierto] = useState(true);
  const subs = abierta && abierta !== "daes" ? subitemsDe(abierta) : undefined;
  const subActual = subs?.find((s) => s.id === sub) ?? subs?.[0];

  const elegir = (id: IdAnalisis) => {
    if (abierta === id) {
      setAbierta(null);
      return;
    }
    setAbierta(id);
    if (id === "daes") setParte("factor");
    else setSub(subitemsDe(id)?.[0].id ?? "");
  };

  return (
    <section className={`card vx-estudio ${menuAbierto ? "" : "is-contraido"}`}>
      <aside className="vx-aside">
        <button type="button" className="vx-menu" aria-expanded={menuAbierto} aria-label={menuAbierto ? "Contraer" : "Desplegar"} title={menuAbierto ? "Contraer" : "Desplegar"} onClick={() => setMenuAbierto((v) => !v)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        </button>
        {menuAbierto && (
          <nav className="vx-tareas" aria-label="Tareas de análisis">
            {ANALISIS.map((t) => {
              const abierto = abierta === t.id;
              return (
                <Fragment key={t.id}>
                  <button type="button" className={abierto ? "is-on" : ""} onClick={() => elegir(t.id)}>
                    <em>{t.titulo}</em>
                    <EstadoLado estado={estadoAnalisis(t.id)} />
                  </button>
                  {abierto && t.id === "daes" && (
                    <div className="vx-subs">
                      {PARTES_DAES.map((p) => (
                        <button key={p.id} type="button" className={parte === p.id ? "is-on" : ""} onClick={() => setParte(p.id)}>
                          <em>{p.titulo}</em>
                          <EstadoLado estado={estadoParteDaes(subHecha, p.id)} />
                        </button>
                      ))}
                    </div>
                  )}
                  {abierto && subs && (
                    <div className="vx-subs">
                      {subs.map((s) => (
                        <button key={s.id} type="button" className={subActual?.id === s.id ? "is-on" : ""} onClick={() => setSub(s.id)}>
                          <em>{s.titulo}</em>
                          <EstadoLado estado={subHecha(t.id, s.id) ? { texto: "Completada", tono: "ok" } : { texto: "Pendiente", tono: "muted" }} />
                        </button>
                      ))}
                    </div>
                  )}
                </Fragment>
              );
            })}
          </nav>
        )}
      </aside>
      <div className="vx-lienzo">
        {abierta === "daes" ? (
          <DetalleDaes parte={parte} />
        ) : abierta && subActual ? (
          <PantallaSub key={`${abierta}-${subActual.id}`} tarea={abierta} item={subActual} />
        ) : abierta ? (
          <PantallaTarea key={abierta} id={abierta} />
        ) : (
          <p className="vx-vacio">Elige una tarea.</p>
        )}
      </div>
    </section>
  );
}
