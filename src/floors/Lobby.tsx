import { content } from '../content';
import { FLOORS, type FloorId } from '../floors';
import { Eyebrow } from './Eyebrow';

// Planta L: recepción. Pared acanalada, luz cenital cálida y el directorio del edificio.
export function Lobby({ onCall }: { onCall: (id: FloorId) => void }) {
  return (
    <div className="absolute inset-0 overflow-y-auto bg-[#0f0e0d]">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgb(255_255_255/0.025)_0_2px,transparent_2px_56px,rgb(0_0_0/0.25)_56px_58px)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_50%_-5%,rgb(255_226_184/0.16),transparent_70%)]" />
        <div className="absolute inset-x-0 bottom-0 h-[22%] border-t border-white/10 bg-[linear-gradient(180deg,#171512,#0b0a09)]">
          <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(ellipse_40%_100%_at_50%_0%,rgb(255_226_184/0.08),transparent)]" />
        </div>
      </div>

      <div className="relative mx-auto flex min-h-full max-w-6xl flex-col justify-center gap-12 px-6 pt-28 pb-32 sm:px-12 sm:pr-56 lg:flex-row lg:items-center lg:justify-between">
        <header className="max-w-xl">
          <Eyebrow floor="L" />
          <h1
            id="floor-title"
            tabIndex={-1}
            className="mt-5 text-5xl leading-[1.02] font-extralight tracking-tight text-[#eef0f2] sm:text-7xl"
          >
            {content.name}
          </h1>
          <p className="mt-5 text-xl text-metal">{content.role}</p>
          <p className="mt-3 max-w-md leading-relaxed text-metal/70">{content.intro}</p>
        </header>

        <section
          aria-labelledby="directory-title"
          className="w-full max-w-sm shrink-0 rounded-[3px] bg-gradient-to-b from-[#cfae74] via-[#6f5a33] to-[#b8975e] p-[3px] shadow-[0_30px_60px_rgb(0_0_0/0.6)]"
        >
          <div className="bg-[#0b0b0c] bg-[repeating-linear-gradient(0deg,rgb(255_255_255/0.025)_0_1px,transparent_1px_4px)] px-6 py-5">
            <h2
              id="directory-title"
              className="font-mono text-[11px] tracking-[0.35em] text-[#d9c49a] uppercase"
            >
              Directorio
            </h2>
            <ul className="mt-3 divide-y divide-white/[0.06]">
              {[...FLOORS].reverse().map((f) => {
                const row = (
                  <>
                    <span className="w-6 text-accent">{f.id}</span>
                    <span className="flex-1">{f.blurb}</span>
                  </>
                );
                return (
                  <li key={f.id}>
                    {f.id === 'L' ? (
                      <div className="flex min-h-11 items-center gap-4 font-mono text-sm tracking-[0.15em] text-[#eae6dc] uppercase">
                        {row}
                        <span className="text-[10px] tracking-[0.2em] text-accent/80">Estás aquí</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onCall(f.id)}
                        className="group flex min-h-11 w-full items-center gap-4 text-left font-mono text-sm tracking-[0.15em] text-[#eae6dc] uppercase"
                      >
                        {row}
                        <span
                          aria-hidden
                          className="-translate-x-1 text-accent opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:opacity-100"
                        >
                          →
                        </span>
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
