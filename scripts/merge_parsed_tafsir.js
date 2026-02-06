const fs = require('fs');
const path = require('path');

const MAIN_FILE = path.join(__dirname, '../src/assets/quran_full.json');
const TAFSIR_FILE = path.join(__dirname, '../src/assets/tafsir_parsed.json');

const main = () => {
    if (!fs.existsSync(MAIN_FILE) || !fs.existsSync(TAFSIR_FILE)) {
        console.error("Missing files.");
        return;
    }

    const quran = JSON.parse(fs.readFileSync(MAIN_FILE, 'utf-8'));
    const tafsirBlocks = JSON.parse(fs.readFileSync(TAFSIR_FILE, 'utf-8'));

    // Create a quick lookup map
    const tafsirMap = {}; // "surahId:verseId" -> text

    tafsirBlocks.forEach(block => {
        if (!block.id) return;
        Object.keys(block.verses).forEach(vNum => {
            tafsirMap[`${block.id}:${vNum}`] = block.verses[vNum];
        });
    });

    let updatedCount = 0;

    // Iterate main quran and update tafsir_text
    quran.forEach(verse => {
        const key = `${verse.surah_id}:${verse.verse_number}`;
        if (tafsirMap[key]) {
            // Clean up the text slightly (remove newlines if excessive?)
            const newText = tafsirMap[key].replace(/\n{3,}/g, '\n\n').trim();

            // Should we overwrite or append?
            // The existing tafsir might have a footnote.
            // Let's prepend the Parsed Text (richer?) or Append?
            // Parsed text usually starts with Translation.

            // Strategy: Use Parsed Text as the primary "Tafsir".
            // If existing tafsir (footnotes) exists, append it as "Notes".

            if (verse.tafsir_text && verse.tafsir_text.length > 5) {
                verse.tafsir_text = newText + "\n\n--- Notes ---\n" + verse.tafsir_text;
            } else {
                verse.tafsir_text = newText;
            }
            updatedCount++;
        }
    });

    fs.writeFileSync(MAIN_FILE, JSON.stringify(quran, null, 2));
    console.log(`Merged Tafsir into ${updatedCount} verses.`);
};

main();
