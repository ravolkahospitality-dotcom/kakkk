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

export interface Song {
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
  mimeType: string;
  durationSeconds: number;
  audioBase64?: string;
  coverGradient: string;
  accentColor: string;
}

export interface GenerateFormState {
  prompt: string;
  genre: Genre;
  mood: Mood;
  vocal: Vocal;
  language: Language;
  isInstrumental: boolean;
}

export type LibraryFilter = 'all' | 'songs' | 'instrumentals';

export type NavigationTab = 'create' | 'library' | 'profile';

