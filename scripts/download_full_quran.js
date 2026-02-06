const fs = require('fs');
const path = require('path');
const https = require('https');

const FILES = {
    arabic: 'https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/quran.json',
    transliteration: 'https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/quran_transliteration.json',
};

const QURANENC_BASE = 'https://quranenc.com/api/v1/translation/sura/french_montada';

const download = (url) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            const chunks = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => {
                try {
                    const body = Buffer.concat(chunks).toString('utf-8');
                    resolve(JSON.parse(body));
                } catch (e) {
                    console.error("Parse error for url:", url, Buffer.concat(chunks).toString('utf-8').substring(0, 100));
                    reject(e);
                }
            });
            res.on('error', reject);
        });
    });
};

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const main = async () => {
    console.log('Downloading Base Data (Arabic/Transliteration)...');
    try {
        const [arabic, transliteration] = await Promise.all([
            download(FILES.arabic),
            download(FILES.transliteration)
        ]);

        console.log('Downloading French Data (Translation + Tafsir) from QuranEnc...');
        const frenchData = {}; // Map surah_id -> verses array

        for (let i = 1; i <= 114; i++) {
            process.stdout.write(`Fetching Surah ${i}... `);
            try {
                const response = await download(`${QURANENC_BASE}/${i}`);
                // Response structure: { result: [ { id, sura, aya, arabic_text, translation, footnotes } ] }
                if (response && response.result) {
                    frenchData[i] = response.result;
                    process.stdout.write('OK\n');
                } else {
                    console.error('Invalid response format');
                }
            } catch (e) {
                console.error('Failed to fetch surah', i, e.message);
            }
            // Polite delay
            await wait(200);
        }

        console.log('Merging data...');
        const merged = [];

        for (let i = 0; i < 114; i++) {
            const surahId = i + 1;
            const arSurah = arabic[i];
            const trSurah = transliteration[i];
            const frVerses = frenchData[surahId] || [];

            if (!arSurah || !trSurah) {
                console.error(`Missing base data for Surah ${surahId}`);
                continue;
            }

            for (let j = 0; j < arSurah.verses.length; j++) {
                const verseNum = j + 1;

                const arText = arSurah.verses[j].text || arSurah.verses[j];
                const trText = trSurah.verses[j].transliteration || trSurah.verses[j].text || trSurah.verses[j];

                // Find matching French verse
                const frVerse = frVerses.find(v => parseInt(v.aya) === verseNum);
                const frTrans = frVerse ? frVerse.translation : "";
                const frTafsir = frVerse ? frVerse.footnotes : "";

                // Clean up translation (remove footnote markers like [1])
                // const cleanTrans = frTrans.replace(/\[\d+\]/g, '').trim(); 
                // Actually, might be useful to keep them if they refer to the tafsir? 
                // But the user interface separates them. 
                // Let's keep markers as they link to the footnotes.

                merged.push({
                    surah_id: surahId,
                    verse_number: verseNum,
                    arabic_text: arText,
                    phonetic_text: trText,
                    translation_text: frTrans,
                    tafsir_text: frTafsir
                });
            }
        }

        const outputPath = path.join(__dirname, '../src/assets/quran_full.json');

        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2));
        console.log(`Successfully saved ${merged.length} verses to ${outputPath}`);

    } catch (e) {
        console.error("Error:", e);
    }
};

main();
