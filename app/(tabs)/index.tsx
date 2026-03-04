import React, { useEffect } from 'react';
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
import { useFibonacciGame } from '@/hooks/useFibonacciGame';
import { useBestScore } from '@/hooks/useBestScore';

import { GameColors } from '@/constants/colors';
import type { Direction } from '@/hooks/useFibonacciGame';

export default function GameScreen() {
  const insets = useSafeAreaInsets();
  const { tiles, score, gameOver, swipe, restart } = useFibonacciGame();
  const bestScore = useBestScore(score);

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  const scoreShake = useSharedValue(0);
  const boardShake = useSharedValue(0);
  const scoreScale = useSharedValue(1);

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
  }, [score]);

  const handleSwipe = (dir: Direction) => {
    const result = swipe(dir);
    if (!result.changed) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      boardShake.value = withSequence(
        withTiming(-10, { duration: 55 }),
        withTiming(10, { duration: 55 }),
        withTiming(-6, { duration: 45 }),
        withTiming(6, { duration: 45 }),
        withTiming(0, { duration: 35 })
      );
    } else if (result.merged) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleRestart = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    restart();
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: topInset, paddingBottom: bottomInset },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>fibonacci</Text>
          <Text style={styles.subtitle}>merge consecutive numbers</Text>
        </View>

        <View style={styles.headerRight}>
          <Animated.View style={[styles.scoreCard, scoreAnimStyle]}>
            <Text style={styles.scoreLabel}>SCORE</Text>
            <Text style={styles.scoreValue}>{score}</Text>
          </Animated.View>

          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>BEST</Text>
            <Text style={styles.scoreValue}>{bestScore}</Text>
          </View>

          <Pressable
            onPress={handleRestart}
            style={({ pressed }) => [
              styles.restartBtn,
              { opacity: pressed ? 0.75 : 1, transform: [{ scale: pressed ? 0.93 : 1 }] },
            ]}
          >
            <Ionicons name="refresh" size={20} color={GameColors.restartBtnText} />
          </Pressable>
        </View>
      </View>

      <Animated.View style={[styles.boardWrapper, boardShakeStyle]}>
        <GameBoard tiles={tiles} onSwipe={handleSwipe} />
      </Animated.View>

      <View style={styles.hintRow}>
        <Text style={styles.hintText}>
          {'1+1=2  ·  2+3=5  ·  3+5=8'}
        </Text>
      </View>

      {gameOver && (
        <View style={styles.overlay}>
          <View style={styles.gameOverCard}>
            <Text style={styles.gameOverTitle}>Game Over</Text>
            <Text style={styles.gameOverScore}>Score  {score}</Text>
            {score >= bestScore && score > 0 && (
              <Text style={styles.newBestLabel}>New Best!</Text>
            )}
            <Pressable
              onPress={handleRestart}
              style={({ pressed }) => [
                styles.playAgainBtn,
                { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.96 : 1 }] },
              ]}
            >
              <Text style={styles.playAgainText}>Play Again</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const scoreCardBase = {
  backgroundColor: GameColors.scoreCard,
  borderRadius: 14,
  paddingHorizontal: 14,
  paddingVertical: 8,
  alignItems: 'center' as const,
  minWidth: 64,
  ...Platform.select({
    ios: {
      shadowColor: 'rgba(44,36,32,0.10)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 8,
    },
    android: { elevation: 3 },
    web: { boxShadow: '0px 2px 8px rgba(44,36,32,0.10)' },
  }),
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GameColors.background,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleBlock: {
    gap: 2,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    letterSpacing: -1,
    color: GameColors.textPrimary,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: GameColors.textMuted,
    letterSpacing: 0.3,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreCard: scoreCardBase,
  scoreLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    letterSpacing: 1.2,
    color: GameColors.textMuted,
  },
  scoreValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: GameColors.textPrimary,
    letterSpacing: -0.5,
  },
  restartBtn: {
    backgroundColor: GameColors.restartBtn,
    width: 42,
    height: 42,
    borderRadius: 12,
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
    paddingBottom: 20,
    paddingTop: 12,
  },
  hintText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: GameColors.textMuted,
    letterSpacing: 0.2,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(250,247,242,0.90)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameOverCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 40,
    paddingVertical: 36,
    alignItems: 'center',
    gap: 6,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(44,36,32,0.14)',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 1,
        shadowRadius: 28,
      },
      android: { elevation: 10 },
      web: { boxShadow: '0px 10px 28px rgba(44,36,32,0.14)' },
    }),
  },
  gameOverTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 30,
    color: GameColors.textPrimary,
    letterSpacing: -0.8,
  },
  gameOverScore: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: GameColors.textSecondary,
  },
  newBestLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#FF8C50',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  playAgainBtn: {
    backgroundColor: GameColors.restartBtn,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  playAgainText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FAF7F2',
    letterSpacing: 0.2,
  },
});
