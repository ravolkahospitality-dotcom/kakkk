import React from 'react';
import {
  Wand2,
  Dices,
  SlidersHorizontal,
  Flame,
  Mic2,
  Globe2,
  Check,
} from 'lucide-react';
import { Genre, Mood, Vocal, Language, GenerateFormState } from '../types/music';

interface StudioCreateProps {
  form: GenerateFormState;
  onChange: <K extends keyof GenerateFormState>(
    field: K,
    value: GenerateFormState[K]
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
  isGenerating: boolean;
  onInspire: () => void;
}

const GENRES: Genre[] = [
  'Pop',
  'Cinematic',
  'Acoustic',
  'Rock',
  'R&B',
  'Indie',
  'Folk',
  'Electronic',
  'Jazz',
];

const MOODS: Mood[] = [
  'Emotional',
  'Happy',
  'Sad',
  'Romantic',
  'Dark',
  'Peaceful',
  'Epic',
  'Nostalgic',
  'Hopeful',
];

const VOCALS: Vocal[] = ['Male', 'Female', 'Mixed', 'Instrumental'];

const LANGUAGES: Language[] = [
  'Indonesian',
  'English',
  'Japanese',
  'Korean',
  'Spanish',
  'Other',
];

export const StudioCreate: React.FC<StudioCreateProps> = ({
  form,
  onChange,
  onSubmit,
  isGenerating,
  onInspire,
}) => {
  const isPromptValid = form.prompt.trim().length >= 3;

  const handleInstrumentalToggle = (checked: boolean) => {
    onChange('isInstrumental', checked);
    if (checked) {
      onChange('vocal', 'Instrumental');
    } else if (form.vocal === 'Instrumental') {
      onChange('vocal', 'Female');
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-2 sm:px-4">
      {/* Studio Header */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-100 mb-4">
          Create something you can feel.
        </h1>

        <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Turn an idea, a story, or a feeling into a song.
        </p>
      </div>

      {/* Main Studio Console Deck */}
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Large Prompt Card */}
        <div className="relative rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 sm:p-8 backdrop-blur-sm transition-all focus-within:border-zinc-700">
          <div className="flex items-center justify-between mb-3">
            <label
              htmlFor="prompt-input"
              className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-zinc-300"
            >
              Describe the song you want to create...
            </label>

            <button
              type="button"
              onClick={onInspire}
              disabled={isGenerating}
              className="flex items-center gap-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 px-3 py-1.5 text-xs font-medium text-amber-300 hover:text-amber-200 border border-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              <Dices className="h-3.5 w-3.5 text-amber-400" />
              <span>Inspire Me</span>
            </button>
          </div>

          <textarea
            id="prompt-input"
            rows={4}
            value={form.prompt}
            onChange={(e) => onChange('prompt', e.target.value)}
            disabled={isGenerating}
            placeholder="A slow cinematic song about two people meeting again after years apart, emotional male vocal, atmospheric piano, warm strings, gradually building into a powerful chorus."
            className="w-full resize-none rounded-2xl bg-zinc-950/90 border border-zinc-800/80 p-4 text-sm sm:text-base text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all disabled:opacity-50"
          />

          <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
            <span>Specify instruments, mood, narrative, or tempo</span>
            <span className="font-mono text-zinc-400">{form.prompt.length} chars</span>
          </div>
        </div>

        {/* Instrumental Toggle Option (Check box) */}
        <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/60 px-6 py-4">
          <div>
            <span className="text-sm font-medium text-zinc-200 block">
              Instrumental Track
            </span>
            <span className="text-xs text-zinc-400">
              Generate pure acoustic and melodic arrangement without vocal lines
            </span>
          </div>

          <label className="relative flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.isInstrumental}
              onChange={(e) => handleInstrumentalToggle(e.target.checked)}
              disabled={isGenerating}
              className="sr-only"
            />
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-lg border transition-colors ${
                form.isInstrumental
                  ? 'bg-amber-500 border-amber-500 text-zinc-950'
                  : 'bg-zinc-800 border-zinc-700 text-transparent'
              }`}
            >
              <Check className="h-4 w-4 stroke-[3]" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Instrumental
            </span>
          </label>
        </div>

        {/* Studio Controls Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Genre Selection */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-wider text-zinc-300">
                <SlidersHorizontal className="h-4 w-4 text-amber-400" />
                <span>Genre</span>
              </span>
              <span className="text-xs text-amber-400/90 font-medium font-mono">
                {form.genre}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {GENRES.map((g) => {
                const isSelected = form.genre === g;
                return (
                  <button
                    key={g}
                    type="button"
                    disabled={isGenerating}
                    onClick={() => onChange('genre', g)}
                    className={`rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-zinc-950 font-semibold shadow-sm'
                        : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700/80 hover:text-zinc-100 border border-zinc-700/50'
                    } disabled:opacity-50`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mood Selection */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-wider text-zinc-300">
                <Flame className="h-4 w-4 text-amber-400" />
                <span>Mood</span>
              </span>
              <span className="text-xs text-amber-400/90 font-medium font-mono">
                {form.mood}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {MOODS.map((m) => {
                const isSelected = form.mood === m;
                return (
                  <button
                    key={m}
                    type="button"
                    disabled={isGenerating}
                    onClick={() => onChange('mood', m)}
                    className={`rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-zinc-950 font-semibold shadow-sm'
                        : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700/80 hover:text-zinc-100 border border-zinc-700/50'
                    } disabled:opacity-50`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vocal Style */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-wider text-zinc-300">
                <Mic2 className="h-4 w-4 text-amber-400" />
                <span>Vocal</span>
              </span>
              <span className="text-xs text-amber-400/90 font-medium font-mono">
                {form.isInstrumental ? 'Instrumental' : form.vocal}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {VOCALS.map((v) => {
                const isSelected = form.vocal === v;
                const isDisabled = form.isInstrumental && v !== 'Instrumental';
                return (
                  <button
                    key={v}
                    type="button"
                    disabled={isGenerating || isDisabled}
                    onClick={() => onChange('vocal', v)}
                    className={`rounded-xl py-2 px-3 text-center text-xs sm:text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-zinc-950 font-semibold'
                        : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700/80 hover:text-zinc-100 border border-zinc-700/50'
                    } ${isDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}
                  >
                    {v}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language Selection */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-wider text-zinc-300">
                <Globe2 className="h-4 w-4 text-amber-400" />
                <span>Language</span>
              </span>
              <span className="text-xs text-amber-400/90 font-medium font-mono">
                {form.language}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((l) => {
                const isSelected = form.language === l;
                return (
                  <button
                    key={l}
                    type="button"
                    disabled={isGenerating}
                    onClick={() => onChange('language', l)}
                    className={`rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-zinc-950 font-semibold shadow-sm'
                        : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700/80 hover:text-zinc-100 border border-zinc-700/50'
                    } disabled:opacity-50`}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Generate Song Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={!isPromptValid || isGenerating}
            className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-400 py-4 sm:py-5 px-8 font-display text-lg sm:text-xl font-bold text-zinc-950 shadow-[0_0_35px_rgba(245,158,11,0.25)] transition-all hover:shadow-[0_0_45px_rgba(245,158,11,0.4)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Wand2 className="h-6 w-6 transition-transform group-hover:rotate-12" />
            <span>Generate Song</span>
          </button>
        </div>
      </form>
    </div>
  );
};
