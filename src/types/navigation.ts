import { NavigatorScreenParams } from '@react-navigation/native';

// Root stack - Reader is fullscreen (outside tabs)
export type RootStackParamList = {
    MainTabs: undefined;
    Reader: { surahId: number; initialVerse?: number };
};

// Tab navigation
export type TabParamList = {
    Lecture: undefined;
    Favoris: undefined;
    Statistiques: undefined;
    Paramètres: undefined;
};

// For use in screens that navigate to Reader
export type ReadingStackParamList = RootStackParamList;
