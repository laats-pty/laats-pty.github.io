# Portal RRHH LAATS Panamá

Portal interno de Recursos Humanos para empleados de LAATS Panamá. Acceso rápido a formularios, calculadoras laborales y preguntas frecuentes.

---

## Cómo actualizar el contenido

Todo el contenido del sitio vive en un solo archivo: **`content/content.json`**.  
No necesitas instalar nada ni usar la terminal. Todo se hace desde GitHub directamente.

---

### Actualizar el link de un formulario

1. Ir al repositorio en GitHub
2. Clic en la carpeta **`content`** → clic en **`content.json`**
3. Clic en el ícono de **lápiz** (✏️) en la esquina superior derecha
4. Buscar el formulario que quieres actualizar (por ejemplo `"id": "sobretiempos"`)
5. Cambiar el valor de `"url"` con el link real del formulario
6. Bajar y hacer clic en **"Commit changes"**
7. El sitio se actualiza automáticamente en **2-3 minutos**

**Ejemplo:** cambiar el link de Solicitud de Sobretiempos:
```json
{
  "id": "sobretiempos",
  "url": "https://forms.office.com/r/TU_LINK_REAL_AQUI"
}
```

---

### Agregar una pregunta al FAQ

1. Abrir `content/content.json` en GitHub (mismo proceso de arriba)
2. Ir a la sección `"faq"` al final del archivo
3. Agregar un nuevo bloque **antes** del `]` de cierre:
```json
{
  "id": 7,
  "question": "¿Tu pregunta aquí?",
  "answer": "Tu respuesta aquí."
}
```
4. Asegurarse de poner una coma `,` después del bloque anterior
5. Commit changes → el sitio se actualiza solo

---

### Agregar un nuevo acceso rápido

1. Abrir `content/content.json`
2. Ir a la sección `"quickLinks"`
3. Agregar un nuevo objeto con todos sus campos:
```json
{
  "id": "mi-nuevo-link",
  "title": "Nombre del formulario",
  "description": "Descripción breve de para qué sirve",
  "icon": "file-text",
  "url": "https://link-al-formulario.com",
  "category": "Categoría"
}
```
4. Íconos disponibles: `user-plus`, `clock`, `file-text`, `dollar-sign`, `briefcase`, `receipt`, `calendar`

---

## Calculadoras laborales

Las calculadoras están basadas en la legislación laboral vigente de Panamá:

| Calculadora | Ley aplicada |
|-------------|-------------|
| Sobretiempos | Ley 44 de 1995, Art. 26 |
| Vacaciones | Código de Trabajo, Art. 54 |
| Décimo tercer mes | Código de Trabajo, Art. 43 |
| Liquidación | Ley 44 + Código de Trabajo |

---

## Comandos de desarrollo

| Comando | Acción |
|---------|--------|
| `npm run dev` | Servidor de desarrollo en localhost:4321 |
| `npm run build` | Build de producción (output en ./dist/) |
| `npm run preview` | Preview del build de producción |

---

## Contacto técnico

Para soporte técnico o cambios mayores al sitio: **asistentepanama@laats.net**
