export const seedData = [
    {
        surah_id: 1,
        verse_number: 1,
        arabic_text: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
        phonetic_text: "Bismi Allahi alrrahmani alrraheemi",
        translation_text: "Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux.",
        tafsir_text: "Ceci est la Basmala. Elle commence chaque sourate sauf la sourate 9. Elle invoque la miséricorde d'Allah."
    },
    {
        surah_id: 1,
        verse_number: 2,
        arabic_text: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ",
        phonetic_text: "Alhamdu lillahi rabbi alAAalameena",
        translation_text: "Louange à Allah, Seigneur de l'univers.",
        tafsir_text: "La louange est due à Allah seul, créateur et maître de tout ce qui existe."
    },
    {
        surah_id: 1,
        verse_number: 3,
        arabic_text: "ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
        phonetic_text: "Alrrahmani alrraheemi",
        translation_text: "Le Tout Miséricordieux, le Très Miséricordieux,",
        tafsir_text: "Répétition des attributs de miséricorde pour souligner leur importance."
    },
    {
        surah_id: 1,
        verse_number: 4,
        arabic_text: "مَـٰلِكِ يَوْمِ ٱلدِّينِ",
        phonetic_text: "Maliki yawmi alddeeni",
        translation_text: "Maître du Jour de la rétribution.",
        tafsir_text: "Allah est le seul juge et maître lors du Jour du Jugement dernier."
    },
    {
        surah_id: 1,
        verse_number: 5,
        arabic_text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
        phonetic_text: "Iyyaka naAAbudu waiyyaka nastaAeenu",
        translation_text: "C'est Toi [Seul] que nous adorons, et c'est Toi [Seul] dont nous implorons secours.",
        tafsir_text: "L'affirmation du monothéisme pur (Tawhid). Nous n'adorons que Toi et ne demandons de l'aide qu'à Toi."
    },
    {
        surah_id: 1,
        verse_number: 6,
        arabic_text: "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ",
        phonetic_text: "Ihdina alssirata almustaqeema",
        translation_text: "Guide-nous dans le droit chemin,",
        tafsir_text: "La demande la plus importante : être guidé sur la voie de l'Islam et de la rectitude."
    },
    {
        surah_id: 1,
        verse_number: 7,
        arabic_text: "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ",
        phonetic_text: "Sirata allatheena anAAamta AAalayhim ghayri almaghdoobi AAalayhim wala alddalleena",
        translation_text: "le chemin de ceux que Tu as comblés de faveurs, non pas de ceux qui ont encouru Ta colère, ni des égarés.",
        tafsir_text: "Le chemin des prophètes et des vertueux, distincts de ceux qui ont rejeté la vérité ou s'en sont détournés."
    },
    // Adding just first verse of Al-Baqarah to test navigation/separation logic later if needed
    {
        surah_id: 2,
        verse_number: 1,
        arabic_text: "الٓمٓ",
        phonetic_text: "Alif-lam-meem",
        translation_text: "Alif, Lâm, Mîm.",
        tafsir_text: "Ces lettres, appelées Muqatta'at, sont présentes au début de certaines sourates. Seul Allah connaît leur sens exact."
    },
    // Surah 112 - Al-Ikhlas
    { surah_id: 112, verse_number: 1, arabic_text: "قُلْ هُوَ ٱللَّهُ أَحَدٌ", phonetic_text: "Qul huwa Allahu ahad", translation_text: "Dis: «Il est Allah, Unique.", tafsir_text: "Affirmation de l'unicité absolue d'Allah." },
    { surah_id: 112, verse_number: 2, arabic_text: "ٱللَّهُ ٱلصَّمَدُ", phonetic_text: "Allahu alssamad", translation_text: "Allah, Le Seul à être imploré pour ce que nous désirons.", tafsir_text: "Il ne dépend de personne, tout dépend de Lui." },
    { surah_id: 112, verse_number: 3, arabic_text: "لَمْ يَلِدْ وَلَمْ يُولَدْ", phonetic_text: "Lam yalid walam yoolad", translation_text: "Il n'a jamais engendré, n'a pas été engendré non plus.", tafsir_text: "Réfutation de toute filiation ou origine." },
    { surah_id: 112, verse_number: 4, arabic_text: "وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ", phonetic_text: "Walam yakun lahu kufuwan ahad", translation_text: "Et nul n'est égal à Lui».", tafsir_text: "Rien ne Lui ressemble." },

    // Surah 113 - Al-Falaq
    { surah_id: 113, verse_number: 1, arabic_text: "قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ", phonetic_text: "Qul aAAoothu birabbi alfalaq", translation_text: "Dis: «Je cherche protection auprès du Seigneur de l'aube naissante,", tafsir_text: "Refuge auprès d'Allah contre les maux." },
    { surah_id: 113, verse_number: 2, arabic_text: "مِن شَرِّ مَا خَلَقَ", phonetic_text: "Min sharri ma khalaq", translation_text: "contre le mal des êtres qu'Il a créés,", tafsir_text: "Contre tout mal provenant de la création." },
    { surah_id: 113, verse_number: 3, arabic_text: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ", phonetic_text: "Wamin sharri ghasiqin itha waqab", translation_text: "contre le mal de l'obscurité quand elle s'approfondit,", tafsir_text: "Contre les dangers de la nuit." },
    { surah_id: 113, verse_number: 4, arabic_text: "وَمِن شَرِّ ٱلنَّفَّـٰثَـٰتِ فِى ٱلْعُقَدِ", phonetic_text: "Wamin sharri alnnaffathati fee alAAuqad", translation_text: "contre le mal de celles qui soufflent (les sorcières) sur les nœuds,", tafsir_text: "Protection contre la sorcellerie." },
    { surah_id: 113, verse_number: 5, arabic_text: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ", phonetic_text: "Wamin sharri hasidin itha hasad", translation_text: "et contre le mal de l'envieux quand il envie».", tafsir_text: "Protection contre le mauvais œil." },

    // Surah 114 - An-Nas
    { surah_id: 114, verse_number: 1, arabic_text: "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ", phonetic_text: "Qul aAAoothu birabbi alnnas", translation_text: "Dis: «Je cherche protection auprès du Seigneur des hommes.", tafsir_text: "Invoquer le Seigneur de l'humanité." },
    { surah_id: 114, verse_number: 2, arabic_text: "مَلِكِ ٱلنَّاسِ", phonetic_text: "Maliki alnnas", translation_text: "Le Souverain des hommes,", tafsir_text: "Le Roi absolu." },
    { surah_id: 114, verse_number: 3, arabic_text: "إِلَـٰهِ ٱلنَّاسِ", phonetic_text: "Ilahi alnnas", translation_text: "Dieu des hommes,", tafsir_text: "Le seul digne d'adoration." },
    { surah_id: 114, verse_number: 4, arabic_text: "مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ", phonetic_text: "Min sharri alwaswasi alkhannas", translation_text: "contre le mal du mauvais conseiller, furtif,", tafsir_text: "Satan qui murmure et se retire." },
    { surah_id: 114, verse_number: 5, arabic_text: "ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ", phonetic_text: "Allathee yuwaswisu fee sudoori alnnas", translation_text: "qui souffle le mal dans les poitrines des hommes,", tafsir_text: "L'influence satanique interne." },
    { surah_id: 114, verse_number: 6, arabic_text: "مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ", phonetic_text: "Mina aljinnati waalnnas", translation_text: "qu'il (le conseiller) soit un djinn, ou un être humain».", tafsir_text: "Protection contre les démons et les hommes malveillants." }
];
