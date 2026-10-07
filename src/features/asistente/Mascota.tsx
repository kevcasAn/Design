import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { preguntar } from "./api";
import type { RechazoArchivo } from "./api";
import { useAsistenteStore } from "./asistenteStore";
import { TextoAsistente } from "./texto";
import { AvatarMascota } from "./AvatarMascota";
import type { EstadoMascota } from "./AvatarMascota";
import type { PasoExpediente } from "../expediente/api";

interface Props {
  idTramite: number;
  paso: PasoExpediente;
}

const SIN_MENSAJES: never[] = [];
const SUGERENCIAS_INICIALES = ["¿Qué columnas debe traer cada plantilla?", "¿Qué me falta en este paso?", "¿Por qué me pueden rechazar un archivo?"];

/**
 * La mascota del paso: un botón flotante con su avatar que abre un chat.
 * Sabe qué columnas lleva cada plantilla, qué falta en el paso y, cuando un
 * archivo se rechaza, lo explica sola.
 */
export function Mascota({ idTramite, paso }: Props) {
  const clave = `${idTramite}:${paso.IdPaso}`;
  const abierto = useAsistenteStore((s) => s.abierto);
  const alternar = useAsistenteStore((s) => s.alternar);
  const cerrar = useAsistenteStore((s) => s.cerrar);
  // Siempre la misma referencia cuando no hay conversación: si no, React entra en bucle
  const mensajes = useAsistenteStore((s) => s.conversaciones[clave]) ?? SIN_MENSAJES;
  const sugerencias = useAsistenteStore((s) => s.sugerencias);
  const sinLeer = useAsistenteStore((s) => s.sinLeer);
  const rechazoPendiente = useAsistenteStore((s) => s.rechazoPendiente);
  const [texto, setTexto] = useState("");
  const finRef = useRef<HTMLDivElement>(null);
  const nombre = paso.Mascota ?? "Asistente";
  const avatar = paso.MascotaAvatar;

  const consulta = useMutation({ mutationFn: (p: { pregunta: string; rechazo?: RechazoArchivo; silencioso?: boolean }) => enviar(p.pregunta, p.rechazo, p.silencioso) });

  async function enviar(pregunta: string, rechazo?: RechazoArchivo, silencioso = false) {
    const st = useAsistenteStore.getState();
    const historial = (st.conversaciones[clave] ?? []).filter((m) => !m.pensando).map((m) => ({ Rol: m.Rol, Texto: m.Texto }));
    if (!silencioso) st.agregar(clave, { Rol: "usuario", Texto: rechazo ? `Se rechazó «${rechazo.NombreArchivo}». ¿Qué está mal?` : pregunta });
    const idEspera = st.agregar(clave, { Rol: "asistente", Texto: "", pensando: true });
    try {
      const r = await preguntar(idTramite, { IdPaso: paso.IdPaso, Pregunta: pregunta, Historial: historial, Rechazo: rechazo });
      st.reemplazar(clave, idEspera, r.Respuesta);
      st.setSugerencias(r.Sugerencias);
    } catch (e) {
      st.reemplazar(clave, idEspera, `No pude responder ahora: ${(e as Error).message}`);
    }
  }

  // Andy solo habla cuando le preguntan: nada de saludos ni explicaciones automáticas.
  // Si hay un archivo rechazado, se ofrece como pregunta sugerida y el usuario decide.
  const rechazo = rechazoPendiente && rechazoPendiente.idPaso === paso.IdPaso ? rechazoPendiente.rechazo : null;

  const preguntarPorRechazo = () => {
    if (!rechazo) return;
    useAsistenteStore.getState().limpiarRechazo();
    consulta.mutate({ pregunta: "", rechazo });
  };

  useEffect(() => { finRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [mensajes, abierto]);

  const estado: EstadoMascota = consulta.isPending ? "pensando" : sinLeer > 0 ? "nuevo" : abierto ? "feliz" : "quieto";

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const p = texto.trim();
    if (!p || consulta.isPending) return;
    setTexto("");
    consulta.mutate({ pregunta: p });
  };

  return (
    <>
      <button
        type="button"
        className={`mascota-boton ${sinLeer > 0 ? "tiene-nuevo" : ""}`}
        onClick={alternar}
        title={`${nombre}, tu asistente en este paso`}
        aria-label={abierto ? `Cerrar a ${nombre}` : `Abrir a ${nombre}`}
      >
        <AvatarMascota avatar={avatar} estado={estado} tamano={46} />
        {sinLeer > 0 && <span className="mascota-globo">{sinLeer}</span>}
      </button>

      {abierto && (
        <section className="mascota-panel" role="dialog" aria-label={`Conversación con ${nombre}`}>
          <header className="mascota-cabecera">
            <span className="mascota-avatar--chico"><AvatarMascota avatar={avatar} estado={estado} tamano={34} /></span>
            <div className="min-w-0 flex-1">
              <strong className="block">{nombre}</strong>
              <span className="block truncate text-tiny opacity-80">Te ayudo con «{paso.Nombre}»</span>
            </div>
            <button type="button" className="mascota-cerrar" onClick={cerrar} aria-label="Cerrar">×</button>
          </header>

          <div className="mascota-mensajes">
            {mensajes.length === 0 && (
              <p className="m-0 text-small text-muted">Pregúntame lo que necesites sobre «{paso.Nombre}». Puedes escribir o usar una de las preguntas de abajo.</p>
            )}
            {mensajes.map((m) => (
              <div key={m.id} className={`burbuja ${m.Rol === "usuario" ? "burbuja--usuario" : "burbuja--asistente"}`}>
                {m.pensando ? <span className="pensando" aria-label="Escribiendo"><i /><i /><i /></span> : <TextoAsistente texto={m.Texto} />}
              </div>
            ))}
            <div ref={finRef} />
          </div>

          {(sugerencias.length > 0 || rechazo || mensajes.length === 0) && (
            <div className="mascota-sugerencias">
              {rechazo && (
                <button type="button" className="chip chip--boton chip--rechazo" disabled={consulta.isPending} onClick={preguntarPorRechazo}>
                  ¿Por qué se rechazó «{rechazo.NombreArchivo}»?
                </button>
              )}
              {mensajes.length === 0 && sugerencias.length === 0 && SUGERENCIAS_INICIALES.map((s) => (
                <button key={s} type="button" className="chip chip--boton" disabled={consulta.isPending} onClick={() => consulta.mutate({ pregunta: s })}>{s}</button>
              ))}
              {sugerencias.map((s) => (
                <button key={s} type="button" className="chip chip--boton" disabled={consulta.isPending} onClick={() => consulta.mutate({ pregunta: s })}>{s}</button>
              ))}
            </div>
          )}

          <form onSubmit={onSubmit} className="mascota-entrada">
            <input
              type="text"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder={`Pregúntale a ${nombre}…`}
              aria-label="Tu pregunta"
              autoFocus
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={!texto.trim() || consulta.isPending}>Enviar</button>
          </form>
        </section>
      )}
    </>
  );
}
