import { IMPUESTOS } from "../../datos/demo";

export interface TipoDevolucionItem {
  IdTipoDevolucion: number;
  IdImpuesto: number;
  Nombre: string;
  Secuencia: number;
}

/** RefundyTaxAPI: GET api/impuestos (impuestos activos con sus tipos de devolución). */
export interface Impuesto {
  IdImpuesto: number;
  Nombre: string;
  TiposDevoluciones: TipoDevolucionItem[];
}

export const listarImpuestos = async () => IMPUESTOS;
