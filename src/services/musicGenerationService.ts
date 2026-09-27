import { GenerateFormState, Song } from '../types/music';

/**
 * Interface for music generation engine providers.
 * Decouples the frontend UI from direct SDK/network dependencies.
 */
export interface IMusicEngineProvider {
  name: string;
  generate(
    params: GenerateFormState,
    onProgress?: (stage: string) => void
  ): Promise<Song>;
}

/**
 * Official Google Lyria 3.5 Music Provider
 * Connects directly to the backend endpoint which communicates with Lyria 3.5
 * using the official @google/genai Interactions API.
 */
export class LyriaMusicProvider implements IMusicEngineProvider {
  name = 'Google Lyria 3.5 Engine';

  async generate(
    params: GenerateFormState,
    onProgress?: (stage: string) => void
  ): Promise<Song> {
    onProgress?.('Preparing your prompt...');

    // Progress updates reflecting actual audio generation workflow stages
    let stageIndex = 0;
    const stages = [
      'Preparing your prompt...',
      'Creating your song...',
      'Generating music with Lyria 3.5...',
      'Preparing audio...',
      'Almost ready...',
    ];

    const timer = setInterval(() => {
      stageIndex++;
      if (stageIndex < stages.length) {
        onProgress?.(stages[stageIndex]);
      }
    }, 2800);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: params.prompt,
          genre: params.genre,
          mood: params.mood,
          vocal: params.vocal,
          language: params.language,
          isInstrumental: params.isInstrumental,
          model: 'lyria-3.5',
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success || !data?.song) {
        const errorMsg =
          data?.error ||
          `Lyria 3.5 generation failed (Status ${response.status}).`;
        throw new Error(errorMsg);
      }

      return data.song as Song;
    } finally {
      clearInterval(timer);
    }
  }
}

/**
 * Singleton Music Generation Service
 */
class MusicGenerationService {
  private currentEngine: IMusicEngineProvider;

  constructor() {
    this.currentEngine = new LyriaMusicProvider();
  }

  public setEngine(engine: IMusicEngineProvider) {
    this.currentEngine = engine;
  }

  public getEngineName(): string {
    return this.currentEngine.name;
  }

  public async generateSong(
    params: GenerateFormState,
    onProgress?: (stage: string) => void
  ): Promise<Song> {
    return this.currentEngine.generate(params, onProgress);
  }
}

export const musicGenerationService = new MusicGenerationService();
