import React, { useState } from 'react';
import {
  Play,
  MoreVertical,
  Download,
  Trash2,
  FileText,
  Music4,
  Search,
  ExternalLink,
} from 'lucide-react';
import { Song, LibraryFilter } from '../types/music';

interface MyLibraryProps {
  songs: Song[];
  onPlaySong: (song: Song) => void;
  onDeleteSong: (id: string) => void;
  onCreateNew: () => void;
}

function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - d.getTime()) / 3600000);
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Recent';
  }
}

export const MyLibrary: React.FC<MyLibraryProps> = ({
  songs,
  onPlaySong,
  onDeleteSong,
  onCreateNew,
}) => {
  const [filter, setFilter] = useState<LibraryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Filter songs by tab and search
  const filteredSongs = songs.filter((song) => {
    if (filter === 'songs' && song.isInstrumental) return false;
    if (filter === 'instrumentals' && !song.isInstrumental) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = song.title.toLowerCase().includes(q);
      const matchGenre = song.genre.toLowerCase().includes(q);
      const matchPrompt = song.prompt.toLowerCase().includes(q);
      return matchTitle || matchGenre || matchPrompt;
    }
    return true;
  });

  const handleDownload = (song: Song, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenuId(null);
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

  const handleCopyLyrics = async (song: Song, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenuId(null);
    if (!song.lyrics) return;
    await navigator.clipboard.writeText(song.lyrics);
  };

  return (
    <div className="mx-auto max-w-5xl px-2 sm:px-4 space-y-6 pb-12">
      {/* Library Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">
            My Songs
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Your personal collection of created musical tracks
          </p>
        </div>

        {/* Search bar */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by title or genre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-zinc-900 border border-zinc-800 pl-9 pr-3 py-2 text-xs sm:text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-amber-500/60 focus:outline-none"
          />
        </div>
      </div>

      {/* Filter Segmented Control */}
      <div className="flex items-center gap-1.5 p-1 bg-zinc-900/90 border border-zinc-800/80 rounded-xl w-fit">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-zinc-800 text-zinc-100 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          All
        </button>

        <button
          onClick={() => setFilter('songs')}
          className={`px-4 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
            filter === 'songs'
              ? 'bg-zinc-800 text-zinc-100 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Songs
        </button>

        <button
          onClick={() => setFilter('instrumentals')}
          className={`px-4 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
            filter === 'instrumentals'
              ? 'bg-zinc-800 text-zinc-100 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Instrumentals
        </button>
      </div>

      {/* Songs Grid / List */}
      {filteredSongs.length === 0 ? (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800 text-zinc-400">
            <Music4 className="h-8 w-8 text-amber-400/80" />
          </div>
          <h3 className="font-display text-xl font-bold text-zinc-200 mb-2">
            No tracks found
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto mb-6">
            {songs.length === 0
              ? 'Your music library is currently empty. Head to the Studio to create something you can feel.'
              : 'No songs matched your current filter or search criteria.'}
          </p>
          <button
            onClick={onCreateNew}
            className="rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-2.5 text-xs sm:text-sm font-bold text-zinc-950 shadow-md shadow-amber-500/20 transition-all active:scale-95"
          >
            Create a Song
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSongs.map((song) => {
            const isMenuOpen = activeMenuId === song.id;

            return (
              <div
                key={song.id}
                onClick={() => onPlaySong(song)}
                className="group relative flex items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 transition-all hover:border-zinc-700 hover:bg-zinc-900 cursor-pointer"
              >
                {/* Left: Cover Artwork Placeholder & Info */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  {/* Styled Album Artwork Placeholder */}
                  <div
                    className={`relative flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${
                      song.coverGradient || 'from-amber-600 via-stone-900 to-black'
                    } border border-white/10 shadow-md group-hover:scale-105 transition-transform overflow-hidden`}
                  >
                    <Music4 className="h-6 w-6 text-white/70" />
                    {/* Hover Play Overlay */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-zinc-950 shadow-sm">
                        <Play className="h-4 w-4 fill-zinc-950 ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Title & Metadata (Zero-Pill discipline) */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <h3 className="font-display text-base font-bold text-zinc-100 truncate group-hover:text-amber-400 transition-colors">
                      {song.title}
                    </h3>

                    {/* Unboxed Metadata with Typographic Separators */}
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 truncate">
                      <span>{song.genre}</span>
                      <span aria-hidden="true" className="text-zinc-600">·</span>
                      <span className="font-mono">{formatDuration(song.durationSeconds)}</span>
                      <span aria-hidden="true" className="text-zinc-600">·</span>
                      <span>{formatDate(song.createdAt)}</span>
                    </div>

                    {song.prompt && (
                      <p className="text-[11px] text-zinc-400 truncate italic">
                        {song.prompt}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Quick Play Button & More Menu */}
                <div
                  className="flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => onPlaySong(song)}
                    title="Play Song"
                    aria-label={`Play ${song.title}`}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 hover:bg-amber-400 hover:text-zinc-950 text-zinc-300 transition-colors"
                  >
                    <Play className="h-4 w-4 fill-current ml-0.5" />
                  </button>

                  {/* More Menu Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setActiveMenuId(isMenuOpen ? null : song.id)
                      }
                      title="More options"
                      aria-label="More options"
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {isMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-20"
                          onClick={() => setActiveMenuId(null)}
                        />
                        <div className="absolute right-0 top-11 z-30 w-44 rounded-xl border border-zinc-800 bg-zinc-900 p-1 shadow-xl">
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              onPlaySong(song);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span>Open Player</span>
                          </button>

                          <button
                            onClick={(e) => handleDownload(song, e)}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>Download Audio</span>
                          </button>

                          {song.lyrics && (
                            <button
                              onClick={(e) => handleCopyLyrics(song, e)}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              <span>Copy Lyrics</span>
                            </button>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(null);
                              onDeleteSong(song.id);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-400 hover:bg-red-950/40"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
