import type { ReactNode } from "react";

/**
 * Convierte el texto de la mascota a elementos: párrafos, listas con "- " y negritas con **…**.
 * Es lo mínimo que hace falta; no interpreta HTML, así que es seguro.
 */
export function TextoAsistente({ texto }: { texto: string }) {
  const bloques: ReactNode[] = [];
  const lineas = texto.split(/\r?\n/);
  let lista: string[] = [];
  let parrafo: string[] = [];

  const cerrarLista = () => {
    if (lista.length) bloques.push(<ul key={bloques.length} className="mb-2 list-disc pl-5">{lista.map((l, i) => <li key={i}>{negritas(l)}</li>)}</ul>);
    lista = [];
  };
  const cerrarParrafo = () => {
    if (parrafo.length) bloques.push(<p key={bloques.length} className="mb-2">{negritas(parrafo.join(" "))}</p>);
    parrafo = [];
  };

  for (const linea of lineas) {
    const t = linea.trim();
    if (t.startsWith("- ") || t.startsWith("· ")) { cerrarParrafo(); lista.push(t.slice(2)); continue; }
    cerrarLista();
    if (t === "") { cerrarParrafo(); continue; }
    parrafo.push(t);
  }
  cerrarLista();
  cerrarParrafo();
  return <>{bloques}</>;
}

function negritas(texto: string): ReactNode[] {
  return texto.split(/(\*\*[^*]+\*\*)/g).map((parte, i) =>
    parte.startsWith("**") && parte.endsWith("**") ? <strong key={i}>{parte.slice(2, -2)}</strong> : <span key={i}>{parte}</span>
  );
}
