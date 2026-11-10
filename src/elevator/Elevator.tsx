import { useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { content } from '../content';
import { floorById, floorForPath, isFloorId } from '../floors';
import { FloorView } from '../floors/FloorView';
import { FULL, REDUCED, SHORT } from '../motion';
import { sound } from '../sound';
import { Doors } from './Doors';
import { Indicator } from './Indicator';
import { Panel } from './Panel';
import { SoundToggle } from './SoundToggle';
import { useElevator } from './useElevator';

const VISITED = 'elevator:visited';

export function Elevator() {
  const location = useLocation();
  const navigate = useNavigate();
  const routeFloor = floorForPath(location.pathname);
  const reduced = useReducedMotion() ?? false;

  // Primera visita: secuencia completa. Visitas siguientes: versión corta.
  const [returning] = useState(() => localStorage.getItem(VISITED) === '1');
  const timings = reduced ? REDUCED : returning ? SHORT : FULL;

  const pathRef = useRef(location.pathname);
  pathRef.current = location.pathname;

  const { state, press, open } = useElevator(routeFloor, {
    timings,
    onPress: () => sound.play('click'),
    onClose: () => sound.play('door'),
    onDepart: (id) => {
      sound.humStart();
      if (floorForPath(pathRef.current) !== id) navigate(floorById(id).path);
    },
    onBoost: () => sound.humBoost(),
    onArrive: () => {
      sound.humStop();
      sound.play('ding');
      sound.play('door');
      localStorage.setItem(VISITED, '1');
    },
  });

  const doorsOpen = state.phase === 'opening' || state.phase === 'open';

  // Primera apertura al cargar.
  useEffect(() => {
    const t = window.setTimeout(open, reduced ? 100 : 450);
    return () => window.clearTimeout(t);
  }, [open, reduced]);

  // Atrás/adelante del navegador o un enlace interno: el ascensor va a esa planta.
  // Solo reacciona cuando cambia la URL, no cuando el propio ascensor cambia de planta.
  const latest = useRef(state);
  latest.current = state;
  useEffect(() => {
    const s = latest.current;
    if (routeFloor !== s.current && routeFloor !== s.target) press(routeFloor);
  }, [routeFloor, press]);

  // Teclas L, 1, 2, 3 y B.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      const el = e.target instanceof Element ? e.target : null;
      if (el?.closest('input, textarea, select, [contenteditable]')) return;
      const key = e.key.toUpperCase();
      if (isFloorId(key)) {
        e.preventDefault();
        press(key);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [press]);

  const floor = floorById(state.current);
  useEffect(() => {
    document.title = floor.id === 'L' ? `${content.name} · Portfolio` : `${floor.name} · ${content.name}`;
  }, [floor]);

  const dest = state.target ? floorById(state.target) : null;
  const status = dest
    ? `${(state.direction || Math.sign(dest.level - floor.level)) > 0 ? 'Subiendo' : 'Bajando'} a la planta ${dest.id}, ${dest.name}`
    : `Planta ${state.current}, ${floor.name}`;

  const lightFloor = state.target ? floorById(state.target) : floor;

  return (
    <>
      <FloorView
        floor={state.current}
        phase={state.phase}
        trips={state.trips}
        timings={timings}
        reduced={reduced}
        onCall={press}
      />
      <Doors
        phase={state.phase}
        direction={state.direction}
        speed={state.speed}
        timings={timings}
        light={lightFloor.light}
        reduced={reduced}
      />
      <Indicator
        shown={state.shown}
        direction={state.direction}
        speed={state.speed}
        digitDuration={state.digitDuration}
      />
      <Panel lit={state.target ?? state.current} here={doorsOpen ? state.current : null} onPress={press} />
      <SoundToggle />
      <p aria-live="polite" className="sr-only">
        {status}
      </p>
    </>
  );
}
