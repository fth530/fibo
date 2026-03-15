import { useCallback, useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import { Audio } from 'expo-av';
import { useSettings } from '@/hooks/useSettings';

// Sound files — add actual .wav/.mp3 files to assets/sounds/
// Uncomment the requires below once sound files are added
const SOUNDS = {
  // merge: require('@/assets/sounds/merge.wav'),
  // swipe: require('@/assets/sounds/swipe.wav'),
  // gameOver: require('@/assets/sounds/gameover.wav'),
  // newRecord: require('@/assets/sounds/newrecord.wav'),
  // undo: require('@/assets/sounds/undo.wav'),
  // tap: require('@/assets/sounds/tap.wav'),
};

type SoundName = keyof typeof SOUNDS;

export function useGameAudio() {
  const { settings } = useSettings();
  const soundsRef = useRef<Map<string, Audio.Sound>>(new Map());
  const enabled = settings.soundEnabled ?? true;

  // Configure audio session
  useEffect(() => {
    if (Platform.OS === 'web') return;
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: false,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    }).catch(() => {});
  }, []);

  // Pause on background, resume on foreground
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') {
        // Stop all sounds when app goes to background
        soundsRef.current.forEach((sound) => {
          sound.stopAsync().catch(() => {});
        });
      }
    });
    return () => sub.remove();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      soundsRef.current.forEach((sound) => {
        sound.unloadAsync().catch(() => {});
      });
      soundsRef.current.clear();
    };
  }, []);

  const play = useCallback(async (_name: SoundName) => {
    if (!enabled || Platform.OS === 'web') return;

    // TODO: Uncomment when sound files are added
    // const source = SOUNDS[name];
    // if (!source) return;
    //
    // try {
    //   // Reuse or create sound
    //   let sound = soundsRef.current.get(name);
    //   if (sound) {
    //     await sound.setPositionAsync(0);
    //     await sound.playAsync();
    //   } else {
    //     const { sound: newSound } = await Audio.Sound.createAsync(source, { shouldPlay: true, volume: 0.7 });
    //     soundsRef.current.set(name, newSound);
    //   }
    // } catch {}
  }, [enabled]);

  const playMerge = useCallback(() => play('merge' as SoundName), [play]);
  const playSwipe = useCallback(() => play('swipe' as SoundName), [play]);
  const playGameOver = useCallback(() => play('gameOver' as SoundName), [play]);
  const playNewRecord = useCallback(() => play('newRecord' as SoundName), [play]);
  const playUndo = useCallback(() => play('undo' as SoundName), [play]);
  const playTap = useCallback(() => play('tap' as SoundName), [play]);

  return { playMerge, playSwipe, playGameOver, playNewRecord, playUndo, playTap };
}
