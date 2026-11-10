// Genera los sonidos del ascensor en public/sounds/ (WAV mono, 22 kHz, 16 bits).
// Uso: node scripts/make-sounds.mjs
import fs from 'node:fs';
import path from 'node:path';

const RATE = 22050;
const out = path.resolve(import.meta.dirname, '../public/sounds');
fs.mkdirSync(out, { recursive: true });

function wav(name, seconds, fn) {
  const n = Math.round(seconds * RATE);
  const buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write('WAVEfmt ', 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(RATE, 24);
  buf.writeUInt32LE(RATE * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, fn(i / RATE, i)));
    buf.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  }
  fs.writeFileSync(path.join(out, `${name}.wav`), buf);
  console.log(`${name}.wav  ${(buf.length / 1024).toFixed(0)} KB`);
}

let seed = 1;
const noise = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
const sin = (f, t) => Math.sin(2 * Math.PI * f * t);

// Clic del botón: golpe corto y seco.
wav('click', 0.06, (t) => noise() * Math.exp(-t / 0.002) * 0.6 + sin(2200, t) * Math.exp(-t / 0.008) * 0.35);

// Puertas: soplido grave filtrado.
{
  let lp = 0;
  wav('door', 0.6, (t) => {
    lp += (noise() - lp) * 0.06;
    const env = Math.sin(Math.PI * Math.min(1, t / 0.6)) ** 2;
    return (lp * 2.2 + sin(70, t) * 0.15) * env;
  });
}

// Ding de llegada: campana con armónicos.
wav('ding', 1.6, (t) => {
  const env = Math.min(1, t / 0.003) * Math.exp(-t / 0.45);
  return (sin(1318.5, t) * 0.5 + sin(2637, t) * 0.18 + sin(3951, t) * 0.07 + sin(659.25, t) * 0.12) * env;
});

// Zumbido de viaje: bucle de 2 s exacto (ciclos enteros, sin cortes).
wav('hum', 2, (t) => {
  const am = 0.85 + 0.15 * sin(0.5, t);
  return (sin(55, t) * 0.5 + sin(110, t) * 0.25 + sin(165, t) * 0.1) * am * 0.8;
});
