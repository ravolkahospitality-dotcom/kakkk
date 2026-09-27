import { Router, Request, Response } from 'express';
import { GenerateMusicRequest, Genre, Mood, Vocal, Language } from '../types.js';
import { musicGenerator } from '../services/musicGenerator.js';
import { audioStore } from '../services/audioStore.js';

const router = Router();

const VALID_GENRES: Genre[] = [
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

const VALID_MOODS: Mood[] = [
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

const VALID_VOCALS: Vocal[] = ['Male', 'Female', 'Mixed', 'Instrumental'];

const VALID_LANGUAGES: Language[] = [
  'Indonesian',
  'English',
  'Japanese',
  'Korean',
  'Spanish',
  'Other',
];

/**
 * Health check & configuration status
 */
router.get('/health', (_req: Request, res: Response) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const hasApiKey = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim() !== '');

  res.json({
    status: 'ok',
    service: 'Ravolka Music AI',
    model: 'lyria-3.5',
    hasApiKey,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Generate song via Lyria 3.5
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const {
      prompt,
      genre,
      mood,
      vocal,
      language,
      isInstrumental,
      model,
    } = req.body as Partial<GenerateMusicRequest>;

    // Validate prompt
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 3) {
      res.status(400).json({
        success: false,
        error: 'Please describe the song you want to create (minimum 3 characters).',
      });
      return;
    }

    // Validate genre
    if (!genre || !VALID_GENRES.includes(genre as Genre)) {
      res.status(400).json({
        success: false,
        error: 'Invalid or missing music genre.',
      });
      return;
    }

    // Validate mood
    if (!mood || !VALID_MOODS.includes(mood as Mood)) {
      res.status(400).json({
        success: false,
        error: 'Invalid or missing mood selection.',
      });
      return;
    }

    // Validate vocal
    if (!vocal || !VALID_VOCALS.includes(vocal as Vocal)) {
      res.status(400).json({
        success: false,
        error: 'Invalid or missing vocal selection.',
      });
      return;
    }

    // Validate language
    if (!language || !VALID_LANGUAGES.includes(language as Language)) {
      res.status(400).json({
        success: false,
        error: 'Invalid or missing language selection.',
      });
      return;
    }

    const payload: GenerateMusicRequest = {
      prompt: prompt.trim(),
      genre: genre as Genre,
      mood: mood as Mood,
      vocal: vocal as Vocal,
      language: language as Language,
      isInstrumental: Boolean(isInstrumental || vocal === 'Instrumental'),
      model: model || 'lyria-3.5',
    };

    const { song } = await musicGenerator.generateSong(payload);

    res.json({
      success: true,
      song,
    });
  } catch (error: any) {
    console.error('[API /generate] Error generating song:', error);
    const message =
      error?.message || 'An unexpected error occurred while generating the song.';
    res.status(500).json({
      success: false,
      error: message,
    });
  }
});

/**
 * Stream or Download generated audio with Range support
 */
router.get('/audio/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const entry = audioStore.get(id);

  if (!entry) {
    res.status(404).json({
      error: 'Audio file not found or expired from session cache.',
    });
    return;
  }

  const { buffer, mimeType, title } = entry;
  const total = buffer.length;
  const isDownload = req.query.download === 'true';

  // Format safe filename
  const safeTitle = (title || 'Ravolka-Song')
    .replace(/[^a-zA-Z0-9_\-\s]/g, '')
    .trim()
    .replace(/\s+/g, '_');
  const extension = mimeType.includes('wav') ? 'wav' : 'mp3';

  if (isDownload) {
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${safeTitle}.${extension}"`
    );
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', total);
    res.send(buffer);
    return;
  }

  // Handle Range request for seeking
  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const partialStart = parts[0];
    const partialEnd = parts[1];

    const start = parseInt(partialStart, 10);
    const end = partialEnd ? parseInt(partialEnd, 10) : total - 1;
    const chunkSize = end - start + 1;

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${total}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': mimeType,
    });
    res.end(buffer.subarray(start, end + 1));
  } else {
    res.writeHead(200, {
      'Content-Length': total,
      'Content-Type': mimeType,
      'Accept-Ranges': 'bytes',
    });
    res.end(buffer);
  }
});

/**
 * Curated inspiration prompts for music producers
 */
const INSPIRATION_PROMPTS = [
  {
    genre: 'Cinematic' as Genre,
    mood: 'Emotional' as Mood,
    vocal: 'Male' as Vocal,
    language: 'English' as Language,
    prompt:
      'A slow cinematic song about two people meeting again after years apart, emotional male vocal, atmospheric piano, warm strings, gradually building into a powerful chorus.',
  },
  {
    genre: 'Indie' as Genre,
    mood: 'Nostalgic' as Mood,
    vocal: 'Female' as Vocal,
    language: 'English' as Language,
    prompt:
      'Warm lo-fi indie folk about rainy Sunday afternoons, gentle fingerstyle acoustic guitar, whispery female vocals, and subtle tape hiss.',
  },
  {
    genre: 'Electronic' as Genre,
    mood: 'Epic' as Mood,
    vocal: 'Instrumental' as Vocal,
    language: 'English' as Language,
    prompt:
      'Futuristic synthwave cyberpunk odyssey with pulsing analog basslines, shimmering arpeggios, retro drum machines, and towering crescendo leads.',
  },
  {
    genre: 'R&B' as Genre,
    mood: 'Romantic' as Mood,
    vocal: 'Mixed' as Vocal,
    language: 'English' as Language,
    prompt:
      'Smooth midnight R&B duet with silky Rhodes chords, 808 sub-bass, tasteful vocal harmonies, and a lush late-night groove.',
  },
  {
    genre: 'Acoustic' as Genre,
    mood: 'Peaceful' as Mood,
    vocal: 'Female' as Vocal,
    language: 'Indonesian' as Language,
    prompt:
      'Lagu akustik bernuansa senja di tepi pantai, petikan gitar akustik lembut dengan vokal perempuan syahdu dan hembusan angin laut.',
  },
  {
    genre: 'Rock' as Genre,
    mood: 'Dark' as Mood,
    vocal: 'Male' as Vocal,
    language: 'English' as Language,
    prompt:
      'Gritty alternative rock with heavy distorted guitars, driving bassline, raw emotive vocals, and an explosive anthemic breakdown.',
  },
  {
    genre: 'Pop' as Genre,
    mood: 'Happy' as Mood,
    vocal: 'Female' as Vocal,
    language: 'Japanese' as Language,
    prompt:
      'Upbeat J-Pop anthem filled with bright sparkling piano, punchy drums, joyful vocals, and infectious energy celebrating summer.',
  },
];

router.get('/inspire', (_req: Request, res: Response) => {
  const randomIndex = Math.floor(Math.random() * INSPIRATION_PROMPTS.length);
  res.json({
    success: true,
    inspiration: INSPIRATION_PROMPTS[randomIndex],
  });
});

export default router;
