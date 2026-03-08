import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { GameBoard } from '@/components/GameBoard';
import { HowToPlayModal } from '@/components/HowToPlayModal';
import { GameOverOverlay } from '@/components/GameOverOverlay';
import { SettingsModal } from '@/components/SettingsModal';
import { useFibonacciGame } from '@/hooks/useFibonacciGame';
import { useBestScore } from '@/hooks/useBestScore';
import { useSettings } from '@/hooks/useSettings';
import { useGameStats } from '@/hooks/useGameStats';
import { getTheme } from '@/constants/colors';
import type { Direction } from '@/hooks/useFibonacciGame';

export default function GameScreen() {
  const insets = useSafeAreaInsets();
  const { tiles, score, gameOver, canUndo, swipe, restart, undo } = useFibonacciGame();
  const bestScore = useBestScore(score);
  const { settings, updateSettings } = useSettings();
  const { stats, recordGame } = useGameStats();

  const theme = getTheme(settings.theme);

  const [showTutorial, setShowTutorial] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const prevGameOver = useRef(false);

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  const scoreShake = useSharedValue(0);
  const boardShake = useSharedValue(0);
  const scoreScale = useSharedValue(1);

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

  const handleSwipe = (dir: Direction) => {
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
    } else {
      haptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
    }
  };

  const handleRestart = () => {
    haptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
    restart();
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

  return (
    <View
      style={[
        styles.container,
        { paddingTop: topInset, paddingBottom: bottomInset, backgroundColor: theme.background },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>fibo</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>ardışık sayıları birleştir</Text>
        </View>

        <View style={styles.headerRight}>
          <Animated.View style={[styles.scoreCard, { backgroundColor: theme.scoreCard }, shadowStyle, scoreAnimStyle]}>
            <Text style={[styles.scoreLabel, { color: theme.textMuted }]}>SKOR</Text>
            <Text style={[styles.scoreValue, { color: theme.textPrimary }]}>{score}</Text>
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
        >
          <Ionicons name="settings-outline" size={18} color={theme.textSecondary} />
        </Pressable>

        <Pressable
          onPress={handleRestart}
          style={({ pressed }) => [
            styles.restartBtn,
            { backgroundColor: theme.restartBtn, opacity: pressed ? 0.75 : 1, transform: [{ scale: pressed ? 0.93 : 1 }] },
          ]}
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
          onPlayAgain={handleRestart}
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
