import { create } from 'zustand';

interface AudioState {
    isPlaying: boolean;
    currentSurahId: number | null;
    currentVerseId: number | null; // Corresponds to verse_number

    setIsPlaying: (isPlaying: boolean) => void;
    setPlayback: (surahId: number, verseId: number) => void;
}

export const useAudioStore = create<AudioState>((set) => ({
    isPlaying: false,
    currentSurahId: null,
    currentVerseId: null,

    setIsPlaying: (isPlaying) => set({ isPlaying }),
    setPlayback: (surahId, verseId) => set({ currentSurahId: surahId, currentVerseId: verseId }),
}));
