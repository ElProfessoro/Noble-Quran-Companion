import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Verse } from '../types';
import { useSettingsStore } from '../store/settingsStore';
import { useAudioStore } from '../store/audioStore';
import { useFavoritesStore } from '../store/favoritesStore';
import { themes } from '../constants/theme';
import { playVerse, pausePlayback } from '../services/AudioService';

interface VerseItemProps {
    verse: Verse;
    onPressTafsir: (verse: Verse) => void;
}

const VerseItem = ({ verse, onPressTafsir }: VerseItemProps) => {
    // Optimization: Select only what we need to prevent re-renders
    const themeMode = useSettingsStore(state => state.theme);
    const showArabic = useSettingsStore(state => state.showArabic);
    const showPhonetic = useSettingsStore(state => state.showPhonetic);
    const showTranslation = useSettingsStore(state => state.showTranslation);

    // Optimization: Only re-render if THIS verse's playback state changes
    const isThisVersePlaying = useAudioStore(state =>
        state.isPlaying &&
        state.currentSurahId === verse.surah_id &&
        state.currentVerseId === verse.verse_number
    );
    const { isFavorite, toggleFavorite } = useFavoritesStore();

    const theme = themes[themeMode];
    const isFav = isFavorite(verse.id);

    const isHighlighted = isThisVersePlaying;

    const handlePlayPause = () => {
        if (isThisVersePlaying) {
            // Pause if this verse is playing
            pausePlayback();
        } else {
            // Play this verse
            playVerse(verse.surah_id, verse.verse_number);
        }
    };

    const handleToggleFavorite = () => {
        toggleFavorite(verse.id);
    };

    return (
        <View style={[
            styles.container,
            {
                backgroundColor: isHighlighted ? theme.secondary + '20' : theme.background,
                borderColor: theme.border
            }
        ]}>
            {/* Header: Number and Actions */}
            <View style={styles.header}>
                <View style={[styles.numberBadge, { backgroundColor: theme.secondary }]}>
                    <Text style={[styles.numberText, { color: theme.background }]}>{verse.verse_number}</Text>
                </View>
                <View style={styles.actions}>
                    <TouchableOpacity onPress={handlePlayPause} style={styles.actionButton}>
                        <Ionicons
                            name={isThisVersePlaying ? "pause-circle" : "play-circle-outline"}
                            size={22}
                            color={isThisVersePlaying ? theme.primary : theme.primary}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onPressTafsir(verse)} style={styles.actionButton}>
                        <Ionicons name="document-text-outline" size={22} color={theme.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleToggleFavorite} style={styles.actionButton}>
                        <Ionicons
                            name={isFav ? "heart" : "heart-outline"}
                            size={22}
                            color={isFav ? '#E74C3C' : theme.secondary}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="bookmark-outline" size={22} color={theme.secondary} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {showArabic && (
                    <Text style={[styles.arabicText, { color: theme.arabicText }]}>{verse.arabic_text}</Text>
                )}

                {showPhonetic && (
                    <Text style={[styles.phoneticText, { color: theme.secondary }]}>{verse.phonetic_text}</Text>
                )}

                {showTranslation && (
                    <Text style={[styles.translationText, { color: theme.text }]}>{verse.translation_text}</Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderBottomWidth: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    numberBadge: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    numberText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    actions: {
        flexDirection: 'row',
        gap: 16,
    },
    actionButton: {
        padding: 4,
    },
    content: {
        gap: 12,
    },
    arabicText: {
        fontSize: 24,
        textAlign: 'right',
        fontFamily: 'System', // Should eventually use a custom Arabic font
        marginBottom: 4,
    },
    phoneticText: {
        fontSize: 14,
        fontStyle: 'italic',
    },
    translationText: {
        fontSize: 16,
        lineHeight: 24,
    },
});

export default memo(VerseItem);
