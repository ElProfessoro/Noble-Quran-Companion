const fs = require('fs');
const path = require('path');

const MAIN_FILE = path.join(__dirname, '../src/assets/quran_full.json');
const DUMP_FILE = path.join(__dirname, '../tafsir_dump.json');

const main = () => {
    if (!fs.existsSync(MAIN_FILE) || !fs.existsSync(DUMP_FILE)) {
        console.error("Missing files.");
        return;
    }

    console.log("Loading files...");
    const quran = JSON.parse(fs.readFileSync(MAIN_FILE, 'utf-8'));
    const tafsirEntries = JSON.parse(fs.readFileSync(DUMP_FILE, 'utf-8'));

    console.log(`Loaded ${quran.length} verses and ${tafsirEntries.length} tafsir entries.`);

    // Create lookup map
    const tafsirMap = {};
    tafsirEntries.forEach(entry => {
        if (entry.ayah_key && entry.text) {
            tafsirMap[entry.ayah_key] = entry.text;
        }
    });

    let updatedCount = 0;

    quran.forEach(verse => {
        const key = `${verse.surah_id}:${verse.verse_number}`;
        if (tafsirMap[key]) {
            // Overwrite existing tafsir (which was either sparse or bad parsed data)
            verse.tafsir_text = tafsirMap[key];
            updatedCount++;
        } else {
            // If no tafsir in DB, maybe keep existing?
            // But this DB has 6236 rows, so it should cover everything.
            // If missing, we leave it as is.
        }
    });

    fs.writeFileSync(MAIN_FILE, JSON.stringify(quran, null, 2));
    console.log(`Successfully merged text into ${updatedCount} verses.`);
};

main();
