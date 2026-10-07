import { useState } from "react";
import type { FormEvent } from "react";
import type { Propuesta, PropuestaTramite } from "./api";
import { useAccionesAdministracion } from "./hooks";
import { useEtiquetas } from "../configuracion/hooks";
import { MESES } from "../tramites/textos";
import { confirmar } from "../../shared/ui/dialogos";
import { useAvisoStore } from "../../shared/ui/avisoStore";
import { periodoTramite } from "./textos";

interface Props {
  propuesta: Propuesta;
  /** Trámites del mismo cliente (de cualquier propuesta) que este podría continuar. */
  anteriores: (PropuestaTramite & { NumeroPropuesta: string })[];
  onListo: () => void;
}

const hoy = new Date();

/** Agregar trámites a una propuesta abierta: deadline, tipo, periodo y, si aplica, de cuál viene. */
export function FormNuevoTramite({ propuesta, anteriores, onListo }: Props) {
  const { L, lower } = useEtiquetas();
  const { crearTramites } = useAccionesAdministracion();
  const avisar = useAvisoStore((s) => s.mostrar);

  const [deadline, setDeadline] = useState("");
  const [idTipo, setIdTipo] = useState(String(propuesta.Tipos[0]?.IdTipoDevolucion ?? ""));
  const [anual, setAnual] = useState(false);
  const [ano, setAno] = useState(hoy.getFullYear());
  const [mesDesde, setMesDesde] = useState(hoy.getMonth() + 1);
  const [anoHasta, setAnoHasta] = useState(hoy.getFullYear());
  const [mesHasta, setMesHasta] = useState(hoy.getMonth() + 1);
  const [unSolo, setUnSolo] = useState(false);
  const [idOrigen, setIdOrigen] = useState("");

  const meses = anual ? 12 : anoHasta * 12 + mesHasta - (ano * 12 + mesDesde) + 1;
  const variosMeses = !anual && meses > 1;
  const anios = Array.from({ length: 8 }, (_, i) => hoy.getFullYear() - 4 + i);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (variosMeses && unSolo) {
      const ok = await confirmar({
        titulo: `Un solo ${lower("tramite")} para varios meses`,
        texto: `Se va a crear un solo ${lower("tramite")} que cubre de ${MESES[mesDesde - 1]} ${ano} a ${MESES[mesHasta - 1]} ${anoHasta} (${meses} meses), en vez de uno por mes.`,
        confirmar: "Sí, crear uno solo"
      });
      if (!ok) return;
    }
    crearTramites.mutate(
      {
        idProducto: propuesta.IdProducto,
        datos: {
          IdTipoDevolucion: Number(idTipo),
          Deadline: deadline,
          EsAnual: anual,
          Ano: ano,
          MesDesde: anual ? undefined : mesDesde,
          AnoHasta: anual ? undefined : anoHasta,
          MesHasta: anual ? undefined : mesHasta,
          UnSolo: variosMeses && unSolo,
          IdTramiteOrigen: idOrigen ? Number(idOrigen) : undefined
        }
      },
      { onSuccess: (r) => { avisar(r.Creados === 1 ? `${L("tramite")} creado.` : `${r.Creados} ${lower("tramites")} creados.`); onListo(); } }
    );
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-xl border border-line bg-surface-2 p-4">
      <strong>Agregar {lower("tramite")}</strong>
      <div className="grid gap-3 md:grid-cols-3">
        <label className="field">Deadline<input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} required /></label>
        {propuesta.Tipos.length > 1 && (
          <label className="field md:col-span-2">
            Tipo de devolución
            <select value={idTipo} onChange={(e) => setIdTipo(e.target.value)}>
              {propuesta.Tipos.map((t) => <option key={t.IdTipoDevolucion} value={t.IdTipoDevolucion}>{t.Nombre}</option>)}
            </select>
          </label>
        )}
        <label className="field">
          Periodicidad
          <select value={anual ? "anual" : "mensual"} onChange={(e) => setAnual(e.target.value === "anual")}>
            <option value="mensual">Mensual</option>
            <option value="anual">Anual</option>
          </select>
        </label>
      </div>

      {anual ? (
        <label className="field max-w-40">
          Año
          <select value={ano} onChange={(e) => setAno(Number(e.target.value))}>{anios.map((a) => <option key={a}>{a}</option>)}</select>
        </label>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          <div className="grid grid-cols-2 gap-2">
            <label className="field">Desde<select value={mesDesde} onChange={(e) => setMesDesde(Number(e.target.value))}>{MESES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}</select></label>
            <label className="field">&nbsp;<select value={ano} onChange={(e) => setAno(Number(e.target.value))} aria-label="Año desde">{anios.map((a) => <option key={a}>{a}</option>)}</select></label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="field">Hasta<select value={mesHasta} onChange={(e) => setMesHasta(Number(e.target.value))}>{MESES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}</select></label>
            <label className="field">&nbsp;<select value={anoHasta} onChange={(e) => setAnoHasta(Number(e.target.value))} aria-label="Año hasta">{anios.map((a) => <option key={a}>{a}</option>)}</select></label>
          </div>
        </div>
      )}

      {variosMeses && (
        <label className="flex items-center gap-2 text-small">
          <input type="checkbox" checked={unSolo} onChange={(e) => setUnSolo(e.target.checked)} />
          Un solo {lower("tramite")} para los {meses} meses (si no, se crea uno por mes)
        </label>
      )}
      {!anual && meses < 1 && <div className="alert alert-danger">"Desde" no puede ser después de "Hasta".</div>}

      {anteriores.length > 0 && (
        <label className="field">
          Continúa otro {lower("tramite")} (opcional, por ejemplo uno que el SRI rechazó)
          <select value={idOrigen} onChange={(e) => setIdOrigen(e.target.value)}>
            <option value="">No continúa ninguno</option>
            {anteriores.map((t) => (
              <option key={t.IdTramite} value={t.IdTramite}>
                {t.NumeroPropuesta} · {String(t.Numero).padStart(3, "0")} · {periodoTramite(t)} · {t.Estado.toLowerCase()}
              </option>
            ))}
          </select>
        </label>
      )}

      {crearTramites.isError && <div className="alert alert-danger">{crearTramites.error.message}</div>}

      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary btn-sm" disabled={crearTramites.isPending || (!anual && meses < 1)}>
          {crearTramites.isPending ? "Creando…" : !anual && meses > 1 && !unSolo ? `Crear ${meses} ${lower("tramites")}` : `Crear ${lower("tramite")}`}
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onListo}>Cancelar</button>
      </div>
    </form>
  );
}
