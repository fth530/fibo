import React, { useEffect, useState } from 'react';
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
import { useFibonacciGame } from '@/hooks/useFibonacciGame';
import { useBestScore } from '@/hooks/useBestScore';
import { GameColors } from '@/constants/colors';
import type { Direction } from '@/hooks/useFibonacciGame';

export default function GameScreen() {
  const insets = useSafeAreaInsets();
  const { tiles, score, gameOver, swipe, restart } = useFibonacciGame();
  const bestScore = useBestScore(score);
  const [showTutorial, setShowTutorial] = useState(false);

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

  const handleInfo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowTutorial(true);
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
          <Text style={styles.title}>fibo</Text>
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
            onPress={handleInfo}
            style={({ pressed }) => [
              styles.infoBtn,
              { opacity: pressed ? 0.72 : 1, transform: [{ scale: pressed ? 0.92 : 1 }] },
            ]}
          >
            <Ionicons name="help" size={18} color={GameColors.textSecondary} />
          </Pressable>

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
        <GameOverOverlay
          score={score}
          bestScore={bestScore}
          onPlayAgain={handleRestart}
        />
      )}

      <HowToPlayModal
        visible={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </View>
  );
}

const scoreCardBase = {
  backgroundColor: GameColors.scoreCard,
  borderRadius: 14,
  paddingHorizontal: 14,
  paddingVertical: 8,
  alignItems: 'center' as const,
  minWidth: 60,
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
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 18,
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
    gap: 7,
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
  infoBtn: {
    backgroundColor: '#FFFFFF',
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  restartBtn: {
    backgroundColor: GameColors.restartBtn,
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
    color: GameColors.textMuted,
    letterSpacing: 0.2,
  },
});
