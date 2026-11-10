import { motion } from 'framer-motion';
import type { CSSProperties } from 'react';
import { doorEase, type Timings } from '../motion';
import type { Phase } from './useElevator';

interface Props {
  phase: Phase;
  direction: -1 | 0 | 1;
  speed: number;
  timings: Timings;
  /** Color de la luz de la planta de destino. */
  light: string;
  reduced: boolean;
}

const SHAFT_PERIOD = 360; // px, igual que el patrón de .shaft-light

export function Doors({ phase, direction, speed, timings, light, reduced }: Props) {
  const open = phase === 'opening' || phase === 'open';
  const traveling = phase === 'traveling';
  const doorT = { duration: open ? timings.doorOpen : timings.doorClose, ease: doorEase };

  // Reduced motion: las puertas no se deslizan, se funden.
  const left = reduced ? { opacity: open ? 0 : 1 } : { x: open ? '-100%' : '0%' };
  const right = reduced ? { opacity: open ? 0 : 1 } : { x: open ? '100%' : '0%' };
  const shake = traveling && !reduced;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-20"
      style={{ '--light': light } as CSSProperties}
      animate={shake ? { x: [0, 1, -1, 1, 0], y: [0, -1, 1, -1, 0] } : { x: 0, y: 0 }}
      transition={shake ? { duration: 0.24 / speed, repeat: Infinity, ease: 'linear' } : { duration: 0.2 }}
    >
      <motion.div
        className="metal absolute inset-y-0 left-0 w-[50vw] shadow-[inset_-1px_0_0_rgb(0_0_0/0.6),inset_-2px_0_0_rgb(255_255_255/0.18)]"
        initial={false}
        animate={left}
        transition={doorT}
      />
      <motion.div
        className="metal absolute inset-y-0 right-0 w-[50vw] shadow-[inset_1px_0_0_rgb(0_0_0/0.6),inset_2px_0_0_rgb(255_255_255/0.18)]"
        initial={false}
        animate={right}
        transition={doorT}
      />

      {/* Rendija central */}
      {!reduced && (
        <div className="absolute inset-y-0 left-1/2 w-24 -translate-x-1/2">
          {/* Luz que se ensancha al abrir */}
          <motion.div
            className="absolute inset-y-0 left-1/2 -ml-0.5 w-1 bg-(--light) blur-[2px]"
            initial={false}
            animate={open ? { scaleX: 90, opacity: 0 } : { scaleX: 1, opacity: traveling ? 0.3 : 0.6 }}
            transition={open ? doorT : { duration: 0.3 }}
          />
          {/* Franjas de luz verticales durante el viaje */}
          <motion.div
            className="absolute inset-y-0 left-1/2 -ml-[1.5px] w-[3px] overflow-hidden"
            initial={false}
            animate={{ opacity: traveling ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="shaft-light absolute inset-x-0 -top-[360px] h-[calc(100%+720px)]"
              animate={
                traveling ? { y: direction >= 0 ? [0, SHAFT_PERIOD] : [SHAFT_PERIOD, 0] } : { y: 0 }
              }
              transition={
                traveling ? { duration: 0.4 / speed, repeat: Infinity, ease: 'linear' } : { duration: 0 }
              }
            />
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
