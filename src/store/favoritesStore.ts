import { create } from 'zustand';
import { addFavorite, removeFavorite, getFavoriteVerseIds } from '../db/database';

interface FavoritesState {
    favorites: Set<number>;
    isLoaded: boolean;
    loadFavorites: () => Promise<void>;
    toggleFavorite: (verseId: number) => Promise<void>;
    isFavorite: (verseId: number) => boolean;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
    favorites: new Set<number>(),
    isLoaded: false,

    loadFavorites: async () => {
        try {
            const favoriteIds = await getFavoriteVerseIds();
            set({ favorites: new Set(favoriteIds), isLoaded: true });
        } catch (error) {
            console.error('Error loading favorites:', error);
            set({ isLoaded: true });
        }
    },

    toggleFavorite: async (verseId: number) => {
        const { favorites } = get();
        const isFav = favorites.has(verseId);

        // Optimistic update
        const newFavorites = new Set(favorites);
        if (isFav) {
            newFavorites.delete(verseId);
        } else {
            newFavorites.add(verseId);
        }
        set({ favorites: newFavorites });

        // Persist to DB
        try {
            if (isFav) {
                await removeFavorite(verseId);
            } else {
                await addFavorite(verseId);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            // Rollback on error
            set({ favorites });
        }
    },

    isFavorite: (verseId: number) => {
        return get().favorites.has(verseId);
    },
}));
