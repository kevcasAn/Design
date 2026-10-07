import { useNavigate } from "react-router-dom";
import { useImpuestos } from "./hooks";
import { textoImpuesto } from "./textos";
import { IconoImpuesto } from "./IconoImpuesto";
import { Cargando } from "../../shared/ui/Cargando";
import { SelectorVista } from "../tramites/SelectorVista";

/** Paso 1 de 2: elegir el impuesto. Cada tarjeta es una fila de la tabla Impuestos. */
export function ImpuestoPage() {
  const impuestos = useImpuestos();
  const navigate = useNavigate();

  return (
    <>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Paso 1 de 2</p>
          <h1>¿Qué impuesto vas a trabajar?</h1>
          <p className="lede">Elige el régimen para ver los tipos de devolución disponibles.</p>
        </div>
        <SelectorVista />
      </div>

      {impuestos.isPending && <Cargando texto="Cargando impuestos…" />}
      {impuestos.isError && <div className="alert alert-danger">{impuestos.error.message}</div>}

      <div className="grid gap-4 sm:grid-cols-2">
        {impuestos.data?.map((i) => {
          const t = textoImpuesto(i.Nombre);
          return (
            <button key={i.IdImpuesto} type="button" className="choice" onClick={() => navigate(`/impuestos/${i.IdImpuesto}`)}>
              <span className="choice-icon"><IconoImpuesto nombre={i.Nombre} /></span>
              <span className="choice-kicker">{t.kicker}</span>
              <strong>{i.Nombre}</strong>
              <span className="choice-hint">{t.hint || `${i.TiposDevoluciones.length} tipos de devolución`}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
