import { useCallback, useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import { Audio } from 'expo-av';
import { useSettings } from '@/hooks/useSettings';

const SOUND_FILES = {
  merge: require('@/assets/sounds/taslarınbirlesmesesi.mp3'),
  swipe: require('@/assets/sounds/parmaklakaydırmasesi.wav'),
  gameOver: require('@/assets/sounds/gameover.mp3'),
  newRecord: require('@/assets/sounds/Yenirekorsesi.mp3'),
};

type SoundName = keyof typeof SOUND_FILES;

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

  // Stop sounds on background
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') {
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

  // Stop all sounds when sound is disabled
  useEffect(() => {
    if (!enabled) {
      soundsRef.current.forEach((sound) => {
        sound.stopAsync().catch(() => {});
      });
    }
  }, [enabled]);

  const play = useCallback(async (name: SoundName) => {
    if (!enabled || Platform.OS === 'web') return;

    try {
      let sound = soundsRef.current.get(name);
      if (sound) {
        await sound.setPositionAsync(0);
        await sound.playAsync();
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          SOUND_FILES[name],
          { shouldPlay: true, volume: 0.7 }
        );
        soundsRef.current.set(name, newSound);
      }
    } catch {}
  }, [enabled]);

  const playMerge = useCallback(() => play('merge'), [play]);
  const playSwipe = useCallback(() => play('swipe'), [play]);
  const playGameOver = useCallback(() => play('gameOver'), [play]);
  const playNewRecord = useCallback(() => play('newRecord'), [play]);

  return { playMerge, playSwipe, playGameOver, playNewRecord };
}
