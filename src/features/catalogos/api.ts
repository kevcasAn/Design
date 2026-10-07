import { IMPUESTOS } from "../../datos/demo";

export interface TipoDevolucion {
  IdTipoDevolucion: number;
  IdImpuesto: number;
  Impuesto: string;
  Nombre: string;
  Secuencia: number;
  IdEstado: number;
  Estado: string;
}

export interface TipoTramiteSri {
  IdTipoTramiteSri: number;
  Nombre: string;
  PlazoDias: number;
  PlazoEstimadoDias: number;
  IdEstado: number;
  Estado: string;
}

export const listarTiposDevoluciones = async (): Promise<TipoDevolucion[]> =>
  IMPUESTOS.flatMap((i) => i.TiposDevoluciones.map((t) => ({
    IdTipoDevolucion: t.IdTipoDevolucion,
    IdImpuesto: t.IdImpuesto,
    Impuesto: i.Nombre,
    Nombre: t.Nombre,
    Secuencia: t.Secuencia,
    IdEstado: 1,
    Estado: "Activo"
  })));

export const listarTiposTramiteSri = async (): Promise<TipoTramiteSri[]> => [];

export const actualizarPlazoEstimado = async (_idTipoTramiteSri: number, _plazoEstimadoDias: number) => {};
