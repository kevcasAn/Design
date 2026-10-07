/**
 * Leotax: el leoncito. Mismas clases de animación que el búho (buho-cuerpo, buho-cabeza,
 * buho-parpado, buho-pupila, buho-ala, buho-ceja), así comparten el CSS:
 * respira, parpadea, mira a los lados, piensa ladeando la cabeza y saluda con la pata.
 */
export function Leon({ className, tamano }: { className: string; tamano: number }) {
  const melena = "#d9842b";
  const piel = "#f4b860";
  const claro = "#fbe3b4";
  const oscuro = "#7a4a1d";

  return (
    <svg className={className} width={tamano} height={tamano} viewBox="0 0 100 100" aria-hidden="true">
      <g className="buho-cuerpo">
        {/* patas delanteras (la derecha saluda) */}
        <ellipse className="buho-ala buho-ala--izq" cx="30" cy="80" rx="9" ry="12" fill={piel} />
        <ellipse className="buho-ala buho-ala--der" cx="70" cy="80" rx="9" ry="12" fill={piel} />
        {/* cuerpo y barriga */}
        <ellipse cx="50" cy="74" rx="26" ry="22" fill={piel} />
        <ellipse cx="50" cy="78" rx="15" ry="14" fill={claro} />
        {/* cola */}
        <path d="M74 84 q14 -4 10 -16" fill="none" stroke={piel} strokeWidth="5" strokeLinecap="round" />
        <circle cx="84.5" cy="66" r="4" fill={melena} />
      </g>
      <g className="buho-cabeza">
        {/* melena */}
        <circle cx="50" cy="40" r="33" fill={melena} />
        <g fill={melena}>
          <circle cx="20" cy="26" r="7" /><circle cx="80" cy="26" r="7" />
          <circle cx="14" cy="44" r="7" /><circle cx="86" cy="44" r="7" />
          <circle cx="22" cy="62" r="7" /><circle cx="78" cy="62" r="7" />
          <circle cx="36" cy="10" r="7" /><circle cx="64" cy="10" r="7" />
          <circle cx="50" cy="7" r="7" />
        </g>
        {/* orejas */}
        <circle cx="27" cy="19" r="8" fill={piel} />
        <circle cx="73" cy="19" r="8" fill={piel} />
        <circle cx="27" cy="19" r="4" fill={claro} />
        <circle cx="73" cy="19" r="4" fill={claro} />
        {/* cara */}
        <circle cx="50" cy="42" r="24" fill={piel} />
        {/* ojos */}
        <g className="buho-ojo">
          <circle cx="40" cy="38" r="6.5" fill="#fff" />
          <circle className="buho-pupila" cx="41" cy="39" r="4" fill="#241a16" />
          <circle cx="42.5" cy="37" r="1.4" fill="#fff" />
          <rect className="buho-parpado" x="33" y="31" width="14" height="14" rx="7" fill={piel} />
        </g>
        <g className="buho-ojo">
          <circle cx="60" cy="38" r="6.5" fill="#fff" />
          <circle className="buho-pupila" cx="61" cy="39" r="4" fill="#241a16" />
          <circle cx="62.5" cy="37" r="1.4" fill="#fff" />
          <rect className="buho-parpado" x="53" y="31" width="14" height="14" rx="7" fill={piel} />
        </g>
        {/* cejas */}
        <path className="buho-ceja" d="M34 29 q6 -4 12 -1" fill="none" stroke={oscuro} strokeWidth="2.4" strokeLinecap="round" />
        <path className="buho-ceja" d="M66 29 q-6 -4 -12 -1" fill="none" stroke={oscuro} strokeWidth="2.4" strokeLinecap="round" />
        {/* hocico, nariz y boca */}
        <ellipse cx="50" cy="51" rx="11" ry="8" fill={claro} />
        <path d="M45 47 l5 4 l5 -4 q-5 -3 -10 0 z" fill={oscuro} />
        <path d="M50 51 v4 M50 55 q-4 4 -7 0 M50 55 q4 4 7 0" fill="none" stroke={oscuro} strokeWidth="2" strokeLinecap="round" />
        {/* mejillas */}
        <circle cx="33" cy="48" r="3.5" fill="#f08a7a" opacity="0.55" />
        <circle cx="67" cy="48" r="3.5" fill="#f08a7a" opacity="0.55" />
      </g>
    </svg>
  );
}
