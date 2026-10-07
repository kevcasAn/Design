/**
 * Textos de apoyo de las tarjetas. La tabla Impuestos solo guarda el nombre;
 * si la empresa quiere otros textos, se agregan como columnas y se leen de ahí.
 */
export const TEXTOS_IMPUESTO: Record<string, { kicker: string; hint: string }> = {
  IVA: { kicker: "Impuesto al valor agregado", hint: "Devoluciones de crédito tributario de IVA" },
  IR: { kicker: "Impuesto a la renta", hint: "Devoluciones y saldos a favor de renta" }
};

export function textoImpuesto(nombre: string) {
  return TEXTOS_IMPUESTO[nombre] ?? { kicker: "Impuesto", hint: "" };
}
