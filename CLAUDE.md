# Portal RRHH LAATS Panamá

Sitio estático de recursos humanos para LAATS Panamá. Construido con Astro 7 + Tailwind CSS v4 + Alpine.js (CDN). Sin base de datos, sin backend, sin auth. Deploy automático a GitHub Pages via GitHub Actions.

**URL de producción:** https://laats-pty.github.io

## Commands

- `npm run dev` — Servidor de desarrollo en localhost:4321
- `npm run build` — Build de producción (output en ./dist/)
- `npm run preview` — Preview del build de producción
- `npm test` — Pruebas de las calculadoras (`tests/calculations.test.ts`, runner nativo de Node)

## Tech Stack

Astro 7 (static) + TypeScript (strict) + Tailwind CSS v4 + Alpine.js v3.17.5, build CSP (CDN) + GitHub Pages

## Architecture

### Directory Structure
- `src/components/layout/` — Header, Footer, BaseLayout
- `src/components/sections/` — Hero, QuickLinks, Calculators, FAQ
- `src/components/calculators/` — Las 4 calculadoras individuales con Alpine.js
- `src/lib/` — calculations.ts (lógica pura de cálculo + datos de factores), types.ts
- `src/scripts/calculators.ts` — Componentes Alpine (`Alpine.data`): calculadoras (llaman a calculations.ts), pestañas, encabezado (`siteHeader`) y año del pie (`currentYear`)
- `src/styles/globals.css` — Tokens de color y clases compartidas (`.field`, `.btn-primary`, `.toggle`, `.result-box`, `.disclaimer`, `.eyebrow`, `.card-link`)
- `tests/` — Casos de prueba de las calculadoras
- `src/pages/index.astro` — Página única que ensambla todas las secciones
- `content/content.json` — Fuente de verdad del contenido: lema, textos de cada sección (`sections`), links y FAQs
- `public/` — Assets estáticos (logo: logo-laats.jpg; favicon.ico = ícono oficial de laats.net)
- `.github/workflows/deploy.yml` — Pipeline de deploy a GitHub Pages
- `.github/dependabot.yml` — Actualizaciones automáticas de dependencias

### Data Flow
content.json → importado en build time → props de componentes Astro → HTML estático
calculations.ts → importado por los .astro (tablas, en build) y por scripts/calculators.ts (cálculo, en el navegador)
Alpine.js → estado local de cada calculadora → sin llamadas a red

### Key Patterns
- Todo el contenido (links, FAQs) viene de content.json — nunca hardcodear strings en componentes
- Las funciones de cálculo viven en calculations.ts como funciones TypeScript puras — sin lógica en los componentes Alpine
- Alpine.js se carga via CDN con SRI (integrity hash) — no instalar el paquete npm
- Cada sección tiene ID de anchor para smooth scroll desde el nav
- Todas las URLs en QuickLinks pasan por `safeUrl()` que valida protocolo https:/http:
- El FAQ usa `<details name="faq">` nativo: funciona sin Alpine y no interpola contenido en expresiones
- El script de componentes va ANTES del `<script>` de Alpine en BaseLayout (se registra en `alpine:init`)
- No usar manejadores en línea (`onclick=`, `onmouseover=`): la CSP los bloquea. Hover/foco se hacen con CSS
- `astro.config.mjs` fija `assetsInlineLimit: 0` para que ningún script salga en línea (la CSP no admite `'unsafe-inline'` en scripts)

## Security

### Content Security Policy (meta tag en BaseLayout.astro)
```
default-src 'none';
script-src 'self' https://cdn.jsdelivr.net;
style-src 'self' 'unsafe-inline';
font-src 'self';
img-src 'self' data:;
connect-src 'none';
base-uri 'self';
form-action 'none';
```
- Sin `'unsafe-eval'`: se usa el build CSP de Alpine (`@alpinejs/csp`). Sus expresiones no pueden leer globales (`window`), ni usar funciones flecha, plantillas, desestructuración o asignar a propiedades anidadas; esa lógica va en un componente `Alpine.data` de `src/scripts/calculators.ts`.
- `form-action 'none'`: la página no tiene formularios propios; los trámites son enlaces.
- `Referrer-Policy` va como `<meta name="referrer">`. `Permissions-Policy` no se puede fijar por meta ni en GitHub Pages.

