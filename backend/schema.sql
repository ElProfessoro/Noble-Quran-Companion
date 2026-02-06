-- Schema for user stats
CREATE TABLE IF NOT EXISTS user_stats (
    device_id TEXT PRIMARY KEY,
    total_verses_read INTEGER DEFAULT 0,
    surahs_visited INTEGER DEFAULT 0,
    favorites_count INTEGER DEFAULT 0,
    reading_streak INTEGER DEFAULT 0,
    today_verses_read INTEGER DEFAULT 0,
    week_verses_read INTEGER DEFAULT 0,
    progress_percent REAL DEFAULT 0,
    last_read_surah INTEGER,
    last_read_verse INTEGER,
    last_sync TEXT
);
