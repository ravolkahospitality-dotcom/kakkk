import React, { useState } from 'react';
import {
  Download,
  Trash2,
  Music,
  Clock,
  Play,
  Pause,
  ExternalLink,
  Sparkles,
  FileText,
} from 'lucide-react';
import { Song } from '../types/music';

interface SongHistoryProps {
  history: Song[];
  onSelectSong: (song: Song) => void;
  onDeleteSong: (id: string) => void;
  onCreateNew: () => void;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Recent';
  }
}

export const SongHistory: React.FC<SongHistoryProps> = ({
  history,
  onSelectSong,
  onDeleteSong,
  onCreateNew,
}) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selectedLyricsSong, setSelectedLyricsSong] = useState<Song | null>(null);

  const handleDownload = (song: Song, e: React.MouseEvent) => {
    e.stopPropagation();
    const safeTitle = (song.title || 'Ravolka-Song')
      .replace(/[^a-zA-Z0-9_\-\s]/g, '')
      .trim()
      .replace(/\s+/g, '_');

    if (song.audioBase64) {
      const a = document.createElement('a');
      a.href = song.audioBase64;
      a.download = `${safeTitle}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const a = document.createElement('a');
      a.href = `${song.audioUrl}?download=true`;
      a.download = `${safeTitle}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-zinc-100">
            Studio Library
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Persisted history of generated audio tracks from Lyria 3.5
          </p>
        </div>

        <button
          onClick={onCreateNew}
          className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 px-3.5 py-2 text-xs sm:text-sm font-bold text-zinc-950 shadow-md shadow-amber-500/20 transition-all active:scale-95"
        >
          <Sparkles className="h-4 w-4" />
          <span>New Track</span>
        </button>
      </div>

      {/* History Items List */}
      {history.length === 0 ? (
        <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/40 p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800 text-zinc-400">
            <Music className="h-8 w-8 text-amber-400/80" />
          </div>
          <h3 className="font-display text-xl font-bold text-zinc-200 mb-2">
            No songs generated yet
          </h3>
          <p className="text-sm text-zinc-400 max-w-md mx-auto mb-6">
            Describe a musical mood or story in the Studio, and your generated creations will be saved here automatically.
          </p>
          <button
            onClick={onCreateNew}
            className="rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-2.5 text-sm font-bold text-zinc-950 shadow-lg shadow-amber-500/25 transition-all"
          >
            Create Your First Song
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((song) => {
            const isPlaying = playingId === song.id;

            return (
              <div
                key={song.id}
                className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-sm transition-all hover:border-zinc-700 hover:bg-zinc-900/80 shadow-lg"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Metadata & Title */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                        {song.genre}
                      </span>
                      <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-300">
                        {song.mood}
                      </span>
                      {song.vocal && (
                        <span className="rounded-full bg-zinc-800/80 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                          {song.vocal}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
                        <Clock className="h-3 w-3" />
                        {formatDate(song.createdAt)}
                      </span>
                    </div>

                    <h4
                      onClick={() => onSelectSong(song)}
                      className="font-display text-lg font-bold text-zinc-100 truncate cursor-pointer hover:text-amber-400 transition-colors"
                    >
                      {song.title}
                    </h4>

                    <p className="text-xs text-zinc-400 line-clamp-1 italic">
                      &ldquo;{song.prompt}&rdquo;
                    </p>
                  </div>

                  {/* Right: Inline Audio Player Controls & Actions */}
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    {/* Lyrics preview button */}
                    {song.lyrics && (
                      <button
                        onClick={() => setSelectedLyricsSong(song)}
                        title="View Lyrics"
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800/80 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700/80 border border-zinc-700/50 transition-all"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                    )}

                    {/* Download button required by spec */}
                    <button
                      onClick={(e) => handleDownload(song, e)}
                      title="Download MP3"
                      className="flex items-center gap-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 px-3 py-2 text-xs font-medium text-amber-300 border border-zinc-700/60 transition-all active:scale-95"
                    >
                      <Download className="h-3.5 w-3.5 text-amber-400" />
                      <span className="hidden sm:inline">Download</span>
                    </button>

                    {/* Open in full studio player */}
                    <button
                      onClick={() => onSelectSong(song)}
                      title="Open in Studio Player"
                      className="flex items-center gap-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 px-3 py-2 text-xs font-semibold transition-all active:scale-95"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Studio</span>
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => onDeleteSong(song.id)}
                      title="Delete from history"
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Inline HTML5 Audio Player for Direct Listening */}
                <div className="mt-3 pt-3 border-t border-zinc-800/60">
                  <audio
                    controls
                    preload="none"
                    src={song.audioUrl || song.audioBase64}
                    className="w-full h-8 rounded-lg opacity-80 hover:opacity-100 transition-opacity"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lyrics Viewer Modal if an item's lyrics is clicked */}
      {selectedLyricsSong && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-zinc-100">
                  {selectedLyricsSong.title}
                </h3>
                <p className="text-xs text-zinc-400">
                  {selectedLyricsSong.genre} • {selectedLyricsSong.mood}
                </p>
              </div>
              <button
                onClick={() => setSelectedLyricsSong(null)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              >
                ✕
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto pr-2 text-sm leading-relaxed text-zinc-300 font-sans whitespace-pre-line">
              {selectedLyricsSong.lyrics || 'No lyrics available.'}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedLyricsSong(null)}
                className="rounded-xl bg-zinc-800 hover:bg-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
