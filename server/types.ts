export type Genre =
  | 'Pop'
  | 'Cinematic'
  | 'Acoustic'
  | 'Rock'
  | 'R&B'
  | 'Indie'
  | 'Folk'
  | 'Electronic'
  | 'Jazz';

export type Mood =
  | 'Emotional'
  | 'Happy'
  | 'Sad'
  | 'Romantic'
  | 'Dark'
  | 'Peaceful'
  | 'Epic'
  | 'Nostalgic'
  | 'Hopeful';

export type Vocal = 'Male' | 'Female' | 'Mixed' | 'Instrumental';

export type Language =
  | 'Indonesian'
  | 'English'
  | 'Japanese'
  | 'Korean'
  | 'Spanish'
  | 'Other';

export interface GenerateMusicRequest {
  prompt: string;
  genre: Genre;
  mood: Mood;
  vocal: Vocal;
  language: Language;
  isInstrumental: boolean;
  model?: string;
}

export interface GeneratedSong {
  id: string;
  title: string;
  prompt: string;
  genre: Genre;
  mood: Mood;
  vocal: Vocal;
  language: Language;
  isInstrumental: boolean;
  lyrics: string;
  createdAt: string;
  audioUrl: string;
  downloadUrl?: string;
  mimeType: string;
  durationSeconds: number;
  audioBase64?: string;
  modelUsed: string;
  coverGradient: string;
  accentColor: string;
}
