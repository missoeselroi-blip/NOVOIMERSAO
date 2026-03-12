import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'bible_offline_db';
const DB_VERSION = 1;

export interface OfflineBibleChapter {
  id: string; // e.g., "NVI-GEN-1"
  version: string;
  book: string;
  chapter: number;
  content: string;
  downloadedAt: number;
}

export interface OfflineStudyMaterial {
  id: string;
  title: string;
  content: string;
  type: 'commentary' | 'study_bible' | 'article';
  downloadedAt: number;
}

class OfflineService {
  private db: Promise<IDBPDatabase>;

  constructor() {
    this.db = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('bible_chapters')) {
          db.createObjectStore('bible_chapters', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('study_materials')) {
          db.createObjectStore('study_materials', { keyPath: 'id' });
        }
      },
    });
  }

  async saveChapter(chapter: OfflineBibleChapter) {
    const db = await this.db;
    await db.put('bible_chapters', chapter);
  }

  async getChapter(id: string): Promise<OfflineBibleChapter | undefined> {
    const db = await this.db;
    return db.get('bible_chapters', id);
  }

  async saveStudyMaterial(material: OfflineStudyMaterial) {
    const db = await this.db;
    await db.put('study_materials', material);
  }

  async getStudyMaterial(id: string): Promise<OfflineStudyMaterial | undefined> {
    const db = await this.db;
    return db.get('study_materials', id);
  }

  async getAllChapters(): Promise<OfflineBibleChapter[]> {
    const db = await this.db;
    return db.getAll('bible_chapters');
  }

  async getAllStudyMaterials(): Promise<OfflineStudyMaterial[]> {
    const db = await this.db;
    return db.getAll('study_materials');
  }

  async deleteChapter(id: string) {
    const db = await this.db;
    await db.delete('bible_chapters', id);
  }

  async deleteStudyMaterial(id: string) {
    const db = await this.db;
    await db.delete('study_materials', id);
  }

  async clearAll() {
    const db = await this.db;
    await db.clear('bible_chapters');
    await db.clear('study_materials');
  }
}

export const offlineService = new OfflineService();
