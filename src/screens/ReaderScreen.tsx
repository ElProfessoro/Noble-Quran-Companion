import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Modal, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Platform, Pressable, Animated, FlatList } from 'react-native';
import { Verse } from '../types';
import { initDatabase, getDB, recordVerseRead } from '../db/database';
import VerseItem from '../components/VerseItem';
import ReadingProgress from '../components/ReadingProgress';
import { useSettingsStore } from '../store/settingsStore';
import { themes } from '../constants/theme';

import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type ReaderScreenRouteProp = RouteProp<RootStackParamList, 'Reader'>;

const ReaderScreen = () => {
    const route = useRoute<ReaderScreenRouteProp>();
    const { surahId, initialVerse } = route.params;

    const listRef = useRef<FlatList>(null);
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const [verses, setVerses] = useState<Verse[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTafsirVerse, setSelectedTafsirVerse] = useState<Verse | null>(null);
    const [surahName, setSurahName] = useState("");
    const [currentVerse, setCurrentVerse] = useState(1);
    const [showControls, setShowControls] = useState(false);
    const isScrolling = useRef(false);

    const { theme: themeMode, toggleArabic, togglePhonetic, toggleTranslation, setTheme, setLastRead } = useSettingsStore();
    const theme = themes[themeMode];

    useEffect(() => {
        const loadData = async () => {
            try {
                await initDatabase();
                const db = await getDB();

                // Get Surah Info - use phonetic name with French in parentheses
                const surahInfo = await db.getFirstAsync<{ name_phonetic: string; name_fr: string }>(
                    'SELECT name_phonetic, name_fr FROM surahs WHERE id = ?',
                    [surahId]
                );
                if (surahInfo) setSurahName(`${surahInfo.name_phonetic} (${surahInfo.name_fr})`);

                // Fetch Verses
                const result = await db.getAllAsync<Verse>(
                    'SELECT * FROM verses WHERE surah_id = ? ORDER BY verse_number ASC',
                    [surahId]
                );
                setVerses(result);
            } catch (e) {
                console.error("Failed to load verses", e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [surahId]);

    const handlePressTafsir = useCallback((verse: Verse) => {
        setSelectedTafsirVerse(verse);
    }, []);

    const renderItem = useCallback(({ item }: { item: Verse }) => {
        return <VerseItem verse={item} onPressTafsir={handlePressTafsir} />;
    }, [handlePressTafsir]); // VerseItem is memoized, so this is stable if props are stable
    const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: any[] }) => {
        if (viewableItems.length > 0) {
            const firstItem = viewableItems[0].item as Verse;
            if (firstItem && firstItem.verse_number) {
                setCurrentVerse(firstItem.verse_number);
                setLastRead({
                    surahId,
                    verseNumber: firstItem.verse_number,
                    timestamp: Date.now(),
                    surahName
                });
                // Record for statistics
                recordVerseRead(surahId, firstItem.verse_number);
            }
        }
    }, [surahId, surahName, setLastRead]);

    const toggleControls = useCallback(() => {
        // Only toggle if not scrolling
        if (!isScrolling.current) {
            setShowControls(prev => !prev);
        }
    }, []);

    const handleScrollBegin = useCallback(() => {
        isScrolling.current = true;
    }, []);

    const handleScrollEnd = useCallback(() => {
        // Small delay to prevent tap detection right after scroll
        setTimeout(() => {
            isScrolling.current = false;
        }, 150);
    }, []);

    // Touch handling for tap-to-show controls
    const touchStartTime = useRef(0);
    const touchStartY = useRef(0);

    const handleTouchStart = useCallback((e: any) => {
        touchStartTime.current = Date.now();
        touchStartY.current = e.nativeEvent.pageY;
    }, []);

    const handleTouchEnd = useCallback((e: any) => {
        const touchDuration = Date.now() - touchStartTime.current;
        const touchDistance = Math.abs(e.nativeEvent.pageY - touchStartY.current);

        // Only toggle if it's a quick tap (< 200ms) with minimal movement (< 10px)
        if (touchDuration < 200 && touchDistance < 10 && !isScrolling.current) {
            setShowControls(prev => !prev);
        }
    }, []);

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

            {/* Main content - always full screen */}
            <View
                style={styles.listContainer}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <FlatList
                    ref={listRef}
                    data={verses}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={5} // Reduce memory usage
                    removeClippedSubviews={true} // Essential for long lists (Android mainly, but helps iOS too)
                    updateCellsBatchingPeriod={50} // 50ms batching
                    initialScrollIndex={initialVerse ? initialVerse - 1 : undefined}
                    onViewableItemsChanged={onViewableItemsChanged}
                    onScrollBeginDrag={handleScrollBegin}
                    onScrollEndDrag={handleScrollEnd}
                    onMomentumScrollBegin={handleScrollBegin}
                    onMomentumScrollEnd={handleScrollEnd}
                    viewabilityConfig={{
                        itemVisiblePercentThreshold: 50 // Trigger when item is 50% visible
                    }}
                    ListEmptyComponent={() => (
                        <View style={{ padding: 40, alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                            <Text style={{ color: theme.text, textAlign: 'center', fontSize: 16 }}>
                                ⚠️ Les versets de cette sourate ne sont pas encore disponibles dans cette version de démonstration.
                            </Text>
                            <Text style={{ color: theme.secondary, textAlign: 'center', marginTop: 10 }}>
                                Essayez les sourates 1, 112, 113 ou 114.
                            </Text>
                        </View>
                    )}
                    ListHeaderComponent={() => surahId !== 9 ? (
                        <View style={[styles.bismillahContainer, { borderBottomColor: theme.border }]}>
                            <Text style={[styles.bismillahText, { color: theme.arabicText }]}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
                            <Text style={[styles.bismillahFrench, { color: theme.secondary }]}>Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux</Text>
                        </View>
                    ) : null}
                    ListFooterComponent={() => surahId < 114 ? (
                        <TouchableOpacity
                            style={[styles.nextSurahButton, { backgroundColor: theme.primary }]}
                            onPress={() => navigation.replace('Reader', { surahId: surahId + 1 })}
                        >
                            <Text style={styles.nextSurahText}>Sourate Suivante →</Text>
                        </TouchableOpacity>
                    ) : null}
                />
            </View>

            {/* Header Overlay - Back button + Surah Title */}
            {showControls && (
                <Pressable
                    style={[styles.headerOverlay, { backgroundColor: (themeMode === 'sepia' ? '#F0EAD6' : theme.background) + 'F0' }]}
                    onPress={toggleControls}
                >
                    <View style={styles.headerRow}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Text style={[styles.backButtonText, { color: theme.primary }]}>← Retour</Text>
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: theme.primary }]}>{surahName || `Sourate ${surahId}`}</Text>
                        <View style={styles.headerSpacer} />
                    </View>
                </Pressable>
            )}

            {/* Progress Bar Overlay */}
            {showControls && verses.length > 0 && (
                <Pressable style={styles.progressOverlay} onPress={toggleControls}>
                    <ReadingProgress
                        surahId={surahId}
                        currentVerse={currentVerse}
                        totalVerses={verses.length}
                        theme={theme}
                    />
                </Pressable>
            )}

            {/* Tafsir Bottom Sheet (Modal for MVP) */}
            <Modal
                visible={!!selectedTafsirVerse}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setSelectedTafsirVerse(null)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.modalBackdrop} onPress={() => setSelectedTafsirVerse(null)} />
                    <View style={[styles.modalContent, { backgroundColor: theme.background === '#000000' ? '#1E1E1E' : '#FFFFFF' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>
                                Tafsir - Verset {selectedTafsirVerse?.verse_number}
                            </Text>
                            <TouchableOpacity onPress={() => setSelectedTafsirVerse(null)}>
                                <Text style={{ color: theme.secondary, fontSize: 18 }}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            <Text style={[styles.tafsirText, { color: theme.text }]}>
                                {selectedTafsirVerse?.tafsir_text}
                            </Text>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Audio Player Mini Bar could go here */}
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
    controls: {
        padding: 16,
        borderBottomWidth: 1,
        elevation: 2,
        zIndex: 10,
    },
    headerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingTop: 55,
        paddingBottom: 12,
        paddingHorizontal: 16,
        zIndex: 100,
        elevation: 10,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        flex: 1,
    },
    headerSpacer: {
        width: 70, // Same width as back button for centering
    },
    progressOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        elevation: 10,
    },
    tapOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
    },
    topTapZone: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 80,
        zIndex: 50,
    },
    bottomTapZone: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        zIndex: 50,
    },
    backButton: {
        paddingVertical: 4,
        width: 70,
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    toggles: {
        flexDirection: 'row',
    },
    pill: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
    },
    pillText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 12,
    },
    listContainer: {
        flex: 1,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalBackdrop: {
        flex: 1,
    },
    modalContent: {
        height: '40%',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    tafsirText: {
        fontSize: 16,
        lineHeight: 24,
    },
    bismillahContainer: {
        paddingVertical: 24,
        paddingHorizontal: 16,
        alignItems: 'center',
        borderBottomWidth: 1,
    },
    bismillahText: {
        fontSize: 28,
        fontFamily: 'System',
        textAlign: 'center',
    },
    bismillahFrench: {
        fontSize: 14,
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 8,
    },
    nextSurahButton: {
        margin: 20,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
    },
    nextSurahText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ReaderScreen;
