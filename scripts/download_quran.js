const fs = require('fs');
const path = require('path');
const https = require('https');

const FILES = {
    arabic: 'https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/quran.json',
    transliteration: 'https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/quran_transliteration.json',
    french: 'https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/quran_fr.json'
};

const download = (url) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
            res.on('error', reject);
        });
    });
};

const main = async () => {
    console.log('Downloading Quran data...');
    try {
        const [arabic, transliteration, french] = await Promise.all([
            download(FILES.arabic),
            download(FILES.transliteration),
            download(FILES.french)
        ]);

        console.log('Merging data...');
        const merged = [];

        // Structure: arabic is array of chapters, each has verses
        // quran-json structure: Array<{ id, name, ..., verses: Array<{ id, text, translation, ... }> }>

        // Actually risan/quran-json/dist/quran.json structure is:
        // Array of Surahs. Surah has "verses" array. Verse has "id" (global?), "text".

        // Let's verify structure by assuming standard.
        // arabic[0].verses[0].text -> Surah 1 Verse 1

        for (let i = 0; i < 114; i++) {
            const arSurah = arabic[i];
            const trSurah = transliteration[i];
            const frSurah = french[i];

            if (!arSurah || !trSurah || !frSurah) {
                console.error(`Missing data for Surah ${i + 1}`);
                continue;
            }

            for (let j = 0; j < arSurah.verses.length; j++) {
                const verseNum = j + 1;

                // quran-json verses usually have just 'text' key inside them?
                // Or sometimes 'translation' key in the specific language file.

                const arText = arSurah.verses[j].text || arSurah.verses[j]; // Handling variations
                const trText = trSurah.verses[j].transliteration || trSurah.verses[j].text || trSurah.verses[j];
                const frText = frSurah.verses[j].translation || frSurah.verses[j].text || frSurah.verses[j];

                merged.push({
                    surah_id: arSurah.id,
                    verse_number: verseNum,
                    arabic_text: arText,
                    phonetic_text: trText,
                    translation_text: frText,
                    // Placeholder tafsir, as we don't have a dataset for it yet
                    tafsir_text: ""
                });
            }
        }

        const outputPath = path.join(__dirname, '../src/assets/quran_full.json');

        // Ensure dir exists
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2));
        console.log(`Successfully saved ${merged.length} verses to ${outputPath}`);

    } catch (e) {
        console.error("Error:", e);
    }
};

main();
