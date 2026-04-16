import { openDB, IDBPDatabase } from 'idb';

export interface OfflineContent {
  id: string;
  type: 'bible' | 'study' | 'outline' | 'lesson';
  title: string;
  content: any;
  version?: string;
  downloadedAt: number;
}

export interface OfflineBibleChapter {
  id: string;
  book: string;
  chapter: number;
  version: string;
  content: any;
  downloadedAt: number;
}

export interface OfflineStudyMaterial {
  id: string;
  type: 'study' | 'outline' | 'lesson';
  title: string;
  content: string;
  downloadedAt: number;
}

class OfflineService {
  private dbPromise: Promise<IDBPDatabase>;

  constructor() {
    this.dbPromise = openDB('imersao-biblica-offline', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('content')) {
          db.createObjectStore('content', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('chapters')) {
          db.createObjectStore('chapters', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('materials')) {
          db.createObjectStore('materials', { keyPath: 'id' });
        }
      },
    });
  }

  // Generic methods
  async saveContent(content: OfflineContent) {
    const db = await this.dbPromise;
    await db.put('content', content);
  }

  async getContent(id: string): Promise<OfflineContent | undefined> {
    const db = await this.dbPromise;
    return db.get('content', id);
  }

  async getAllContent(): Promise<OfflineContent[]> {
    const db = await this.dbPromise;
    const content = await db.getAll('content');
    const chapters = await db.getAll('chapters');
    const materials = await db.getAll('materials');
    
    // Convert chapters and materials to OfflineContent format if they are not in 'content' store
    const convertedChapters = chapters.map(c => ({
      id: c.id,
      type: 'bible' as const,
      title: `${c.book} ${c.chapter}`,
      content: c.content,
      version: c.version,
      downloadedAt: c.downloadedAt
    }));
    
    const convertedMaterials = materials.map(m => ({
      id: m.id,
      type: m.type,
      title: m.title,
      content: m.content,
      downloadedAt: m.downloadedAt
    }));
    
    // Use a Map to avoid duplicates by ID
    const allContentMap = new Map<string, OfflineContent>();
    
    [...content, ...convertedChapters, ...convertedMaterials].forEach(item => {
      allContentMap.set(item.id, item);
    });
    
    return Array.from(allContentMap.values());
  }

  async deleteContent(id: string) {
    const db = await this.dbPromise;
    await db.delete('content', id);
    await db.delete('chapters', id);
    await db.delete('materials', id);
  }

  async isDownloaded(id: string): Promise<boolean> {
    const content = await this.getContent(id);
    return !!content;
  }

  // Backward compatibility methods
  async saveChapter(chapter: OfflineBibleChapter) {
    const db = await this.dbPromise;
    await db.put('chapters', chapter);
  }

  async getAllChapters(): Promise<OfflineBibleChapter[]> {
    const db = await this.dbPromise;
    return db.getAll('chapters');
  }

  async deleteChapter(id: string) {
    const db = await this.dbPromise;
    await db.delete('chapters', id);
  }

  async saveStudyMaterial(material: OfflineStudyMaterial) {
    const db = await this.dbPromise;
    await db.put('materials', material);
  }

  async getAllStudyMaterials(): Promise<OfflineStudyMaterial[]> {
    const db = await this.dbPromise;
    return db.getAll('materials');
  }

  async deleteStudyMaterial(id: string) {
    const db = await this.dbPromise;
    await db.delete('materials', id);
  }
}

export const offlineService = new OfflineService();
