import React from 'react';
import { Music2, Library, User } from 'lucide-react';
import { NavigationTab } from '../types/music';

interface MobileNavProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  libraryCount: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentTab,
  onSelectTab,
  libraryCount,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-800/90 bg-[#08090c]/95 backdrop-blur-lg px-2 pb-safe">
      <div className="flex h-16 items-center justify-around">
        {/* Create */}
        <button
          onClick={() => onSelectTab('create')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 gap-1 min-h-[44px] transition-colors ${
            currentTab === 'create'
              ? 'text-amber-400 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          aria-label="Create Music"
        >
          <Music2 className="h-5 w-5" />
          <span className="text-[11px] font-medium">Create</span>
        </button>

        {/* Library */}
        <button
          onClick={() => onSelectTab('library')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 gap-1 min-h-[44px] transition-colors relative ${
            currentTab === 'library'
              ? 'text-amber-400 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          aria-label="Music Library"
        >
          <div className="relative">
            <Library className="h-5 w-5" />
            {libraryCount > 0 && (
              <span className="absolute -top-1 -right-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-zinc-950 px-0.5">
                {libraryCount}
              </span>
            )}
          </div>
          <span className="text-[11px] font-medium">Library</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => onSelectTab('profile')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 gap-1 min-h-[44px] transition-colors ${
            currentTab === 'profile'
              ? 'text-amber-400 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          aria-label="Profile and Settings"
        >
          <User className="h-5 w-5" />
          <span className="text-[11px] font-medium">Profile</span>
        </button>
      </div>
    </nav>
  );
};
