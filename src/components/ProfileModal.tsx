import React from 'react';
import {
  User,
  X,
  Disc3,
  Layers,
  Sparkles,
  HardDrive,
  Cpu,
  ShieldCheck,
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  songsCount: number;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  songsCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8 shadow-2xl z-10 space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-zinc-100">
                Studio Profile
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                ravolkahospitality@gmail.com
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            aria-label="Close Profile"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <Disc3 className="h-3.5 w-3.5 text-amber-400" />
              <span>Library Tracks</span>
            </div>
            <p className="font-display text-2xl font-extrabold text-zinc-100">
              {songsCount}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <HardDrive className="h-3.5 w-3.5 text-amber-400" />
              <span>Storage</span>
            </div>
            <p className="font-display text-2xl font-extrabold text-zinc-100">
              Local V1
            </p>
          </div>
        </div>

        {/* Audio Engine Configuration (Modular) */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 font-medium text-zinc-300">
              <Cpu className="h-4 w-4 text-amber-400" />
              <span>Music Engine Core</span>
            </span>
            <span className="text-amber-400/90 font-mono text-[11px]">
              Modular Architecture
            </span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            The frontend communicates via an isolated music generation service layer, ready for Google Lyria 3.5 neural engine integration in the next step.
          </p>

          <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
            <span>Audio Spec: Stereo 44.1kHz</span>
            <span>Format: 16-bit WAV</span>
          </div>
        </div>

        {/* Security & Integrity Note */}
        <div className="flex items-center gap-2 text-xs text-zinc-400 px-1">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>No external keys or billing exposed in client code</span>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-zinc-800 hover:bg-zinc-700 py-3 text-xs sm:text-sm font-semibold text-zinc-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