### Alpine.js CDN con SRI
```html
<script src="https://cdn.jsdelivr.net/npm/@alpinejs/csp@3.17.5/dist/cdn.min.js"
  integrity="sha384-Q4UOujiwqAb/jTt3ki4pdkETk4I3rIFQX8h271PLI41okj/YIKY7IQQFMw73wkrX"
  crossorigin="anonymous" defer></script>
```

### GitHub Actions — SHAs fijos (no usar tags mutables)
Los SHA vigentes están en `.github/workflows/deploy.yml` (los actualiza Dependabot). El comentario
junto a cada SHA debe decir la versión real. El workflow corre `npm test` y `npm run build`; en
pull requests solo compila y prueba, y solo despliega en push a `main`.

## Code Organization Rules

1. **Contenido en content.json.** Nunca hardcodear texto de links, FAQs ni encabezados de sección en componentes. Los textos publicables los redacta Codex.
2. **Lógica de cálculo en calculations.ts.** Los componentes Astro no hacen matemática — solo llaman funciones.
3. **Un componente por archivo.** Máximo 150 líneas por archivo .astro. Lo repetitivo (filas, campos) se genera desde datos, no se copia.
4. **Alpine.js solo para interactividad.** No usar para renderizar contenido estático.
5. **Mobile-first.** Todas las clases responsive empiezan en mobile, se sobrescriben con md: y xl:.

## Design System

### Colors
Primario y acento son los de laats.net (extraídos del sitio el 2026-11-16).
- Primary: #275B88 (azul LAATS — header, hero, botones, iconos)
- Primary Dark: #1B4266 (hover de primary, pie)
- Accent: #C59704 (dorado LAATS — botón principal del hero, badges). Solo como FONDO o adorno
- Accent text: #7A5C00 (dorado oscuro para TEXTO sobre fondo claro; el dorado puro da 2.7:1)
- Accent on dark: #FFD45C (dorado claro para texto y foco sobre el azul; 5.1:1)
- Background: #EEF2F7 (fondo de página)
- Surface: #FFFFFF (cards, calculadoras)
- Text: #1E293B (texto principal; también sobre el botón dorado, 5.4:1)
- Muted: #56657A (texto secundario; 5.3:1 sobre el fondo)
- Success: #059669 (resultado de calculadoras)
- Border: #DDE3EC (bordes de cards) · Field border: #8492A6 (bordes de campos, 3:1)

### Typography
- Fuente: Montserrat (la de laats.net; headings + body), JetBrains Mono (montos calculados)
- Alojadas en el propio sitio con `@fontsource-variable/*` (se importan en BaseLayout.astro y se declaran en `@theme`). No usar Google Fonts: la CSP no admite orígenes externos de fuentes ni estilos

### Style
- Border radius cards: rounded-xl (12px)
- Border radius botones: rounded-lg (8px)
- Sombra: shadow-sm en reposo, shadow-md en hover
- Transiciones: 200 ms; se anulan con `prefers-reduced-motion`
- Foco: `:focus-visible` global (azul sobre claro, dorado claro dentro de `.on-dark`)
- Aesthetic: limpio, profesional, corporativo — hero de color plano, sin texturas ni manchas difuminadas

### Íconos disponibles (QuickLinks)
`user-plus`, `clock`, `file-text`, `dollar-sign`, `receipt`, `calendar`, `envelope`, `user-question`

## Quick Links — Reglas de negocio

Cada link lleva `audience` en content.json y la sección se pinta en dos grupos (textos en `sections.accesos.groups`):
- **Para todo el personal (`todos`):** Nuevo Ingreso, Cartas de Trabajo, Solicitud de Vacaciones, Consultas de Planilla
  - Consultas de Planilla la usan ambos: el temporal registra ahí toda consulta; el fijo consulta por la plataforma de Copa y usa este formulario cuando necesita atención personalizada o presencial (RRHH decide si se atiende presencialmente)
