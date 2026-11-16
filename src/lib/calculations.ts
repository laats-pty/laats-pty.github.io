// ============================================================
// Lógica pura de las calculadoras del portal.
// Única fuente de verdad: los componentes .astro pintan las tablas con
// estos datos y src/scripts/calculators.ts calcula con estas funciones.
// Pruebas: tests/calculations.test.ts (npm test).
// ============================================================

/** Redondeo a 2 decimales (centavos). */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Convierte la entrada de un campo a número ≥ 0 (vacío o inválido = 0). */
export function toAmount(value: unknown): number {
  const n = typeof value === 'number' ? value : parseFloat(String(value ?? ''));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** "B/. 1,234.56" */
export function formatMoney(n: number, decimals = 2): string {
  return (
    'B/. ' +
    n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  );
}

/** "×1.25", "×2.50", "×2.1875" (mínimo 2 decimales, sin recortar los factores largos). */
export function formatFactor(f: number): string {
  const s = String(f);
  const dec = s.includes('.') ? s.split('.')[1].length : 0;
  return '×' + (dec < 2 ? f.toFixed(2) : s);
}

// ============================================================
// SOBRETIEMPO — Ley 44 de 1995, Art. 26, según la estructura de PayDay
// (Planilla Computarizada de LAATS). No cambiar factores ni divisores sin
// verificarlos contra PayDay (regla no negociable 1 de CLAUDE.md).
// Los factores "con recargo" ya incluyen el ×1.75 sobre el factor base.
// ============================================================
export const OVERTIME_DIVISORS = {
  fijo: 182.5, // Rotación 6×2
  temporal: 208, // Rotación 6×1
} as const;

export type EmployeeType = keyof typeof OVERTIME_DIVISORS;

export interface OvertimeCategory {
  code: string;
  label: string;
  factor: number;
}

export interface OvertimeGroup {
  title: string;
  categories: OvertimeCategory[];
}

export const OVERTIME_GROUPS: OvertimeGroup[] = [
  {
    title: 'Día regular — sin recargo',
    categories: [
      { code: 'SDiu', label: 'ST Diurno DiaNor', factor: 1.25 },
      { code: 'SMix', label: 'ST Mixto DiaNor', factor: 1.5 },
      { code: 'SNoc', label: 'ST Nocturno DiaNor', factor: 1.75 },
    ],
  },
  {
    title: 'Día regular — con recargo (×1.75)',
    categories: [
      { code: 'SDiuRc', label: 'ST Diurno DiaNor Rec', factor: 2.1875 },
      { code: 'SMixRc', label: 'ST Mixto DiaNor Rec', factor: 2.625 },
      { code: 'SNocRc', label: 'ST Nocturno DiaNor Rec', factor: 3.0625 },
    ],
  },
  {
    title: 'Domingo / día de descanso — sin recargo',
    categories: [
      { code: 'SDiuDom', label: 'ST Diurno DiaDes', factor: 1.875 },
      { code: 'SMixDom', label: 'ST Mixto DiaDes', factor: 2.25 },
      { code: 'SNocDom', label: 'ST Nocturno DiaDes', factor: 2.625 },
    ],
  },
  {
    title: 'Domingo / día de descanso — con recargo (×1.75)',
    categories: [
      { code: 'SDiuDomRc', label: 'ST Diurno DiaDes Rec', factor: 3.28125 },
      { code: 'SMixDomRc', label: 'ST Mixto DiaDes Rec', factor: 3.9375 },
      { code: 'SNocDomRc', label: 'ST Nocturno DiaDes Rec', factor: 4.59375 },
    ],
  },
  {
    title: 'Feriado nacional',
    categories: [{ code: 'Feriado', label: 'ST Feriado Nacional', factor: 2.5 }],
  },
];

export const OVERTIME_CATEGORIES: OvertimeCategory[] = OVERTIME_GROUPS.flatMap((g) => g.categories);

export function hourlyRate(salarioMensual: number, tipo: EmployeeType): number {
  return toAmount(salarioMensual) / OVERTIME_DIVISORS[tipo];
}

export interface OvertimeLine extends OvertimeCategory {
  horas: number;
  monto: number;
}

export function calcOvertime(params: {
  salarioMensual: number;
  tipo: EmployeeType;
  horas: Record<string, unknown>;
}): { salarioHora: number; detalle: OvertimeLine[]; total: number } {
  const salarioHora = hourlyRate(params.salarioMensual, params.tipo);
  const detalle = OVERTIME_CATEGORIES.map((c) => {
    const horas = toAmount(params.horas[c.code]);
    return { ...c, horas, monto: round2(salarioHora * c.factor * horas) };
  }).filter((l) => l.horas > 0);
  // El total es la suma de las líneas ya redondeadas, para que el desglose
  // que ve el empleado sume exactamente el total.
  const total = round2(detalle.reduce((sum, l) => sum + l.monto, 0));
  return { salarioHora, detalle, total };
}

// ============================================================
// VACACIONES — Código de Trabajo de Panamá, Art. 54
// 30 días por cada 11 meses trabajados
// ============================================================
export function calcVacation(params: {
  salarioMensual: number;
  mesesTrabajados: number;
}): { diasCorresponden: number; montoVacaciones: number } {
  const diasCorresponden = round2((toAmount(params.mesesTrabajados) / 11) * 30);
  const montoVacaciones = round2((toAmount(params.salarioMensual) / 30) * diasCorresponden);
  return { diasCorresponden, montoVacaciones };
}

// ============================================================
// DÉCIMO TERCER MES — Art. 43 del Código de Trabajo
// 3 cuotas, cada una cubre 4 meses:
//   Abril     → 16 dic al 15 abr
//   Agosto    → 16 abr al 15 ago
//   Diciembre → 16 ago al 15 dic
// Fórmula: total devengado en el período (4 meses) ÷ 12
// Salario fijo: (salario × 4) ÷ 12 = salario ÷ 3
// ============================================================
export const THIRTEENTH_INSTALLMENTS = [
  { id: 'abril', nombre: 'Cuota Abril', periodo: '16 dic al 15 abr' },
  { id: 'agosto', nombre: 'Cuota Agosto', periodo: '16 abr al 15 ago' },
  { id: 'diciembre', nombre: 'Cuota Diciembre', periodo: '16 ago al 15 dic' },
] as const;

export function calcThirteenth(params: { devengadoPorMes: unknown[] }): {
  totalPeriodo: number;
  montoDecimo: number;
} {
  const totalPeriodo = round2(params.devengadoPorMes.reduce<number>((s, m) => s + toAmount(m), 0));
  return { totalPeriodo, montoDecimo: round2(totalPeriodo / 12) };
}

export function calcThirteenthFijo(salarioMensual: number): { totalPeriodo: number; montoDecimo: number } {
  const s = toAmount(salarioMensual);
  return calcThirteenth({ devengadoPorMes: [s, s, s, s] });
}

// ============================================================
// LIQUIDACIÓN — Ley 44 de 1995 + Código de Trabajo
// Prima de antigüedad: 1 semana de salario por año completo trabajado.
// Preaviso: <2 años = 1 sem | 2–5 = 2 sem | 5–10 = 4 sem | >10 = 6 sem
// ============================================================
export function calcLiquidation(params: {
  salarioMensual: number;
  aniosTrabajados: number;
  mesesAdicionales: number;
  diasVacacionesPendientes: number;
  mesesDecimoPeriodoActual: number;
}): {
  primaAntiguedad: number;
  vacacionesProporcionales: number;
  decimoProporcional: number;
  montoPreaviso: number;
  semanasPreaviso: number;
  total: number;
} {
  const salario = toAmount(params.salarioMensual);
  const salarioSemanal = (salario * 12) / 52;
  const totalAnios = toAmount(params.aniosTrabajados) + toAmount(params.mesesAdicionales) / 12;

  const primaAntiguedad = round2(salarioSemanal * Math.floor(totalAnios));
  const vacacionesProporcionales = round2((salario / 30) * toAmount(params.diasVacacionesPendientes));
  const decimoProporcional = round2((salario * toAmount(params.mesesDecimoPeriodoActual)) / 12);

  let semanasPreaviso = 1;
  if (totalAnios >= 10) semanasPreaviso = 6;
  else if (totalAnios >= 5) semanasPreaviso = 4;
  else if (totalAnios >= 2) semanasPreaviso = 2;

  const montoPreaviso = round2(salarioSemanal * semanasPreaviso);
  const total = round2(primaAntiguedad + vacacionesProporcionales + decimoProporcional + montoPreaviso);

  return { primaAntiguedad, vacacionesProporcionales, decimoProporcional, montoPreaviso, semanasPreaviso, total };
}
