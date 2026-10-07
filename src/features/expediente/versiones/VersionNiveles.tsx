import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { PasoExpediente } from "../api";
import { NIVELES, nivelPorNombre, type Nivel, type Rama } from "./arbol";
import { PuntoEstado } from "./PuntoEstado";
import { ContenidoHoja } from "./ContenidoHoja";

interface Props {
  pasos: PasoExpediente[];
  paso: PasoExpediente;
  onPaso: (id: number) => void;
  idTramite: number;
  editable: boolean;
}

type Direccion = "adelante" | "atras";
type Capa = "niveles" | "ramas" | "hojas";

function useTransicion() {
  const [saliendo, setSaliendo] = useState<Direccion | null>(null);
  const [entrando, setEntrando] = useState<Direccion | null>(null);
  const ocupado = useRef(false);

  const ir = (dir: Direccion, cambio: () => void) => {
    if (ocupado.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cambio();
      return;
    }
    ocupado.current = true;
    setSaliendo(dir);
    window.setTimeout(() => {
      cambio();
      setSaliendo(null);
      setEntrando(dir);
      ocupado.current = false;
    }, 200);
  };

  return { ir, saliendo, clase: saliendo ? `is-sale-${saliendo}` : entrando ? `is-entra-${entrando}` : "" };
}

/** Versión 2: una fila de pastillas por nivel. El tercero abre la tarea o el archivo. */
export function VersionNiveles({ paso, idTramite, editable }: Props) {
  const { ir, saliendo, clase } = useTransicion();
  const inicio = nivelPorNombre(paso.Nombre);
  const [capa, setCapa] = useState<Capa>("ramas");
  const [nivelId, setNivelId] = useState(inicio.id);
  const [ramaId, setRamaId] = useState(inicio.ramas[0].id);
  const [hojaId, setHojaId] = useState(inicio.ramas[0].hojas[0].id);
  const nivel = NIVELES.find((n) => n.id === nivelId) ?? NIVELES[0];
  const rama = nivel.ramas.find((r) => r.id === ramaId) ?? nivel.ramas[0];
  const hoja = rama.hojas.find((h) => h.id === hojaId) ?? rama.hojas[0];

  const entrarNivel = (n: Nivel) => ir("adelante", () => {
    setNivelId(n.id);
    setRamaId(n.ramas[0].id);
    setHojaId(n.ramas[0].hojas[0].id);
    setCapa("ramas");
  });

  const entrarRama = (r: Rama) => ir("adelante", () => {
    setRamaId(r.id);
    setHojaId(r.hojas[0].id);
    setCapa("hojas");
  });

  const volver = () => ir("atras", () => {
    if (capa === "hojas") setCapa("ramas");
    else setCapa("niveles");
  });

  const irA = (destino: Capa) => {
    if (destino === capa) return;
    ir("atras", () => setCapa(destino));
  };

  let pastillas: ReactNode;
  let atras = "";
  if (capa === "niveles") {
    pastillas = NIVELES.map((n, i) => (
      <button key={n.id} type="button" className="menu-paso" style={{ "--i": i } as CSSProperties} onClick={() => entrarNivel(n)}>
        {n.nombre}
        <PuntoEstado lista={false} />
      </button>
    ));
  } else if (capa === "ramas") {
    atras = "Inicio";
    pastillas = nivel.ramas.map((r, i) => (
      <button key={r.id} type="button" className={`menu-paso ${r.id === rama.id ? "is-current" : ""}`} style={{ "--i": i + 1 } as CSSProperties} onClick={() => entrarRama(r)}>
        {r.nombre}
        <PuntoEstado lista={false} />
      </button>
    ));
  } else {
    atras = nivel.nombre;
    pastillas = rama.hojas.map((h, i) => (
      <button key={h.id} type="button" className={`menu-paso ${h.id === hoja.id ? "is-current" : ""}`} style={{ "--i": i + 1 } as CSSProperties} onClick={() => setHojaId(h.id)}>
        {h.nombre}
        <PuntoEstado lista={false} />
      </button>
    ));
  }

  return (
    <>
      {capa !== "niveles" && (
        <p className="vx-miga">
          <button type="button" onClick={() => irA("niveles")}>Inicio</button>
          <span aria-hidden="true">/</span>
          {capa === "ramas" ? <strong>{nivel.nombre}</strong> : <button type="button" onClick={() => irA("ramas")}>{nivel.nombre}</button>}
          {capa === "hojas" && (
            <>
              <span aria-hidden="true">/</span>
              <strong>{rama.nombre}</strong>
            </>
          )}
        </p>
      )}
      <nav key={capa} className={`menu-pasos vx-nivel ${clase}`} aria-label="Niveles">
        {capa !== "niveles" && (
          <button type="button" className="vx-atras" style={{ "--i": 0 } as CSSProperties} aria-label={`Volver a ${atras}`} onClick={volver}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
          </button>
        )}
        {pastillas}
      </nav>
      {capa === "hojas" && (
        <section key={hoja.id} className={`card p-5 ${saliendo ? "is-sale" : "vx-aparece"}`}>
          <ContenidoHoja hoja={hoja} idTramite={idTramite} editable={editable} paso={paso} />
        </section>
      )}
    </>
  );
}
