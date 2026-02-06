import * as SQLite from 'expo-sqlite';
import { seedData } from './seed';
import { surahsData } from './surahs';

let db: SQLite.SQLiteDatabase | null = null;

export const getDB = async () => {
  if (db) {
    return db;
  }
  db = await SQLite.openDatabaseAsync('quran.db');
  return db;
};

export const initDatabase = async () => {
  const database = await getDB();

  // Enable foreign keys and WAL mode for performance
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
  `);

  // Create verses table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS verses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      surah_id INTEGER NOT NULL,
      verse_number INTEGER NOT NULL,
      arabic_text TEXT,
      phonetic_text TEXT,
      translation_text TEXT,
      tafsir_text TEXT
    );
    
    CREATE TABLE IF NOT EXISTS surahs (
      id INTEGER PRIMARY KEY,
      name_ar TEXT,
      name_en TEXT,
      name_fr TEXT,
      name_phonetic TEXT,
      verses_count INTEGER
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      verse_id INTEGER NOT NULL,
      UNIQUE(verse_id)
    );
    
    CREATE TABLE IF NOT EXISTS bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      surah_id INTEGER NOT NULL,
      verse_number INTEGER NOT NULL,
      timestamp INTEGER
    );

    CREATE TABLE IF NOT EXISTS reading_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      surah_id INTEGER NOT NULL,
      verse_number INTEGER NOT NULL,
      timestamp INTEGER NOT NULL,
      date TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_surah_verse ON verses (surah_id, verse_number);
    CREATE INDEX IF NOT EXISTS idx_reading_date ON reading_history (date);
  `);

  // Migration: Add name_phonetic column if it doesn't exist
  try {
    await database.execAsync('ALTER TABLE surahs ADD COLUMN name_phonetic TEXT');
    console.log('Added name_phonetic column to surahs table');
    // Update existing data with phonetic names
    for (const s of surahsData) {
      await database.runAsync(
        'UPDATE surahs SET name_phonetic = ? WHERE id = ?',
        [s.name_phonetic, s.id]
      );
    }
    console.log('Updated surahs with phonetic names');
  } catch (e) {
    // Column already exists, ignore error
  }

  // Check if we need to update data (Phase 3 check: Surah count < 114)
  const surahCheck = await database.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM surahs');

  if (surahCheck && surahCheck.count < 114) {
    console.log('Detected partial data. Resetting for Phase 3 update...');
    await database.execAsync('DROP TABLE IF EXISTS surahs');
    await database.execAsync('DROP TABLE IF EXISTS verses');
    // Re-create tables immediately (recursion or copy-paste code?)
    // Simplest: just run the create statements again (IF NOT EXISTS handles it, but since we dropped, it creates)
    await database.execAsync(`
            CREATE TABLE IF NOT EXISTS verses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            surah_id INTEGER NOT NULL,
            verse_number INTEGER NOT NULL,
            arabic_text TEXT,
            phonetic_text TEXT,
            translation_text TEXT,
            tafsir_text TEXT
            );
            
            CREATE TABLE IF NOT EXISTS surahs (
            id INTEGER PRIMARY KEY,
            name_ar TEXT,
            name_en TEXT,
            name_fr TEXT,
            name_phonetic TEXT,
            verses_count INTEGER
            );
            
            CREATE INDEX IF NOT EXISTS idx_surah_verse ON verses (surah_id, verse_number);
        `);

    console.log('Re-seeding...');
    await seedSurahs(database);
    await seedDatabase(database);
    return;
  }

  // Normal check (should be skipped if above ran)
  if (surahCheck && surahCheck.count === 0) {
    console.log('Seeding Surahs...');
    await seedSurahs(database);
  }

  // Check if verses exist
  const result = await database.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM verses');

  // Phase 4 Fix: Check if we have the full Quran (~6236 verses).
  // If count is less than 6000, it means we are on the demo version. Force update.
  const verseCountCheck = await database.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM verses');

  if (verseCountCheck && verseCountCheck.count < 6000) {
    console.log('Detected partial dataset (< 6000 verses). Upgrading to Full Quran...');
    await database.execAsync('DELETE FROM verses'); // Clear demo data
    await seedDatabase(database);
  } else if (result && result.count === 0) {
    console.log('Seeding database...');
    await seedDatabase(database);
  } else {
    console.log('Database already seeded.');
  }
};

