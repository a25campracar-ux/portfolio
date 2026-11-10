# Portfolio "Elevator"

Portfolio en el que cada sección es una planta de un edificio y se navega en ascensor.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # genera dist/
npm run preview   # sirve dist/ para probarlo
```

No sirve con Live Server ni abriendo `index.html` a mano: hay que usar Vite (`npm run dev`).

## Tus textos

Todos están en [src/content.ts](src/content.ts). Sustituye lo que va entre corchetes.

## Añadir un proyecto

Cada proyecto es una carpeta dentro de `public/proyectos/`:

```
public/proyectos/
  mi-proyecto/
    index.html      ← el proyecto ya compilado (si es Vue/Vite: el contenido de su dist/)
    cover.png       ← captura (opcional; 16:10 queda mejor)
    project.json
```

`project.json`:

```json
{
  "title": "Mi proyecto",
  "year": 2026,
  "description": "Qué es y qué hiciste tú, en una o dos frases.",
  "tags": ["Vue", "Vite"],
  "cover": "cover.png",
  "entry": "index.html",
  "order": 1,
  "floor": "projects"
}
```

- El nombre de la carpeta es la URL de la ficha: `/projects/mi-proyecto`.
- `"floor": "lab"` lo manda al sótano (Lab) en lugar del pasillo de proyectos.
- `order` ordena el pasillo (de menor a mayor).
- Un proyecto de Vite debe compilarse con `base: '/proyectos/mi-proyecto/'` en su `vite.config` para que encuentre sus archivos.

Las carpetas `ejemplo-uno` y `ejemplo-dos` son de muestra: bórralas cuando tengas las tuyas.

## Publicar

Sube el contenido de `dist/`. El servidor tiene que devolver `index.html` para las rutas del portfolio (`/about`, `/projects/...`). Con nginx:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

## Sonidos

Se generan con `node scripts/make-sounds.mjs` (en `public/sounds/`). Están silenciados por defecto; el visitante los activa con el botón Sonido.
