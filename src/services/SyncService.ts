import AsyncStorage from '@react-native-async-storage/async-storage';
import { getReadingStats } from '../db/database';
import { useSettingsStore } from '../store/settingsStore';

const API_URL = 'https://quran-stats-api.msalla-youssef.workers.dev';
const DEVICE_ID_KEY = 'quran_device_id';

// Generate or get existing device ID
export const getDeviceId = async (): Promise<string> => {
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);

    if (!deviceId) {
        // Generate new UUID
        deviceId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    }

    return deviceId;
};

// Sync stats to cloud
export const syncStatsToCloud = async (): Promise<boolean> => {
    try {
        const deviceId = await getDeviceId();
        const stats = await getReadingStats();
        const lastRead = useSettingsStore.getState().lastRead;

        const payload = {
            device_id: deviceId,
            total_verses_read: stats.totalVersesRead,
            surahs_visited: stats.surahsVisited,
            favorites_count: stats.favoritesCount,
            reading_streak: stats.readingStreak,
            today_verses_read: stats.todayVersesRead,
            week_verses_read: stats.weekVersesRead,
            progress_percent: stats.progressPercent,
            last_read_surah: lastRead?.surahId || null,
            last_read_verse: lastRead?.verseNumber || null,
        };

        const response = await fetch(`${API_URL}/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const result = await response.json();
        console.log('Stats synced to cloud:', result.success);
        return result.success;
    } catch (error) {
        console.error('Failed to sync stats:', error);
        return false;
    }
};

// Get stats from cloud (for future use)
export const getStatsFromCloud = async (): Promise<any | null> => {
    try {
        const deviceId = await getDeviceId();
        const response = await fetch(`${API_URL}/stats/${deviceId}`);
        const result = await response.json();

        if (result.found) {
            return result.stats;
        }
        return null;
    } catch (error) {
        console.error('Failed to get stats from cloud:', error);
        return null;
    }
};
