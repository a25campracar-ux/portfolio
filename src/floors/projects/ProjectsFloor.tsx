import { useEffect, useRef, useState } from 'react';
import { useLocation, useMatch, useNavigate } from 'react-router';
import { PROJECTS } from '../../projects';
import { Eyebrow } from '../Eyebrow';
import { Corridor } from './Corridor';
import { ProjectSheet } from './ProjectSheet';

const nn = (i: number) => String(i).padStart(2, '0');

// Planta 1: pasillo de proyectos. /projects/:slug abre la ficha encima del pasillo.
export function ProjectsFloor({ active, reduced }: { active: boolean; reduced: boolean }) {
  const match = useMatch('/projects/:slug');
  const location = useLocation();
  const navigate = useNavigate();
  const slug = match?.params.slug;
  const openIndex = slug ? PROJECTS.findIndex((p) => p.slug === slug) : -1;
  const [index, setIndex] = useState(Math.max(0, openIndex));
  const control = useRef<{ goTo: (i: number) => void; step: (d: number) => void } | null>(null);
  const n = PROJECTS.length;

  // Una ficha que no existe vuelve al pasillo.
  useEffect(() => {
    if (slug && openIndex < 0) navigate('/projects', { replace: true });
  }, [slug, openIndex, navigate]);

  useEffect(() => {
    if (openIndex >= 0) control.current?.goTo(openIndex);
  }, [openIndex]);

  const close = () => {
    const from = openIndex;
    if ((location.state as { fromCorridor?: boolean } | null)?.fromCorridor) navigate(-1);
    else navigate('/projects', { replace: true });
    // Devuelve el foco a la tarjeta de la que venía.
    window.setTimeout(() => {
      document.querySelectorAll<HTMLElement>('.corridor-card')[from]?.focus({ preventScroll: true });
    }, 0);
  };

  if (n === 0) {
    return (
      <div className="absolute inset-0 grid place-items-center bg-[#0c0c0d] px-6">
        <div className="max-w-md text-center">
          <Eyebrow floor="1" />
          <h1 id="floor-title" tabIndex={-1} className="mt-4 text-4xl font-extralight text-[#eef0f2]">
            Proyectos
          </h1>
          <p className="mt-4 text-metal/70">[Añade una carpeta con su project.json en public/proyectos]</p>
        </div>
      </div>
    );
  }

  const sheetOpen = openIndex >= 0;

  return (
    <div className="absolute inset-0 bg-[#0c0c0d]">
      <Corridor
        projects={PROJECTS}
        active={active && !sheetOpen}
        reduced={reduced}
        startAt={Math.max(0, openIndex)}
        onIndex={setIndex}
        controlRef={control}
      />

      <header className="pointer-events-none absolute top-24 left-6 z-10 sm:top-28 sm:left-12">
        <Eyebrow floor="1" />
        <h1
          id="floor-title"
          tabIndex={-1}
          className="mt-3 text-3xl font-extralight tracking-tight text-[#eef0f2] sm:text-5xl"
        >
          Proyectos
        </h1>
        <p className="mt-2 font-mono text-[11px] tracking-[0.2em] text-metal/60 uppercase">
          {n} {n === 1 ? 'proyecto' : 'proyectos'}
        </p>
      </header>

      <div className="absolute bottom-24 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 sm:bottom-8">
        <button
          type="button"
          aria-label="Proyecto anterior"
          disabled={index === 0}
          onClick={() => control.current?.step(-1)}
          className="grid size-11 place-items-center rounded-full border border-white/15 bg-black/60 text-metal transition-[opacity,transform] active:scale-95 disabled:opacity-30"
        >
          ←
        </button>
        <p aria-live="polite" className="w-56 truncate text-center font-mono text-[11px] tracking-[0.15em] text-metal/80 uppercase">
          <span className="text-accent">{nn(index + 1)}</span> / {nn(n)} · {PROJECTS[index]?.title}
        </p>
        <button
          type="button"
          aria-label="Proyecto siguiente"
          disabled={index === n - 1}
          onClick={() => control.current?.step(1)}
          className="grid size-11 place-items-center rounded-full border border-white/15 bg-black/60 text-metal transition-[opacity,transform] active:scale-95 disabled:opacity-30"
        >
          →
        </button>
      </div>
      <p className="pointer-events-none absolute bottom-10 left-12 z-10 hidden font-mono text-[10px] tracking-[0.2em] text-metal/40 uppercase lg:block">
        Rueda, arrastra o usa ← →
      </p>

      {sheetOpen && (
        <ProjectSheet project={PROJECTS[openIndex]} index={openIndex} reduced={reduced} onClose={close} />
      )}
    </div>
  );
}
