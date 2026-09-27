import React from 'react';
import { Disc3 } from 'lucide-react';
import { Genre, Mood } from '../types/music';

interface GenerationLoaderProps {
  genre: Genre;
  mood: Mood;
  isInstrumental: boolean;
  stageMessage?: string;
}

export const GenerationLoader: React.FC<GenerationLoaderProps> = ({
  genre,
  mood,
  isInstrumental,
  stageMessage = 'Harmonizing acoustic stems and rhythm...',
}) => {
  return (
    <div className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/90 p-8 sm:p-12 text-center shadow-2xl backdrop-blur-md">
      {/* Background Studio Backlight */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl animate-pulse" />

      {/* Central Visualizer Orbit */}
      <div className="relative mx-auto mb-8 flex h-28 w-28 items-center justify-center">
        {/* Pulsing ring */}
        <div className="absolute inset-0 rounded-full border border-amber-500/20 animate-ping opacity-40" />
        <div className="absolute inset-2 rounded-full border border-amber-500/30 animate-[spin_8s_linear_infinite]" />

        {/* Center vinyl turntable disk */}
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-zinc-950 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
          <Disc3 className="h-10 w-10 animate-[spin_3s_linear_infinite]" />
        </div>
      </div>

      {/* Primary Headings as specified by the brief */}
      <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100 mb-2">
        Creating your song...
      </h3>

      <p className="text-base font-medium text-amber-300/90 mb-6">
        Turning your idea into sound.
      </p>

      {/* Live Stage Subtitle */}
      <p className="text-xs font-mono text-zinc-400 mb-8 min-h-[1.5rem] transition-all">
        {stageMessage}
      </p>

      {/* Animated Sound Waveform Bars */}
      <div className="flex h-12 items-center justify-center gap-1.5 mb-8">
        {[30, 60, 45, 90, 65, 100, 75, 85, 50, 95, 60, 80, 40, 70, 35, 80, 55].map(
          (h, i) => (
            <div
              key={i}
              style={{
                height: `${h}%`,
                animationDelay: `${(i % 8) * 0.12}s`,
              }}
              className="w-1.5 rounded-full bg-gradient-to-t from-amber-500 to-amber-300 animate-[pulse_1s_ease-in-out_infinite]"
            />
          )
        )}
      </div>

      {/* Clean Unboxed Metadata Context (Zero-Pill discipline) */}
      <div className="flex items-center justify-center gap-3 text-xs text-zinc-400">
        <span>{genre}</span>
        <span aria-hidden="true" className="text-zinc-600">·</span>
        <span>{mood}</span>
        <span aria-hidden="true" className="text-zinc-600">·</span>
        <span>{isInstrumental ? 'Instrumental' : 'Vocal Track'}</span>
      </div>
    </div>
  );
};
