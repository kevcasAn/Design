import { useState } from "react";

const CLAVE = "refundy-tax-version-fase";

export type NumeroVersion = 1 | 2;

export function useVersionFase() {
  const [n, setN] = useState<NumeroVersion>(() => (localStorage.getItem(CLAVE) === "2" ? 2 : 1));
  const cambiar = (valor: NumeroVersion) => {
    setN(valor);
    localStorage.setItem(CLAVE, String(valor));
  };
  return { n, cambiar };
}
