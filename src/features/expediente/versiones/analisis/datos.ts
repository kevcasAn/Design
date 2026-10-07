/** Datos de muestra: no se conecta a la API. */

export interface Empresa {
  id: string;
  razon: string;
  corto: string;
  ruc: string;
}

export const EMPRESAS: Empresa[] = [
  { id: "priscila", razon: "INDUSTRIAL PESQUERA SANTA PRISCILA S.A.", corto: "Santa Priscila", ruc: "0991257721001" },
  { id: "ocean", razon: "OCEANEXPORT S.A.", corto: "Oceanexport", ruc: "0991417699001" },
  { id: "nirsa", razon: "NEGORI, INDUSTRIAL Y AGROPECUARIA NIRSA S.A.", corto: "Nirsa", ruc: "0990017516001" },
  { id: "promopesca", razon: "PROMOPESCA S.A.", corto: "Promopesca", ruc: "0991324458001" },
  { id: "idealsa", razon: "INDUSTRIAL ECUATORIANA DE ALIMENTOS IDEALSA S.A.", corto: "Idealsa", ruc: "0992233101001" },
  { id: "salica", razon: "SALICA DEL ECUADOR S.A.", corto: "Salica", ruc: "0990844332001" }
];

export const SIMPLES = [
  { id: "ventas", nombre: "Detalle de ventas" },
  { id: "daes-archivo", nombre: "Detalle de DAES" },
  { id: "compras", nombre: "Detalle de compras" },
  { id: "retenciones", nombre: "Retenciones" },
  { id: "exportaciones", nombre: "Exportaciones" }
];

/** `traido`: fecha en que Toolbox ya dejó el archivo; sin ella se sube a mano. */
export const TOOLS: { id: string; nombre: string; traido?: string }[] = [
  { id: "intereses", nombre: "Intereses", traido: "02 oct 2026" },
  { id: "gastos", nombre: "Gastos", traido: "05 oct 2026" },
  { id: "sri", nombre: "Cruce SRI" }
];

export const TOTAL_CARGAS = SIMPLES.length + TOOLS.length;

export const PASOS_ATS = ["Carga", "Errores", "Análisis", "Descarga"] as const;

export const ERRORES_ATS = [
  ["12", "Identificación", "RUC no válido"],
  ["40", "Base IVA", "No cuadra"],
  ["88", "Sustento", "Vacío"]
];

export const ERRORES_RESTANTES = [["40", "Base IVA", "No cuadra"]];

export const UNIDADES_OPC = ["KG", "LB", "UNIDAD", "CAJA"];

export interface Unidad {
  id: string;
  empresa: string;
  ruc: string;
  factor: string;
  dias: string;
  vendida: string;
  exportada: string;
}

export type PatchUnidad = Partial<Pick<Unidad, "factor" | "dias" | "vendida" | "exportada">>;

export const UNIDADES_INICIALES: Unidad[] = [
  { id: "priscila", empresa: "Santa Priscila", ruc: "0991257721001", factor: "1,58", dias: "70", vendida: "KG", exportada: "KG" },
  { id: "ocean", empresa: "Oceanexport", ruc: "0991417699001", factor: "1,00", dias: "45", vendida: "LB", exportada: "KG" },
  { id: "nirsa", empresa: "Nirsa", ruc: "0990017516001", factor: "1,20", dias: "60", vendida: "KG", exportada: "LB" },
  { id: "promopesca", empresa: "Promopesca", ruc: "0991324458001", factor: "1,00", dias: "90", vendida: "CAJA", exportada: "KG" },
  { id: "idealsa", empresa: "Idealsa", ruc: "0992233101001", factor: "2,20", dias: "30", vendida: "UNIDAD", exportada: "KG" },
  { id: "salica", empresa: "Salica", ruc: "0990844332001", factor: "1,10", dias: "55", vendida: "KG", exportada: "KG" }
];

export const COLUMNAS = [
  "No.",
  "RUC del exportador",
  "Razón social del exportador",
  "Serie",
  "Secuencia",
  "Fecha de emisión",
  "Días",
  "Fecha de relación",
  "Autorización (comprobantes físicos)",
  "Clave de acceso (comprobantes electrónicos)",
  "Valor",
  "Cantidad vendida",
  "Factor de conversión",
  "Valor a soportar",
  "Fecha DAE",
  "Validar días DAE",
  "Asignación DAE 1",
  "DAE peso utilizado 1",
  "Asignación DAE 2",
  "DAE peso utilizado 2",
  "Asignación DAE n",
  "DAE peso utilizado n",
  "Saldo a soportar"
] as const;

export const COL_VALIDAR = 15;

