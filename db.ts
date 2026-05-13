import { DatabaseSync } from 'node:sqlite';
import path from 'path';

let dbSync: DatabaseSync | null = null;

class DbWrapper {
  constructor(private db: DatabaseSync) {}

  async exec(sql: string) {
    this.db.exec(sql);
  }

  async run(sql: string, params: any[] = []) {
    const stmt = this.db.prepare(sql);
    return stmt.run(...params);
  }

  async get(sql: string, params: any[] = []) {
    const stmt = this.db.prepare(sql);
    return stmt.get(...params);
  }

  async all(sql: string, params: any[] = []) {
    const stmt = this.db.prepare(sql);
    return stmt.all(...params);
  }
}

let dbWrapper: DbWrapper | null = null;

export async function getDb() {
  if (!dbSync) {
    dbSync = new DatabaseSync(path.resolve(process.cwd(), 'database.sqlite'));
    dbWrapper = new DbWrapper(dbSync);

    dbSync.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT,
        avatar_url TEXT
      );

      CREATE TABLE IF NOT EXISTS career_progress (
        user_id TEXT PRIMARY KEY,
        points INTEGER DEFAULT 0,
        weekly_points INTEGER DEFAULT 0,
        authorized BOOLEAN DEFAULT 0,
        rank_id INTEGER DEFAULT 1,
        last_promotion_check TEXT,
        trend TEXT DEFAULT 'stable',
        avatar TEXT,
        name TEXT,
        activity_points INTEGER DEFAULT 0,
        last_activity TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_reset TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS career_progress_history (
        user_id TEXT,
        month_id TEXT,
        points INTEGER DEFAULT 0,
        rank_id INTEGER DEFAULT 1,
        saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY(user_id, month_id)
      );

      CREATE TABLE IF NOT EXISTS game_scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        game_name TEXT,
        score INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS quiz_leaderboard (
        user_id TEXT PRIMARY KEY,
        name TEXT,
        avatar TEXT,
        total_score INTEGER DEFAULT 0,
        questions_answered INTEGER DEFAULT 0,
        battles_won INTEGER DEFAULT 0,
        panorama_score INTEGER DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS quiz_scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        quiz_id TEXT,
        score INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );
    `);
  }
  return dbWrapper!;
}
