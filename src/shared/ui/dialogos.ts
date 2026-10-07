import Swal from "sweetalert2";

/**
 * Diálogos de la aplicación (SweetAlert2, igual que ComplyTax) con el estilo de RefundyTax.
 * Los botones usan las clases .btn de index.css y el cuadro las clases .dialogo-*,
 * así toman los colores de los tokens. Nunca usar window.confirm ni alert.
 */
const base = Swal.mixin({
  buttonsStyling: false,
  reverseButtons: true,
  focusCancel: true,
  customClass: {
    popup: "dialogo",
    title: "dialogo-titulo",
    htmlContainer: "dialogo-texto",
    actions: "dialogo-acciones",
    confirmButton: "btn btn-primary",
    cancelButton: "btn btn-ghost",
    denyButton: "btn btn-ghost"
  }
});

interface Confirmar {
  titulo: string;
  texto?: string;
  /** Texto del botón que ejecuta la acción. */
  confirmar?: string;
  cancelar?: string;
  /** true para acciones que borran o quitan algo: ícono de advertencia. */
  peligro?: boolean;
}

/** Pregunta sí/no. Devuelve true si el usuario confirmó. */
export async function confirmar({ titulo, texto, confirmar = "Sí, continuar", cancelar = "Cancelar", peligro = false }: Confirmar): Promise<boolean> {
  const r = await base.fire({
    title: titulo,
    text: texto,
    icon: peligro ? "warning" : "question",
    showCancelButton: true,
    confirmButtonText: confirmar,
    cancelButtonText: cancelar
  });
  return r.isConfirmed;
}

interface Elegir {
  titulo: string;
  texto?: string;
  opcionA: string;
  opcionB: string;
}

/** Dos caminos más cancelar. Devuelve "a", "b" o null si cerró el diálogo. */
export async function elegir({ titulo, texto, opcionA, opcionB }: Elegir): Promise<"a" | "b" | null> {
  const r = await base.fire({
    title: titulo,
    text: texto,
    icon: "question",
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: opcionA,
    denyButtonText: opcionB,
    cancelButtonText: "Cancelar",
    focusCancel: false
  });
  if (r.isConfirmed) return "a";
  if (r.isDenied) return "b";
  return null;
}

interface PedirTexto {
  titulo: string;
  texto?: string;
  confirmar?: string;
  etiqueta?: string;
}

/** Pide un texto obligatorio (por ejemplo el motivo de un cierre). Devuelve null si canceló. */
export async function pedirTexto({ titulo, texto, confirmar = "Guardar", etiqueta = "Motivo" }: PedirTexto): Promise<string | null> {
  const r = await base.fire({
    title: titulo,
    text: texto,
    input: "textarea",
    inputPlaceholder: etiqueta,
    inputAttributes: { "aria-label": etiqueta, maxlength: "500" },
    showCancelButton: true,
    focusCancel: false,
    confirmButtonText: confirmar,
    cancelButtonText: "Cancelar",
    customClass: { input: "dialogo-input" },
    inputValidator: (valor) => (String(valor ?? "").trim() ? undefined : "Escribe el motivo para continuar.")
  });
  return r.isConfirmed ? String(r.value).trim() : null;
}