export const FILAS: Record<string, string[][]> = {
  priscila: [
    ["1", "0991257721001", "INDUSTRIAL PESQUERA SANTA PRISCILA S.A.", "001-018", "000011087", "01/08/2025", "70", "10/10/2025", "N/A", "0108202501099129543700120010180000110871234567816", "3.075,80", "1.625,00", "1,58", "1.028,48", "11/11/2025", "VERDADERO", "02820254002318324", "1.028,48", "", "", "", "", "-"],
    ["2", "0991257721001", "INDUSTRIAL PESQUERA SANTA PRISCILA S.A.", "001-018", "000011089", "01/08/2025", "70", "10/10/2025", "N/A", "0108202501099129543700120010180000110891234567817", "29.790,96", "30.725,00", "1,58", "19.446,20", "", "FALSO", "02820254002318324", "18.771,52", "02820254002319095", "674,68", "", "", "-"],
    ["3", "0991257721001", "INDUSTRIAL PESQUERA SANTA PRISCILA S.A.", "001-018", "000011173", "04/08/2025", "70", "13/10/2025", "N/A", "0408202501099129543700120010180000111731234567817", "72.720,00", "75.000,00", "1,58", "47.468,35", "", "FALSO", "02820254002319095", "15.654,81", "02820254002319152", "19.800,00", "02820254002361860", "12.013,55", "-"],
    ["4", "0991257721001", "INDUSTRIAL PESQUERA SANTA PRISCILA S.A.", "001-001", "000023082", "27/08/2025", "70", "05/11/2025", "N/A", "2708202504099129543700120010010000230821234567811", "-18.664,80", "-19.250,00", "1,58", "-12.183,54", "", "FALSO", "02820254002361860", "-12.183,54", "", "", "", "", "-"]
  ],
  ocean: [
    ["1", "0991417699001", "OCEANEXPORT S.A.", "001-002", "000004512", "03/08/2025", "45", "17/09/2025", "N/A", "0308202501099141769900120010020000045121234567812", "8.420,00", "4.200,00", "1,00", "4.200,00", "02/10/2025", "VERDADERO", "02820254003001122", "4.200,00", "", "", "", "", "-"],
    ["2", "0991417699001", "OCEANEXPORT S.A.", "001-002", "000004590", "12/08/2025", "45", "26/09/2025", "N/A", "1208202501099141769900120010020000045901234567813", "15.300,50", "6.100,00", "1,00", "6.100,00", "", "FALSO", "02820254003001122", "3.400,00", "02820254003004418", "2.700,00", "", "", "-"]
  ],
  nirsa: [
    ["1", "0990017516001", "NEGORI, INDUSTRIAL Y AGROPECUARIA NIRSA S.A.", "001-004", "000008811", "05/08/2025", "60", "04/10/2025", "N/A", "0508202501099001751600120010040000088111234567814", "12.440,10", "8.100,00", "1,20", "6.750,00", "20/10/2025", "VERDADERO", "02820254004110088", "6.750,00", "", "", "", "", "-"],
    ["2", "0990017516001", "NEGORI, INDUSTRIAL Y AGROPECUARIA NIRSA S.A.", "001-004", "000008900", "18/08/2025", "60", "17/10/2025", "N/A", "1808202501099001751600120010040000089001234567815", "6.220,00", "4.000,00", "1,20", "3.333,33", "", "FALSO", "02820254004118820", "3.333,33", "", "", "", "", "-"]
  ],
  promopesca: [
    ["1", "0991324458001", "PROMOPESCA S.A.", "002-001", "000002210", "02/08/2025", "90", "31/10/2025", "N/A", "0208202501099132445800120020010000022101234567816", "4.180,75", "2.200,00", "1,00", "2.200,00", "", "FALSO", "02820254005001221", "1.100,00", "02820254005001880", "1.100,00", "", "", "-"]
  ],
  idealsa: [
    ["1", "0992233101001", "INDUSTRIAL ECUATORIANA DE ALIMENTOS IDEALSA S.A.", "001-009", "000015002", "11/08/2025", "30", "10/09/2025", "N/A", "1108202501099223310100120010090000150021234567817", "22.900,00", "10.000,00", "2,20", "4.545,45", "25/09/2025", "VERDADERO", "02820254006015002", "4.545,45", "", "", "", "", "-"],
    ["2", "0992233101001", "INDUSTRIAL ECUATORIANA DE ALIMENTOS IDEALSA S.A.", "001-009", "000015118", "22/08/2025", "30", "21/09/2025", "N/A", "2208202501099223310100120010090000151181234567818", "7.150,00", "3.200,00", "2,20", "1.454,55", "", "FALSO", "02820254006015118", "1.454,55", "", "", "", "", "-"]
  ],
  salica: [
    ["1", "0990844332001", "SALICA DEL ECUADOR S.A.", "003-001", "000000774", "08/08/2025", "55", "02/10/2025", "N/A", "0808202501099084433200120030010000007741234567819", "9.640,40", "5.500,00", "1,10", "5.000,00", "", "FALSO", "02820254007000774", "5.000,00", "", "", "", "", "-"]
  ]
};

/* ── Tareas de análisis ───────────────────────────────────────────────── */

export type IdAnalisis = "iva" | "prevalidacion" | "ats" | "ventas" | "daes" | "compras" | "solicitud" | "saldos";

