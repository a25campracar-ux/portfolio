import { motion } from 'framer-motion';
import { useEffect } from 'react';
import type { FloorId } from '../floors';
import { doorEase, type Timings } from '../motion';
import type { Phase } from '../elevator/useElevator';
import { About } from './About';
import { Contact } from './Contact';
import { Lab } from './Lab';
import { Lobby } from './Lobby';
import { ProjectsFloor } from './projects/ProjectsFloor';

interface Props {
  floor: FloorId;
  phase: Phase;
  trips: number;
  timings: Timings;
  reduced: boolean;
  onCall: (id: FloorId) => void;
}

export function FloorView({ floor, phase, trips, timings, reduced, onCall }: Props) {
  const doorsOpen = phase === 'opening' || phase === 'open';
  const active = phase === 'open';

  const hidden = reduced ? { opacity: 0 } : { opacity: 1, scale: 1.08, filter: 'blur(8px)' };
  const shown = reduced
    ? { opacity: 1 }
    : { opacity: 1, scale: 1, filter: 'blur(0px)', transitionEnd: { filter: 'none' } };

  // Al llegar a una planta, el foco va a su título (no en la primera carga).
  useEffect(() => {
    if (trips > 0 && phase === 'opening') {
      document.getElementById('floor-title')?.focus({ preventScroll: true });
    }
  }, [trips, phase]);

  return (
    <motion.main
      key={floor}
      inert={!doorsOpen}
      initial={hidden}
      animate={doorsOpen ? shown : hidden}
      transition={{ duration: timings.doorOpen, ease: doorEase }}
      className="fixed inset-0 z-0 overflow-hidden"
    >
      {floor === 'L' && <Lobby onCall={onCall} />}
      {floor === '1' && <ProjectsFloor active={active} reduced={reduced} />}
      {floor === '2' && <About reduced={reduced} />}
      {floor === '3' && <Contact reduced={reduced} />}
      {floor === 'B' && <Lab active={active} reduced={reduced} />}
    </motion.main>
  );
}
