import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { GameBoard } from '@/components/GameBoard';
import { HowToPlayModal } from '@/components/HowToPlayModal';
import { GameOverOverlay } from '@/components/GameOverOverlay';
import { SettingsModal } from '@/components/SettingsModal';
import { FloatingScore } from '@/components/FloatingScore';
import { AnimatedScore } from '@/components/AnimatedScore';
import { OnboardingModal } from '@/components/OnboardingModal';
import { HomeScreen } from '@/components/HomeScreen';
import { useFibonacciGame } from '@/hooks/useFibonacciGame';
import { useBestScore } from '@/hooks/useBestScore';
import { useSettings } from '@/hooks/useSettings';
import { useGameStats } from '@/hooks/useGameStats';
import { useSavedGames } from '@/hooks/useSavedGames';
import { useReviewPrompt } from '@/hooks/useReviewPrompt';
import { getTheme } from '@/constants/colors';
import { useT } from '@/constants/i18n';
import type { Direction } from '@/hooks/useFibonacciGame';
import type { Language } from '@/hooks/useSettings';

type Screen = 'home' | 'game';

interface FloatingScoreItem {
  id: number;
  value: number;
}

export default function AppRoot() {
  const { settings, updateSettings } = useSettings();
  const theme = getTheme(settings.theme);
  const isDark = settings.theme === 'dark';
  const t = useT();

  // Show onboarding if not completed
  const [showOnboarding, setShowOnboarding] = useState(!settings.hasCompletedOnboarding);
  const [screen, setScreen] = useState<Screen>('home');
  const [activeSlot, setActiveSlot] = useState<number>(-1);

  const { tiles, score, gameOver, canUndo, moveCount, swipe, restart, undo, loadGame } = useFibonacciGame();
  const { bestScore, resetBestScore } = useBestScore(score);
  const { stats, recordGame, resetStats } = useGameStats();
  const { slots, saveGame, deleteGame, findEmptySlot } = useSavedGames();
  const { recordSession, onReachTile55, onNewPersonalBest } = useReviewPrompt();

  const [showTutorial, setShowTutorial] = useState(false);
  const prevHighestTile = useRef(0);
  const [showSettings, setShowSettings] = useState(false);
  const [floatingScores, setFloatingScores] = useState<FloatingScoreItem[]>([]);
  const prevGameOver = useRef(false);
  const floatingIdRef = useRef(0);

  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  const scoreShake = useSharedValue(0);
  const boardShake = useSharedValue(0);
  const scoreScale = useSharedValue(1);
  const boardOpacity = useSharedValue(1);

  const gameStartTime = useRef(Date.now());
  const [gameDuration, setGameDuration] = useState(0);

  // Record session for review prompt
  useEffect(() => {
    recordSession();
  }, [recordSession]);

  // Check for milestone tiles for review prompt
  useEffect(() => {
    if (screen !== 'game' || tiles.length === 0) return;
    const currentHighest = tiles.reduce((max, ti) => Math.max(max, ti.value), 0);
    if (currentHighest >= 55 && prevHighestTile.current < 55) {
      onReachTile55();
    }
    if (currentHighest > prevHighestTile.current && prevHighestTile.current > 0) {
      onNewPersonalBest();
    }
    prevHighestTile.current = currentHighest;
  }, [tiles, screen, onReachTile55, onNewPersonalBest]);

  // Onboarding completion
  const handleOnboardingComplete = () => {
    updateSettings({ hasCompletedOnboarding: true, hasSeenTutorial: true });
    setShowOnboarding(false);
  };

  // Navigate to game
  const startNewGame = () => {
    const slot = findEmptySlot();
    setActiveSlot(slot);
    restart();
    gameStartTime.current = Date.now();
    setGameDuration(0);
    setFloatingScores([]);
    boardOpacity.value = 0;
    boardOpacity.value = withDelay(100, withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }));
    setScreen('game');
  };

  const continueGame = (slotIndex: number) => {
    const saved = slots[slotIndex];
    if (!saved) return;
    setActiveSlot(slotIndex);
    loadGame(saved.tiles, saved.score, saved.moveCount);
    gameStartTime.current = Date.now();
    setGameDuration(0);
    setFloatingScores([]);
    setScreen('game');
  };

  const handleSaveAndExit = () => {
    if (score === 0 && moveCount === 0) {
      setScreen('home');
      return;
    }
    const highestTile = tiles.reduce((max, ti) => Math.max(max, ti.value), 0);
    const slot = activeSlot >= 0 ? activeSlot : findEmptySlot();
    saveGame(slot, {
      tiles,
      score,
      moveCount,
      savedAt: Date.now(),
      highestTile,
    });
    setScreen('home');
  };

  const handleBackToMenu = () => {
    if (score > 0 && !gameOver) {
      if (Platform.OS === 'web') {
        const action = confirm(t.exitConfirmMsg + '\n\n' + t.save + '?');
        if (action) handleSaveAndExit();
        else setScreen('home');
      } else {
        Alert.alert(t.exitConfirmTitle, t.exitConfirmMsg, [
          { text: t.cancel, style: 'cancel' },
          { text: t.dontSave, style: 'destructive', onPress: () => setScreen('home') },
          { text: t.save, onPress: handleSaveAndExit },
        ]);
      }
    } else {
      setScreen('home');
    }
  };

  // Track game over
  useEffect(() => {
    if (gameOver) setGameDuration(Math.floor((Date.now() - gameStartTime.current) / 1000));
  }, [gameOver]);

  useEffect(() => {
    if (gameOver && !prevGameOver.current) {
      const highestTile = tiles.reduce((max, ti) => Math.max(max, ti.value), 0);
      recordGame(score, highestTile);
      // Delete from saved slot since game is over
      if (activeSlot >= 0) deleteGame(activeSlot);
    }
    prevGameOver.current = gameOver;
  }, [gameOver, score, tiles, recordGame, activeSlot, deleteGame]);

  const removeFloating = useCallback((id: number) => {
    setFloatingScores((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const handleResetAll = useCallback(() => {
    resetStats();
    resetBestScore();
  }, [resetStats, resetBestScore]);

  const scoreAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: scoreShake.value }, { scale: scoreScale.value }],
  }));

  const boardShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: boardShake.value }],
    opacity: boardOpacity.value,
  }));

  useEffect(() => {
    if (score > 0) {
      scoreShake.value = withSequence(
        withTiming(7, { duration: 55 }), withTiming(-7, { duration: 55 }),
        withTiming(4, { duration: 45 }), withTiming(0, { duration: 40 })
      );
      scoreScale.value = withSequence(
        withTiming(1.12, { duration: 80 }),
        withSpring(1, { damping: 14, stiffness: 340 })
      );
    }
  }, [score, scoreScale, scoreShake]);

  const haptic = (fn: () => void) => {
    if (settings.hapticEnabled) fn();
  };

  const handleSwipe = useCallback((dir: Direction) => {
    const result = swipe(dir);
    if (!result.changed) {
      haptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));
      boardShake.value = withSequence(
        withTiming(-10, { duration: 55 }), withTiming(10, { duration: 55 }),
        withTiming(-6, { duration: 45 }), withTiming(6, { duration: 45 }),
        withTiming(0, { duration: 35 })
      );
    } else if (result.merged) {
      haptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy));
      if (result.scoreGained > 0) {
        const id = ++floatingIdRef.current;
        setFloatingScores((prev) => [...prev, { id, value: result.scoreGained }]);
      }
    } else {
      haptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
    }
  }, [swipe, settings.hapticEnabled, boardShake]);

  const doRestart = () => {
    haptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
    setFloatingScores([]);
    gameStartTime.current = Date.now();
    setGameDuration(0);
    boardOpacity.value = 0;
    boardOpacity.value = withDelay(100, withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }));
    restart();
  };

  const handleRestart = () => {
    if (score > 0 && !gameOver) {
      if (Platform.OS === 'web') {
        if (confirm(t.restartConfirmMsg)) doRestart();
      } else {
        Alert.alert(t.restartConfirmTitle, t.restartConfirmMsg, [
          { text: t.cancel, style: 'cancel' },
          { text: t.yes, onPress: doRestart },
        ]);
      }
    } else {
      doRestart();
    }
  };

  const handleUndo = () => {
    if (!canUndo) return;
    haptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
    undo();
  };

  const handleInfo = () => {
    haptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
    setShowTutorial(true);
  };

  const handleSettings = () => {
    haptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
    setShowSettings(true);
  };

  // Web keyboard support
  useEffect(() => {
    if (Platform.OS !== 'web' || screen !== 'game') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyMap: Record<string, Direction> = {
        ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
      };
      const dir = keyMap[e.key];
      if (dir) { e.preventDefault(); handleSwipe(dir); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSwipe, screen]);

  const shadowStyle = Platform.select({
    ios: { shadowColor: theme.scoreCardShadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8 },
    android: { elevation: 3 },
    web: { boxShadow: `0px 2px 8px ${theme.scoreCardShadow}` },
  });

  // ─── Onboarding ───
  if (showOnboarding) {
    return (
      <OnboardingModal
        visible
        theme={theme}
        selectedLanguage={settings.language ?? 'tr'}
        onSelectLanguage={(lang: Language) => updateSettings({ language: lang })}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  // ─── Home Screen ───
  if (screen === 'home') {
    return (
      <>
        <HomeScreen
          theme={theme}
          isDark={isDark}
          bestScore={bestScore}
          slots={slots}
          onNewGame={startNewGame}
          onContinueGame={continueGame}
          onDeleteGame={deleteGame}
          onOpenSettings={handleSettings}
        />
        <SettingsModal
          visible={showSettings}
          onClose={() => setShowSettings(false)}
          theme={theme}
          stats={stats}
          onResetStats={handleResetAll}
        />
      </>
    );
  }

  // ─── Game Screen ───
  return (
    <View style={[styles.container, { paddingTop: topInset, paddingBottom: bottomInset, backgroundColor: theme.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Pressable
            onPress={handleBackToMenu}
            style={({ pressed }) => [
              styles.backBtn,
              { backgroundColor: theme.scoreCard, opacity: pressed ? 0.72 : 1 },
              shadowStyle,
            ]}
            accessibilityLabel={t.backToMenu}
          >
            <Ionicons name="chevron-back" size={20} color={theme.textSecondary} />
          </Pressable>

          <Text style={[styles.title, { color: theme.textPrimary }]}>fibo</Text>
        </View>

        <View style={styles.headerRight}>
          <Animated.View style={[styles.scoreCard, { backgroundColor: theme.scoreCard }, shadowStyle, scoreAnimStyle]}>
            <Text style={[styles.scoreLabel, { color: theme.textMuted }]}>{t.scoreLabel}</Text>
            <AnimatedScore value={score} style={[styles.scoreValue, { color: theme.textPrimary }]} />
            {floatingScores.map((f) => (
              <FloatingScore key={f.id} id={f.id} value={f.value} onDone={removeFloating} />
            ))}
          </Animated.View>

          <View style={[styles.scoreCard, { backgroundColor: theme.scoreCard }, shadowStyle]}>
            <Text style={[styles.scoreLabel, { color: theme.textMuted }]}>{t.bestLabel}</Text>
            <Text style={[styles.scoreValue, { color: theme.textPrimary }]}>{bestScore}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionRow}>
        <Pressable
          onPress={handleSaveAndExit}
          style={({ pressed }) => [
            styles.actionBtn,
            { backgroundColor: theme.scoreCard, opacity: pressed ? 0.72 : 1 },
            shadowStyle,
          ]}
          accessibilityLabel={t.saveAndExit}
        >
          <Ionicons name="save-outline" size={17} color={theme.textSecondary} />
        </Pressable>

        <Pressable
          onPress={handleUndo}
          style={({ pressed }) => [
            styles.actionBtn,
            { backgroundColor: theme.scoreCard, opacity: canUndo ? (pressed ? 0.72 : 1) : 0.35 },
            shadowStyle,
          ]}
          disabled={!canUndo}
          accessibilityLabel={t.undoLabel}
        >
          <Ionicons name="arrow-undo" size={17} color={theme.textSecondary} />
        </Pressable>

        <Pressable
          onPress={handleInfo}
          style={({ pressed }) => [
            styles.actionBtn,
            { backgroundColor: theme.scoreCard, opacity: pressed ? 0.72 : 1 },
            shadowStyle,
          ]}
          accessibilityLabel={t.howToPlayLabel}
        >
          <Ionicons name="help" size={18} color={theme.textSecondary} />
        </Pressable>

        <Pressable
          onPress={handleRestart}
          style={({ pressed }) => [
            styles.restartBtn,
            { backgroundColor: theme.restartBtn, opacity: pressed ? 0.75 : 1, transform: [{ scale: pressed ? 0.93 : 1 }] },
          ]}
          accessibilityLabel={t.newGameLabel}
        >
          <Ionicons name="refresh" size={20} color={theme.restartBtnText} />
        </Pressable>
      </View>

      <Animated.View style={[styles.boardWrapper, boardShakeStyle]}>
        <GameBoard tiles={tiles} onSwipe={handleSwipe} theme={theme} />
      </Animated.View>

      <View style={styles.hintRow}>
        <Text style={[styles.hintText, { color: theme.textMuted }]}>
          {'1+1=2  ·  2+3=5  ·  3+5=8'}
        </Text>
      </View>

      {gameOver && (
        <GameOverOverlay
          score={score}
          bestScore={bestScore}
          highestTile={tiles.reduce((max, ti) => Math.max(max, ti.value), 0)}
          moveCount={moveCount}
          gameDuration={gameDuration}
          onPlayAgain={doRestart}
          onBackToMenu={() => setScreen('home')}
          theme={theme}
        />
      )}

      <HowToPlayModal
        visible={showTutorial}
        onClose={() => setShowTutorial(false)}
        theme={theme}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center' },
  header: {
    width: '100%', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10,
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backBtn: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: 'Inter_700Bold', fontSize: 28, letterSpacing: -1.2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  scoreCard: { borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center', minWidth: 60 },
  scoreLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 9, letterSpacing: 1.2 },
  scoreValue: { fontFamily: 'Inter_700Bold', fontSize: 20, letterSpacing: -0.5 },
  actionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingBottom: 8, alignSelf: 'flex-end',
  },
  actionBtn: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  restartBtn: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  boardWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
  hintRow: { paddingBottom: 18, paddingTop: 10 },
  hintText: { fontFamily: 'Inter_400Regular', fontSize: 12, letterSpacing: 0.2 },
});
