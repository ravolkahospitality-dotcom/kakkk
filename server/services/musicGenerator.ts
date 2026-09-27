import { GoogleGenAI } from '@google/genai';
import { GenerateMusicRequest, GeneratedSong, Genre } from '../types.js';
import { audioStore } from './audioStore.js';
import crypto from 'crypto';

interface GenerationResult {
  song: GeneratedSong;
  audioBuffer: Buffer;
}

const PALETTES: Record<Genre, { gradient: string; accent: string }> = {
  Cinematic: {
    gradient: 'from-amber-600 via-stone-900 to-black',
    accent: '#d97706',
  },
  Pop: {
    gradient: 'from-pink-600 via-purple-950 to-black',
    accent: '#ec4899',
  },
  Acoustic: {
    gradient: 'from-emerald-700 via-amber-950 to-black',
    accent: '#10b981',
  },
  Rock: {
    gradient: 'from-red-700 via-zinc-900 to-black',
    accent: '#ef4444',
  },
  'R&B': {
    gradient: 'from-indigo-700 via-fuchsia-950 to-black',
    accent: '#8b5cf6',
  },
  Indie: {
    gradient: 'from-teal-600 via-slate-900 to-black',
    accent: '#14b8a6',
  },
  Folk: {
    gradient: 'from-amber-800 via-orange-950 to-black',
    accent: '#f59e0b',
  },
  Electronic: {
    gradient: 'from-cyan-500 via-blue-950 to-black',
    accent: '#06b6d4',
  },
  Jazz: {
    gradient: 'from-yellow-600 via-neutral-900 to-black',
    accent: '#eab308',
  },
};

/**
 * Standardized error classifier for Google Gemini Lyria 3.5
 */
export function formatLyriaError(err: any): string {
  if (!err) return 'Music generation failed.';
  let msg = err?.message || String(err);

  try {
    const parsed = JSON.parse(msg);
    if (parsed.error?.message) {
      msg = parsed.error.message;
      try {
        const nested = JSON.parse(msg);
        if (nested.error?.message) {
          msg = nested.error.message;
        }
      } catch {
        // ignore
      }
    }
  } catch {
    // ignore
  }

  // Paid tier & Quota exceeded handling
  if (
    msg.includes('Quota exceeded') ||
    msg.includes('429') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('free_tier') ||
    msg.includes('FreeTier')
  ) {
    return 'Lyria 3.5 requires a paid Gemini API tier. Please configure a paid API key to generate songs.';
  }

  // Authentication & API Key validation
  if (
    msg.includes('API key not valid') ||
    msg.includes('401') ||
    msg.includes('UNAUTHENTICATED')
  ) {
    return 'The configured GEMINI_API_KEY is invalid or authentication failed. Please verify your Gemini API key in Google AI Studio.';
  }

  // Authorization / Permission
  if (
    msg.includes('403') ||
    msg.includes('PERMISSION_DENIED') ||
    msg.includes('permission denied')
  ) {
    return 'Permission denied for Lyria 3.5. Your Gemini API key lacks authorization to access Lyria models.';
  }

  // Model Availability
  if (
    msg.includes('not found') ||
    msg.includes('404') ||
    msg.includes('is not supported')
  ) {
    return 'The requested Lyria 3.5 music model is currently unavailable for this account region or configuration.';
  }

  // Rate Limiting
  if (msg.includes('rate limit') || msg.includes('Rate limit')) {
    return 'Rate limit reached for Lyria 3.5. Please wait a moment before generating another song.';
  }

  return msg;
}

export class MusicGeneratorService {
  /**
   * Primary and ONLY model used for song generation
   * Strictly no fallback to preview or clip models
   */
  private readonly MODEL_NAME = 'lyria-3.5';

