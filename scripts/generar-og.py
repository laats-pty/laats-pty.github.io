"""Genera public/og-portal.jpg (vista previa del enlace en WhatsApp y Teams).

Uso, desde la raíz del repo:  python scripts/generar-og.py
Requiere: pip install pillow fonttools brotli

Todo el contenido va dentro del cuadrado central de 630 x 630 px, porque
WhatsApp recorta la imagen a ese cuadrado en la miniatura. El logo es el
archivo oficial (public/logo-laats.jpg), sin redibujar.
"""
import tempfile
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from PIL import Image, ImageDraw, ImageFont

RAIZ = Path(__file__).resolve().parent.parent
AZUL, DORADO = "#275B88", "#C59704"
W, H, S = 1200, 630, 2  # S: supermuestreo para bordes limpios
LINEAS = ("Portal RRHH", "LAATS Panamá")

# Montserrat 700 a partir de la fuente variable que ya usa el sitio.
fuente = TTFont(RAIZ / "node_modules/@fontsource-variable/montserrat/files/montserrat-latin-wght-normal.woff2")
fuente = instancer.instantiateVariableFont(fuente, {"wght": 700})
fuente.flavor = None
ttf = Path(tempfile.gettempdir()) / "Montserrat-Bold-og.ttf"
fuente.save(ttf)

im = Image.new("RGB", (W * S, H * S), AZUL)
dr = ImageDraw.Draw(im)

cw, ch, cy = 440, 236, 62  # tarjeta blanca del logo
cx = (W - cw) // 2
dr.rounded_rectangle((cx * S, cy * S, (cx + cw) * S, (cy + ch) * S), radius=22 * S, fill="white")
logo = Image.open(RAIZ / "public/logo-laats.jpg").convert("RGB")
lw = cw - 36
lh = round(lw * logo.height / logo.width)  # conserva la proporción oficial
im.paste(logo.resize((lw * S, lh * S), Image.LANCZOS), (((W - lw) // 2) * S, (cy + (ch - lh) // 2) * S))

titulo = ImageFont.truetype(str(ttf), 70 * S)
y = cy + ch + 38
for linea in LINEAS:
    ancho = dr.textlength(linea, font=titulo)
    assert ancho <= (H - 40) * S, "el título se sale del cuadrado central"
    dr.text(((W * S - ancho) / 2, y * S), linea, font=titulo, fill="white")
    y += 84
y += 22
dr.rounded_rectangle(((W // 2 - 90) * S, y * S, (W // 2 + 90) * S, (y + 6) * S), radius=3 * S, fill=DORADO)

im.resize((W, H), Image.LANCZOS).save(RAIZ / "public/og-portal.jpg", quality=90, optimize=True, progressive=True)
print("public/og-portal.jpg generado")
