import type { FaseExpediente } from "../api";
import { useVersionFase, type NumeroVersion } from "./versionStore";
import { VersionEstudio } from "./VersionEstudio";
import { VersionNiveles } from "./VersionNiveles";
import { TrabajoProvider } from "./analisis/estado";
import "./versiones.css";

interface Props {
  fase: FaseExpediente;
  pasoId: number | null;
  onPaso: (id: number) => void;
  idTramite: number;
  editable: boolean;
}

/** Las dos presentaciones de la fase. La elección se recuerda en este navegador. */
export function VersionFase({ fase, pasoId, onPaso, idTramite, editable }: Props) {
  const { n, cambiar } = useVersionFase();
  const pasos = [...fase.Pasos].sort((a, b) => a.Secuencia - b.Secuencia);
  const paso = pasos.find((p) => p.IdPaso === pasoId) ?? pasos[0];
  if (!paso) return null;

  return (
    <TrabajoProvider>
    <div className="vx">
      <div className="vx-elige">
        <label>
          Versión
          <select aria-label="Versión" value={n} onChange={(e) => cambiar(Number(e.target.value) as NumeroVersion)}>
            <option value={1}>1</option>
            <option value={2}>2</option>
          </select>
        </label>
      </div>
      {n === 1 ? (
        <VersionEstudio pasos={pasos} paso={paso} onPaso={onPaso} idTramite={idTramite} editable={editable} />
      ) : (
        <VersionNiveles pasos={pasos} paso={paso} onPaso={onPaso} idTramite={idTramite} editable={editable} />
      )}
    </div>
    </TrabajoProvider>
  );
}
