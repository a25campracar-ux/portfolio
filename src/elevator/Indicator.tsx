import { motion } from 'framer-motion';
import { FLOORS, floorById, type FloorId } from '../floors';
import { doorEase } from '../motion';

interface Props {
  shown: FloorId;
  direction: -1 | 0 | 1;
  speed: number;
  digitDuration: number;
}

// Odómetro: una tira con todas las plantas (de abajo arriba) que se desplaza en Y.
// Al subir, el dígito nuevo entra desde abajo.
export function Indicator({ shown, direction, speed, digitDuration }: Props) {
  const index = FLOORS.findIndex((f) => f.id === shown);

  return (
    <div
      aria-hidden
      className="fixed top-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-md border border-white/10 bg-black/80 px-4 py-2 shadow-[0_10px_30px_rgb(0_0_0/0.5)]"
    >
      <span className="flex w-3 flex-col text-[10px] leading-[10px] text-accent">
        <motion.span animate={{ opacity: direction === 1 ? 1 : 0.15 }}>▲</motion.span>
        <motion.span animate={{ opacity: direction === -1 ? 1 : 0.15 }}>▼</motion.span>
      </span>
      <div className="h-[1em] w-[1ch] overflow-hidden font-mono text-4xl leading-none font-medium text-accent [text-shadow:0_0_12px_rgb(255_179_71/0.6)]">
        <motion.div
          initial={false}
          animate={{ y: `${-index}em` }}
          transition={{ duration: digitDuration / speed, ease: doorEase }}
        >
          {FLOORS.map((f) => (
            <div key={f.id} className="h-[1em]">
              {f.id}
            </div>
          ))}
        </motion.div>
      </div>
      <span className="w-[6.5rem] font-mono text-[11px] tracking-[0.2em] text-metal/70 uppercase">
        {floorById(shown).name}
      </span>
    </div>
  );
}
