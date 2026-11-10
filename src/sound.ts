import { Howl, Howler } from 'howler';

// Sonidos generados con scripts/make-sounds.mjs. Silenciado por defecto.
type Name = 'click' | 'door' | 'ding' | 'hum';

const KEY = 'elevator:sound';
let muted = localStorage.getItem(KEY) !== 'on';
const listeners = new Set<() => void>();
const cache = new Map<Name, Howl>();

const VOLUME: Record<Name, number> = { click: 0.5, door: 0.35, ding: 0.45, hum: 0.22 };

function get(name: Name): Howl {
  let h = cache.get(name);
  if (!h) {
    h = new Howl({ src: [`/sounds/${name}.wav`], volume: VOLUME[name], loop: name === 'hum' });
    cache.set(name, h);
  }
  return h;
}

export const sound = {
  isMuted: () => muted,
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  setMuted(next: boolean) {
    muted = next;
    localStorage.setItem(KEY, next ? 'off' : 'on');
    Howler.mute(next);
    if (next) cache.get('hum')?.stop();
    listeners.forEach((fn) => fn());
  },
  play(name: Exclude<Name, 'hum'>) {
    if (!muted) get(name).play();
  },
  humStart() {
    if (muted) return;
    const h = get('hum');
    h.rate(1);
    h.volume(0);
    h.play();
    h.fade(0, VOLUME.hum, 250);
  },
  humBoost() {
    cache.get('hum')?.rate(1.35);
  },
  humStop() {
    const h = cache.get('hum');
    if (!h?.playing()) return;
    h.fade(h.volume(), 0, 200);
    window.setTimeout(() => h.stop(), 220);
  },
};

Howler.mute(muted);
