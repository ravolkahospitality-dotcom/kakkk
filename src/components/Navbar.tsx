import React from 'react';
import { Disc3, Music2, Library, User } from 'lucide-react';
import { NavigationTab } from '../types/music';

interface NavbarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  libraryCount: number;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  libraryCount,
  onOpenProfile,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-[#08090c]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Logo & Title */}
        <div
          onClick={() => onSelectTab('create')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-zinc-950 border border-amber-500/30 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)] group-hover:border-amber-400/50 transition-colors">
            <Disc3 className="h-5 w-5 animate-[spin_10s_linear_infinite]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-bold tracking-tight text-zinc-100 sm:text-xl">
                Ravolka Music AI
              </span>
            </div>
            <p className="hidden text-[11px] text-zinc-400 tracking-wide sm:block">
              AI Music Creation Studio
            </p>
          </div>
        </div>

        {/* Center: Desktop Navigation Links (Clean unboxed typographic links) */}
        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={() => onSelectTab('create')}
            className={`flex items-center gap-2 text-sm font-medium transition-colors relative py-1 ${
              currentTab === 'create'
                ? 'text-amber-400 font-semibold'
                : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            <Music2 className="h-4 w-4" />
            <span>Create</span>
            {currentTab === 'create' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onSelectTab('library')}
            className={`flex items-center gap-2 text-sm font-medium transition-colors relative py-1 ${
              currentTab === 'library'
                ? 'text-amber-400 font-semibold'
                : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            <Library className="h-4 w-4" />
            <span>Library</span>
            {libraryCount > 0 && (
              <span className="text-xs text-zinc-400 font-mono">
                ({libraryCount})
              </span>
            )}
            {currentTab === 'library' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
            )}
          </button>
        </nav>

        {/* Right: Profile Icon Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenProfile}
            aria-label="User Profile"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-400 hover:border-zinc-700 hover:bg-zinc-800/80 transition-all active:scale-95"
            title="Profile & Settings"
          >
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
