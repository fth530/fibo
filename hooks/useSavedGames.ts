import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TileData } from '@/hooks/useFibonacciGame';

const SAVED_GAMES_KEY = '@fibo_saved_games';
const MAX_SLOTS = 3;

export interface SavedGame {
  tiles: TileData[];
  score: number;
  moveCount: number;
  savedAt: number;
  highestTile: number;
}

type SavedSlots = (SavedGame | null)[];

export function useSavedGames() {
  const [slots, setSlots] = useState<SavedSlots>([null, null, null]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(SAVED_GAMES_KEY)
      .then((val) => {
        if (val) {
          try {
            const parsed = JSON.parse(val) as SavedSlots;
            const padded: SavedSlots = Array.from({ length: MAX_SLOTS }, (_, i) => parsed[i] ?? null);
            setSlots(padded);
          } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setIsLoaded(true));
  }, []);

  const persist = useCallback((next: SavedSlots) => {
    setSlots(next);
    AsyncStorage.setItem(SAVED_GAMES_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const saveGame = useCallback((slotIndex: number, game: SavedGame) => {
    if (slotIndex < 0 || slotIndex >= MAX_SLOTS) return;
    setSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = game;
      AsyncStorage.setItem(SAVED_GAMES_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const deleteGame = useCallback((slotIndex: number) => {
    if (slotIndex < 0 || slotIndex >= MAX_SLOTS) return;
    setSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = null;
      AsyncStorage.setItem(SAVED_GAMES_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const findEmptySlot = useCallback((): number => {
    const idx = slots.findIndex((s) => s === null);
    if (idx !== -1) return idx;
    // All full - find oldest
    let oldestIdx = 0;
    let oldestTime = Infinity;
    slots.forEach((s, i) => {
      if (s && s.savedAt < oldestTime) {
        oldestTime = s.savedAt;
        oldestIdx = i;
      }
    });
    return oldestIdx;
  }, [slots]);

  const clearAll = useCallback(() => {
    persist([null, null, null]);
  }, [persist]);

  return { slots, isLoaded, saveGame, deleteGame, findEmptySlot, clearAll };
}
