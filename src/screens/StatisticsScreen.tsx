import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore } from '../store/settingsStore';
import { getReadingStats } from '../db/database';
import { surahsData } from '../db/surahs';
import { themes } from '../constants/theme';

interface Stats {
    totalVersesRead: number;
    surahsVisited: number;
    favoritesCount: number;
    readingStreak: number;
    todayVersesRead: number;
    weekVersesRead: number;
    progressPercent: number;
}

const StatCard = ({
    iconName,
    title,
    value,
    subtitle,
    color,
    theme
}: {
    iconName: keyof typeof Ionicons.glyphMap;
    title: string;
    value: string | number;
    subtitle?: string;
    color: string;
    theme: any;
}) => (
    <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
        <View style={[styles.cardIcon, { backgroundColor: color + '20' }]}>
            <Ionicons name={iconName} size={24} color={color} />
        </View>
        <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: theme.secondary }]}>{title}</Text>
            <Text style={[styles.cardValue, { color: theme.text }]}>{value}</Text>
            {subtitle && <Text style={[styles.cardSubtitle, { color: theme.secondary }]}>{subtitle}</Text>}
        </View>
    </View>
);

const ProgressBar = ({ percent, color, theme }: { percent: number; color: string; theme: any }) => (
    <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
            <View style={[styles.progressFill, { width: `${Math.min(percent, 100)}%`, backgroundColor: color }]} />
        </View>
        <Text style={[styles.progressText, { color: theme.text }]}>{percent}%</Text>
    </View>
);

const StatisticsScreen = () => {
    const { theme: themeMode, lastRead } = useSettingsStore();
    const theme = themes[themeMode];

    const [stats, setStats] = useState<Stats | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const loadStats = async () => {
        try {
            const data = await getReadingStats();
            setStats(data);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadStats();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadStats();
        setRefreshing(false);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <View style={styles.headerRow}>
                    <Ionicons name="stats-chart" size={28} color={theme.primary} />
                    <Text style={[styles.header, { color: theme.text }]}>Statistiques</Text>
                </View>

                {/* Progress Section */}
                <View style={[styles.progressSection, { backgroundColor: theme.primary + '10', borderColor: theme.border }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Progression du Coran</Text>
                    <ProgressBar
                        percent={stats?.progressPercent || 0}
                        color={theme.primary}
                        theme={theme}
                    />
                    <Text style={[styles.progressDetail, { color: theme.secondary }]}>
                        {stats?.totalVersesRead || 0} / 6236 versets lus
                    </Text>
                </View>

                {/* Today's Stats */}
                <Text style={[styles.sectionHeader, { color: theme.text }]}>Aujourd'hui</Text>
                <View style={styles.row}>
                    <StatCard
                        iconName="book-outline"
                        title="Versets lus"
                        value={stats?.todayVersesRead || 0}
                        color={theme.primary}
                        theme={theme}
                    />
                    <StatCard
                        iconName="flame-outline"
                        title="Série"
                        value={stats?.readingStreak || 0}
                        subtitle={stats?.readingStreak === 1 ? "jour" : "jours"}
                        color="#E74C3C"
                        theme={theme}
                    />
                </View>

                {/* Overall Stats */}
                <Text style={[styles.sectionHeader, { color: theme.text }]}>Totaux</Text>
                <View style={styles.row}>
                    <StatCard
                        iconName="checkmark-circle-outline"
                        title="Versets uniques"
                        value={stats?.totalVersesRead || 0}
                        color="#27AE60"
                        theme={theme}
                    />
                    <StatCard
                        iconName="library-outline"
                        title="Sourates visitées"
                        value={`${stats?.surahsVisited || 0} / 114`}
                        color="#3498DB"
                        theme={theme}
                    />
                </View>
                <View style={styles.row}>
                    <StatCard
                        iconName="heart-outline"
                        title="Favoris"
                        value={stats?.favoritesCount || 0}
                        color="#F39C12"
                        theme={theme}
                    />
                    <StatCard
                        iconName="calendar-outline"
                        title="Cette semaine"
                        value={stats?.weekVersesRead || 0}
                        subtitle="versets"
                        color="#9B59B6"
                        theme={theme}
                    />
                </View>

                {/* Last Read */}
                {lastRead && (
                    <>
                        <Text style={[styles.sectionHeader, { color: theme.text }]}>Dernière lecture</Text>
                        <View style={[styles.lastReadCard, { backgroundColor: theme.primary + '10', borderColor: theme.border }]}>
                            <Text style={[styles.lastReadTitle, { color: theme.text }]}>
                                {surahsData.find(s => s.id === lastRead.surahId)?.name_phonetic || `Sourate ${lastRead.surahId}`}
                                {surahsData.find(s => s.id === lastRead.surahId)?.name_fr ? ` (${surahsData.find(s => s.id === lastRead.surahId)?.name_fr})` : ''}
                            </Text>
                            <Text style={[styles.lastReadSubtitle, { color: theme.secondary }]}>
                                Verset {lastRead.verseNumber}
                            </Text>
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 0,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 20,
        marginBottom: 12,
    },
    progressSection: {
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    progressBar: {
        flex: 1,
        height: 12,
        borderRadius: 6,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 6,
    },
    progressText: {
        fontSize: 18,
        fontWeight: 'bold',
        minWidth: 50,
        textAlign: 'right',
    },
    progressDetail: {
        marginTop: 12,
        fontSize: 14,
        textAlign: 'center',
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    card: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
    },
    cardIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cardIconText: {
        fontSize: 20,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 12,
        marginBottom: 4,
    },
    cardValue: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    cardSubtitle: {
        fontSize: 12,
        marginTop: 2,
    },
    lastReadCard: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
    },
    lastReadTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    lastReadSubtitle: {
        fontSize: 14,
        marginTop: 4,
    },
});

export default StatisticsScreen;
