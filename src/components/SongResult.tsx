import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Volume1,
  Download,
  Share2,
  PlusCircle,
  Copy,
  Check,
  FileText,
} from 'lucide-react';
import { Song } from '../types/music';

interface SongResultProps {
  song: Song;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  onCreateAnother: () => void;
}

function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const SongResult: React.FC<SongResultProps> = ({
  song,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
  onCreateAnother,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(song.durationSeconds || 34);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [copiedLyrics, setCopiedLyrics] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Audio source: prefer audioUrl or fallback base64
  const audioSrc = song.audioUrl || song.audioBase64 || '';

  // Synchronize audio element when song changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      setCurrentTime(0);
      setIsPlaying(false);
      audioRef.current.play().catch(() => {
        // Autoplay may be restricted until user gesture
        setIsPlaying(false);
      });
    }
  }, [song.id, audioSrc]);

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
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const target = ratio * duration;
    audioRef.current.currentTime = target;
    setCurrentTime(target);
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

  const handleDownload = () => {
    const safeTitle = (song.title || 'Ravolka-Song')
      .replace(/[^a-zA-Z0-9_\-\s]/g, '')
      .trim()
      .replace(/\s+/g, '_');

    if (song.audioUrl) {
      const a = document.createElement('a');
      a.href = song.audioUrl;
      a.download = `${safeTitle}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleShare = async () => {
    const shareText = `Listen to "${song.title}" (${song.genre} · ${song.mood}) created with Ravolka Music AI`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: song.title,
          text: shareText,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(
          `${shareText}\n${window.location.href}`
        );
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2000);
      }
    } catch {
      await navigator.clipboard.writeText(shareText);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const handleCopyLyrics = async () => {
    if (!song.lyrics) return;
    await navigator.clipboard.writeText(song.lyrics);
    setCopiedLyrics(true);
    setTimeout(() => setCopiedLyrics(false), 2000);
  };

  const progressRatio = duration > 0 ? currentTime / duration : 0;

  // Waveform bars
  const totalBars = 54;
  const bars = Array.from({ length: totalBars }, (_, idx) => {
    const norm = idx / totalBars;
    const env = Math.sin(norm * Math.PI);
    const noise = ((idx * 29 + 17) % 31) / 31;
    return Math.max(0.18, Math.min(0.96, env * 0.7 + noise * 0.3));
  });

  return (
    <div className="mx-auto max-w-4xl px-2 sm:px-4 space-y-8 pb-12">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={audioSrc}
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
          if (hasNext && onNext) {
            onNext();
          }
        }}
      />

      {/* Main Player Surface */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/90 p-6 sm:p-10 shadow-2xl backdrop-blur-md">
        {/* Subtle Ambient Backlight Glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" />

        {/* Top Header: Song Title & Clean Unboxed Metadata */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-100 mb-2">
              {song.title}
            </h2>

            {/* Zero-Pill Unboxed Metadata with Typographic Separators */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-400">
              <span className="font-medium text-zinc-300">{song.genre}</span>
              <span aria-hidden="true" className="text-zinc-600">·</span>
              <span>{song.mood}</span>
              <span aria-hidden="true" className="text-zinc-600">·</span>
              <span className="font-mono">{formatDuration(duration)}</span>
              {song.isInstrumental && (
                <>
                  <span aria-hidden="true" className="text-zinc-600">·</span>
                  <span className="text-amber-400/90">Instrumental</span>
                </>
              )}
            </div>
          </div>

          {/* Prompt Context Kicker */}
          <p className="text-xs text-zinc-400 max-w-sm italic line-clamp-2">
            &ldquo;{song.prompt}&rdquo;
          </p>
        </div>

        {/* Large Interactive Waveform & Progress Bar */}
        <div className="relative z-10 mb-8 rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-5">
          <div
            onClick={handleSeek}
            className="group relative flex h-20 w-full cursor-pointer items-center gap-[3px] select-none py-1"
            role="slider"
            aria-label="Seek track"
            aria-valuenow={Math.round(progressRatio * 100)}
          >
            {bars.map((height, idx) => {
              const barRatio = idx / totalBars;
              const isPassed = barRatio <= progressRatio;
              return (
                <div
                  key={idx}
                  className="relative flex-1 h-full flex items-center justify-center"
                >
                  <div
                    style={{ height: `${Math.round(height * 100)}%` }}
                    className={`w-full rounded-full transition-all duration-100 ${
                      isPassed
                        ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                        : 'bg-zinc-700/60 group-hover:bg-zinc-600'
                    }`}
                  />
                </div>
              );
            })}

            {/* Thumb Line */}
            <div
              style={{
                left: `${Math.min(99.5, Math.max(0.5, progressRatio * 100))}%`,
              }}
              className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-amber-400"
            >
              <div className="absolute -top-1 -left-1 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-zinc-950" />
            </div>
          </div>

          {/* Time Display */}
          <div className="mt-3 flex items-center justify-between font-mono text-xs text-zinc-400 px-1">
            <span className="text-amber-400 font-medium">
              {formatDuration(currentTime)}
            </span>
            <span className="text-zinc-500">{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Controls Deck: Previous, Play/Pause, Next, Volume */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pt-2">
          {/* Transport Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={onPrevious}
              disabled={!hasPrevious}
              title="Previous Track"
              aria-label="Previous Track"
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-800/80 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-700 border border-zinc-700/60 transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            >
              <SkipBack className="h-5 w-5" />
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-zinc-950 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 active:scale-95 transition-all"
            >
              {isPlaying ? (
                <Pause className="h-7 w-7 fill-zinc-950 stroke-zinc-950" />
              ) : (
                <Play className="h-7 w-7 fill-zinc-950 stroke-zinc-950 ml-1" />
              )}
            </button>

            <button
              onClick={onNext}
              disabled={!hasNext}
              title="Next Track"
              aria-label="Next Track"
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-800/80 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-700 border border-zinc-700/60 transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            >
              <SkipForward className="h-5 w-5" />
            </button>
          </div>

          {/* Volume Control Deck */}
          <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-2">
            <button
              onClick={toggleMute}
              className="text-zinc-400 hover:text-zinc-100 transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
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
              aria-label="Volume level"
              className="h-1.5 w-20 sm:w-28 cursor-pointer appearance-none rounded-lg bg-zinc-700 accent-amber-400 hover:accent-amber-300"
            />
            <span className="font-mono text-[11px] text-zinc-400 w-8 text-right">
              {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
            </span>
          </div>
        </div>

        {/* Action Buttons: Download, Share, Create Another */}
        <div className="relative z-10 flex flex-wrap items-center justify-end gap-3 pt-6 mt-6 border-t border-zinc-800/80">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 px-4 py-2.5 text-xs sm:text-sm font-semibold text-zinc-200 border border-zinc-700/70 transition-all active:scale-95"
          >
            <Download className="h-4 w-4 text-amber-400" />
            <span>Download</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 px-4 py-2.5 text-xs sm:text-sm font-semibold text-zinc-200 border border-zinc-700/70 transition-all active:scale-95"
          >
            {copiedShare ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span className="text-emerald-300">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4 text-amber-400" />
                <span>Share</span>
              </>
            )}
          </button>

          <button
            onClick={onCreateAnother}
            className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-2.5 text-xs sm:text-sm font-bold text-zinc-950 shadow-md shadow-amber-500/20 transition-all active:scale-95"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create Another</span>
          </button>
        </div>
      </div>

      {/* Lyrics Section */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-amber-400" />
            <h3 className="font-display text-lg font-bold text-zinc-100">
              Lyrics
            </h3>
          </div>

          {song.lyrics && (
            <button
              onClick={handleCopyLyrics}
              className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors"
            >
              {copiedLyrics ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-300 font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Lyrics</span>
                </>
              )}
            </button>
          )}
        </div>

        {song.lyrics ? (
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2 text-sm sm:text-base leading-relaxed text-zinc-300 font-sans">
            {song.lyrics.split('\n\n').map((paragraph, idx) => {
              const trimmed = paragraph.trim();
              if (!trimmed) return null;
              const isSectionHeader =
                trimmed.startsWith('[') && trimmed.includes(']');
              return (
                <div
                  key={idx}
                  className={
                    isSectionHeader
                      ? 'font-mono text-xs text-amber-300/90 uppercase tracking-wider pt-2'
                      : 'pl-3 border-l-2 border-zinc-800 hover:border-amber-500/40 transition-colors whitespace-pre-line'
                  }
                >
                  {trimmed}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-zinc-400 italic py-4">
            Instrumental composition without vocal lyrics.
          </p>
        )}
      </div>
    </div>
  );
};
