import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@fibo_settings';

export type ThemeMode = 'light' | 'dark';
export type Language = 'tr' | 'en';

export interface Settings {
  hapticEnabled: boolean;
  theme: ThemeMode;
  language: Language;
  hasSeenTutorial: boolean;
  hasCompletedOnboarding: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  hapticEnabled: true,
  theme: 'light',
  language: 'tr',
  hasSeenTutorial: false,
  hasCompletedOnboarding: false,
};

export interface SettingsContextValue {
  settings: Settings;
  updateSettings: (partial: Partial<Settings>) => void;
  isLoaded: boolean;
}

export const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  updateSettings: () => {},
  isLoaded: false,
});

export function useSettingsProvider(): SettingsContextValue {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(SETTINGS_KEY)
      .then((val) => {
        if (val) {
          try {
            const parsed = JSON.parse(val);
            setSettings({ ...DEFAULT_SETTINGS, ...parsed });
          } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setIsLoaded(true));
  }, []);

  const updateSettings = useCallback((partial: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  return { settings, updateSettings, isLoaded };
}

export function useSettings(): SettingsContextValue {
  return useContext(SettingsContext);
}
