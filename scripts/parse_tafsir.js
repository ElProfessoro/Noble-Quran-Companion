const fs = require('fs');
const path = require('path');

const RAW_FILE = path.join(__dirname, '../tafsir_raw.txt');
const OUT_FILE = path.join(__dirname, '../src/assets/tafsir_parsed.json');
const FULL_QURAN = require('../src/assets/quran_full.json'); // To get Surah names for fuzzy matching

// Helper to normalize strings for comparison
const normalize = (str) => str.toUpperCase().replace(/[^A-Z]/g, '');

const main = () => {
    if (!fs.existsSync(RAW_FILE)) {
        console.error("tafsir_raw.txt not found. Please download it first.");
        return;
    }

    const text = fs.readFileSync(RAW_FILE, 'utf-8');
    const lines = text.split('\n');

    // 1. Identify Surah Start Lines
    // Pattern: "SOURATE" key word.
    // We will collect chunks starting with SOURATE.

    const rawsurahs = [];
    let currentBuffer = [];
    let currentHeader = "";

    // Regex for Surah Header: Start of line, or typical numeration.
    // We expect "SOURATE" to be UPPERCASE usually.
    const surahHeaderRegex = /^(?:(?:\d+\s*[-–.]\s*)?SOURATE|SOURATE)\s+/;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        // Heuristic: Line must match strict Regex and be short.
        if (surahHeaderRegex.test(line) && line.length < 60 && !line.includes("sourate")) { // exclude lowercase usages
            // Check if it really looks like a header
            if (currentBuffer.length > 0) {
                rawsurahs.push({ header: currentHeader, lines: currentBuffer });
            }
            currentHeader = line;
            currentBuffer = [];
        } else {
            currentBuffer.push(line);
        }
    }
    if (currentBuffer.length > 0) rawsurahs.push({ header: currentHeader, lines: currentBuffer });

    console.log(`Found ${rawsurahs.length} potential Surah blocks.`);

    // 2. Map blocks to Surah IDs
    const parsedData = []; // [{ surah_id, verses: { 1: "text", ... } }]

    // We assume the file follows Quran order 1..114 EXCEPT Fatiha might be missing or first.
    // Actually, Fatiha was "SOURATE DE LA VACHE" at line 897?
    // Wait, line 897 was Vache (2). Where is 1?
    // Let's check the first blocks.

    let surahPointer = 1;

    for (const block of rawsurahs) {
        // Try to identify Surah by Name
        const headerNorm = normalize(block.header);

        // Find matching Surah in Reference Data
        let matchedId = -1;

        // 1. Try to extract ID directly from header (e.g. "5 -SOURATE")
        const idMatch = block.header.match(/(\d+)\s*[-–.]\s*SOURATE/i);
        if (idMatch) {
            matchedId = parseInt(idMatch[1]);
        }

        // 2. Custom overrides/fallbacks if no number found
        if (matchedId === -1) {
            if (headerNorm.includes("VACHE")) matchedId = 2;
            else if (headerNorm.includes("ALFATIHA") || headerNorm.includes("OUVERTURE") || headerNorm.includes("FATIHA")) matchedId = 1;
            else if (headerNorm.includes("REPENTIR")) matchedId = 9;
            else if (headerNorm.includes("JONAS")) matchedId = 10;
            else if (headerNorm.includes("HOUD")) matchedId = 11;
            else if (headerNorm.includes("JOSEPH")) matchedId = 12;
            else if (headerNorm.includes("FOUDRE")) matchedId = 13;
            else if (headerNorm.includes("DISTINCTION")) matchedId = 25;
        }

        // 3. Parse Verses inside the block
        // Search for (N) patterns.
        const content = block.lines.join('\n');
        // Regex: (number) or (number).
        const splitRegex = /\(\s*(\d+)\s*\)/g;

        let match;
        let lastIndex = 0;
        let lastVerseNum = 0;

        const versesMap = {};

        while ((match = splitRegex.exec(content)) !== null) {
            const verseNum = parseInt(match[1]);
            const textSegment = content.substring(lastIndex, match.index).trim();

            // Assign this segment to ... the PREVIOUS verse?
            // "Text (1)" -> Text belongs to 1.
            if (verseNum > 0) {
                versesMap[verseNum] = textSegment;
            }

            lastIndex = splitRegex.lastIndex;
            lastVerseNum = verseNum;
        }

        // Trailing text belongs to ... the last verse? Or is it Tafsir?
        // "Text (Last). Tafsir..."
        const tail = content.substring(lastIndex).trim();
        if (lastVerseNum > 0) {
            versesMap[lastVerseNum] = (versesMap[lastVerseNum] || "") + "\n\n" + tail;
        }

        // Optimization: If a block has NO verse markers (Title only or Summary), ignore or attach to Verse 1?

        if (matchedId > 0) {
            parsedData.push({ id: matchedId, verses: versesMap });
            surahPointer = matchedId; // Track last valid ID
        } else {
            // If this block clearly isn't a header (e.g. false positive that slipped through, or just preamble?),
            // Check if it contains verses.
            const hasVerses = Object.keys(versesMap).length > 0;
            if (hasVerses && surahPointer > 0) {
                // It's likely a continuation of the previous Surah (misidentified header or split)
                console.log(`Block "${block.header}" attached to previous Surah ${surahPointer}`);
                // Find the existing Surah object in parsedData
                const existing = parsedData.find(p => p.id === surahPointer);
                if (existing) {
                    Object.assign(existing.verses, versesMap);
                }
            } else {
                parsedData.push({ header: block.header, verses: versesMap });
            }
        }
    }

    fs.writeFileSync(OUT_FILE, JSON.stringify(parsedData, null, 2));
    console.log("Parsed", parsedData.length, "blocks.");
};

main();
