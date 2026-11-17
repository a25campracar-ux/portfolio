# Portfolio "Elevator"

Portfolio en el que cada sección es una planta de un edificio y se navega en ascensor.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # genera dist/
npm run preview   # sirve dist/ para probarlo
```

Usar Vite (`npm run dev`).

## Tus textos

Todos están en [src/content.ts](src/content.ts). Sustituye lo que va entre corchetes.

## Añadir un proyecto

Cada proyecto es una carpeta dentro de `public/proyectos/` con su ficha y una captura:

```
public/proyectos/
  time-attack/
    project.json
    cover.png       ← captura 16:10 (1440×900)
```

`project.json`:

```json
{
  "title": "Time Attack",
  "year": 2026,
  "description": "Qué es, en una o dos frases.",
  "tags": ["Vue 3", "Pinia"],
  "cover": "cover.png",
  "link": "http://a25campracar.daw.inspedralbes.cat/time-attack/",
  "repo": "https://github.com/a25campracar-ux/timeAttackGame",
  "how": ["Paso 1 de lo que ve y hace quien lo abre", "Paso 2…"],
  "basics": ["Tecnología o decisión técnica", "…"],
  "order": 1
}
```

- La ficha muestra la captura, la descripción, **Cómo funciona** (`how`) y **Bases del proyecto** (`basics`), con los botones *Abrir proyecto* (`link`) y *Ver código* (`repo`, se omite si el repo es privado).
- Si no hay `link`, se enlaza la copia compilada que haya en la propia carpeta (`entry`, por defecto `index.html`).
- El nombre de la carpeta es la URL de la ficha: `/projects/time-attack`.
- `"floor": "lab"` lo manda al sótano (Lab) en lugar del pasillo de proyectos.
- `order` ordena el pasillo (de menor a mayor).

## Publicar

Todo el despliegue (este portfolio y los proyectos) está en [`deploy/`](deploy/README.md):

```bash
deploy/deploy.sh portfolio
```

`public/.htaccess` hace que `/about`, `/projects/...` funcionen al recargar (el servidor es nginx + Apache).

## Sonidos

Se generan con `node scripts/make-sounds.mjs` (en `public/sounds/`). Están silenciados por defecto; el visitante los activa con el botón Sonido.
