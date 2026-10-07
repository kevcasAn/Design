import { Leon } from "./Leon";

export type EstadoMascota = "quieto" | "pensando" | "nuevo" | "feliz";

interface Props {
  /** Avatar de MascotasIA. "🦉" (o vacío) dibuja el búho; "🦁" el leoncito Leotax; otro emoji se muestra tal cual, con balanceo. */
  avatar: string | null;
  estado?: EstadoMascota;
  tamano?: number;
}

/**
 * La cara de la mascota. El búho es un dibujo en vectores con animación:
 * respira, parpadea, mira a los lados; piensa ladeando la cabeza y saluda con el ala.
 */
export function AvatarMascota({ avatar, estado = "quieto", tamano = 44 }: Props) {
  if (avatar?.includes("🦁")) {
    return <Leon className={`buho buho--${estado}`} tamano={tamano} />;
  }
  const esBuho = !avatar || avatar.trim() === "" || avatar.includes("🦉");
  if (!esBuho) {
    return <span className={`mascota-emoji mascota-emoji--${estado}`} style={{ fontSize: tamano * 0.72 }} aria-hidden="true">{avatar}</span>;
  }

  return (
    <svg className={`buho buho--${estado}`} width={tamano} height={tamano} viewBox="0 0 100 100" aria-hidden="true">
      <g className="buho-cuerpo">
        {/* alas */}
        <ellipse className="buho-ala buho-ala--izq" cx="22" cy="62" rx="11" ry="20" fill="#5a3b2e" />
        <ellipse className="buho-ala buho-ala--der" cx="78" cy="62" rx="11" ry="20" fill="#5a3b2e" />
        {/* cuerpo y pecho */}
        <ellipse cx="50" cy="62" rx="30" ry="32" fill="#8a5a3c" />
        <ellipse cx="50" cy="68" rx="19" ry="21" fill="#e9c9a3" />
        <path d="M38 62 q6 5 12 0 q6 5 12 0" fill="none" stroke="#c9a27c" strokeWidth="2" strokeLinecap="round" />
        <path d="M36 72 q7 5 14 0 q7 5 14 0" fill="none" stroke="#c9a27c" strokeWidth="2" strokeLinecap="round" />
        {/* patas */}
        <path d="M40 92 l-5 5 M40 92 l0 6 M40 92 l5 5" stroke="#e8a33c" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M60 92 l-5 5 M60 92 l0 6 M60 92 l5 5" stroke="#e8a33c" strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
      <g className="buho-cabeza">
        {/* orejas */}
        <path d="M24 30 l-4 -18 l16 10 z" fill="#8a5a3c" />
        <path d="M76 30 l4 -18 l-16 10 z" fill="#8a5a3c" />
        {/* cabeza */}
        <circle cx="50" cy="36" r="28" fill="#8a5a3c" />
        {/* cara clara */}
        <path d="M22 40 q10 -22 28 -16 q18 -6 28 16 q-10 20 -28 18 q-18 2 -28 -18 z" fill="#e9c9a3" />
        {/* ojos */}
        <g className="buho-ojo">
          <circle cx="37" cy="38" r="11" fill="#fff" />
          <circle className="buho-pupila" cx="38" cy="39" r="6" fill="#241a16" />
          <circle cx="40.5" cy="36" r="2" fill="#fff" />
          <rect className="buho-parpado" x="25" y="26" width="24" height="24" rx="12" fill="#e9c9a3" />
        </g>
        <g className="buho-ojo">
          <circle cx="63" cy="38" r="11" fill="#fff" />
          <circle className="buho-pupila" cx="64" cy="39" r="6" fill="#241a16" />
          <circle cx="66.5" cy="36" r="2" fill="#fff" />
          <rect className="buho-parpado" x="51" y="26" width="24" height="24" rx="12" fill="#e9c9a3" />
        </g>
        {/* pico y cejas */}
        <path d="M46 46 l4 8 l4 -8 z" fill="#e8a33c" />
        <path className="buho-ceja" d="M27 26 q10 -6 20 -2" fill="none" stroke="#5a3b2e" strokeWidth="3" strokeLinecap="round" />
        <path className="buho-ceja" d="M73 26 q-10 -6 -20 -2" fill="none" stroke="#5a3b2e" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}
