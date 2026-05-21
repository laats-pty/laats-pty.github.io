# Portal RRHH LAATS Panamá

Sitio estático de recursos humanos para LAATS Panamá. Construido con Astro 5 + Tailwind CSS v4 + Alpine.js (CDN). Sin base de datos, sin backend, sin auth. Deploy automático a GitHub Pages via GitHub Actions.

## Commands

- `npm run dev` — Servidor de desarrollo en localhost:4321
- `npm run build` — Build de producción (output en ./dist/)
- `npm run preview` — Preview del build de producción

## Tech Stack

Astro 5 (static) + TypeScript (strict) + Tailwind CSS v4 + Alpine.js v3 (CDN) + GitHub Pages

## Architecture

### Directory Structure
- `src/components/layout/` — Header, Footer, BaseLayout
- `src/components/sections/` — Hero, QuickLinks, Calculators, FAQ
- `src/components/calculators/` — Las 4 calculadoras individuales con Alpine.js
- `src/lib/` — calculations.ts (lógica pura de cálculo), types.ts
- `src/pages/index.astro` — Página única que ensambla todas las secciones
- `content/content.json` — Fuente de verdad del contenido: links y FAQs
- `public/` — Assets estáticos (logo, favicon)
- `.github/workflows/deploy.yml` — Pipeline de deploy a GitHub Pages

### Data Flow
content.json → importado en build time → props de componentes Astro → HTML estático
Alpine.js → estado local de cada calculadora → sin llamadas a red

### Key Patterns
- Todo el contenido (links, FAQs) viene de content.json — nunca hardcodear strings en componentes
- Las funciones de cálculo viven en calculations.ts como funciones TypeScript puras — sin lógica en los componentes Alpine
- Alpine.js se carga via CDN — no instalar el paquete npm
- Cada sección tiene ID de anchor para smooth scroll desde el nav

## Code Organization Rules

1. **Contenido en content.json.** Nunca hardcodear texto de links o FAQs en componentes.
2. **Lógica de cálculo en calculations.ts.** Los componentes Astro no hacen matemática — solo llaman funciones.
3. **Un componente por archivo.** Máximo 150 líneas por archivo .astro.
4. **Alpine.js solo para interactividad.** No usar para renderizar contenido estático.
5. **Mobile-first.** Todas las clases responsive empiezan en mobile, se sobrescriben con md: y xl:.

## Design System

### Colors (verificar contra laats.net antes de confirmar)
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

## Ley Laboral Panameña (referencia)

- **Sobretiempo** — Ley 44 de 1995, Art. 26: Diurno ×1.25, Nocturno ×1.50, Feriado ×2.00
- **Vacaciones** — Código de Trabajo Art. 54: 30 días por 11 meses trabajados
- **Décimo tercer mes** — Art. 43 CT: 1 mes de salario/año, en 3 cuotas (abril/agosto/diciembre)
- **Liquidación** — Prima de antigüedad: 1 semana/año. Preaviso: <2 años=1sem, 2-5=2sem, 5-10=4sem, >10=6sem

## Reglas No Negociables

1. Los cálculos deben verificarse contra los casos de prueba de la sección 13 del blueprint antes de considerar la feature completa.
2. El color primary y accent DEBEN ser extraídos de laats.net con DevTools — no usar los valores aproximados del blueprint sin verificar.
3. Todos los links en content.json que digan "REEMPLAZAR_CON_LINK_REAL" deben ser reemplazados con los URLs reales de los formularios existentes.
4. El sitio debe verse correctamente en viewport de 375px (iPhone SE) antes del deploy.
5. Nunca instalar Alpine.js como paquete npm — siempre via CDN para mantener el build simple.
