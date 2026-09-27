import { Song } from '../types/music';

const STORAGE_KEY = 'ravolka_music_history_v1';
const DB_NAME = 'RavolkaAudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'audio_blobs';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result as IDBDatabase;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export async function storeAudioBlob(id: string, base64Data: string): Promise<void> {
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({ id, base64Data, savedAt: Date.now() });
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to store audio in IndexedDB:', err);
  }
}

export async function getAudioBlob(id: string): Promise<string | null> {
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(id);
    return new Promise((resolve) => {
      req.onsuccess = () => {
        resolve(req.result?.base64Data || null);
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function removeAudioBlob(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
  } catch {
    // ignore
  }
}

const INITIAL_DEMO_SONGS: Song[] = [
  {
    id: 'ravolka_demo_1',
    title: 'Neon Skyline Horizon',
    prompt: 'Synthwave electronic bassline with energetic rhythm and distant vocoder melodies',
    genre: 'Electronic',
    mood: 'Epic',
    vocal: 'Instrumental',
    language: 'English',
    isInstrumental: true,
    lyrics: '',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    audioUrl: '',
    mimeType: 'audio/wav',
    durationSeconds: 194,
    coverGradient: 'from-cyan-500 via-blue-950 to-black',
    accentColor: '#06b6d4',
  },
  {
    id: 'ravolka_demo_2',
    title: 'Autumn Rain at Dusk',
    prompt: 'A gentle acoustic fingerpicking song with warm nostalgic male vocals and rain ambience',
    genre: 'Acoustic',
    mood: 'Nostalgic',
    vocal: 'Male',
    language: 'English',
    isInstrumental: false,
    lyrics: `[Verse 1]\nRaindrops against the window frame\nWhispering an old familiar name\nLeaves are turning gold and brown\nWalking softly through this quiet town\n\n[Chorus]\nTake me back to where we stood\nEverything felt right and good\nAutumn wind and twilight sky\nSaying hello before goodbye`,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    audioUrl: '',
    mimeType: 'audio/wav',
    durationSeconds: 218,
    coverGradient: 'from-emerald-700 via-amber-950 to-black',
    accentColor: '#10b981',
  },
];

export function getHistory(): Song[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_SONGS));
      return INITIAL_DEMO_SONGS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading song history:', err);
    return INITIAL_DEMO_SONGS;
  }
}

export async function saveSongToHistory(song: Song): Promise<void> {
  try {
    // If audioBase64 exists, persist in IndexedDB
    if (song.audioBase64) {
      await storeAudioBlob(song.id, song.audioBase64);
    }

    // Keep metadata in localStorage (without massive base64 to avoid quota limits)
    const history = getHistory();
    const cleanSong: Song = {
      ...song,
      // Strip raw base64 from localStorage to stay lean
      audioBase64: undefined,
    };

    const updated = [cleanSong, ...history.filter((s) => s.id !== song.id)].slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving song to history:', err);
  }
}

export async function deleteSongFromHistory(id: string): Promise<Song[]> {
  try {
    await removeAudioBlob(id);
    const history = getHistory();
    const updated = history.filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error deleting song:', err);
    return getHistory();
  }
}
