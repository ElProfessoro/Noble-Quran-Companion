// Juz and Hizb mapping data for progress tracking
// Data derived from api.quran.com/api/v4/juzs

export interface JuzRange {
    juz: number;
    hizb: [number, number]; // [start, end] - 2 Hizbs per Juz
    startVerse: { surah: number; verse: number };
    endVerse: { surah: number; verse: number };
}

// Juz boundaries (30 Juz total, each has 2 Hizb)
export const JUZ_DATA: JuzRange[] = [
    { juz: 1, hizb: [1, 2], startVerse: { surah: 1, verse: 1 }, endVerse: { surah: 2, verse: 141 } },
    { juz: 2, hizb: [3, 4], startVerse: { surah: 2, verse: 142 }, endVerse: { surah: 2, verse: 252 } },
    { juz: 3, hizb: [5, 6], startVerse: { surah: 2, verse: 253 }, endVerse: { surah: 3, verse: 92 } },
    { juz: 4, hizb: [7, 8], startVerse: { surah: 3, verse: 93 }, endVerse: { surah: 4, verse: 23 } },
    { juz: 5, hizb: [9, 10], startVerse: { surah: 4, verse: 24 }, endVerse: { surah: 4, verse: 147 } },
    { juz: 6, hizb: [11, 12], startVerse: { surah: 4, verse: 148 }, endVerse: { surah: 5, verse: 81 } },
    { juz: 7, hizb: [13, 14], startVerse: { surah: 5, verse: 82 }, endVerse: { surah: 6, verse: 110 } },
    { juz: 8, hizb: [15, 16], startVerse: { surah: 6, verse: 111 }, endVerse: { surah: 7, verse: 87 } },
    { juz: 9, hizb: [17, 18], startVerse: { surah: 7, verse: 88 }, endVerse: { surah: 8, verse: 40 } },
    { juz: 10, hizb: [19, 20], startVerse: { surah: 8, verse: 41 }, endVerse: { surah: 9, verse: 92 } },
    { juz: 11, hizb: [21, 22], startVerse: { surah: 9, verse: 93 }, endVerse: { surah: 11, verse: 5 } },
    { juz: 12, hizb: [23, 24], startVerse: { surah: 11, verse: 6 }, endVerse: { surah: 12, verse: 52 } },
    { juz: 13, hizb: [25, 26], startVerse: { surah: 12, verse: 53 }, endVerse: { surah: 14, verse: 52 } },
    { juz: 14, hizb: [27, 28], startVerse: { surah: 15, verse: 1 }, endVerse: { surah: 16, verse: 128 } },
    { juz: 15, hizb: [29, 30], startVerse: { surah: 17, verse: 1 }, endVerse: { surah: 18, verse: 74 } },
    { juz: 16, hizb: [31, 32], startVerse: { surah: 18, verse: 75 }, endVerse: { surah: 20, verse: 135 } },
    { juz: 17, hizb: [33, 34], startVerse: { surah: 21, verse: 1 }, endVerse: { surah: 22, verse: 78 } },
    { juz: 18, hizb: [35, 36], startVerse: { surah: 23, verse: 1 }, endVerse: { surah: 25, verse: 20 } },
    { juz: 19, hizb: [37, 38], startVerse: { surah: 25, verse: 21 }, endVerse: { surah: 27, verse: 55 } },
    { juz: 20, hizb: [39, 40], startVerse: { surah: 27, verse: 56 }, endVerse: { surah: 29, verse: 45 } },
    { juz: 21, hizb: [41, 42], startVerse: { surah: 29, verse: 46 }, endVerse: { surah: 33, verse: 30 } },
    { juz: 22, hizb: [43, 44], startVerse: { surah: 33, verse: 31 }, endVerse: { surah: 36, verse: 27 } },
    { juz: 23, hizb: [45, 46], startVerse: { surah: 36, verse: 28 }, endVerse: { surah: 39, verse: 31 } },
    { juz: 24, hizb: [47, 48], startVerse: { surah: 39, verse: 32 }, endVerse: { surah: 41, verse: 46 } },
    { juz: 25, hizb: [49, 50], startVerse: { surah: 41, verse: 47 }, endVerse: { surah: 45, verse: 37 } },
    { juz: 26, hizb: [51, 52], startVerse: { surah: 46, verse: 1 }, endVerse: { surah: 51, verse: 30 } },
    { juz: 27, hizb: [53, 54], startVerse: { surah: 51, verse: 31 }, endVerse: { surah: 57, verse: 29 } },
    { juz: 28, hizb: [55, 56], startVerse: { surah: 58, verse: 1 }, endVerse: { surah: 66, verse: 12 } },
    { juz: 29, hizb: [57, 58], startVerse: { surah: 67, verse: 1 }, endVerse: { surah: 77, verse: 50 } },
    { juz: 30, hizb: [59, 60], startVerse: { surah: 78, verse: 1 }, endVerse: { surah: 114, verse: 6 } },
];

/**
 * Get current Juz number based on Surah and Verse
 */
export function getJuz(surahId: number, verseNumber: number): number {
    for (const juz of JUZ_DATA) {
        const { startVerse, endVerse } = juz;

        // Check if verse is within this Juz range
        const afterStart = surahId > startVerse.surah ||
            (surahId === startVerse.surah && verseNumber >= startVerse.verse);
        const beforeEnd = surahId < endVerse.surah ||
            (surahId === endVerse.surah && verseNumber <= endVerse.verse);

        if (afterStart && beforeEnd) {
            return juz.juz;
        }
    }
    return 1; // Default fallback
}

/**
 * Get current Hizb number based on Surah and Verse
 * (Approximate: assigns first half of Juz to Hizb[0], second half to Hizb[1])
 */
export function getHizb(surahId: number, verseNumber: number): number {
    const juzNumber = getJuz(surahId, verseNumber);
    const juz = JUZ_DATA.find(j => j.juz === juzNumber);
    if (!juz) return 1;

    // Simple approximation: if in first half of Juz, return first Hizb
    // This is not 100% accurate but provides a reasonable estimate
    return juz.hizb[0]; // For more accuracy, would need detailed Hizb boundary data
}
