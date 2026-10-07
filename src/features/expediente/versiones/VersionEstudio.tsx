import { Fragment, useState } from "react";
import type { PasoExpediente } from "../api";
import { NIVELES, cargaDeHoja, nivelPorNombre, type Rama } from "./arbol";
import { ListaCargas } from "./ListaCargas";
import { PuntoEstado } from "./PuntoEstado";
import { ContenidoHoja } from "./ContenidoHoja";

interface Props {
  pasos: PasoExpediente[];
  paso: PasoExpediente;
  onPaso: (id: number) => void;
  idTramite: number;
  editable: boolean;
}

/** Versión 1: el nivel 1 arriba, el nivel 2 al costado y el nivel 3 a la derecha. */
export function VersionEstudio({ paso, idTramite, editable }: Props) {
  const inicial = nivelPorNombre(paso.Nombre);
  const [nivelId, setNivelId] = useState(inicial.id);
  const [ramaId, setRamaId] = useState(inicial.ramas[0].id);
  const [hojaId, setHojaId] = useState(inicial.ramas[0].hojas[0].id);
  const [menuAbierto, setMenuAbierto] = useState(true);
  const nivel = NIVELES.find((n) => n.id === nivelId) ?? NIVELES[0];
  const rama = nivel.ramas.find((r) => r.id === ramaId) ?? nivel.ramas[0];
  const hoja = rama.hojas.find((h) => h.id === hojaId) ?? rama.hojas[0];
  const esCarga = nivel.id === "carga";

  const elegirNivel = (id: string) => {
    const siguiente = NIVELES.find((n) => n.id === id) ?? NIVELES[0];
    setNivelId(siguiente.id);
    setRamaId(siguiente.ramas[0].id);
    setHojaId(siguiente.ramas[0].hojas[0].id);
  };

  const elegirRama = (r: Rama) => {
    setRamaId(r.id);
    setHojaId(r.hojas[0].id);
  };

  return (
    <>
      <nav className="menu-pasos" aria-label="Niveles">
        {NIVELES.map((n) => (
          <button key={n.id} type="button" className={`menu-paso ${n.id === nivel.id ? "is-current" : ""}`} onClick={() => elegirNivel(n.id)}>
            {n.nombre}
            <PuntoEstado lista={false} />
          </button>
        ))}
      </nav>
      <section className={`card vx-estudio ${menuAbierto ? "" : "is-contraido"}`}>
        <aside className="vx-aside">
          <button type="button" className="vx-menu" aria-expanded={menuAbierto} aria-label={menuAbierto ? "Contraer" : "Desplegar"} title={menuAbierto ? "Contraer" : "Desplegar"} onClick={() => setMenuAbierto((v) => !v)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          </button>
          {menuAbierto && (
            <nav className="vx-tareas" aria-label="Grupos">
              {nivel.ramas.map((r) => (
                <Fragment key={r.id}>
                  <button type="button" className={r.id === rama.id ? "is-on" : ""} onClick={() => elegirRama(r)}>
                    <em>{r.nombre}</em>
                    <small>0/{r.hojas.length}</small>
                  </button>
                  {!esCarga && r.id === rama.id && (
                    <div className="vx-subs">
                      {r.hojas.map((h) => (
                        <button key={h.id} type="button" className={h.id === hoja.id ? "is-on" : ""} onClick={() => setHojaId(h.id)}>
                          <em>{h.nombre}</em>
                        </button>
                      ))}
                    </div>
                  )}
                </Fragment>
              ))}
            </nav>
          )}
        </aside>
        <div className="vx-lienzo">
          {esCarga ? (
            <ListaCargas cargas={[]} ejemplos={rama.hojas.map(cargaDeHoja)} idTramite={idTramite} editable={editable} paso={paso} />
          ) : (
            <ContenidoHoja key={hoja.id} hoja={hoja} idTramite={idTramite} editable={editable} paso={paso} />
          )}
        </div>
      </section>
    </>
  );
}
