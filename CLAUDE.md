# Portal RRHH LAATS Panamá

Sitio estático de recursos humanos para LAATS Panamá. Construido con Astro 6 + Tailwind CSS v4 + Alpine.js (CDN). Sin base de datos, sin backend, sin auth. Deploy automático a GitHub Pages via GitHub Actions.

**URL de producción:** https://laats-pty.github.io

## Commands

- `npm run dev` — Servidor de desarrollo en localhost:4321
- `npm run build` — Build de producción (output en ./dist/)
- `npm run preview` — Preview del build de producción

## Tech Stack

Astro 6 (static) + TypeScript (strict) + Tailwind CSS v4 + Alpine.js v3.14.9 (CDN) + GitHub Pages

## Architecture

### Directory Structure
- `src/components/layout/` — Header, Footer, BaseLayout
- `src/components/sections/` — Hero, QuickLinks, Calculators, FAQ
- `src/components/calculators/` — Las 4 calculadoras individuales con Alpine.js
- `src/lib/` — calculations.ts (lógica pura de cálculo), types.ts
- `src/pages/index.astro` — Página única que ensambla todas las secciones
- `content/content.json` — Fuente de verdad del contenido: links y FAQs
- `public/` — Assets estáticos (logo: logo-laats.jpg, favicon)
- `.github/workflows/deploy.yml` — Pipeline de deploy a GitHub Pages
- `.github/dependabot.yml` — Actualizaciones automáticas de dependencias

### Data Flow
content.json → importado en build time → props de componentes Astro → HTML estático
Alpine.js → estado local de cada calculadora → sin llamadas a red

### Key Patterns
- Todo el contenido (links, FAQs) viene de content.json — nunca hardcodear strings en componentes
- Las funciones de cálculo viven en calculations.ts como funciones TypeScript puras — sin lógica en los componentes Alpine
- Alpine.js se carga via CDN con SRI (integrity hash) — no instalar el paquete npm
- Cada sección tiene ID de anchor para smooth scroll desde el nav
- Todas las URLs en QuickLinks pasan por `safeUrl()` que valida protocolo https:/http:
- Los IDs del FAQ pasan por `safeId()` antes de usarse en expresiones Alpine

## Security

### Content Security Policy (meta tag en BaseLayout.astro)
```
default-src 'none';
script-src 'self' 'unsafe-eval' https://cdn.jsdelivr.net;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data:;
connect-src 'none';
base-uri 'self';
form-action 'https:' https://forms.microsoft.com https://docs.google.com;
```
- `'unsafe-eval'` es requerido e inevitable: Alpine.js v3 usa `new Function()` internamente.

### Alpine.js CDN con SRI
```html
<script src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.9/dist/cdn.min.js"
  integrity="sha384-9Ax3MmS9AClxJyd5/zafcXXjxmwFhZCdsT6HJoJjarvCaAkJlk5QDzjLJm+Wdx5F"
  crossorigin="anonymous" defer></script>
```

### GitHub Actions — SHAs fijos (no usar tags mutables)
```yaml
actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5          # v4
actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020         # v4.4.0
actions/upload-pages-artifact@56afc609e74202658d3ffba0e8f6dda462b719fa  # v3.0.1
actions/deploy-pages@d6db90164ac5ed86f2b6aed7e0febac5b3c0c03e       # v4
```

### Pendiente — Node.js deprecation (no urgente)
GitHub Actions deprecará Node.js 20 el **2 de junio 2026** y lo eliminará el 16 de septiembre 2026.
Dependabot ya tiene PRs abiertos para actualizar las Actions a versiones compatibles con Node.js 24.
Mergear esos PRs antes de mayo 2026.

## Code Organization Rules

1. **Contenido en content.json.** Nunca hardcodear texto de links o FAQs en componentes.
2. **Lógica de cálculo en calculations.ts.** Los componentes Astro no hacen matemática — solo llaman funciones.
3. **Un componente por archivo.** Máximo 150 líneas por archivo .astro.
4. **Alpine.js solo para interactividad.** No usar para renderizar contenido estático.
5. **Mobile-first.** Todas las clases responsive empiezan en mobile, se sobrescriben con md: y xl:.

## Design System

### Colors
- Primary: #1B3A6B (azul marino — header, botones, iconos)
- Primary Dark: #122750 (hover de primary)
- Accent: #F59E0B (ámbar — badges, bordes activos)
- Background: #F1F5F9 (fondo de página)
- Surface: #FFFFFF (cards, calculadoras)
- Text: #1E293B (texto principal)
- Muted: #64748B (texto secundario)
- Success: #059669 (resultado de calculadoras)
- Border: #E2E8F0 (bordes de cards)

### Typography
- Fuente: Inter (headings + body), JetBrains Mono (montos calculados)
- Cargar ambas desde Google Fonts en BaseLayout.astro

