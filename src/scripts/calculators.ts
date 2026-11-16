// Componentes Alpine de las calculadoras. Toda la matemática vive en
// src/lib/calculations.ts; aquí solo hay estado de formulario.
// Este módulo debe ejecutarse ANTES que el script de Alpine (ver BaseLayout):
// se registra en el evento alpine:init, que Alpine dispara al arrancar.
import {
  OVERTIME_CATEGORIES,
  OVERTIME_DIVISORS,
  THIRTEENTH_INSTALLMENTS,
  calcLiquidation,
  calcOvertime,
  calcThirteenth,
  calcThirteenthFijo,
  calcVacation,
  formatMoney,
  hourlyRate,
  toAmount,
  type EmployeeType,
} from '../lib/calculations';

const SIN_SALARIO = 'Ingresa tu salario mensual para calcular.';

document.addEventListener('alpine:init', () => {
  const Alpine = (window as any).Alpine;

  // Pestañas accesibles (flechas, Inicio y Fin mueven el foco y la selección).
  Alpine.data('tabs', (first: string) => ({
    tab: first,
    move(this: any, event: KeyboardEvent, step: number | 'first' | 'last') {
      const tabs = Array.from(this.$refs.tablist.querySelectorAll('[role="tab"]')) as HTMLElement[];
      const current = tabs.indexOf(event.target as HTMLElement);
      let next = 0;
      if (step === 'last') next = tabs.length - 1;
      else if (step !== 'first') next = (current + step + tabs.length) % tabs.length;
      this.tab = tabs[next].dataset.tab;
      tabs[next].focus();
    },
  }));

  Alpine.data('overtimeCalc', () => ({
    salario: '',
    tipo: 'fijo' as EmployeeType,
    horas: Object.fromEntries(OVERTIME_CATEGORIES.map((c) => [c.code, ''])) as Record<string, string>,
    resultado: null as ReturnType<typeof calcOvertime> | null,
    error: '',
    money: formatMoney,
    get divisor() {
      return OVERTIME_DIVISORS[this.tipo as EmployeeType];
    },
    get salarioHoraTexto() {
      const s = toAmount(this.salario);
      return s > 0 ? formatMoney(hourlyRate(s, this.tipo as EmployeeType), 4) : '—';
    },
    montoLinea(code: string) {
      if (toAmount(this.salario) <= 0 || toAmount(this.horas[code]) <= 0) return '—';
      const linea = calcOvertime({
        salarioMensual: toAmount(this.salario),
        tipo: this.tipo as EmployeeType,
        horas: { [code]: this.horas[code] },
      }).detalle[0];
      return formatMoney(linea.monto);
    },
    setTipo(tipo: EmployeeType) {
      this.tipo = tipo;
      this.invalidar();
    },
    invalidar() {
      this.resultado = null;
      this.error = '';
    },
    calcular() {
      this.invalidar();
      const salarioMensual = toAmount(this.salario);
      if (salarioMensual <= 0) return (this.error = SIN_SALARIO);
      const r = calcOvertime({ salarioMensual, tipo: this.tipo as EmployeeType, horas: this.horas });
      if (r.detalle.length === 0) return (this.error = 'Ingresa las horas de al menos un tipo de sobretiempo.');
      this.resultado = r;
    },
  }));

  Alpine.data('vacationCalc', () => ({
    salario: '',
    meses: 11,
    resultado: null as ReturnType<typeof calcVacation> | null,
    error: '',
    money: formatMoney,
    invalidar() {
      this.resultado = null;
      this.error = '';
    },
    calcular() {
      this.invalidar();
      const salarioMensual = toAmount(this.salario);
      if (salarioMensual <= 0) return (this.error = SIN_SALARIO);
      this.resultado = calcVacation({ salarioMensual, mesesTrabajados: toAmount(this.meses) });
    },
  }));

  Alpine.data('thirteenthCalc', () => ({
    modo: 'fijo',
    cuota: THIRTEENTH_INSTALLMENTS[0].id as string,
    salarioMensual: '',
    meses: ['', '', '', ''],
    resultado: null as ReturnType<typeof calcThirteenth> | null,
    error: '',
    money: formatMoney,
    get labelCuota() {
      const c = THIRTEENTH_INSTALLMENTS.find((i) => i.id === this.cuota) ?? THIRTEENTH_INSTALLMENTS[0];
      return `${c.nombre} (${c.periodo})`;
    },
    setModo(modo: string) {
      this.modo = modo;
      this.invalidar();
    },
    invalidar() {
      this.resultado = null;
      this.error = '';
    },
    calcular() {
      this.invalidar();
      if (this.modo === 'fijo') {
        const s = toAmount(this.salarioMensual);
        if (s <= 0) return (this.error = SIN_SALARIO);
        this.resultado = calcThirteenthFijo(s);
      } else {
        const r = calcThirteenth({ devengadoPorMes: this.meses });
        if (r.totalPeriodo <= 0) return (this.error = 'Ingresa lo devengado en al menos un mes del período.');
        this.resultado = r;
      }
    },
  }));

  Alpine.data('liquidationCalc', () => ({
    salario: '',
    anios: '',
    mesesAdicionales: '',
    diasVacaciones: '',
    mesesDecimo: '',
    resultado: null as ReturnType<typeof calcLiquidation> | null,
    error: '',
    money: formatMoney,
    invalidar() {
      this.resultado = null;
      this.error = '';
    },
    calcular() {
      this.invalidar();
      const salarioMensual = toAmount(this.salario);
      if (salarioMensual <= 0) return (this.error = SIN_SALARIO);
      this.resultado = calcLiquidation({
        salarioMensual,
        aniosTrabajados: toAmount(this.anios),
        mesesAdicionales: toAmount(this.mesesAdicionales),
        diasVacacionesPendientes: toAmount(this.diasVacaciones),
        mesesDecimoPeriodoActual: toAmount(this.mesesDecimo),
      });
    },
  }));
});
