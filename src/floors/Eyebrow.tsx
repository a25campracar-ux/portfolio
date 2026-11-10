import { floorById, type FloorId } from '../floors';

export function Eyebrow({ floor, className = 'text-accent' }: { floor: FloorId; className?: string }) {
  const f = floorById(floor);
  return (
    <p className={`font-mono text-[11px] tracking-[0.3em] uppercase ${className}`}>
      Planta {f.id} · {f.name}
    </p>
  );
}
