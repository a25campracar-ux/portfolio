export type FloorId = 'B' | 'L' | '1' | '2' | '3';

export interface Floor {
  id: FloorId;
  name: string;
  path: string;
  /** Altura en el edificio: B = -1, L = 0. */
  level: number;
  /** Texto del directorio del Lobby. */
  blurb: string;
  /** Color de la luz que entra por la rendija al llegar. */
  light: string;
}

// Ordenadas de abajo arriba; el odómetro usa este orden.
export const FLOORS: readonly Floor[] = [
  { id: 'B', name: 'Lab', path: '/lab', level: -1, blurb: 'Experimentos', light: '#c9fff0' },
  { id: 'L', name: 'Lobby', path: '/', level: 0, blurb: 'Recepción', light: '#ffe2b8' },
  { id: '1', name: 'Projects', path: '/projects', level: 1, blurb: 'Proyectos', light: '#fff1d6' },
  { id: '2', name: 'About', path: '/about', level: 2, blurb: 'Sobre mí', light: '#ffc27a' },
  { id: '3', name: 'Contact', path: '/contact', level: 3, blurb: 'Contacto', light: '#9cc3ff' },
];

export const floorById = (id: FloorId): Floor => FLOORS.find((f) => f.id === id)!;

export const floorByLevel = (level: number): Floor =>
  FLOORS.find((f) => f.level === level) ?? FLOORS[1];

export const isFloorId = (key: string): key is FloorId => FLOORS.some((f) => f.id === key);

/** '/projects/catclicker' → '1'. Una ruta desconocida lleva al Lobby. */
export const floorForPath = (pathname: string): FloorId => {
  const first = '/' + (pathname.split('/')[1] ?? '');
  return FLOORS.find((f) => f.path === first)?.id ?? 'L';
};
