import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TileData } from '@/hooks/useFibonacciGame';

const DAILY_KEY = '@fibo_daily_challenge';
const GRID_SIZE = 4;

export interface DailyChallenge {
  date: string; // YYYY-MM-DD
  seed: number;
  completed: boolean;
  bestScore: number;
  streak: number;
}

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Seeded random — same date = same board
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function dateSeed(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash + dateStr.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) || 1;
}

export function makeDailyTiles(dateStr: string): TileData[] {
  const seed = dateSeed(dateStr);
  const rng = seededRandom(seed);

  // Pick 2 random positions
  const pool = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => i);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // Occasionally start with a 2 or 3 instead of 1 for variety
  const startValues = [1, 1, 1, 1, 1, 2, 2, 3];
  const val1 = startValues[Math.floor(rng() * startValues.length)];
  const val2 = startValues[Math.floor(rng() * startValues.length)];

  return [pool[0], pool[1]].map((idx, i) => ({
    id: `daily-${dateStr}-${i}`,
    value: i === 0 ? val1 : val2,
    row: Math.floor(idx / GRID_SIZE),
    col: idx % GRID_SIZE,
    isNew: true,
    isMerged: false,
  }));
}

export function useDailyChallenge() {
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const today = getTodayString();

  useEffect(() => {
    AsyncStorage.getItem(DAILY_KEY)
      .then((val) => {
        if (val) {
          try {
            const saved = JSON.parse(val) as DailyChallenge;
            if (saved.date === today) {
              setChallenge(saved);
            } else {
              // New day — carry streak if yesterday was completed
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
              const newStreak = saved.date === yesterdayStr && saved.completed ? saved.streak : 0;
              const newChallenge: DailyChallenge = {
                date: today,
                seed: dateSeed(today),
                completed: false,
                bestScore: 0,
                streak: newStreak,
              };
              setChallenge(newChallenge);
              AsyncStorage.setItem(DAILY_KEY, JSON.stringify(newChallenge)).catch(() => {});
            }
          } catch {
            initNew();
          }
        } else {
          initNew();
        }
      })
      .catch(() => initNew())
      .finally(() => setIsLoaded(true));
  }, [today]);

  function initNew() {
    const c: DailyChallenge = {
      date: today,
      seed: dateSeed(today),
      completed: false,
      bestScore: 0,
      streak: 0,
    };
    setChallenge(c);
    AsyncStorage.setItem(DAILY_KEY, JSON.stringify(c)).catch(() => {});
  }

  const completeDaily = useCallback((score: number) => {
    setChallenge((prev) => {
      if (!prev) return prev;
      const next: DailyChallenge = {
        ...prev,
        completed: true,
        bestScore: Math.max(prev.bestScore, score),
        streak: prev.completed ? prev.streak : prev.streak + 1,
      };
      AsyncStorage.setItem(DAILY_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const getDailyTiles = useCallback(() => {
    return makeDailyTiles(today);
  }, [today]);

  return { challenge, isLoaded, completeDaily, getDailyTiles, today };
}
