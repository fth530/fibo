import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { GameColors } from '@/constants/colors';

interface GameOverOverlayProps {
  score: number;
  bestScore: number;
  onPlayAgain: () => void;
}

export function GameOverOverlay({
  score,
  bestScore,
  onPlayAgain,
}: GameOverOverlayProps) {
  const isNewBest = score > 0 && score >= bestScore;

  const backdropAlpha = useSharedValue(0);
  const cardScale = useSharedValue(0.80);
  const cardAlpha = useSharedValue(0);
  const badgeScale = useSharedValue(0);
  const btnScale = useSharedValue(0.88);

  useEffect(() => {
    backdropAlpha.value = withTiming(1, { duration: 320 });
    cardAlpha.value = withTiming(1, { duration: 300 });
    cardScale.value = withSpring(1, { damping: 15, stiffness: 230 });
    btnScale.value = withDelay(240, withSpring(1, { damping: 14, stiffness: 260 }));
    if (isNewBest) {
      badgeScale.value = withDelay(
        460,
        withSequence(
          withSpring(1.15, { damping: 10, stiffness: 360 }),
          withSpring(1, { damping: 14, stiffness: 300 })
        )
      );
    }
  }, []);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropAlpha.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardAlpha.value,
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  return (
    <Animated.View style={[styles.backdrop, backdropStyle]}>
      <Animated.View style={[styles.card, cardStyle]}>
        <Text style={styles.eyebrow}>game over</Text>

        <View style={styles.scoreSection}>
          <Text style={styles.scoreNumber}>{score}</Text>
          <Text style={styles.scoreLabel}>FINAL SCORE</Text>
        </View>

        {isNewBest && (
          <Animated.View style={[styles.newBestBadge, badgeStyle]}>
            <Ionicons name="star" size={13} color="#FFFFFF" />
            <Text style={styles.newBestText}>New Best!</Text>
          </Animated.View>
        )}

        {!isNewBest && bestScore > 0 && (
          <Text style={styles.prevBest}>Best  {bestScore}</Text>
        )}

        <View style={styles.divider} />

        <Animated.View style={[{ width: '100%' }, btnStyle]}>
          <Pressable
            onPress={onPlayAgain}
            style={({ pressed }) => [
              styles.playAgainBtn,
              {
                transform: [{ scale: pressed ? 0.96 : 1 }],
                opacity: pressed ? 0.88 : 1,
              },
            ]}
          >
            <Text style={styles.playAgainText}>Play Again</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(250,247,242,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { backdropFilter: 'blur(6px)' } as any,
    }),
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingTop: 32,
    paddingBottom: 28,
    paddingHorizontal: 32,
    width: '82%',
    maxWidth: 320,
    alignItems: 'center',
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(44,36,32,0.16)',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 1,
        shadowRadius: 36,
      },
      android: { elevation: 16 },
      web: { boxShadow: '0px 16px 48px rgba(44,36,32,0.18)' },
    }),
  },
  eyebrow: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    letterSpacing: 2,
    color: GameColors.textMuted,
    textTransform: 'uppercase',
  },
  scoreSection: {
    alignItems: 'center',
    gap: 2,
    paddingVertical: 8,
  },
  scoreNumber: {
    fontFamily: 'Inter_700Bold',
    fontSize: 64,
    letterSpacing: -2,
    color: GameColors.textPrimary,
    lineHeight: 72,
  },
  scoreLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 1.8,
    color: GameColors.textMuted,
  },
  newBestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FF8C50',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  newBestText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  prevBest: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: GameColors.textMuted,
    letterSpacing: 0.2,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: GameColors.background,
    marginVertical: 4,
  },
  playAgainBtn: {
    width: '100%',
    backgroundColor: GameColors.restartBtn,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
  },
  playAgainText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
    color: '#FAF7F2',
    letterSpacing: 0.2,
  },
});
