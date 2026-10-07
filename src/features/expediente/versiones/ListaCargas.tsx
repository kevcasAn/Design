import type { CargaExpediente, PasoExpediente } from "../api";
import { CargaCard } from "../CargaCard";
import { AvatarMascota } from "../../asistente/AvatarMascota";
import { useAsistenteStore } from "../../asistente/asistenteStore";

export function ListaCargas({ cargas, idTramite, editable, paso, conMascota = true, limitar = true, ejemplos = [] }: { cargas: CargaExpediente[]; idTramite: number; editable: boolean; paso: PasoExpediente; conMascota?: boolean; limitar?: boolean; ejemplos?: CargaExpediente[] }) {
  return (
    <div className="vx-lienzo-cuerpo">
      {conMascota && paso.Mascota && (
        <div className="vx-mascota">
          <button type="button" className="enlace inline-flex items-center gap-1.5 text-small" onClick={() => useAsistenteStore.getState().abrir()}>
            <AvatarMascota avatar={paso.MascotaAvatar} tamano={26} /> Pregúntale a {paso.Mascota}
          </button>
        </div>
      )}
      {cargas.length === 0 && ejemplos.length === 0 ? (
        <p className="text-small text-muted">Este paso no tiene cargas configuradas.</p>
      ) : (
        <div className={`vx-lista ${limitar ? "is-limite" : ""}`}>
          {cargas.map((c) => <CargaCard key={c.IdTramiteDetalle} carga={c} idTramite={idTramite} editable={editable} />)}
          {ejemplos.map((c) => <CargaCard key={c.IdTramiteDetalle} carga={c} idTramite={idTramite} editable={editable} ejemplo />)}
        </div>
      )}
    </div>
  );
}
