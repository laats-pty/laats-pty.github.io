// ============================================================
// SOBRETIEMPO — Ley 44 de 1995, Art. 26
// Diurno ×1.25 | Nocturno ×1.50 | Feriado/Domingo ×2.00
// ============================================================
export function calcOvertime(params: {
  salarioMensual: number;
  horasDiurnas: number;
  horasNocturnas: number;
  horasFeriado: number;
}): { salarioHora: number; montoDiurno: number; montoNocturno: number; montoFeriado: number; total: number } {
  const salarioHora = params.salarioMensual / 240; // 30 días × 8 horas
  const montoDiurno = salarioHora * 1.25 * params.horasDiurnas;
  const montoNocturno = salarioHora * 1.50 * params.horasNocturnas;
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
// Cuota Abril → 3 meses | Cuota Agosto → 4 meses | Cuota Dic → 4 meses
// ============================================================
export function calcThirteenth(params: {
  salarioMensual: number;
  mesesEnPeriodo: number;
}): { montoDecimo: number; decimoMensualAcumulado: number } {
  const decimoMensualAcumulado = parseFloat((params.salarioMensual / 12).toFixed(2));
  const montoDecimo = parseFloat(((params.salarioMensual * params.mesesEnPeriodo) / 12).toFixed(2));
  return { montoDecimo, decimoMensualAcumulado };
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