const seedSurahs = async (database: SQLite.SQLiteDatabase) => {
  try {
    await database.execAsync('BEGIN TRANSACTION');
    for (const s of surahsData) {
      await database.runAsync(
        'INSERT INTO surahs (id, name_ar, name_fr, name_phonetic, verses_count) VALUES (?, ?, ?, ?, ?)',
        [s.id, s.name_ar, s.name_fr, s.name_phonetic, s.verses_count]
      );
    }
    await database.execAsync('COMMIT');
    console.log('Surahs seeded.');
  } catch (e) {
    console.error('Error seeding surahs', e);
    await database.execAsync('ROLLBACK');
  }
}

// Import full dataset (generated by script)
const fullQuranData = require('../assets/quran_full.json');

const seedDatabase = async (database: SQLite.SQLiteDatabase) => {
  try {
    console.log(`Starting bulk seed of ${fullQuranData.length} verses...`);
    // Begin transaction
    await database.execAsync('BEGIN TRANSACTION');

    // Prepare statement is safer/faster for bulk, but expo-sqlite modern API usually handles runAsync well.
    // We will simple loop. Performance for 6000 rows in a transaction is usually < 1-2 seconds.
    for (const verse of fullQuranData) {
      // Escape manually or let library handle it? runAsync handles params.
      await database.runAsync(
        'INSERT INTO verses (surah_id, verse_number, arabic_text, phonetic_text, translation_text, tafsir_text) VALUES (?, ?, ?, ?, ?, ?)',
        [verse.surah_id, verse.verse_number, verse.arabic_text, verse.phonetic_text, verse.translation_text, verse.tafsir_text]
      );
    }

    await database.execAsync('COMMIT');
    console.log('Database seeded successfully with full Quran.');
  } catch (error) {
    console.error('Error seeding database:', error);
    try { await database.execAsync('ROLLBACK'); } catch { }
  }
};

// Manual reset for debugging/fixing
export const resetDatabase = async () => {
  const database = await getDB();
  console.log('Manual Reset: Dropping tables...');
  await database.execAsync('DROP TABLE IF EXISTS surahs');
  await database.execAsync('DROP TABLE IF EXISTS verses');

  // Re-init (will re-create and seed)
  await initDatabase();
};

export const getVerseCount = async () => {
  const database = await getDB();
  const result = await database.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM verses');
  return result?.count || 0;
};

// ========== FAVORITES ==========

export const addFavorite = async (verseId: number) => {
  const database = await getDB();
  await database.runAsync(
    'INSERT OR IGNORE INTO favorites (verse_id) VALUES (?)',
    [verseId]
  );
};

export const removeFavorite = async (verseId: number) => {
  const database = await getDB();
  await database.runAsync(
    'DELETE FROM favorites WHERE verse_id = ?',
    [verseId]
  );
};

export const isFavorite = async (verseId: number): Promise<boolean> => {
  const database = await getDB();
  const result = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM favorites WHERE verse_id = ?',
    [verseId]
  );
  return (result?.count || 0) > 0;
};

export const getAllFavorites = async () => {
  const database = await getDB();
  const result = await database.getAllAsync<{
    id: number;
    verse_id: number;
    surah_id: number;
    verse_number: number;
    arabic_text: string;
    phonetic_text: string;
    translation_text: string;
    surah_name_ar: string;
    surah_name_fr: string;
    surah_name_phonetic: string;
  }>(`
    SELECT 
      f.id,
      f.verse_id,
      v.surah_id,
      v.verse_number,
      v.arabic_text,
      v.phonetic_text,
      v.translation_text,
      s.name_ar as surah_name_ar,
      s.name_fr as surah_name_fr,
      s.name_phonetic as surah_name_phonetic
    FROM favorites f
    JOIN verses v ON f.verse_id = v.id
    JOIN surahs s ON v.surah_id = s.id
    ORDER BY f.id DESC
  `);
  return result;
};