/** Tareas de análisis en el orden del trámite; la corrección de ATS es la subida del ATS. */
export const ANALISIS: { id: IdAnalisis; titulo: string; nota: string; aviso?: boolean }[] = [
  { id: "iva", titulo: "Liquidación de IVA", nota: "Crédito a solicitar 129.747,00" },
  { id: "prevalidacion", titulo: "Prevalidación de ATS", nota: "2 reglas por revisar", aviso: true },
  { id: "ats", titulo: "Corrección de ATS", nota: "Cuatro pasos" },
  { id: "ventas", titulo: "Detalle de ventas", nota: "4 comprobantes" },
  { id: "daes", titulo: "Detalle de DAES", nota: "Asignación por empresa", aviso: true },
  { id: "compras", titulo: "Detalle de compras", nota: "4 comprobantes" },
  { id: "solicitud", titulo: "Solicitud", nota: "Borrador" },
  { id: "saldos", titulo: "Control de saldos por compensar", nota: "12.640,00 por compensar" }
];

export interface TablaMuestra {
  columnas: string[];
  filas: string[][];
  resaltar?: number;
}

/** Ejemplo de subnivel: la prevalidación se divide en dos subtareas. */
export const SUBTAREAS_PREVALIDACION: { id: string; titulo: string; tabla: TablaMuestra }[] = [
  {
    id: "estructura",
    titulo: "Validación de estructura",
    tabla: {
      columnas: ["Regla", "Resultado", "Detalle"],
      resaltar: 1,
      filas: [
        ["RUC de proveedores", "Cumple", "412 de 412 válidos"],
        ["Sustento tributario", "Cumple", "Todos con código"],
        ["Fechas dentro del periodo", "Revisar", "2 fuera de enero"]
      ]
    }
  },
  {
    id: "valores",
    titulo: "Validación de valores",
    tabla: {
      columnas: ["Regla", "Resultado", "Detalle"],
      resaltar: 1,
      filas: [
        ["Bases contra IVA", "Revisar", "1 comprobante no cuadra"],
        ["Exportaciones con DAE", "Cumple", "38 de 38 relacionadas"]
      ]
    }
  }
];

/** Tareas con subnivel: se completan cuando todas sus partes están guardadas. */
export const SUBITEMS: Partial<Record<IdAnalisis, string[]>> = {
  prevalidacion: SUBTAREAS_PREVALIDACION.map((s) => s.id),
  daes: ["factor", ...EMPRESAS.map((e) => `${e.id}:asignacion`)]
};

export const TABLAS_ANALISIS: Record<Exclude<IdAnalisis, "daes" | "ats" | "prevalidacion">, TablaMuestra> = {
  iva: {
    columnas: ["Concepto", "Base", "IVA"],
    filas: [
      ["Ventas tarifa 15 %", "182.430,00", "27.364,50"],
      ["Exportaciones tarifa 0 %", "1.245.800,00", "0,00"],
      ["Compras con derecho a crédito", "964.210,00", "144.631,50"],
      ["Retenciones de IVA recibidas", "—", "12.480,00"],
      ["Crédito tributario a solicitar", "—", "129.747,00"]
    ]
  },
  ventas: {
    columnas: ["Comprobante", "Cliente", "Fecha", "Base", "IVA"],
    filas: [
      ["001-018-000011087", "Santa Priscila", "01/01/2026", "3.075,80", "0,00"],
      ["001-002-000004512", "Oceanexport", "03/01/2026", "8.420,00", "0,00"],
      ["001-004-000008811", "Nirsa", "05/01/2026", "12.440,10", "1.866,02"],
      ["001-009-000015002", "Idealsa", "11/01/2026", "22.900,00", "0,00"]
    ]
  },
  compras: {
    columnas: ["Proveedor", "Factura", "Fecha", "Base", "IVA"],
    filas: [
      ["Balanceados del Pacífico", "002-001-000045120", "04/01/2026", "54.200,00", "8.130,00"],
      ["Larvas Costa Azul", "001-003-000008874", "09/01/2026", "18.760,00", "2.814,00"],
      ["Empaques Guayas", "001-001-000120044", "15/01/2026", "9.340,00", "1.401,00"],
      ["Transportes Litoral", "001-002-000003391", "22/01/2026", "4.100,00", "615,00"]
    ]
  },
  solicitud: {
    columnas: ["Campo", "Valor"],
    filas: [
      ["Tipo", "Devolución de IVA a exportadores"],
      ["Periodo", "Enero 2026"],
      ["Trámite", "001"],
      ["Monto solicitado", "129.747,00"],
      ["Estado", "Borrador"]
    ]
  },
  saldos: {
    columnas: ["Periodo", "Saldo inicial", "Compensado", "Saldo por compensar"],
    filas: [
      ["Octubre 2025", "48.210,00", "30.000,00", "18.210,00"],
      ["Noviembre 2025", "18.210,00", "18.210,00", "0,00"],
      ["Diciembre 2025", "22.640,00", "10.000,00", "12.640,00"],
      ["Enero 2026", "12.640,00", "—", "12.640,00"]
    ]
  }
};

export function porRevisar(id: string) {
  return FILAS[id].filter((f) => f[COL_VALIDAR] === "FALSO").length;
}

export const POR_REVISAR_TOTAL = EMPRESAS.reduce((s, e) => s + porRevisar(e.id), 0);
