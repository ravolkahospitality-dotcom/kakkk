import React, { useMemo } from 'react';

interface AudioWaveformProps {
  isPlaying: boolean;
  progress?: number; // 0 to 1
  onSeek?: (ratio: number) => void;
  barCount?: number;
  height?: number;
  interactive?: boolean;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  isPlaying,
  progress = 0,
  onSeek,
  barCount = 48,
  height = 56,
  interactive = true,
}) => {
  // Deterministic but dynamic heights
  const bars = useMemo(() => {
    const list: number[] = [];
    for (let i = 0; i < barCount; i++) {
      // Shape a natural musical waveform envelope
      const normalized = i / barCount;
      const envelope = Math.sin(normalized * Math.PI);
      const noise = ((i * 17 + 23) % 41) / 41;
      const val = Math.max(0.15, Math.min(0.98, envelope * 0.7 + noise * 0.3));
      list.push(val);
    }
    return list;
  }, [barCount]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !onSeek) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(ratio);
  };

  return (
    <div
      onClick={handleClick}
      style={{ height: `${height}px` }}
      className={`group relative flex w-full items-center gap-[3px] py-1 select-none ${
        interactive ? 'cursor-pointer' : ''
      }`}
      role="slider"
      aria-label="Audio scrubber"
      aria-valuenow={Math.round(progress * 100)}
    >
      {bars.map((bar, idx) => {
        const barRatio = idx / barCount;
        const isPassed = barRatio <= progress;
        // Animation delay for playful wave motion when playing
        const animationDelay = `${(idx % 12) * 0.08}s`;

        return (
          <div
            key={idx}
            className="relative flex-1 h-full flex items-center justify-center"
          >
            <div
              style={{
                height: `${Math.round(bar * 100)}%`,
                animationDelay: isPlaying ? animationDelay : '0s',
              }}
              className={`w-full rounded-full transition-all duration-150 ${
                isPassed
                  ? 'bg-gradient-to-t from-amber-500 to-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                  : 'bg-zinc-700/60 group-hover:bg-zinc-600/70'
              } ${isPlaying ? 'animate-pulse' : ''}`}
            />
          </div>
        );
      })}

      {/* Scrubber thumb line */}
      {interactive && (
        <div
          style={{ left: `${Math.min(99.5, Math.max(0.5, progress * 100))}%` }}
          className="absolute top-0 bottom-0 w-0.5 bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.8)] pointer-events-none transition-all duration-75"
        >
          <div className="absolute -top-1 -left-[3.5px] h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-zinc-950" />
        </div>
      )}
    </div>
  );
};