  private getApiKey(): string {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === 'MY_GEMINI_API_KEY' || key.trim() === '') {
      throw new Error(
        'GEMINI_API_KEY is not configured on the server. Please configure your GEMINI_API_KEY in the AI Studio Settings > Secrets panel.'
      );
    }
    return key.trim();
  }

  /**
   * Combines user parameters into an evocative natural prompt for Lyria 3.5
   * clearly communicating genre, mood, vocal style, language, instrumental status,
   * narrative theme, arrangement, and ~2-3 min song duration.
   */
  private buildMusicPrompt(request: GenerateMusicRequest): string {
    const isInstrumental = Boolean(
      request.isInstrumental || request.vocal === 'Instrumental'
    );

    if (isInstrumental) {
      return `Create a full-length studio instrumental track (approximately 2 to 3 minutes in duration) in the ${request.genre} genre with an evocative ${request.mood} mood.

Production Specifications:
- Genre: ${request.genre}
- Mood & Atmosphere: ${request.mood}
- Creative Direction & Narrative Theme: ${request.prompt.trim()}
- Arrangement & Flow: Complete instrumental piece with an atmospheric intro, evolving harmonic themes, rhythmic build-up, melodic climax, and organic outro.
- Vocal Requirement: Strictly instrumental. Do not include any lead vocals, backing vocals, spoken words, or human vocalizations.

Output Instructions:
1. Provide an evocative Title for the instrumental piece on the first line.
2. Generate full-length stereo audio arrangement.`;
    }

    return `Create a full-length studio song (approximately 2 to 3 minutes in duration) in the ${request.genre} genre with an evocative ${request.mood} mood.

Production Specifications:
- Genre: ${request.genre}
- Mood & Atmosphere: ${request.mood}
- Vocal Style & Performance: Expressive ${request.vocal} vocal delivery performed in ${request.language} with emotional resonance and clear melodic presence.
- Language: ${request.language}
- Song Subject & Story: ${request.prompt.trim()}
- Arrangement & Structure: Complete song structure featuring an Intro, Verse 1, Chorus, Verse 2, Bridge, high-energy Chorus, and Outro.

Output Instructions:
1. Provide an evocative Song Title on the first line.
2. Provide complete formatted lyrics with clear section markers: [Intro], [Verse 1], [Chorus], [Verse 2], [Bridge], [Outro] in ${request.language}.
3. Generate the stereo audio with high production quality, balanced instrumentation, and clear vocals.`;
  }

  /**
   * Extract title and lyrics from model output text
   */
  private extractTitleAndLyrics(
    rawText: string,
    prompt: string,
    genre: Genre,
    mood: string
  ): { title: string; lyrics: string } {
    let cleanText = (rawText || '').trim();
    let title = '';

    // Check for explicit "Title: ..." marker
    const titleMatch =
      cleanText.match(/(?:Title|Song Title|Track Title):\s*["']?([^"\n\r]+)["']?/i) ||
      cleanText.match(/^#\s*([^\n\r]+)/m);

    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].trim();
      cleanText = cleanText.replace(titleMatch[0], '').trim();
    }

    // Check first non-empty line if it looks like a title
    if (!title && cleanText) {
      const lines = cleanText.split('\n').map((l) => l.trim()).filter(Boolean);
      if (
        lines[0] &&
        lines[0].length < 60 &&
        !lines[0].startsWith('[') &&
        !lines[0].toLowerCase().includes('verse') &&
        !lines[0].toLowerCase().includes('here is')
      ) {
        title = lines[0].replace(/^["']|["']$/g, '').trim();
        cleanText = lines.slice(1).join('\n').trim();
      }
    }

    // Clean fallback title derived from prompt keywords
    if (!title) {
      const words = prompt
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(
          (w) =>
            w.length > 2 &&
            !['song', 'track', 'about', 'with', 'into', 'like'].includes(
              w.toLowerCase()
            )
        )
        .slice(0, 3);
      if (words.length > 0) {
        title = words
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ');
      } else {
        title = `${mood} ${genre} Opus`;
      }
    }

    return { title, lyrics: cleanText };
  }

  /**
   * Main song generation invoking Lyria 3.5 via the official Interactions API
   */
  public async generateSong(
    request: GenerateMusicRequest
  ): Promise<GenerationResult> {
    const apiKey = this.getApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const combinedPrompt = this.buildMusicPrompt(request);

    console.log(
      `[MusicGenerator] Invoking official Interactions API with model: ${this.MODEL_NAME}`
    );

    let interaction: any;
    try {
      // Official Google GenAI SDK Interactions API pattern for Lyria 3.5
      interaction = await ai.interactions.create({
        model: this.MODEL_NAME,
        input: combinedPrompt,
      });
    } catch (err: any) {
      console.error(
        `[MusicGenerator] Lyria 3.5 Interactions API request failed:`,
        err?.message || err
      );
      const formattedMessage = formatLyriaError(err);
      throw new Error(formattedMessage);
    }

    if (!interaction) {
      throw new Error(
        'Lyria 3.5 did not return a valid interaction response from the server.'
      );
    }

    // Extract audio data directly from interaction.output_audio
    let audioBase64: string | undefined = interaction.output_audio?.data;
    let mimeType: string = interaction.output_audio?.mime_type || 'audio/mp3';
    let lyricsText: string = interaction.output_text || '';

    // Also check interaction.steps if populated
    if (!audioBase64 && Array.isArray(interaction.steps)) {
      for (const step of interaction.steps) {
        if (step.type === 'model_output' && Array.isArray(step.content)) {
          for (const item of step.content) {
            if (item.type === 'audio' && item.data) {
              audioBase64 = item.data;
              if (item.mime_type) mimeType = item.mime_type;
            }
            if (item.type === 'text' && item.text && !lyricsText) {
              lyricsText = item.text;
            }
          }
        }
      }
    }

    // Verify audio exists; do NOT create a fake song on failure
    if (!audioBase64) {
      throw new Error(
        'Lyria 3.5 completed the request but did not return audio data. Please ensure your Gemini API key has active billing enabled.'
      );
    }

    // Decode base64 audio into binary Buffer
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    const songId = `ravolka_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const isInstrumental = Boolean(
      request.isInstrumental || request.vocal === 'Instrumental'
    );

    const { title, lyrics } = isInstrumental
      ? {
          title: this.extractTitleAndLyrics(
            lyricsText,
            request.prompt,
            request.genre,
            request.mood
          ).title,
          lyrics: '',
        }
      : this.extractTitleAndLyrics(
          lyricsText,
          request.prompt,
          request.genre,
          request.mood
        );

    // Save audio into audioStore for HTTP streaming & download
    audioStore.save(songId, audioBuffer, mimeType, title);

    const palette = PALETTES[request.genre] || PALETTES.Cinematic;

    // Calculate approximate duration for UI player (~2 to 3 minutes for full tracks)
    let durationSeconds = 180;
    if (audioBuffer.length > 0) {
      if (mimeType.includes('mp3') || mimeType.includes('mpeg')) {
        // ~128kbps to 192kbps average bitrate (~20KB/s)
        const estimated = Math.round(audioBuffer.length / 20000);
        if (estimated >= 30 && estimated <= 600) {
          durationSeconds = estimated;
        }
      } else if (audioBuffer.length > 44) {
        // WAV 44.1kHz 16-bit stereo = 176400 bytes/sec
        const estimated = Math.round((audioBuffer.length - 44) / 176400);
        if (estimated >= 10 && estimated <= 600) {
          durationSeconds = estimated;
        }
      }
    }

    const song: GeneratedSong = {
      id: songId,
      title,
      prompt: request.prompt,
      genre: request.genre,
      mood: request.mood,
      vocal: isInstrumental ? 'Instrumental' : request.vocal,
      language: request.language,
      isInstrumental,
      lyrics,
      createdAt: new Date().toISOString(),
      audioUrl: `/api/audio/${songId}`,
      downloadUrl: `/api/audio/${songId}?download=true`,
      mimeType,
      durationSeconds,
      audioBase64: `data:${mimeType};base64,${audioBase64}`,
      modelUsed: this.MODEL_NAME,
      coverGradient: palette.gradient,
      accentColor: palette.accent,
    };

    return { song, audioBuffer };
  }
}

export const musicGenerator = new MusicGeneratorService();
