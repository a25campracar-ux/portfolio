import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { Timings } from '../motion';
import { floorById, floorByLevel, type FloorId } from '../floors';

export type Phase = 'idle' | 'closing' | 'traveling' | 'opening' | 'open';

export interface ElevatorState {
  phase: Phase;
  /** Planta que hay detrás de las puertas (cambia al empezar el viaje). */
  current: FloorId;
  /** Destino pulsado; null cuando la cabina está parada. */
  target: FloorId | null;
  /** Lo que marca el indicador en cada momento. */
  shown: FloorId;
  direction: -1 | 0 | 1;
  /** 1 normal, 2 tras el segundo clic durante el viaje. */
  speed: number;
  /** Segundos que tarda el odómetro en pasar un dígito a velocidad 1. */
  digitDuration: number;
  /** Cuántos viajes se han completado. */
  trips: number;
}

export interface ElevatorEvents {
  timings: Timings;
  onPress?: (id: FloorId) => void;
  onClose?: () => void;
  /** Puertas cerradas, empieza el viaje: aquí cambia la ruta. */
  onDepart?: (id: FloorId) => void;
  onBoost?: () => void;
  onArrive?: (id: FloorId) => void;
}

// El último dígito llega al 75 % del viaje, así termina de rodar antes del "ding".
const LAST_STEP_AT = 0.75;

export function useElevator(initial: FloorId, events: ElevatorEvents) {
  const initialState: ElevatorState = {
    phase: 'idle',
    current: initial,
    target: null,
    shown: initial,
    direction: 0,
    speed: 1,
    digitDuration: events.timings.digit,
    trips: 0,
  };
  const [state, setState] = useState(initialState);
  const ref = useRef(initialState);
  const ev = useRef(events);
  const timer = useRef<number | undefined>(undefined);
  const frame = useRef(0);

  useLayoutEffect(() => {
    ev.current = events;
  });

  const api = useMemo(() => {
    const commit = (patch: Partial<ElevatorState>) => {
      ref.current = { ...ref.current, ...patch };
      setState(ref.current);
    };

    const clear = () => {
      window.clearTimeout(timer.current);
      cancelAnimationFrame(frame.current);
    };

    const open = () => {
      clear();
      const arrived = ref.current.phase === 'traveling';
      commit({ phase: 'opening', target: null, direction: 0 });
      if (arrived) {
        commit({ trips: ref.current.trips + 1 });
        ev.current.onArrive?.(ref.current.current);
      }
      timer.current = window.setTimeout(
        () => commit({ phase: 'open', speed: 1 }),
        ev.current.timings.doorOpen * 1000,
      );
    };

    const travel = () => {
      const { current, target } = ref.current;
      if (!target || target === current) {
        commit({ phase: 'traveling' });
        return open();
      }
      const t = ev.current.timings;
      const from = floorById(current).level;
      const delta = floorById(target).level - from;
      const steps = Math.abs(delta);
      const dir = Math.sign(delta) as -1 | 1;
      const spacing = (LAST_STEP_AT * t.travel) / Math.max(steps - 0.5, 0.5);

      commit({
        phase: 'traveling',
        current: target,
        direction: dir,
        digitDuration: Math.min(t.digit, spacing),
      });
      ev.current.onDepart?.(target);

      let elapsed = 0;
      let last = performance.now();
      const tick = (now: number) => {
        elapsed += ((now - last) / 1000) * ref.current.speed;
        last = now;
        const p = Math.min(1, elapsed / t.travel);
        const k = Math.min(steps, Math.floor((p / LAST_STEP_AT) * (steps - 0.5) + 0.5));
        const shown = floorByLevel(from + dir * k).id;
        if (shown !== ref.current.shown) commit({ shown });
        if (p < 1) frame.current = requestAnimationFrame(tick);
        else {
          commit({ shown: target });
          open();
        }
      };
      frame.current = requestAnimationFrame(tick);
    };

    const press = (id: FloorId) => {
      const s = ref.current;
      if (s.phase === 'traveling') {
        if (s.speed === 1) {
          commit({ speed: 2 });
          ev.current.onBoost?.();
        }
        return;
      }
      if (s.phase === 'closing') {
        if (id !== s.target) {
          commit({ target: id });
          ev.current.onPress?.(id);
        }
        return;
      }
      // idle, opening u open
      if (id === s.current) {
        if (s.phase === 'idle') open();
        return;
      }
      clear();
      ev.current.onPress?.(id);
      commit({ phase: 'closing', target: id, speed: 1 });
      ev.current.onClose?.();
      timer.current = window.setTimeout(travel, ev.current.timings.doorClose * 1000);
    };

    return { press, open, clear };
  }, []);

  useEffect(() => api.clear, [api]);

  return { state, press: api.press, open: api.open };
}
