// Casos de prueba de las calculadoras. Ejecutar con: npm test
// Los valores esperados están calculados a mano a partir de las reglas de
// negocio documentadas en CLAUDE.md (factores PayDay, divisores 182.5 / 208).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  OVERTIME_CATEGORIES,
  OVERTIME_DIVISORS,
  calcLiquidation,
  calcOvertime,
  calcThirteenth,
  calcThirteenthFijo,
  calcVacation,
  formatFactor,
  formatMoney,
  hourlyRate,
  round2,
  toAmount,
} from '../src/lib/calculations.ts';

test('sobretiempo: 13 categorías con los factores de PayDay', () => {
  const esperado: Record<string, number> = {
    SDiu: 1.25, SMix: 1.5, SNoc: 1.75,
    SDiuRc: 2.1875, SMixRc: 2.625, SNocRc: 3.0625,
    SDiuDom: 1.875, SMixDom: 2.25, SNocDom: 2.625,
    SDiuDomRc: 3.28125, SMixDomRc: 3.9375, SNocDomRc: 4.59375,
    Feriado: 2.5,
  };
  assert.equal(OVERTIME_CATEGORIES.length, 13);
  for (const c of OVERTIME_CATEGORIES) assert.equal(c.factor, esperado[c.code], c.code);
});

test('sobretiempo: los factores con recargo son base × 1.75 y descanso es base × 1.5', () => {
  const f = Object.fromEntries(OVERTIME_CATEGORIES.map((c) => [c.code, c.factor]));
  for (const b of ['SDiu', 'SMix', 'SNoc']) {
    assert.equal(f[b + 'Rc'], f[b] * 1.75);
    assert.equal(f[b + 'Dom'], f[b] * 1.5);
    assert.equal(f[b + 'DomRc'], f[b] * 1.5 * 1.75);
  }
});

test('sobretiempo: divisores Fijo 182.5 y Temporal 208', () => {
  assert.equal(OVERTIME_DIVISORS.fijo, 182.5);
  assert.equal(OVERTIME_DIVISORS.temporal, 208);
  assert.equal(hourlyRate(1825, 'fijo'), 10);
  assert.equal(hourlyRate(1040, 'temporal'), 5);
});

test('sobretiempo: fijo, B/. 1,825 → B/. 10/h', () => {
  const r = calcOvertime({ salarioMensual: 1825, tipo: 'fijo', horas: { SDiu: 2, SNocRc: 1, Feriado: 8 } });
  assert.equal(r.salarioHora, 10);
  assert.deepEqual(r.detalle.map((l) => [l.code, l.monto]), [
    ['SDiu', 25], // 10 × 1.25 × 2
    ['SNocRc', 30.63], // 10 × 3.0625 × 1 = 30.625
    ['Feriado', 200], // 10 × 2.5 × 8
  ]);
  assert.equal(r.total, 255.63);
});

test('sobretiempo: temporal, B/. 800 con medias horas', () => {
  const r = calcOvertime({ salarioMensual: 800, tipo: 'temporal', horas: { SMix: '1.5', SDiuDom: '4' } });
  // 800/208 = 3.846153…; ×1.5×1.5 = 8.65; ×1.875×4 = 28.85
  assert.deepEqual(r.detalle.map((l) => l.monto), [8.65, 28.85]);
  assert.equal(r.total, 37.5);
});

test('sobretiempo: el total es la suma exacta de las líneas mostradas', () => {
  const horas = Object.fromEntries(OVERTIME_CATEGORIES.map((c) => [c.code, 1.5]));
  const r = calcOvertime({ salarioMensual: 777.77, tipo: 'temporal', horas });
  assert.equal(r.detalle.length, 13);
  assert.equal(r.total, round2(r.detalle.reduce((s, l) => s + l.monto, 0)));
});

test('sobretiempo: ignora vacíos, negativos y texto', () => {
  const r = calcOvertime({ salarioMensual: 1000, tipo: 'fijo', horas: { SDiu: '', SMix: -3, SNoc: 'abc' } });
  assert.deepEqual(r.detalle, []);
  assert.equal(r.total, 0);
});

