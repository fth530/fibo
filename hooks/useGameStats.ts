import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STATS_KEY = '@fibo_game_stats';

export interface GameStats {
  totalGames: number;
  highestTile: number;
  totalScore: number;
}

const DEFAULT_STATS: GameStats = {
  totalGames: 0,
  highestTile: 0,
  totalScore: 0,
};

export function useGameStats() {
  const [stats, setStats] = useState<GameStats>(DEFAULT_STATS);

  useEffect(() => {
    AsyncStorage.getItem(STATS_KEY)
      .then((val) => {
        if (val) {
          try {
            setStats({ ...DEFAULT_STATS, ...JSON.parse(val) });
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const recordGame = useCallback((score: number, highestTile: number) => {
    setStats((prev) => {
      const next: GameStats = {
        totalGames: prev.totalGames + 1,
        highestTile: Math.max(prev.highestTile, highestTile),
        totalScore: prev.totalScore + score,
      };
      AsyncStorage.setItem(STATS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  return { stats, recordGame };
}
