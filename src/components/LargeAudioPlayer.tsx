import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  RotateCcw,
  Repeat,
  Radio,
} from 'lucide-react';
import { AudioWaveform } from './AudioWaveform';

interface LargeAudioPlayerProps {
  src: string;
  fallbackBase64?: string;
  title: string;
  genre?: string;
  mood?: string;
  autoPlay?: boolean;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const LargeAudioPlayer: React.FC<LargeAudioPlayerProps> = ({
  src,
  fallbackBase64,
  title,
  genre,
  mood,
  autoPlay = true,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Active audio source: prefer src, fall back to base64
  const audioSource = src || fallbackBase64 || '';

  // Reset audio playback and error state when source changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      setCurrentTime(0);
      setIsPlaying(false);
      setAudioError(null);
      setIsLoading(true);
    }
  }, [audioSource]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        console.warn('Playback error:', err);
      });
    }
  }, [isPlaying]);

  // Handle keyboard shortcut (Space to toggle play when player is focused)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === 'Space' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const dur = audioRef.current.duration;
      if (!isNaN(dur) && isFinite(dur)) {
        setDuration(dur);
      }
      setIsLoading(false);
      if (autoPlay) {
        audioRef.current.play().catch(() => {
          // Autoplay policy may block initial play until user gesture
          setIsPlaying(false);
        });
      }
    }
  };

  const handleSeek = (ratio: number) => {
    if (audioRef.current && duration > 0) {
      const targetTime = ratio * duration;
      audioRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      if (val === 0) {
        setIsMuted(true);
        audioRef.current.muted = true;
      } else if (isMuted) {
        setIsMuted(false);
        audioRef.current.muted = false;
      }
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioRef.current.muted = nextMuted;
    if (!nextMuted && volume === 0) {
      setVolume(0.5);
      audioRef.current.volume = 0.5;
    }
  };

  const toggleLoop = () => {
    if (!audioRef.current) return;
    const next = !isLooping;
    setIsLooping(next);
    audioRef.current.loop = next;
  };

  const resetToStart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      if (!isPlaying) {
        audioRef.current.play().catch(() => {});
      }
    }
  };

  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-6 sm:p-8 shadow-2xl shadow-black/80">
      {/* Studio Ambient Backlight Glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" />

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={audioSource}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setAudioError(
            'Unable to stream audio. Please check network connection or download the file.'
          );
        }}
        onEnded={() => {
          if (!isLooping) {
            setIsPlaying(false);
            setCurrentTime(0);
          }
        }}
      />

      {/* Track Header Details */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">
              <Radio className="h-3 w-3 animate-pulse text-amber-400" />
              Master Output
            </span>
            {genre && (
              <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-[11px] font-medium text-zinc-300 border border-zinc-700/60">
                {genre}
              </span>
            )}
            {mood && (
              <span className="rounded-full bg-zinc-800/80 px-2.5 py-0.5 text-[11px] font-medium text-zinc-400 border border-zinc-700/40">
                {mood}
              </span>
            )}
          </div>
          <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
            {title}
          </h3>
        </div>

        {/* Audio Engine Badge */}
        <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono bg-zinc-950/80 border border-zinc-800/80 rounded-xl px-3.5 py-2 self-start sm:self-auto">
          <div className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
          <span>Lyria 3.5 Engine</span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-300">Stereo 48kHz</span>
        </div>
      </div>

      {/* Audio Error Alert if any */}
      {audioError && (
        <div className="mb-4 rounded-xl bg-red-950/40 border border-red-800/50 p-3 text-xs text-red-300">
          {audioError}
        </div>
      )}

      {/* Interactive Waveform / Scrubber */}
      <div className="relative z-10 mb-4 bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-4">
        <AudioWaveform
          isPlaying={isPlaying}
          progress={progress}
          onSeek={handleSeek}
          barCount={64}
          height={68}
          interactive={duration > 0}
        />

        {/* Scrub Time Display */}
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mt-2 px-1">
          <span className="text-amber-400/90 font-medium">
            {formatTime(currentTime)}
          </span>
          <span className="text-zinc-500">
            {duration > 0 ? formatTime(duration) : '--:--'}
          </span>
        </div>
      </div>

      {/* Master Controls Deck */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pt-2">
        {/* Left: Transport Playback Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={resetToStart}
            title="Restart track"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800/80 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700/80 border border-zinc-700/60 transition-all"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Primary Play/Pause Button */}
          <button
            onClick={togglePlay}
            disabled={isLoading && duration === 0}
            className="group relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-zinc-950 shadow-[0_0_24px_rgba(245,158,11,0.35)] hover:shadow-[0_0_32px_rgba(245,158,11,0.5)] active:scale-95 transition-all disabled:opacity-60"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="h-6 w-6 fill-zinc-950" />
            ) : (
              <Play className="h-6 w-6 fill-zinc-950 ml-0.5" />
            )}
          </button>

          <button
            onClick={toggleLoop}
            title={isLooping ? 'Loop Enabled' : 'Enable Loop'}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
              isLooping
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700/80 border-zinc-700/60'
            }`}
          >
            <Repeat className="h-4 w-4" />
          </button>
        </div>

        {/* Right: Volume & Monitoring */}
        <div className="flex items-center gap-3 bg-zinc-950/80 border border-zinc-800/80 rounded-xl px-4 py-2">
          <button
            onClick={toggleMute}
            className="text-zinc-400 hover:text-zinc-100 transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-4 w-4 text-red-400" />
            ) : volume < 0.5 ? (
              <Volume1 className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4 text-amber-400" />
            )}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            aria-label="Volume slider"
            className="h-1.5 w-20 sm:w-28 cursor-pointer appearance-none rounded-lg bg-zinc-700 accent-amber-400 hover:accent-amber-300"
          />
          <span className="font-mono text-[11px] text-zinc-400 w-8 text-right">
            {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
          </span>
        </div>
      </div>
    </div>
  );
};