test('vacaciones: 11 meses = 30 días = un salario', () => {
  assert.deepEqual(calcVacation({ salarioMensual: 800, mesesTrabajados: 11 }), {
    diasCorresponden: 30,
    montoVacaciones: 800,
  });
});

test('vacaciones: proporcional', () => {
  // 6/11 × 30 = 16.36 días; 900/30 × 16.36 = 490.80
  assert.deepEqual(calcVacation({ salarioMensual: 900, mesesTrabajados: 6 }), {
    diasCorresponden: 16.36,
    montoVacaciones: 490.8,
  });
  assert.equal(calcVacation({ salarioMensual: 800, mesesTrabajados: 22 }).diasCorresponden, 60);
});

test('décimo: salario fijo = salario ÷ 3', () => {
  assert.deepEqual(calcThirteenthFijo(1500), { totalPeriodo: 6000, montoDecimo: 500 });
  assert.deepEqual(calcThirteenthFijo(1000), { totalPeriodo: 4000, montoDecimo: 333.33 });
});

test('décimo: con ingresos variables = suma de 4 meses ÷ 12', () => {
  assert.deepEqual(calcThirteenth({ devengadoPorMes: ['1000', '1200.50', '', '950'] }), {
    totalPeriodo: 3150.5,
    montoDecimo: 262.54,
  });
});

const baseLiq = {
  salarioMensual: 1300, // salario semanal = 1300 × 12 / 52 = 300
  aniosTrabajados: 3,
  mesesAdicionales: 6,
  diasVacacionesPendientes: 10,
  mesesDecimoPeriodoActual: 2,
};

test('liquidación: renuncia con contrato indefinido, prima proporcional', () => {
  assert.deepEqual(calcLiquidation(baseLiq), {
    primaAntiguedad: 1050, // 300 × 3.5 años (art. 224, proporcional)
    indemnizacion: 0,
    vacacionesProporcionales: 433.33, // 1300/30 × 10
    decimoProporcional: 216.67, // 1300 × 2 / 12
    total: 1700,
  });
});

test('liquidación: despido injustificado suma la indemnización del art. 225', () => {
  const r = calcLiquidation({ ...baseLiq, motivo: 'injustificado' });
  assert.equal(r.indemnizacion, 3570); // 3.4 × 3.5 × 300
  assert.equal(r.total, 5270);
});

test('liquidación: indemnización, 3.4 semanas hasta 10 años y 1 semana después', () => {
  const ind = (anios: number, meses = 0) =>
    calcLiquidation({
      salarioMensual: 1300,
      aniosTrabajados: anios,
      mesesAdicionales: meses,
      diasVacacionesPendientes: 0,
      mesesDecimoPeriodoActual: 0,
      motivo: 'injustificado',
    }).indemnizacion;
  assert.equal(ind(0, 6), 510); // 3.4 × 0.5 × 300
  assert.equal(ind(10), 10200); // 34 semanas
  assert.equal(ind(12, 6), 10950); // 34 + 2.5 semanas
});

test('liquidación: contrato por tiempo definido no lleva prima ni indemnización', () => {
  const r = calcLiquidation({ ...baseLiq, contrato: 'definido', motivo: 'injustificado' });
  assert.equal(r.primaAntiguedad, 0);
  assert.equal(r.indemnizacion, 0);
  assert.equal(r.total, 650); // solo vacaciones y décimo
});

test('utilidades de formato y saneo', () => {
  assert.equal(formatMoney(1234.5), 'B/. 1,234.50');
  assert.equal(formatMoney(5.4795, 4), 'B/. 5.4795');
  assert.equal(formatFactor(1.5), '×1.50');
  assert.equal(formatFactor(2.5), '×2.50');
  assert.equal(formatFactor(1.25), '×1.25');
  assert.equal(formatFactor(4.59375), '×4.59375');
  assert.equal(toAmount(''), 0);
  assert.equal(toAmount('-5'), 0);
  assert.equal(toAmount('12.5'), 12.5);
  assert.equal(round2(30.625), 30.63);
});
