# uNbox · Comercio exterior

Sitio web de **uNbox – Foreign Trade Solutions** y su **costeador de importaciones**, una herramienta para calcular el costo real de una importación por artículo.

## Estructura

```
UnBox/
├── index.html        Página principal del sitio
├── assets/           CSS, JS e imágenes de la página principal
├── costeo/           Costeador compilado (lo que se publica; no editar a mano)
├── costeador/        Código fuente del costeador (React + Vite + Tailwind)
│   └── src/
│       ├── pages/Costeador.tsx        Pantalla principal del costeador
│       ├── lib/costing.ts             Lógica de cálculo de costos
│       └── data/product-tax-data.ts   Catálogo tributario (productos, NCM y alícuotas)
└── unboxcomex.zip    Copia anterior del sitio
```

La página principal enlaza al costeador en `costeo/index.html`.

## Costeador de importaciones

A partir de los datos del embarque y de los artículos, el costeador:

- Distribuye flete, seguro, gastos y honorarios entre los artículos según su valor FOB.
- Aplica los impuestos de cada producto según el catálogo tributario (derechos, tasa de estadística, impuestos internos, IVA, IVA adicional, Ganancias e IIBB).
- Muestra el costo unitario final y el aumento sobre el FOB de cada artículo.
- Permite excluir IIBB, Ganancias o IVA adicional en toda la compra y ver cuánto se ahorra.
- Exporta el resultado a Excel (CSV) y a PDF (impresión).

Los porcentajes del catálogo son orientativos y no reemplazan la consulta oficial.

## Ver el sitio en local

Abrí `index.html` con doble clic: el sitio y el costeador funcionan sin servidor.

## Modificar el costeador

Requiere [Node.js](https://nodejs.org/) 20.19 o superior.

```bash
cd costeador
npm install      # solo la primera vez
npm run dev      # servidor de desarrollo con recarga automática
npm run check    # chequeo de tipos
npm run build    # compila y actualiza la carpeta ../costeo/
```

Los cambios se hacen en `costeador/src/`. Después de cada cambio hay que correr `npm run build` para que se actualice `costeo/`; si no, la página publicada no los muestra.

## Ramas

| Rama   | Uso                                                       |
|--------|-----------------------------------------------------------|
| `test` | Trabajo diario: todas las modificaciones se hacen acá.     |
| `dev`  | Producción. Recibe los cambios de `test` una vez probados. |

## Publicación

Subir al hosting el `index.html` principal y las carpetas `assets/` y `costeo/`. La carpeta `costeador/` es solo el código fuente y no hace falta publicarla.

## Licencia

[MIT](LICENSE)
