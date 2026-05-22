// ============================================================
// SOBRETIEMPO — Ley 44 de 1995, Art. 26
// Diurno ×1.25 | Nocturno ×1.75 | Feriado/Domingo ×2.00
// ============================================================
export function calcOvertime(params: {
  salarioMensual: number;
  horasDiurnas: number;
  horasNocturnas: number;
  horasFeriado: number;
}): { salarioHora: number; montoDiurno: number; montoNocturno: number; montoFeriado: number; total: number } {
  const salarioHora = params.salarioMensual / 240; // 30 días × 8 horas
  const montoDiurno = salarioHora * 1.25 * params.horasDiurnas;
  const montoNocturno = salarioHora * 1.75 * params.horasNocturnas;
  const montoFeriado = salarioHora * 2.00 * params.horasFeriado;
  const total = montoDiurno + montoNocturno + montoFeriado;
  return { salarioHora, montoDiurno, montoNocturno, montoFeriado, total };
}

// ============================================================
// VACACIONES — Código de Trabajo de Panamá, Art. 54
// 30 días por cada 11 meses trabajados
// ============================================================
export function calcVacation(params: {
  salarioMensual: number;
  mesesTrabajados: number;
}): { diasCorresponden: number; montoVacaciones: number } {
  const diasCorresponden = parseFloat(((params.mesesTrabajados / 11) * 30).toFixed(2));
  const montoVacaciones = parseFloat(((params.salarioMensual / 30) * diasCorresponden).toFixed(2));
  return { diasCorresponden, montoVacaciones };
}

// ============================================================
// DÉCIMO TERCER MES — Art. 43 del Código de Trabajo
// 3 cuotas iguales, cada una cubre 4 meses exactos:
//   Cuota Abril    → 16 dic al 15 abr (4 meses)
//   Cuota Agosto   → 16 abr al 15 ago (4 meses)
//   Cuota Diciembre→ 16 ago al 15 dic (4 meses)
// Fórmula: total devengado en el período (4 meses) / 12
// Salario fijo: (salario × 4) / 12 = salario / 3
// Con variables: (mes1 + mes2 + mes3 + mes4) / 12
// ============================================================
export function calcThirteenth(params: {
  totalDevengadoPeriodo: number; // suma de lo devengado en los 4 meses del período
}): { montoDecimo: number; } {
  const montoDecimo = parseFloat((params.totalDevengadoPeriodo / 12).toFixed(2));
  return { montoDecimo };
}

// Helper para salario fijo: total del período = salario × 4
export function calcThirteenthFijo(salarioMensual: number): { montoDecimo: number; acumuladoMes: number } {
  const totalPeriodo = salarioMensual * 4;
  const montoDecimo = parseFloat((totalPeriodo / 12).toFixed(2));
  const acumuladoMes = parseFloat((salarioMensual / 3).toFixed(2));
  return { montoDecimo, acumuladoMes };
}

// ============================================================
// LIQUIDACIÓN — Ley 44 de 1995 + Código de Trabajo
// Prima antigüedad: 1 semana/año | Preaviso según años
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
  const salarioSemanal = (params.salarioMensual * 12) / 52;
  const totalAnios = params.aniosTrabajados + params.mesesAdicionales / 12;

  const primaAntiguedad = parseFloat((salarioSemanal * Math.floor(totalAnios)).toFixed(2));

  const vacacionesProporcionales = parseFloat(
    ((params.salarioMensual / 30) * params.diasVacacionesPendientes).toFixed(2)
  );

  const decimoProporcional = parseFloat(
    ((params.salarioMensual * params.mesesDecimoPeriodoActual) / 12).toFixed(2)
  );

  let semanasPreaviso = 1;
  if (totalAnios >= 10) semanasPreaviso = 6;
  else if (totalAnios >= 5) semanasPreaviso = 4;
  else if (totalAnios >= 2) semanasPreaviso = 2;

  const montoPreaviso = parseFloat((salarioSemanal * semanasPreaviso).toFixed(2));

  const total = primaAntiguedad + vacacionesProporcionales + decimoProporcional + montoPreaviso;

  return {
    primaAntiguedad,
    vacacionesProporcionales,
    decimoProporcional,
    montoPreaviso,
    semanasPreaviso,
    total: parseFloat(total.toFixed(2)),
  };
}
