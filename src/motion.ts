// Tokens de movimiento. Duraciones en segundos.
export const doorEase = [0.76, 0, 0.24, 1] as const;

export const spring = { type: 'spring', stiffness: 140, damping: 22 } as const;

export interface Timings {
  doorClose: number;
  travel: number;
  doorOpen: number;
  /** Tiempo máximo que tarda el odómetro en pasar un dígito. */
  digit: number;
}

/** Primera visita: 2/3 de la secuencia original (0.9 + 2.0 + 1.1 s → 2.67 s). */
export const FULL: Timings = { doorClose: 0.6, travel: 1.33, doorOpen: 0.73, digit: 0.33 };

/** Visitas siguientes: 1.2 s en total. */
export const SHORT: Timings = { doorClose: 0.3, travel: 0.5, doorOpen: 0.4, digit: 0.15 };

/** prefers-reduced-motion: fundidos de 0.3 s, sin vibración. */
export const REDUCED: Timings = { doorClose: 0.3, travel: 0.3, doorOpen: 0.3, digit: 0 };

/** Inercia del pasillo de proyectos (fracción recorrida por fotograma a 60 fps). */
export const corridorLerp = 0.08;
