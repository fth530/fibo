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
import { useFibonacciGame } from '@/hooks/useFibonacciGame';
import { useBestScore } from '@/hooks/useBestScore';
import { useSettings } from '@/hooks/useSettings';
import { useGameStats } from '@/hooks/useGameStats';
import { getTheme } from '@/constants/colors';
import type { Direction } from '@/hooks/useFibonacciGame';

interface FloatingScoreItem {
  id: number;
  value: number;
}

export default function GameScreen() {
  const insets = useSafeAreaInsets();
  const { tiles, score, gameOver, canUndo, moveCount, swipe, restart, undo } = useFibonacciGame();
  const { bestScore, resetBestScore } = useBestScore(score);
  const { settings, updateSettings } = useSettings();
  const { stats, recordGame, resetStats } = useGameStats();

  const theme = getTheme(settings.theme);

  const [showTutorial, setShowTutorial] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [floatingScores, setFloatingScores] = useState<FloatingScoreItem[]>([]);
  const prevGameOver = useRef(false);
  const floatingIdRef = useRef(0);

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  const scoreShake = useSharedValue(0);
  const boardShake = useSharedValue(0);
  const scoreScale = useSharedValue(1);
  const boardOpacity = useSharedValue(1);

  // Game timer
  const gameStartTime = useRef(Date.now());
  const [gameDuration, setGameDuration] = useState(0);

  // Track game over for duration
  useEffect(() => {
    if (gameOver) {
      setGameDuration(Math.floor((Date.now() - gameStartTime.current) / 1000));
    }
  }, [gameOver]);

  // Remove finished floating scores
  const removeFloating = useCallback((id: number) => {
    setFloatingScores((prev) => prev.filter((f) => f.id !== id));
  }, []);

  // Reset all persisted data
  const handleResetAll = useCallback(() => {
    resetStats();
    resetBestScore();
  }, [resetStats, resetBestScore]);

  // First launch tutorial
  useEffect(() => {
    if (!settings.hasSeenTutorial) {
      setShowTutorial(true);
      updateSettings({ hasSeenTutorial: true });
    }
  }, [settings.hasSeenTutorial, updateSettings]);

  // Record game stats on game over
  useEffect(() => {
    if (gameOver && !prevGameOver.current) {
      const highestTile = tiles.reduce((max, t) => Math.max(max, t.value), 0);
      recordGame(score, highestTile);
    }
    prevGameOver.current = gameOver;
  }, [gameOver, score, tiles, recordGame]);

  const scoreAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: scoreShake.value },
      { scale: scoreScale.value },
    ],
  }));

  const boardShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: boardShake.value }],
    opacity: boardOpacity.value,
  }));

  useEffect(() => {
    if (score > 0) {
      scoreShake.value = withSequence(
        withTiming(7, { duration: 55 }),
        withTiming(-7, { duration: 55 }),
        withTiming(4, { duration: 45 }),
        withTiming(0, { duration: 40 })
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
        withTiming(-10, { duration: 55 }),
        withTiming(10, { duration: 55 }),
        withTiming(-6, { duration: 45 }),
        withTiming(6, { duration: 45 }),
        withTiming(0, { duration: 35 })
      );
    } else if (result.merged) {
      haptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy));
      // Floating score popup
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
    // Board entry animation
    boardOpacity.value = 0;
    boardOpacity.value = withDelay(100, withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }));
    restart();
  };

  const handleRestart = () => {
    if (score > 0 && !gameOver) {
      if (Platform.OS === 'web') {
        if (confirm('Mevcut oyunu bitirmek istediğine emin misin?')) {
          doRestart();
        }
      } else {
        Alert.alert(
          'Yeni Oyun',
          'Mevcut oyunu bitirmek istediğine emin misin?',
          [
            { text: 'İptal', style: 'cancel' },
            { text: 'Evet', onPress: doRestart },
          ]
        );
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

  const shadowStyle = Platform.select({
    ios: {
      shadowColor: theme.scoreCardShadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 8,
    },
    android: { elevation: 3 },
    web: { boxShadow: `0px 2px 8px ${theme.scoreCardShadow}` },
  });

  // Web keyboard support (arrow keys)
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyMap: Record<string, Direction> = {
        ArrowLeft: 'left',
        ArrowRight: 'right',
        ArrowUp: 'up',
        ArrowDown: 'down',
      };
      const dir = keyMap[e.key];
      if (dir) {
        e.preventDefault();
        handleSwipe(dir);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSwipe]);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: topInset, paddingBottom: bottomInset, backgroundColor: theme.background },
      ]}
    >
      <StatusBar style={settings.theme === 'dark' ? 'light' : 'dark'} />
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>fibo</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>ardışık sayıları birleştir</Text>
        </View>

        <View style={styles.headerRight}>
          <Animated.View style={[styles.scoreCard, { backgroundColor: theme.scoreCard }, shadowStyle, scoreAnimStyle]}>
            <Text style={[styles.scoreLabel, { color: theme.textMuted }]}>SKOR</Text>
            <AnimatedScore value={score} style={[styles.scoreValue, { color: theme.textPrimary }]} />
            {/* Floating scores anchored to score card */}
            {floatingScores.map((f) => (
              <FloatingScore key={f.id} id={f.id} value={f.value} onDone={removeFloating} />
            ))}
          </Animated.View>

          <View style={[styles.scoreCard, { backgroundColor: theme.scoreCard }, shadowStyle]}>
            <Text style={[styles.scoreLabel, { color: theme.textMuted }]}>EN İYİ</Text>
            <Text style={[styles.scoreValue, { color: theme.textPrimary }]}>{bestScore}</Text>
          </View>
        </View>
      </View>

      {/* Action buttons row */}
      <View style={styles.actionRow}>
        <Pressable
          onPress={handleUndo}
          style={({ pressed }) => [
            styles.actionBtn,
            { backgroundColor: theme.scoreCard, opacity: canUndo ? (pressed ? 0.72 : 1) : 0.35 },
            shadowStyle,
          ]}
          disabled={!canUndo}
          accessibilityLabel="Geri al"
          accessibilityRole="button"
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
          accessibilityLabel="Nasıl oynanır"
          accessibilityRole="button"
        >
          <Ionicons name="help" size={18} color={theme.textSecondary} />
        </Pressable>

        <Pressable
          onPress={handleSettings}
          style={({ pressed }) => [
            styles.actionBtn,
            { backgroundColor: theme.scoreCard, opacity: pressed ? 0.72 : 1 },
            shadowStyle,
          ]}
          accessibilityLabel="Ayarlar"
          accessibilityRole="button"
        >
          <Ionicons name="settings-outline" size={18} color={theme.textSecondary} />
        </Pressable>

        <Pressable
          onPress={handleRestart}
          style={({ pressed }) => [
            styles.restartBtn,
            { backgroundColor: theme.restartBtn, opacity: pressed ? 0.75 : 1, transform: [{ scale: pressed ? 0.93 : 1 }] },
          ]}
          accessibilityLabel="Yeni oyun"
          accessibilityRole="button"
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
          highestTile={tiles.reduce((max, t) => Math.max(max, t.value), 0)}
          moveCount={moveCount}
          gameDuration={gameDuration}
          onPlayAgain={doRestart}
          theme={theme}
        />
      )}

      <HowToPlayModal
        visible={showTutorial}
        onClose={() => setShowTutorial(false)}
        theme={theme}
      />

      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        theme={theme}
        stats={stats}
        onResetStats={handleResetAll}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleBlock: {
    gap: 2,
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    letterSpacing: -1.2,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    letterSpacing: 0.3,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  scoreCard: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
    minWidth: 60,
  },
  scoreLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    letterSpacing: 1.2,
  },
  scoreValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    letterSpacing: -0.5,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
    alignSelf: 'flex-end',
  },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restartBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  hintRow: {
    paddingBottom: 18,
    paddingTop: 10,
  },
  hintText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    letterSpacing: 0.2,
  },
});