export const getFavoriteVerseIds = async (): Promise<number[]> => {
  const database = await getDB();
  const result = await database.getAllAsync<{ verse_id: number }>(
    'SELECT verse_id FROM favorites'
  );
  return result.map(r => r.verse_id);
};

// ========== READING HISTORY & STATISTICS ==========

export const recordVerseRead = async (surahId: number, verseNumber: number) => {
  const database = await getDB();
  const now = Date.now();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  await database.runAsync(
    'INSERT INTO reading_history (surah_id, verse_number, timestamp, date) VALUES (?, ?, ?, ?)',
    [surahId, verseNumber, now, today]
  );
};

export const getReadingStats = async () => {
  const database = await getDB();

  // Total unique verses read
  const uniqueVerses = await database.getFirstAsync<{ count: number }>(`
    SELECT COUNT(DISTINCT surah_id || '-' || verse_number) as count FROM reading_history
  `);

  // Total surahs visited
  const surahsVisited = await database.getFirstAsync<{ count: number }>(`
    SELECT COUNT(DISTINCT surah_id) as count FROM reading_history
  `);

  // Total favorites
  const favoritesCount = await database.getFirstAsync<{ count: number }>(`
    SELECT COUNT(*) as count FROM favorites
  `);

  // Reading streak (consecutive days)
  const recentDays = await database.getAllAsync<{ date: string }>(`
    SELECT DISTINCT date FROM reading_history ORDER BY date DESC LIMIT 30
  `);

  let streak = 0;
  if (recentDays.length > 0) {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Check if read today or yesterday
    if (recentDays[0].date === today || recentDays[0].date === yesterday) {
      streak = 1;
      for (let i = 1; i < recentDays.length; i++) {
        const prevDate = new Date(recentDays[i - 1].date);
        const currDate = new Date(recentDays[i].date);
        const diffDays = (prevDate.getTime() - currDate.getTime()) / 86400000;

        if (diffDays === 1) {
          streak++;
        } else {
          break;
        }
      }
    }
  }

  // Today's verses read
  const today = new Date().toISOString().split('T')[0];
  const todayVerses = await database.getFirstAsync<{ count: number }>(`
    SELECT COUNT(DISTINCT surah_id || '-' || verse_number) as count 
    FROM reading_history WHERE date = ?
  `, [today]);

  // This week's verses
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const weekVerses = await database.getFirstAsync<{ count: number }>(`
    SELECT COUNT(DISTINCT surah_id || '-' || verse_number) as count 
    FROM reading_history WHERE date >= ?
  `, [weekAgo]);

  return {
    totalVersesRead: uniqueVerses?.count || 0,
    surahsVisited: surahsVisited?.count || 0,
    favoritesCount: favoritesCount?.count || 0,
    readingStreak: streak,
    todayVersesRead: todayVerses?.count || 0,
    weekVersesRead: weekVerses?.count || 0,
    progressPercent: Math.round(((uniqueVerses?.count || 0) / 6236) * 100),
  };
};

export const getReadingHistory = async (limit: number = 10) => {
  const database = await getDB();
  const result = await database.getAllAsync<{
    surah_id: number;
    verse_number: number;
    timestamp: number;
    surah_name_fr: string;
  }>(`
    SELECT rh.surah_id, rh.verse_number, rh.timestamp, s.name_fr as surah_name_fr
    FROM reading_history rh
    JOIN surahs s ON rh.surah_id = s.id
    ORDER BY rh.timestamp DESC
    LIMIT ?
  `, [limit]);
  return result;
};
