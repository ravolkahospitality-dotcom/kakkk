export interface AudioEntry {
  id: string;
  buffer: Buffer;
  mimeType: string;
  title: string;
  createdAt: number;
}

class AudioStore {
  private cache = new Map<string, AudioEntry>();
  private readonly maxEntries = 100;

  public save(id: string, buffer: Buffer, mimeType: string, title: string): void {
    if (this.cache.size >= this.maxEntries) {
      // Remove oldest entry
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(id, {
      id,
      buffer,
      mimeType,
      title,
      createdAt: Date.now(),
    });
  }

  public get(id: string): AudioEntry | undefined {
    return this.cache.get(id);
  }

  public has(id: string): boolean {
    return this.cache.has(id);
  }
}

export const audioStore = new AudioStore();
