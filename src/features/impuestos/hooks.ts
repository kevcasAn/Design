import { useQuery } from "@tanstack/react-query";
import { listarImpuestos } from "./api";

export function useImpuestos() {
  return useQuery({ queryKey: ["impuestos"], queryFn: listarImpuestos, staleTime: 10 * 60 * 1000 });
}

/** Un impuesto y uno de sus tipos, a partir de los ids de la URL. */
export function useImpuestoYTipo(idImpuesto?: string, idTipo?: string) {
  const consulta = useImpuestos();
  const impuesto = consulta.data?.find((i) => String(i.IdImpuesto) === idImpuesto) ?? null;
  const tipo = impuesto?.TiposDevoluciones.find((t) => String(t.IdTipoDevolucion) === idTipo) ?? null;
  return { ...consulta, impuesto, tipo };
}