- **Solo para personal temporal (`temporal`):** Solicitud de Sobretiempos, Justificaciones, Gastos Reembolsables
  - El personal fijo tiene sus propios sistemas y procesos para estos trámites
- Los formularios de Google piden iniciar sesión y no todo el personal tiene cuenta: la tarjeta muestra la nota `sections.accesos.googleNote` cuando la URL es de `docs.google.com` o `forms.gle`

## Calculadoras — Reglas de negocio

### Sobretiempos (OvertimeCalc.astro; datos en `OVERTIME_GROUPS` de calculations.ts)
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

**Grupos desplegables:** los 5 grupos de la tabla entran cerrados; cada encabezado es un botón (`aria-expanded`) y, cerrado, muestra las horas y el monto ya ingresados en ese grupo.

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
Reglas contrastadas con el Código de Trabajo el 2026-11-17 (fuentes y pendientes en Contexto-IA, `propuesta-liquidacion-2026-11-17.md`):
- Dos selectores: **tipo de contrato** (indefinido / definido) y **motivo de salida** (renuncia, mutuo acuerdo o despido justificado / despido injustificado)
- Prima de antigüedad (arts. 224 y 226): 1 semana de salario por año, **proporcional por fracción de año**. Solo contrato indefinido, en cualquier motivo de salida
- Indemnización (art. 225-C): 3.4 semanas por año en los primeros 10 años y 1 semana por año desde el 11, proporcional. Solo contrato indefinido con despido injustificado
- Contrato por tiempo definido: sin prima ni indemnización; solo vacaciones y décimo
- Vacaciones: (salario ÷ 30) × días pendientes. Décimo: salario × meses del período actual ÷ 12 (máx. 4)
- Salario semanal = salario mensual × 12 ÷ 52
- **No hay fila de preaviso**: la escala 1/2/4/6 semanas que tuvo la calculadora no existe en la ley. No volver a añadirla
- No calcula salarios pendientes, deducciones, preaviso del art. 212 ni recargos por proceso; lo dice una nota bajo el total
- Resultado mostrado como "Total estimado" (no cifra definitiva)

### Disclaimer en todas las calculadoras
Todas muestran un aviso dorado en el resultado:
> ⚠️ **Referencia orientativa.** Este cálculo tiene como objetivo brindar una referencia de cómo se obtienen los montos, pero el valor real siempre estará sujeto a la realidad particular de cada empleado.

## Ley Laboral Panameña (referencia)

- **Sobretiempo** — Ley 44 de 1995, Art. 26: Diurno ×1.25, Mixto ×1.50, Nocturno ×1.75, Descanso ×1.50 adicional, Feriado ×2.50 total. Recargo ×1.75 desde la 3.ª hora diaria o 9.ª semanal.
- **Vacaciones** — Código de Trabajo Art. 54: 30 días por 11 meses trabajados
- **Décimo tercer mes** — Art. 43 CT: 3 cuotas de 4 meses; fórmula = total devengado en período ÷ 12
- **Liquidación** — Prima de antigüedad (art. 224): 1 semana por año, proporcional, solo contrato indefinido. Indemnización por despido injustificado (art. 225): 3.4 semanas por año hasta 10 años, 1 semana por año después

## Reglas No Negociables

1. Los factores de sobretiempo deben verificarse contra la estructura real de PayDay (Planilla Computarizada) antes de cualquier cambio.
2. El color primary y accent son los de laats.net (#275B88 y #C59704). Si el sitio cambia, se vuelven a extraer con DevTools — no usar valores aproximados sin verificar.
3. Todos los links en content.json deben tener URLs reales — nunca dejar placeholders.
4. El sitio debe verse correctamente en viewport de 360–375px antes del deploy.
5. Nunca instalar Alpine.js como paquete npm — siempre via CDN con SRI para mantener el build simple y seguro.
6. Nunca usar tags mutables en GitHub Actions — siempre SHA completo.
