# Libro — Sistema de Facturación

Sistema de facturación simple hecho con **HTML, CSS y JavaScript puro** (sin frameworks, sin backend). Todos los datos se guardan en el `localStorage` del navegador.

## Funciones

- Alta de clientes (nombre, ID fiscal, correo, teléfono, dirección)
- Creación de facturas con líneas de producto/servicio, cálculo automático de subtotal, impuesto y total
- Folio consecutivo automático
- Registro/historial de facturas con buscador
- Estados: **Pendiente**, **Pagada**, **Vencida** (automático según fecha de vencimiento)
- Vista de factura lista para imprimir o guardar como PDF (`Ctrl/Cmd + P`)
- Datos del negocio configurables (nombre, moneda, prefijo de folio, contacto)

## Uso local

Solo abre `index.html` en tu navegador. No requiere servidor ni instalación.

## Publicar en GitHub Pages

1. Crea un repositorio nuevo y sube estos archivos (`index.html`, `style.css`, `script.js`).
2. Ve a **Settings → Pages**.
3. En "Branch", elige `main` y la carpeta `/root`, luego **Save**.
4. En unos minutos tu sistema estará disponible en `https://tu-usuario.github.io/nombre-repo/`.

## Estructura de archivos

```
├── index.html   → estructura de la app
├── style.css    → estilos (tema "libro contable")
├── script.js    → lógica: clientes, facturas, totales, registro
└── README.md
```

## Notas

- Los datos (clientes, facturas, configuración) se guardan **solo en el navegador en el que se usa** vía `localStorage`. Si necesitas que varias personas compartan la misma información, este proyecto tendría que conectarse a una base de datos (por ejemplo Firebase, Supabase o un backend propio) — puedo ayudarte a extenderlo si lo necesitas .

