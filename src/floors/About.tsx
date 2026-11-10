import { motion } from 'framer-motion';
import { content } from '../content';
import { Eyebrow } from './Eyebrow';

// Planta 2: estudio. Madera oscura, lámpara cálida y la sombra de una persiana en la pared.
export function About({ reduced }: { reduced: boolean }) {
  const { about } = content;
  return (
    <div className="absolute inset-0 overflow-y-auto bg-[#120e0a]">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_60%_at_8%_0%,rgb(255_194_122/0.22),transparent_70%)]" />
        <motion.div
          className="absolute top-[-10%] right-[-15%] h-[120%] w-[75%] rotate-[-12deg] bg-[repeating-linear-gradient(180deg,rgb(255_194_122/0.075)_0_30px,transparent_30px_52px)] [mask-image:radial-gradient(ellipse_50%_45%_at_50%_50%,black,transparent)]"
          animate={reduced ? undefined : { x: [0, 24, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      <div className="relative mx-auto flex min-h-full max-w-6xl flex-col justify-center px-6 pt-28 pb-32 sm:px-12 sm:pr-56">
        <Eyebrow floor="2" className="text-[#ffc27a]" />
        <h1
          id="floor-title"
          tabIndex={-1}
          className="mt-6 max-w-4xl text-4xl leading-[1.08] font-extralight tracking-tight text-[#f3ece3] sm:text-6xl"
        >
          {about.headline}
        </h1>

        <div className="mt-12 grid max-w-4xl gap-8 text-lg leading-relaxed text-[#d8cfc4]/85 md:grid-cols-2">
          {about.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>

        <dl className="mt-14 grid max-w-4xl gap-6 border-t border-[#ffc27a]/15 pt-8 sm:grid-cols-3">
          {about.facts.map((f) => (
            <div key={f.label}>
              <dt className="font-mono text-[11px] tracking-[0.25em] text-[#ffc27a]/70 uppercase">{f.label}</dt>
              <dd className="mt-2 text-[#f3ece3]">{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
