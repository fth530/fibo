import { useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const REVIEW_KEY = '@fibo_review_state';

interface ReviewState {
  sessionCount: number;
  hasReachedTile55: boolean;
  hasReachedPersonalBest: boolean;
  lastPromptDate: number | null;
  promptCount: number;
  firstSessionDate: number;
}

const DEFAULT_STATE: ReviewState = {
  sessionCount: 0,
  hasReachedTile55: false,
  hasReachedPersonalBest: false,
  lastPromptDate: null,
  promptCount: 0,
  firstSessionDate: Date.now(),
};

async function getState(): Promise<ReviewState> {
  try {
    const val = await AsyncStorage.getItem(REVIEW_KEY);
    if (val) return { ...DEFAULT_STATE, ...JSON.parse(val) };
  } catch {}
  return { ...DEFAULT_STATE, firstSessionDate: Date.now() };
}

async function setState(partial: Partial<ReviewState>): Promise<void> {
  try {
    const current = await getState();
    await AsyncStorage.setItem(REVIEW_KEY, JSON.stringify({ ...current, ...partial }));
  } catch {}
}

async function requestReview(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    const StoreReview = await import('expo-store-review');
    const available = await StoreReview.isAvailableAsync();
    if (available) {
      await StoreReview.requestReview();
      const state = await getState();
      await setState({
        promptCount: state.promptCount + 1,
        lastPromptDate: Date.now(),
      });
    }
  } catch {}
}

export function useReviewPrompt() {
  // Call on app start
  const recordSession = useCallback(async () => {
    const state = await getState();
    await setState({ sessionCount: state.sessionCount + 1 });
  }, []);

  // Call when player reaches tile 55 for the first time
  const onReachTile55 = useCallback(async () => {
    const state = await getState();
    if (state.hasReachedTile55) return;
    await setState({ hasReachedTile55: true });

    // Prompt 1: 5+ sessions AND first time reaching 55
    if (state.sessionCount >= 5 && state.promptCount === 0) {
      await requestReview();
    }
  }, []);

  // Call when player achieves a new personal best tile
  const onNewPersonalBest = useCallback(async () => {
    const state = await getState();

    // Prompt 2: 20+ sessions AND new personal best
    if (state.sessionCount >= 20 && state.promptCount === 1) {
      // At least 90 days since last prompt
      const daysSinceLastPrompt = state.lastPromptDate
        ? (Date.now() - state.lastPromptDate) / (1000 * 60 * 60 * 24)
        : 999;
      if (daysSinceLastPrompt >= 90) {
        await requestReview();
      }
    }
  }, []);

  // Call after app update on first session
  const onAppUpdateSession = useCallback(async () => {
    const state = await getState();
    const daysSinceFirst = (Date.now() - state.firstSessionDate) / (1000 * 60 * 60 * 24);

    // Prompt 3: 30+ days active AND after update
    if (daysSinceFirst >= 30 && state.promptCount === 2) {
      const daysSinceLastPrompt = state.lastPromptDate
        ? (Date.now() - state.lastPromptDate) / (1000 * 60 * 60 * 24)
        : 999;
      if (daysSinceLastPrompt >= 90) {
        await requestReview();
      }
    }
  }, []);

  return { recordSession, onReachTile55, onNewPersonalBest, onAppUpdateSession };
}
