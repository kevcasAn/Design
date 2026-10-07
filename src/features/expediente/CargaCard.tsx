import { useRef, useState } from "react";
import type { ArchivoSubido, CargaExpediente, SubirArchivoResultado } from "./api";
import { useSubirArchivo } from "./hooks";
import { imprimirIdsCarga } from "./ids";
import { useAsistenteStore } from "../asistente/asistenteStore";
import { useSesionStore } from "../sesion/sesionStore";
import { generarPlantilla } from "./plantilla";

const ACCIONES: Record<number, string> = { 1: "Un archivo", 2: "Varios archivos", 3: "Proceso", 4: "Formulario", 5: "Lista de revisión" };

/** Archivo elegido en esta sesión, para poder descargarlo tal cual. */
const elegidos = new Map<number, File>();

interface Props {
  carga: CargaExpediente;
  idTramite: number;
  /** false cuando el trámite está cerrado: se ve todo, no se cambia nada. */
  editable: boolean;
  /** Tarjeta de muestra: se ve igual, pero subir y traer no llaman a la API. */
  ejemplo?: boolean;
}

function bajarArchivo(nombre: string, file?: File) {
  const blob = file ?? new Blob([`${nombre}\n`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file?.name ?? nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function Icono({ nombre }: { nombre: "plantilla" | "subir" | "bajar" | "modificar" | "traer" }) {
  const comun = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  if (nombre === "plantilla") {
    return (
      <svg {...comun}>
        <path d="M7 3.5h7.2L19 8.2V20a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 6 20V5A1.5 1.5 0 0 1 7.5 3.5H7z" />
        <path d="M14 3.5V8h4.5" />
        <path d="M9 12.5h6M9 16h6" />
      </svg>
    );
  }
  if (nombre === "subir") return <svg {...comun}><path d="M12 16V5M8 8.5 12 4.5 16 8.5" /><path d="M5 19h14" /></svg>;
  if (nombre === "bajar") return <svg {...comun}><path d="M12 4v11M8 11.5 12 15.5 16 11.5" /><path d="M5 19h14" /></svg>;
  if (nombre === "traer") return <svg {...comun}><path d="M20 12a8 8 0 1 1-2.2-5.5" /><path d="M20 4v5h-5" /></svg>;
  return <svg {...comun}><path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3z" /><path d="M13.5 6.5l3 3" /></svg>;
}

function BotonCarga({ nombre, etiqueta, disabled, onClick }: { nombre: "plantilla" | "subir" | "bajar" | "modificar" | "traer"; etiqueta: string; disabled?: boolean; onClick: () => void }) {
  return (
    <button type="button" className="carga-icono" title={etiqueta} aria-label={etiqueta} disabled={disabled} onClick={onClick}>
      <Icono nombre={nombre} />
    </button>
  );
}

function fechaCarga(iso: string) {
  return new Date(iso).toLocaleString("es-EC", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).replace(".", "");
}

/** Una carga del expediente: nombre, archivo y las acciones en iconos. */
export function CargaCard({ carga, idTramite, editable, ejemplo = false }: Props) {
  const subir = useSubirArchivo(idTramite);
  const usuario = useSesionStore((s) => s.usuario);
  const entrada = useRef<HTMLInputElement>(null);
  const [rechazo, setRechazo] = useState<SubirArchivoResultado | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [generando, setGenerando] = useState(false);
  const [ocupado, setOcupado] = useState<"carga" | "trae" | null>(null);
  const esToolbox = carga.ArchivosEsperados.some((a) => a.OrigenInformacion === "Toolbox");
  const [demoArchivos, setDemoArchivos] = useState(carga.Archivos);
  const [demoCompletada, setDemoCompletada] = useState(carga.Completada);
  const [demoOrigen, setDemoOrigen] = useState<"toolbox" | "manual" | null>(
    carga.Archivos.length ? (carga.Archivos[0].UserNameCarga === "toolbox" ? "toolbox" : "manual") : null
  );

  const recibeArchivos = carga.IdAccion === 1 || carga.IdAccion === 2;
  const esperado = carga.ArchivosEsperados[0];
  const archivos = ejemplo ? demoArchivos : carga.Archivos;
  const completada = ejemplo ? demoCompletada : carga.Completada;
  const actual = archivos[0];
  const hayArchivo = archivos.length > 0;
  const puedeTraer = ejemplo && esToolbox && demoOrigen !== "toolbox";
  const local = elegidos.get(carga.IdTramiteDetalle);

  const fila = (archivo: File, origen: "toolbox" | "manual"): ArchivoSubido => ({
    IdTramiteDetalleArchivo: Date.now(),
    IdTramiteDetalle: carga.IdTramiteDetalle,
    IdPasoDetalleArchivo: esperado?.IdPasoDetalleArchivo ?? null,
    NombreArchivoOriginal: origen === "toolbox" ? `${carga.Nombre}.csv` : archivo.name,
    CantidadRegistros: null,
    FechaCarga: new Date().toISOString(),
    UserNameCarga: usuario?.userName ?? (origen === "toolbox" ? "toolbox" : "ejemplo"),
    NombreTablaDestino: null
  });

  const marcarDemo = (origen: "toolbox" | "manual", archivo?: File) => {
    if (origen === "toolbox") elegidos.delete(carga.IdTramiteDetalle);
    else if (archivo) elegidos.set(carga.IdTramiteDetalle, archivo);
    setDemoArchivos([fila(archivo ?? new File([], `${carga.Nombre}.csv`), origen)]);
    setDemoOrigen(origen);
    setDemoCompletada(true);
    setOcupado(null);
  };

  const elegir = (archivo: File | undefined) => {
    if (!archivo || ocupado) return;
    setRechazo(null);
    setAviso(null);
    if (ejemplo) {
      if (esToolbox) {
        setOcupado("carga");
        window.setTimeout(() => marcarDemo("manual", archivo), 700);
      } else {
        elegidos.set(carga.IdTramiteDetalle, archivo);
        setDemoArchivos([fila(archivo, "manual")]);
        setDemoOrigen("manual");
        setDemoCompletada(true);
      }
      if (entrada.current) entrada.current.value = "";
      return;
    }
    elegidos.set(carga.IdTramiteDetalle, archivo);
    subir.mutate(
      { idTramiteDetalle: carga.IdTramiteDetalle, archivo, idPasoDetalleArchivo: esperado?.IdPasoDetalleArchivo },
      {
        onSuccess: (r) => {
          if (r.Aceptado) setAviso(r.ColumnasIgnoradas.length ? `Se ignoraron columnas que no están en la definición: ${r.ColumnasIgnoradas.join(", ")}.` : null);
          else {
            elegidos.delete(carga.IdTramiteDetalle);
            setRechazo(r);
            useAsistenteStore.getState().registrarRechazo(carga.IdPaso, {
              IdTramiteDetalle: carga.IdTramiteDetalle,
              NombreArchivo: archivo.name,
              Mensaje: r.Mensaje,
              TotalErrores: r.TotalErrores,
              Errores: r.Errores,
              ColumnasIgnoradas: r.ColumnasIgnoradas
            });
          }
        },
        onSettled: () => { if (entrada.current) entrada.current.value = ""; }
      }
    );
  };

  const traer = () => {
    if (!puedeTraer || ocupado) return;
    setOcupado("trae");
    window.setTimeout(() => marcarDemo("toolbox"), 800);
  };

  const plantilla = async () => {
    if (!esperado || generando) return;
    setGenerando(true);
    try { await generarPlantilla(esperado); } finally { setGenerando(false); }
  };

  const descargar = () => {
    if (local) bajarArchivo(local.name, local);
    else if (ejemplo && actual) bajarArchivo(actual.NombreArchivoOriginal);
  };

  const lista = completada && hayArchivo && !ocupado;
  const cargando = ocupado === "trae"
    ? "Trayendo de Toolbox…"
    : ocupado === "carga" || (subir.isPending && !ejemplo)
      ? "Cargando archivo…"
      : "";
  const usuarioCarga = (guardado: string) =>
    ejemplo || !guardado || guardado === "ejemplo" || guardado === "toolbox" ? (usuario?.userName ?? guardado) : guardado;

  return (
    <article className={`carga ${completada && hayArchivo ? "is-ok" : ""}`}>
      <div className="carga-fila">
        <h3 className="cursor-pointer" title="Clic: ver los ids en la consola (F12)" onClick={() => imprimirIdsCarga(idTramite, carga)}>{carga.Nombre}</h3>
        {cargando ? (
          <span className="carga-archivo">{cargando}</span>
        ) : actual ? (
          <span className="carga-datos">
            <span>{actual.NombreArchivoOriginal}</span>
            <span>{fechaCarga(actual.FechaCarga)}</span>
            <span>{usuarioCarga(actual.UserNameCarga)}</span>
          </span>
        ) : (
          <span className="carga-hueco" />
        )}
        <span className={`carga-estado ${lista ? "is-ok" : ""}`}>
          {lista ? "Completada" : "Pendiente"}
        </span>
        {editable && recibeArchivos && (
          <div className="carga-iconos">
            {hayArchivo ? (
              <BotonCarga nombre="modificar" etiqueta="Modificar archivo" disabled={!!ocupado || subir.isPending} onClick={() => entrada.current?.click()} />
            ) : (
              esperado && <BotonCarga nombre="plantilla" etiqueta="Descargar plantilla" disabled={generando || !!ocupado} onClick={() => void plantilla()} />
            )}
            {puedeTraer && <BotonCarga nombre="traer" etiqueta="Traer de Toolbox" disabled={!!ocupado} onClick={traer} />}
            {hayArchivo ? (
              <BotonCarga nombre="bajar" etiqueta="Descargar" disabled={!!ocupado || (!local && !ejemplo)} onClick={descargar} />
            ) : (
              <BotonCarga nombre="subir" etiqueta="Cargar" disabled={!!ocupado || subir.isPending} onClick={() => entrada.current?.click()} />
            )}
          </div>
        )}
      </div>
      <input ref={entrada} type="file" accept=".xlsx,.xls,.csv,.txt" hidden onChange={(e) => elegir(e.target.files?.[0])} />

      {!recibeArchivos && (
        <p className="mt-3 text-small text-muted">Esta tarea es de tipo “{ACCIONES[carga.IdAccion]}”. Su pantalla llega en el siguiente paso de la construcción.</p>
      )}

      {aviso && <div className="alert alert-ok mt-3">{aviso}</div>}
      {subir.error && <div className="alert alert-danger mt-3">{subir.error.message}</div>}

      {rechazo && (
        <div className="mt-3">
          <div className="alert alert-danger">
            {rechazo.Mensaje.startsWith("Al archivo le faltan columnas")
              ? "Se encontraron los siguientes problemas en la carga del archivo:"
              : rechazo.Mensaje}
          </div>
          <div className="mt-2 max-h-72 overflow-auto rounded-xl border border-line">
            <table className="grid-table">
              <thead><tr><th>Fila</th><th>Columna</th><th>Problema</th><th>Valor</th></tr></thead>
              <tbody>
                {rechazo.Errores.map((e, i) => (
                  <tr key={i}>
                    <td>{e.Fila ?? "—"}</td>
                    <td className="font-semibold">{e.Columna}</td>
                    <td>{e.Mensaje}</td>
                    <td className="text-muted">{e.Valor ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rechazo.TotalErrores > rechazo.Errores.length && (
            <p className="mt-1 text-tiny text-muted">Se muestran los primeros {rechazo.Errores.length} de {rechazo.TotalErrores} errores.</p>
          )}
        </div>
      )}
    </article>
  );
}
