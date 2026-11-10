import type { Project } from '../../projects';

// Captura del proyecto o, si no tiene, una portada tipográfica.
export function Cover({ project, index, className = '' }: { project: Project; index: number; className?: string }) {
  if (project.cover) {
    return (
      <img
        src={project.cover}
        alt=""
        loading="lazy"
        draggable={false}
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }
  return (
    <div
      className={`flex h-full w-full items-end bg-[linear-gradient(135deg,#1d1e21,#111214)] p-[6%] ${className}`}
    >
      <span className="font-mono text-[3em] leading-none font-light text-white/10">
        {String(index + 1).padStart(2, '0')}
      </span>
    </div>
  );
}
