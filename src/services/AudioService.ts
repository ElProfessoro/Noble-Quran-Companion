import TrackPlayer, { Capability, AppKilledPlaybackBehavior } from 'react-native-track-player';
import { useAudioStore } from '../store/audioStore';

export const setupPlayer = async () => {
    try {
        // Simple check if player is already setup by trying to get state
        try {
            await TrackPlayer.getActiveTrackIndex();
            return true;
        } catch {
            // Not setup
        }

        await TrackPlayer.setupPlayer();
        await TrackPlayer.updateOptions({
            android: {
                appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
            },
            capabilities: [
                Capability.Play,
                Capability.Pause,
                Capability.SkipToNext,
                Capability.SkipToPrevious,
                Capability.SeekTo,
            ],
            compactCapabilities: [Capability.Play, Capability.Pause, Capability.SkipToNext],
            progressUpdateEventInterval: 2,
        });
        return true;
    } catch (e) {
        console.error('Player setup error', e);
        return false;
    }
};

export const getAudioUrl = (surah: number, verse: number) => {
    const s = surah.toString().padStart(3, '0');
    const v = verse.toString().padStart(3, '0');
    // Using Alafasy as default
    return `https://everyayah.com/data/Alafasy_128kbps/${s}${v}.mp3`;
}

// Play a single verse
export const playVerse = async (surahId: number, verseNumber: number) => {
    await TrackPlayer.reset();

    const track = {
        id: `${surahId}_${verseNumber}`,
        url: getAudioUrl(surahId, verseNumber),
        title: `Sourate ${surahId} - Verset ${verseNumber}`,
        artist: 'Mishary Rashid Alafasy',
        verseId: verseNumber,
        surahId: surahId
    };

    await TrackPlayer.add(track);
    await TrackPlayer.play();

    useAudioStore.getState().setPlayback(surahId, verseNumber);
    useAudioStore.getState().setIsPlaying(true);
};

// Pause playback
export const pausePlayback = async () => {
    await TrackPlayer.pause();
    useAudioStore.getState().setIsPlaying(false);
};

// Resume playback
export const resumePlayback = async () => {
    await TrackPlayer.play();
    useAudioStore.getState().setIsPlaying(true);
};

export const playSurah = async (surahId: number, versesCount: number = 7, startVerseId: number = 1) => {
    await TrackPlayer.reset();

    const tracks = [];
    for (let i = 1; i <= versesCount; i++) {
        tracks.push({
            id: `${surahId}_${i}`,
            url: getAudioUrl(surahId, i),
            title: `Sourate ${surahId} - Verset ${i}`,
            artist: 'Mishary Rashid Alafasy',
            // Custom metadata to track verse
            verseId: i,
            surahId: surahId
        });
    }

    await TrackPlayer.add(tracks);

    if (startVerseId > 1) {
        // TrackPlayer uses 0-based index for queue
        await TrackPlayer.skip(startVerseId - 1);
    }

    await TrackPlayer.play();
    useAudioStore.getState().setIsPlaying(true);
};
