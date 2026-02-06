import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'sepia' | 'oled';

export type ReadingPosition = {
    surahId: number;
    verseNumber: number;
    timestamp: number;
    surahName?: string;
};

interface SettingsState {
    showArabic: boolean;
    showPhonetic: boolean;
    showTranslation: boolean;
    theme: ThemeMode;
    reciterId: string;
    lastRead: ReadingPosition | null;

    toggleArabic: () => void;
    togglePhonetic: () => void;
    toggleTranslation: () => void;
    setTheme: (theme: ThemeMode) => void;
    setReciter: (id: string) => void;
    setLastRead: (position: ReadingPosition) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            showArabic: true,
            showPhonetic: true,
            showTranslation: true,
            theme: 'sepia',
            reciterId: 'ar.alafasy',
            lastRead: null,

            toggleArabic: () => set((state) => ({ showArabic: !state.showArabic })),
            togglePhonetic: () => set((state) => ({ showPhonetic: !state.showPhonetic })),
            toggleTranslation: () => set((state) => ({ showTranslation: !state.showTranslation })),
            setTheme: (theme) => set({ theme }),
            setReciter: (reciterId) => set({ reciterId }),
            setLastRead: (position) => set({ lastRead: position }),
        }),
        {
            name: 'settings-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
