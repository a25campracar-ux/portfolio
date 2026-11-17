import fs from 'node:fs';
import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Lee public/proyectos/<carpeta>/project.json y lo expone como `virtual:projects`.
 * Añadir o borrar una carpeta basta: en desarrollo recarga sola, y en build se lee al compilar.
 */
function projectsManifest(): Plugin {
  const virtualId = 'virtual:projects';
  const resolvedId = '\0' + virtualId;
  const dir = path.resolve(__dirname, 'public/proyectos');

  const read = () => {
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .flatMap((d) => {
        const file = path.join(dir, d.name, 'project.json');
        if (!fs.existsSync(file)) return [];
        try {
          const meta = JSON.parse(fs.readFileSync(file, 'utf8'));
          const base = `/proyectos/${d.name}/`;
          return [
            {
              slug: d.name,
              title: meta.title ?? d.name,
              year: meta.year ?? null,
              description: meta.description ?? '',
              tags: meta.tags ?? [],
              cover: meta.cover ? base + meta.cover : null,
              // Si el proyecto vive en su propia URL ("link"), la ficha enlaza allí;
              // si no, a la copia compilada dentro de esta carpeta ("entry").
              url: meta.link ?? base + (meta.entry ?? 'index.html'),
              repo: meta.repo ?? null,
              how: meta.how ?? [],
              basics: meta.basics ?? [],
              // Solo para el Lab (cuaderno de laboratorio)
              estado: meta.estado ?? null,
              bitacora: meta.bitacora ?? [],
              ia: meta.ia ?? null,
              muestra: meta.muestra ? base + meta.muestra : null,
              pie: meta.pie ?? null,
              floor: meta.floor === 'lab' ? 'lab' : 'projects',
              order: meta.order ?? 0,
            },
          ];
        } catch (err) {
          console.warn(`[proyectos] ${file} no es JSON válido:`, (err as Error).message);
          return [];
        }
      })
      .sort((a, b) => a.order - b.order || (b.year ?? 0) - (a.year ?? 0));
  };

  return {
    name: 'projects-manifest',
    resolveId: (id) => (id === virtualId ? resolvedId : undefined),
    load: (id) => (id === resolvedId ? `export default ${JSON.stringify(read())};` : undefined),
    configureServer(server) {
      server.watcher.add(dir);
      const onChange = (file: string) => {
        if (!file.startsWith(dir)) return;
        const mod = server.moduleGraph.getModuleById(resolvedId);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: 'full-reload' });
      };
      for (const ev of ['add', 'change', 'unlink', 'addDir', 'unlinkDir'] as const) {
        server.watcher.on(ev, onChange);
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), projectsManifest()],
});
