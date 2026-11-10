import { motion } from 'framer-motion';
import { FLOORS, type FloorId } from '../floors';
import { spring } from '../motion';

interface Props {
  /** Botón encendido: el destino en marcha o la planta actual en reposo. */
  lit: FloorId;
  /** Planta actual con las puertas abiertas (para aria-current). */
  here: FloorId | null;
  onPress: (id: FloorId) => void;
}

// De arriba abajo, como en un panel real: 3, 2, 1, L, B. En móvil, en fila de B a 3.
const ORDER = [...FLOORS].reverse();

export function Panel({ lit, here, onPress }: Props) {
  return (
    <nav
      aria-label="Plantas"
      className="fixed bottom-3 left-1/2 z-40 -translate-x-1/2 rounded-2xl border border-white/10 bg-[#141416]/90 p-2 shadow-[0_20px_50px_rgb(0_0_0/0.6)] backdrop-blur-md sm:top-1/2 sm:right-6 sm:bottom-auto sm:left-auto sm:translate-x-0 sm:-translate-y-1/2 sm:p-4"
    >
      <ul className="flex flex-row-reverse gap-2 sm:flex-col sm:gap-3">
        {ORDER.map((f) => {
          const on = f.id === lit;
          return (
            <li key={f.id}>
              <button
                type="button"
                onClick={() => onPress(f.id)}
                aria-label={`Planta ${f.id}: ${f.name}`}
                aria-current={here === f.id ? 'page' : undefined}
                className="group flex w-full items-center justify-end gap-3 rounded-full"
              >
                <span
                  className={`hidden font-mono text-[11px] tracking-[0.2em] uppercase transition-opacity duration-300 sm:block ${
                    on ? 'text-accent opacity-100' : 'text-metal opacity-50 group-hover:opacity-90'
                  }`}
                >
                  {f.name}
                </span>
                <motion.span
                  whileTap={{ scale: 0.92 }}
                  transition={spring}
                  className="relative grid size-12 place-items-center rounded-full border border-white/15 bg-gradient-to-b from-[#2a2c30] to-[#18191b] font-mono text-base font-medium shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_2px_4px_rgb(0_0_0/0.6)]"
                >
                  <span className="absolute inset-0 rounded-full bg-white/5 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                  <motion.span
                    className="absolute inset-0 rounded-full border border-accent shadow-[0_0_18px_rgb(255_179_71/0.55),inset_0_0_10px_rgb(255_179_71/0.35)]"
                    initial={false}
                    animate={{ opacity: on ? 1 : 0 }}
                    transition={{ duration: 0.15 }}
                  />
                  <span className={`relative ${on ? 'text-accent' : 'text-metal'}`}>{f.id}</span>
                </motion.span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
