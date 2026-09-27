import React, { useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { MobileNav } from './components/MobileNav';
import { StudioCreate } from './components/StudioCreate';
import { GenerationLoader } from './components/GenerationLoader';
import { SongResult } from './components/SongResult';
import { MyLibrary } from './components/MyLibrary';
import { ProfileModal } from './components/ProfileModal';
import {
  GenerateFormState,
  Song,
  NavigationTab,
  Genre,
  Mood,
  Vocal,
  Language,
} from './types/music';
import {
  getHistory,
  saveSongToHistory,
  deleteSongFromHistory,
} from './services/storage';
import { musicGenerationService } from './services/musicGenerationService';

const DEFAULT_FORM: GenerateFormState = {
  prompt: '',
  genre: 'Cinematic',
  mood: 'Emotional',
  vocal: 'Male',
  language: 'English',
  isInstrumental: false,
};

const INSPIRATION_IDEAS: Array<{
  prompt: string;
  genre: Genre;
  mood: Mood;
  vocal: Vocal;
  language: Language;
  isInstrumental: boolean;
}> = [
  {
    prompt:
      'A slow cinematic song about two people meeting again after years apart, emotional male vocal, atmospheric piano, warm strings, gradually building into a powerful chorus.',
    genre: 'Cinematic',
    mood: 'Emotional',
    vocal: 'Male',
    language: 'English',
    isInstrumental: false,
  },
  {
    prompt:
      'Warm lo-fi indie folk about rainy Sunday afternoons, gentle fingerstyle acoustic guitar, whispery female vocals, and subtle tape hiss.',
    genre: 'Indie',
    mood: 'Nostalgic',
    vocal: 'Female',
    language: 'English',
    isInstrumental: false,
  },
  {
    prompt:
      'Futuristic synthwave cyberpunk odyssey with pulsing analog basslines, shimmering arpeggios, retro drum machines, and towering crescendo leads.',
    genre: 'Electronic',
    mood: 'Epic',
    vocal: 'Instrumental',
    language: 'English',
    isInstrumental: true,
  },
  {
    prompt:
      'Smooth midnight R&B duet with silky Rhodes chords, 808 sub-bass, tasteful vocal harmonies, and a lush late-night groove.',
    genre: 'R&B',
    mood: 'Romantic',
    vocal: 'Mixed',
    language: 'English',
    isInstrumental: false,
  },
  {
    prompt:
      'Lagu akustik bernuansa senja di tepi pantai, petikan gitar akustik lembut dengan vokal perempuan syahdu dan hembusan angin laut.',
    genre: 'Acoustic',
    mood: 'Peaceful',
    vocal: 'Female',
    language: 'Indonesian',
    isInstrumental: false,
  },
  {
    prompt:
      'Gritty alternative rock with heavy driving bassline, raw emotive vocals, and an explosive anthemic breakdown.',
    genre: 'Rock',
    mood: 'Dark',
    vocal: 'Male',
    language: 'English',
    isInstrumental: false,
  },
  {
    prompt:
      'Bright upbeat J-Pop anthem filled with sparkling piano, punchy drums, joyful vocals, and infectious energy celebrating summer.',
    genre: 'Pop',
    mood: 'Happy',
    vocal: 'Female',
    language: 'Japanese',
    isInstrumental: false,
  },
];

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('create');
  const [viewMode, setViewMode] = useState<'create' | 'result'>('create');
  const [form, setForm] = useState<GenerateFormState>(DEFAULT_FORM);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState('Harmonizing acoustic stems and rhythm...');
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [history, setHistory] = useState<Song[]>([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize history from storage
  useEffect(() => {
    const list = getHistory();
    setHistory(list);
    if (list.length > 0 && !currentSong) {
      setCurrentSong(list[0]);
    }
  }, []);

  const handleFormChange = <K extends keyof GenerateFormState>(
    field: K,
    value: GenerateFormState[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleInspire = () => {
    const random =
      INSPIRATION_IDEAS[Math.floor(Math.random() * INSPIRATION_IDEAS.length)];
    setForm({
      prompt: random.prompt,
      genre: random.genre,
      mood: random.mood,
      vocal: random.vocal,
      language: random.language,
      isInstrumental: random.isInstrumental,
    });
  };

  const handleGenerateSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.prompt.trim()) return;

    setIsGenerating(true);
    setErrorMessage(null);
    setGenerationStage('Preparing your prompt...');

    try {
      // Delegate generation to the modular music engine service (LyriaMusicProvider)
      const song = await musicGenerationService.generateSong(form, (stage) => {
        setGenerationStage(stage);
      });

      // Persist only real successful songs in local storage
      await saveSongToHistory(song);

      // Refresh history state
      const updatedHistory = getHistory();
      setHistory(updatedHistory);

      // Display the generated song in player view
      setCurrentSong(song);
      setViewMode('result');
      setCurrentTab('create');
    } catch (err: any) {
      console.error('Lyria 3.5 generation error:', err);
      setErrorMessage(
        err?.message ||
          'Lyria 3.5 requires a paid Gemini API tier. Please configure a paid API key to generate songs.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectSong = (song: Song) => {
    setCurrentSong(song);
    setViewMode('result');
    setCurrentTab('create');
  };

  const handleDeleteSong = async (id: string) => {
    const updated = await deleteSongFromHistory(id);
    setHistory(updated);
    if (currentSong?.id === id) {
      setCurrentSong(updated[0] || null);
      if (updated.length === 0) {
        setViewMode('create');
      }
    }
  };

  const handleCreateAnother = () => {
    setViewMode('create');
    setCurrentTab('create');
  };

  // Previous and Next track controls for the player
  const currentSongIndex = currentSong
    ? history.findIndex((s) => s.id === currentSong.id)
    : -1;
  const hasPrevious = currentSongIndex > 0;
  const hasNext = currentSongIndex >= 0 && currentSongIndex < history.length - 1;

  const handlePreviousTrack = () => {
    if (hasPrevious) {
      setCurrentSong(history[currentSongIndex - 1]);
    }
  };

  const handleNextTrack = () => {
    if (hasNext) {
      setCurrentSong(history[currentSongIndex + 1]);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090c] text-zinc-100 flex flex-col font-sans selection:bg-amber-500/25 selection:text-amber-200">
      {/* Studio Header Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab === 'library') {
            setHistory(getHistory());
          }
        }}
        libraryCount={history.length}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main Studio Workstation Canvas */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Error notification banner */}
        {errorMessage && (
          <div className="mb-8 mx-auto max-w-4xl rounded-2xl border border-red-500/40 bg-red-950/40 p-4 sm:p-5 backdrop-blur-md">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-red-200">
                    Lyria 3.5 Music Generation Notice
                  </h4>
                  <p className="text-xs sm:text-sm text-red-300/90 leading-relaxed">
                    {errorMessage}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-red-400 hover:text-red-200 p-1 rounded-lg hover:bg-red-900/40 transition-colors"
                aria-label="Dismiss error"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {currentTab === 'library' ? (
          <MyLibrary
            songs={history}
            onPlaySong={handleSelectSong}
            onDeleteSong={handleDeleteSong}
            onCreateNew={() => {
              setCurrentTab('create');
              setViewMode('create');
            }}
          />
        ) : isGenerating ? (
          <GenerationLoader
            genre={form.genre}
            mood={form.mood}
            isInstrumental={form.isInstrumental}
            stageMessage={generationStage}
          />
        ) : viewMode === 'result' && currentSong ? (
          <SongResult
            song={currentSong}
            onPrevious={handlePreviousTrack}
            onNext={handleNextTrack}
            hasPrevious={hasPrevious}
            hasNext={hasNext}
            onCreateAnother={handleCreateAnother}
          />
        ) : (
          <StudioCreate
            form={form}
            onChange={handleFormChange}
            onSubmit={handleGenerateSong}
            isGenerating={isGenerating}
            onInspire={handleInspire}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation (Create · Library · Profile) */}
      <MobileNav
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'profile') {
            setIsProfileOpen(true);
          } else {
            setCurrentTab(tab);
            if (tab === 'library') {
              setHistory(getHistory());
            }
          }
        }}
        libraryCount={history.length}
      />

      {/* Profile & Settings Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        songsCount={history.length}
      />

      {/* Desktop Footer (Hidden on mobile to leave room for bottom nav) */}
      <footer className="hidden md:block w-full border-t border-zinc-900 bg-zinc-950/80 py-6 text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-zinc-300">
              Ravolka Music AI
            </span>
            <span>·</span>
            <span>Turn an idea, a story, or a feeling into a song</span>
          </div>

          <div className="flex items-center gap-3">
            <span>Modular Core Architecture</span>
            <span aria-hidden="true" className="text-zinc-700">·</span>
            <span>Local Studio Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
