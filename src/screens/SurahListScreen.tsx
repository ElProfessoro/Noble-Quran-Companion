import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, SafeAreaView, StatusBar, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import { getDB, initDatabase } from '../db/database';
import { themes } from '../constants/theme';
import { useSettingsStore } from '../store/settingsStore';

interface Surah {
    id: number;
    name_ar: string;
    name_phonetic: string;
    name_fr: string;
    verses_count: number;
}

const SurahListScreen = () => {
    const [surahs, setSurahs] = useState<Surah[]>([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { theme: themeMode, lastRead } = useSettingsStore();

    const theme = themes[themeMode];

    useEffect(() => {
        const loadSurahs = async () => {
            try {
                // Ensure DB is ready
                const db = await getDB();
                const result = await db.getAllAsync<Surah>('SELECT id, name_ar, name_fr, verses_count FROM surahs ORDER BY id ASC');
                // Add phonetic names from static data
                const { surahsData } = require('../db/surahs');
                const surahsWithPhonetic = result.map(s => ({
                    ...s,
                    name_phonetic: surahsData.find((sd: any) => sd.id === s.id)?.name_phonetic || ''
                }));
                setSurahs(surahsWithPhonetic);
            } catch (e) {
                console.error("Failed to load surahs", e);
            } finally {
                setLoading(false);
            }
        };
        loadSurahs();
    }, []);

    const renderItem = ({ item }: { item: Surah }) => (
        <TouchableOpacity
            style={[styles.itemContainer, { borderBottomColor: theme.border, backgroundColor: themeMode === 'sepia' ? '#F0EAD6' : theme.background }]}
            onPress={() => navigation.navigate('Reader', { surahId: item.id })}
        >
            <View style={[styles.numberBadge, { backgroundColor: theme.secondary }]}>
                <Text style={[styles.numberText, { color: theme.background }]}>{item.id}</Text>
            </View>
            <View style={styles.textContainer}>
                <Text style={[styles.nameAr, { color: theme.primary }]}>{item.name_ar}</Text>
                <Text style={[styles.nameDetails, { color: theme.text }]}>({item.name_phonetic} - {item.name_fr})</Text>
                <Text style={[styles.versesCount, { color: theme.secondary }]}>{item.verses_count} Versets</Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={themeMode === 'oled' || themeMode === 'light' ? 'light-content' : 'dark-content'} />
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Le Saint Coran</Text>
            </View>
            {lastRead && (
                <TouchableOpacity
                    style={[styles.resumeCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                    onPress={() => navigation.navigate('Reader', {
                        surahId: lastRead.surahId,
                        initialVerse: lastRead.verseNumber
                    })}
                >
                    <View style={styles.resumeIconContainer}>
                        <Ionicons name="book" size={24} color="#FFFFFF" />
                    </View>
                    <View style={styles.resumeContent}>
                        <Text style={[styles.resumeLabel, { color: theme.secondary }]}>Reprendre la lecture</Text>
                        <Text style={[styles.resumeTitle, { color: theme.text }]}>
                            {surahs.find(s => s.id === lastRead.surahId)?.name_phonetic || `Sourate ${lastRead.surahId}`}
                            {surahs.find(s => s.id === lastRead.surahId)?.name_fr ? ` (${surahs.find(s => s.id === lastRead.surahId)?.name_fr})` : ''}
                            <Text style={{ color: theme.primary }}> • Verset {lastRead.verseNumber}</Text>
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={theme.secondary} />
                </TouchableOpacity>
            )}
            <FlatList
                data={surahs}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 16,
        paddingTop: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'transparent', // Custom logic can follow
        position: 'relative'
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    settingsButton: {
        position: 'absolute',
        right: 16,
        top: 10
    },
    itemContainer: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
        borderBottomWidth: 1,
    },
    numberBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    numberText: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    textContainer: {
        flex: 1,
    },
    nameAr: {
        fontSize: 20,
        fontFamily: 'System',
        marginBottom: 2,
    },
    nameDetails: {
        fontSize: 14,
        marginBottom: 4,
    },
    versesCount: {
        fontSize: 12,
    },
    resumeCard: {
        margin: 16,
        marginBottom: 8,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    resumeIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    resumeIcon: {
        fontSize: 20,
    },
    resumeContent: {
        flex: 1,
    },
    resumeLabel: {
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
        fontWeight: '600',
    },
    resumeTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    resumeArrow: {
        fontSize: 20,
        marginLeft: 8,
    }
});

export default SurahListScreen;
