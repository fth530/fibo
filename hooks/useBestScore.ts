import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BEST_SCORE_KEY = '@fibonacci_best_score';

export function useBestScore(currentScore: number): number {
  const [bestScore, setBestScore] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem(BEST_SCORE_KEY)
      .then((val) => {
        if (val !== null) {
          const saved = parseInt(val, 10);
          if (!isNaN(saved) && saved > 0) setBestScore(saved);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (currentScore > bestScore) {
      setBestScore(currentScore);
      AsyncStorage.setItem(BEST_SCORE_KEY, String(currentScore)).catch(() => {});
    }
  }, [currentScore, bestScore]);

  return bestScore;
}
