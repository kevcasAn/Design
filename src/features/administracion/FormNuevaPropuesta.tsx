import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useImpuestos } from "../impuestos/hooks";
import { useEtiquetas } from "../configuracion/hooks";
import { useAccionesAdministracion, useClientes } from "./hooks";
import type { PersonaEquipo } from "./api";
import { EditorEquipo } from "./EditorEquipo";
import { confirmar } from "../../shared/ui/dialogos";
import { useAvisoStore } from "../../shared/ui/avisoStore";

/** Crear propuesta: cliente, número, tipo de devolución y equipo. Solo administrador. */
export function FormNuevaPropuesta({ onListo }: { onListo: () => void }) {
  const { L, lower } = useEtiquetas();
  const impuestos = useImpuestos();
  const clientes = useClientes(true);
  const { crearPropuesta } = useAccionesAdministracion();
  const avisar = useAvisoStore((s) => s.mostrar);

  const [clienteNuevo, setClienteNuevo] = useState(false);
  const [idCliente, setIdCliente] = useState("");
  const [nombre, setNombre] = useState("");
  const [razon, setRazon] = useState("");
  const [ruc, setRuc] = useState("");
  const [numero, setNumero] = useState("");
  const [idImpuesto, setIdImpuesto] = useState("");
  const [idTipo, setIdTipo] = useState("");
  const [extras, setExtras] = useState<number[]>([]);
  const [justificacion, setJustificacion] = useState("");
  const [equipo, setEquipo] = useState<PersonaEquipo[]>([]);

  const impuesto = useMemo(() => impuestos.data?.find((i) => String(i.IdImpuesto) === idImpuesto) ?? impuestos.data?.[0], [impuestos.data, idImpuesto]);
  const tipos = impuesto?.TiposDevoluciones ?? [];
  const tipoPrincipal = idTipo || String(tipos[0]?.IdTipoDevolucion ?? "");
  const extrasValidos = extras.filter((e) => String(e) !== tipoPrincipal);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (extrasValidos.length > 0) {
      const ok = await confirmar({
        titulo: `¿Una ${lower("propuesta")} con más de un tipo de devolución?`,
        texto: "Es muy poco común. Confirma con quien armó la propuesta que de verdad cubre los dos tipos.",
        confirmar: "Sí, crear así",
        peligro: true
      });
      if (!ok) return;
    }
    crearPropuesta.mutate(
      {
        ...(clienteNuevo ? { ClienteNuevo: { NombreCorto: nombre, RazonSocial: razon, Ruc: ruc } } : { IdCliente: Number(idCliente) }),
        NumeroPropuesta: numero,
        IdTipoDevolucion: Number(tipoPrincipal),
        TiposExtra: extrasValidos,
        Justificacion: extrasValidos.length ? justificacion : undefined,
        Equipo: equipo
      },
      { onSuccess: () => { avisar(`${L("propuesta")} ${numero} creada.`); onListo(); } }
    );
  };

  return (
    <form onSubmit={onSubmit} className="card grid gap-4 p-5">
      <div>
        <h3>Crear {lower("propuesta")}</h3>
        <p className="mt-1 text-small text-muted">{L("cliente")}, número, tipo de devolución y equipo. Los {lower("tramites")} se agregan después.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {!clienteNuevo ? (
          <label className="field">
            {L("cliente")}
            <select value={idCliente} onChange={(e) => setIdCliente(e.target.value)} required>
              <option value="">Elige…</option>
              {clientes.data?.map((c) => <option key={c.IdCliente} value={c.IdCliente}>{c.NombreCorto} · {c.Ruc}</option>)}
            </select>
          </label>
        ) : (
          <>
            <label className="field">Nombre corto<input value={nombre} onChange={(e) => setNombre(e.target.value)} required placeholder="MOTORPLAN S.A." /></label>
            <label className="field">RUC<input value={ruc} onChange={(e) => setRuc(e.target.value)} required inputMode="numeric" maxLength={13} placeholder="1790012345001" /></label>
            <label className="field md:col-span-2">Razón social<input value={razon} onChange={(e) => setRazon(e.target.value)} placeholder="Si se deja vacío se usa el nombre corto" /></label>
          </>
        )}
        <div className="flex items-end">
          <button type="button" className="enlace text-small" onClick={() => setClienteNuevo((v) => !v)}>
            {clienteNuevo ? `Elegir un ${lower("cliente")} que ya existe` : `El ${lower("cliente")} es nuevo`}
          </button>
        </div>

        <label className="field">N.º de {lower("propuesta")}<input value={numero} onChange={(e) => setNumero(e.target.value)} required placeholder="2609-IM102-050" /></label>
        <label className="field">
          Impuesto
          <select value={String(impuesto?.IdImpuesto ?? "")} onChange={(e) => { setIdImpuesto(e.target.value); setIdTipo(""); setExtras([]); }}>
            {impuestos.data?.map((i) => <option key={i.IdImpuesto} value={i.IdImpuesto}>{i.Nombre}</option>)}
          </select>
        </label>
        <label className="field md:col-span-2">
          Tipo de devolución
          <select value={tipoPrincipal} onChange={(e) => setIdTipo(e.target.value)} required>
            {tipos.map((t) => <option key={t.IdTipoDevolucion} value={t.IdTipoDevolucion}>{t.Nombre}</option>)}
          </select>
        </label>
      </div>

      <details className="text-small">
        <summary className="cursor-pointer text-muted">Agregar otro tipo de devolución a la misma {lower("propuesta")} (poco común)</summary>
        <div className="mt-2 grid gap-1">
          {tipos.filter((t) => String(t.IdTipoDevolucion) !== tipoPrincipal).map((t) => (
            <label key={t.IdTipoDevolucion} className="flex items-center gap-2">
              <input type="checkbox" checked={extras.includes(t.IdTipoDevolucion)} onChange={(e) => setExtras((prev) => (e.target.checked ? [...prev, t.IdTipoDevolucion] : prev.filter((x) => x !== t.IdTipoDevolucion)))} />
              {t.Nombre}
            </label>
          ))}
        </div>
        {extrasValidos.length > 0 && (
          <div className="alert alert-warn mt-3 grid gap-2">
            <span><b>Ojo:</b> una {lower("propuesta")} con más de un tipo de devolución es muy poco común.</span>
            <label className="field">Justificación (obligatoria)<textarea rows={2} value={justificacion} onChange={(e) => setJustificacion(e.target.value)} required /></label>
          </div>
        )}
      </details>

      <div>
        <h3 className="mb-2">Equipo</h3>
        <EditorEquipo equipo={equipo} onCambiar={setEquipo} />
      </div>

      {crearPropuesta.isError && <div className="alert alert-danger">{crearPropuesta.error.message}</div>}

      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary" disabled={crearPropuesta.isPending}>{crearPropuesta.isPending ? "Creando…" : `Crear ${lower("propuesta")}`}</button>
        <button type="button" className="btn btn-ghost" onClick={onListo}>Cancelar</button>
      </div>
    </form>
  );
}
