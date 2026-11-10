import { useSyncExternalStore } from 'react';
import { sound } from '../sound';

export function SoundToggle() {
  const muted = useSyncExternalStore(sound.subscribe, sound.isMuted);
  return (
    <button
      type="button"
      onClick={() => sound.setMuted(!muted)}
      aria-pressed={!muted}
      aria-label="Sonido"
      className="group fixed top-5 right-4 z-40 flex h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-white/10 bg-black/70 px-3 sm:px-4 font-mono text-[11px] tracking-[0.2em] text-metal uppercase sm:right-6"
    >
      <svg aria-hidden viewBox="0 0 16 16" className="size-4 fill-none stroke-current" strokeWidth="1.4">
        <path d="M2 6h2.5L8 3v10L4.5 10H2z" />
        {muted ? (
          <path d="M11 6l3 4m0-4l-3 4" />
        ) : (
          <path d="M11 5.5c1 .8 1 4.2 0 5M12.8 4c2 1.6 2 6.4 0 8" />
        )}
      </svg>
      <span className="hidden sm:inline">Sonido</span>
      <span className={`hidden sm:inline ${muted ? 'text-metal/50' : 'text-accent'}`}>{muted ? 'off' : 'on'}</span>
    </button>
  );
}
