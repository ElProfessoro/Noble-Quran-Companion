import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, RefreshControl, FlatList } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore } from '../store/settingsStore';
import { useFavoritesStore } from '../store/favoritesStore';
import { getAllFavorites } from '../db/database';
import { themes } from '../constants/theme';
import { RootStackParamList } from '../../App';

interface FavoriteVerse {
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
}

const FavoritesScreen = () => {
    const { theme: themeMode, showArabic, showTranslation } = useSettingsStore();
    const { toggleFavorite } = useFavoritesStore();
    const theme = themes[themeMode];
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const [favorites, setFavorites] = useState<FavoriteVerse[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadFavorites = async () => {
        try {
            const data = await getAllFavorites();
            setFavorites(data);
        } catch (error) {
            console.error('Error loading favorites:', error);
        }
    };

    // Reload when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadFavorites();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadFavorites();
        setRefreshing(false);
    };

    const handleRemoveFavorite = async (verseId: number) => {
        await toggleFavorite(verseId);
        // Remove from local state immediately
        setFavorites(prev => prev.filter(f => f.verse_id !== verseId));
    };

    const handleNavigateToVerse = (surahId: number, verseNumber: number) => {
        navigation.navigate('Reader', { surahId, initialVerse: verseNumber });
    };

    const renderItem = ({ item }: { item: FavoriteVerse }) => (
        <TouchableOpacity
            style={[styles.itemContainer, { backgroundColor: theme.background, borderBottomColor: theme.border }]}
            onPress={() => handleNavigateToVerse(item.surah_id, item.verse_number)}
        >
            <View style={styles.itemHeader}>
                <View style={[styles.badge, { backgroundColor: theme.primary }]}>
                    <Text style={styles.badgeText}>{item.surah_id}:{item.verse_number}</Text>
                </View>
                <Text style={[styles.surahName, { color: theme.secondary }]}>
                    {item.surah_name_phonetic} ({item.surah_name_fr})
                </Text>
                <TouchableOpacity
                    onPress={() => handleRemoveFavorite(item.verse_id)}
                    style={styles.removeButton}
                >
                    <Ionicons name="heart" size={20} color="#E74C3C" />
                </TouchableOpacity>
            </View>

            {showArabic && item.arabic_text && (
                <Text style={[styles.arabicText, { color: theme.arabicText }]} numberOfLines={2}>
                    {item.arabic_text}
                </Text>
            )}

            {showTranslation && item.translation_text && (
                <Text style={[styles.translationText, { color: theme.text }]} numberOfLines={3}>
                    {item.translation_text}
                </Text>
            )}
        </TouchableOpacity>
    );

    if (favorites.length === 0) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Favoris</Text>
                </View>
                <View style={styles.emptyContainer}>
                    <Ionicons name="heart-outline" size={64} color={theme.secondary} />
                    <Text style={[styles.emptyTitle, { color: theme.text }]}>Aucun favori</Text>
                    <Text style={[styles.emptySubtitle, { color: theme.secondary }]}>
                        Appuyez sur le cœur sur un verset pour l'ajouter à vos favoris
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Favoris</Text>
                <Text style={[styles.headerCount, { color: theme.secondary }]}>
                    {favorites.length} verset{favorites.length > 1 ? 's' : ''}
                </Text>
            </View>

            <FlatList
                data={favorites}
                renderItem={renderItem}
                keyExtractor={(item: FavoriteVerse) => item.verse_id.toString()}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    headerCount: {
        fontSize: 14,
    },
    itemContainer: {
        padding: 16,
        borderBottomWidth: 1,
    },
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600',
    },
    surahName: {
        flex: 1,
        fontSize: 14,
    },
    removeButton: {
        padding: 4,
    },
    arabicText: {
        fontSize: 20,
        textAlign: 'right',
        marginBottom: 8,
        lineHeight: 32,
    },
    translationText: {
        fontSize: 14,
        lineHeight: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    emptySubtitle: {
        fontSize: 16,
        textAlign: 'center',
    },
});

export default FavoritesScreen;