### Style
- Border radius cards: rounded-xl (12px)
- Border radius botones: rounded-lg (8px)
- Sombra: shadow-sm en reposo, shadow-md en hover
- Transiciones: transition-all duration-200
- Aesthetic: limpio, profesional, corporativo — sin gradientes agresivos

### Íconos disponibles (QuickLinks)
`user-plus`, `clock`, `file-text`, `dollar-sign`, `receipt`, `calendar`, `envelope`, `user-question`

## Quick Links — Reglas de negocio

- **Aplican a todos:** Nuevo Ingreso, Cartas de Trabajo, Solicitud de Vacaciones
- **Solo personal Temporal:** Solicitud de Sobretiempos, Justificaciones, Consultas de Planilla, Gastos Reembolsables
  - Los títulos de estos incluyen `(Temporales)` para dejar clara la distinción
  - El personal fijo tiene sus propios sistemas y procesos para estos trámites

## Calculadoras — Reglas de negocio

### Sobretiempos (OvertimeCalc.astro)
Estructura de 13 categorías según PayDay (Planilla Computarizada de LAATS):

| Categoría | Factor |
|-----------|--------|
| ST Diurno DiaNor | ×1.25 |
| ST Mixto DiaNor | ×1.50 |
| ST Nocturno DiaNor | ×1.75 |
| ST Diurno DiaNor Rec | ×2.1875 |
| ST Mixto DiaNor Rec | ×2.625 |
| ST Nocturno DiaNor Rec | ×3.0625 |
| ST Diurno DiaDes | ×1.875 |
| ST Mixto DiaDes | ×2.25 |
| ST Nocturno DiaDes | ×2.625 |
| ST Diurno DiaDes Rec | ×3.28125 |
| ST Mixto DiaDes Rec | ×3.9375 |
| ST Nocturno DiaDes Rec | ×4.59375 |
| ST Feriado Nacional | ×2.50 |

**Tipos de empleado (afectan el divisor del salario hora):**
- **Fijo** (Rotación 6×2): salario mensual ÷ **182.5** horas
- **Temporal** (Rotación 6×1): salario mensual ÷ **208** horas

**Recargo:** aplica a partir de la **3.ª hora diaria** O la **9.ª hora semanal** de sobretiempo.
Los factores "Con Recargo" ya incluyen el multiplicador ×1.75 sobre el factor base.

### Vacaciones (VacationCalc.astro)
- Código de Trabajo Art. 54: 30 días por cada 11 meses trabajados
- Fórmula: (meses / 11) × 30 = días; (salario / 30) × días = monto
- Slider de 1 a 22 meses

### Décimo Tercer Mes (ThirteenthCalc.astro)
- Art. 43 CT — 3 cuotas de **4 meses** cada una:
  - Cuota Abril: período 16 dic → 15 abr
  - Cuota Agosto: período 16 abr → 15 ago
  - Cuota Diciembre: período 16 ago → 15 dic
- **Modo Salario fijo:** total período (salario × 4) ÷ 12 = salario ÷ 3
- **Modo Con sobretiempos:** (mes1 + mes2 + mes3 + mes4) ÷ 12

### Liquidación (LiquidationCalc.astro)
- Prima de antigüedad: 1 semana de salario por año trabajado
- Preaviso: <2 años=1sem, 2-5=2sem, 5-10=4sem, >10=6sem
- Resultado mostrado como "Total estimado" (no cifra definitiva)

### Disclaimer en todas las calculadoras
Todas muestran un aviso ámbar en el resultado:
> ⚠️ **Referencia orientativa.** Este cálculo tiene como objetivo brindar una referencia de cómo se obtienen los montos, pero el valor real siempre estará sujeto a la realidad particular de cada empleado.

## Ley Laboral Panameña (referencia)

- **Sobretiempo** — Ley 44 de 1995, Art. 26: Diurno ×1.25, Mixto ×1.50, Nocturno ×1.75, Descanso ×1.50 adicional, Feriado ×2.50 total. Recargo ×1.75 desde la 3.ª hora diaria o 9.ª semanal.
- **Vacaciones** — Código de Trabajo Art. 54: 30 días por 11 meses trabajados
- **Décimo tercer mes** — Art. 43 CT: 3 cuotas de 4 meses; fórmula = total devengado en período ÷ 12
- **Liquidación** — Prima de antigüedad: 1 semana/año. Preaviso: <2 años=1sem, 2-5=2sem, 5-10=4sem, >10=6sem

## Reglas No Negociables

1. Los factores de sobretiempo deben verificarse contra la estructura real de PayDay (Planilla Computarizada) antes de cualquier cambio.
2. El color primary y accent DEBEN ser extraídos de laats.net con DevTools — no usar valores aproximados sin verificar.
3. Todos los links en content.json deben tener URLs reales — nunca dejar placeholders.
4. El sitio debe verse correctamente en viewport de 375px (iPhone SE) antes del deploy.
5. Nunca instalar Alpine.js como paquete npm — siempre via CDN con SRI para mantener el build simple y seguro.
6. Nunca usar tags mutables en GitHub Actions — siempre SHA completo.
