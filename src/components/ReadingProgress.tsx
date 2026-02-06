import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getJuz, getHizb } from '../constants/quranMetadata';

interface ReadingProgressProps {
    surahId: number;
    currentVerse: number;
    totalVerses: number;
    theme: {
        primary: string;
        secondary: string;
        text: string;
        border: string;
        background: string;
    };
}

const ReadingProgress: React.FC<ReadingProgressProps> = ({
    surahId,
    currentVerse,
    totalVerses,
    theme
}) => {
    const progress = totalVerses > 0 ? (currentVerse / totalVerses) * 100 : 0;
    const juz = getJuz(surahId, currentVerse);
    const hizb = getHizb(surahId, currentVerse);

    return (
        <View style={[styles.container, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
            {/* Progress Bar */}
            <View style={[styles.progressBarContainer, { backgroundColor: theme.border }]}>
                <View
                    style={[
                        styles.progressBarFill,
                        { width: `${progress}%`, backgroundColor: theme.primary }
                    ]}
                />
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: theme.secondary }]}>Verset</Text>
                    <Text style={[styles.statValue, { color: theme.text }]}>
                        {currentVerse} / {totalVerses}
                    </Text>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.border }]} />

                <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: theme.secondary }]}>Juz</Text>
                    <Text style={[styles.statValue, { color: theme.primary }]}>{juz}</Text>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.border }]} />

                <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: theme.secondary }]}>Hizb</Text>
                    <Text style={[styles.statValue, { color: theme.primary }]}>{hizb}</Text>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.border }]} />

                <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: theme.secondary }]}>Progression</Text>
                    <Text style={[styles.statValue, { color: theme.text }]}>
                        {Math.round(progress)}%
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderTopWidth: 1,
    },
    progressBarContainer: {
        height: 4,
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 12,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 2,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statLabel: {
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 2,
    },
    statValue: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    divider: {
        width: 1,
        height: 24,
    },
});

export default ReadingProgress;
