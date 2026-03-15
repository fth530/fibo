import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, Platform, Share } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { ConfettiExplosion } from '@/components/ConfettiExplosion';
import type { ThemeColors } from '@/constants/colors';

interface GameOverOverlayProps {
  score: number;
  bestScore: number;
  highestTile: number;
  moveCount: number;
  gameDuration: number;
  onPlayAgain: () => void;
  onBackToMenu?: () => void;
  theme: ThemeColors;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}dk ${s}sn` : `${s}sn`;
}

export function GameOverOverlay({
  score,
  bestScore,
  highestTile,
  moveCount,
  gameDuration,
  onPlayAgain,
  onBackToMenu,
  theme,
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
  }, [backdropAlpha, badgeScale, btnScale, cardAlpha, cardScale, isNewBest]);

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

  const handleShare = async () => {
    const msg = isNewBest
      ? `🏆 Fibo'da yeni rekor! ${score} puan yaptım! En yüksek taşım: ${highestTile}. Sen de dene!`
      : `🎮 Fibo'da ${score} puan yaptım! En yüksek taşım: ${highestTile}. Sen de dene!`;
    try {
      await Share.share({ message: msg });
    } catch { }
  };

  return (
    <Animated.View style={[styles.backdrop, { backgroundColor: theme.modalBackdrop }, backdropStyle]}>
      <Animated.View
        style={[
          styles.card,
          { backgroundColor: theme.modalBg },
          Platform.select({
            ios: {
              shadowColor: 'rgba(44,36,32,0.16)',
              shadowOffset: { width: 0, height: 16 },
              shadowOpacity: 1,
              shadowRadius: 36,
            },
            android: { elevation: 16 },
            web: { boxShadow: '0px 16px 48px rgba(44,36,32,0.18)' },
          }),
          cardStyle,
        ]}
      >
        <Text style={[styles.eyebrow, { color: theme.textMuted }]}>oyun bitti</Text>

        <View style={styles.scoreSection}>
          <Text style={[styles.scoreNumber, { color: theme.textPrimary }]}>{score}</Text>
          <Text style={[styles.scoreLabel, { color: theme.textMuted }]}>TOPLAM SKOR</Text>
        </View>

        {isNewBest && (
          <Animated.View style={[styles.newBestBadge, badgeStyle]}>
            <Ionicons name="star" size={13} color="#FFFFFF" />
            <Text style={styles.newBestText}>Yeni Rekor!</Text>
          </Animated.View>
        )}

        {!isNewBest && bestScore > 0 && (
          <Text style={[styles.prevBest, { color: theme.textMuted }]}>En İyi  {bestScore}</Text>
        )}

        {/* Extra stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="diamond-outline" size={14} color={theme.textSecondary} />
            <Text style={[styles.statText, { color: theme.textSecondary }]}>{highestTile}</Text>
          </View>
          <View style={[styles.statDot, { backgroundColor: theme.textMuted }]} />
          <View style={styles.statItem}>
            <Ionicons name="swap-horizontal-outline" size={14} color={theme.textSecondary} />
            <Text style={[styles.statText, { color: theme.textSecondary }]}>{moveCount} hamle</Text>
          </View>
          <View style={[styles.statDot, { backgroundColor: theme.textMuted }]} />
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={14} color={theme.textSecondary} />
            <Text style={[styles.statText, { color: theme.textSecondary }]}>{formatDuration(gameDuration)}</Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.divider }]} />

        <Animated.View style={[{ width: '100%', gap: 10 }, btnStyle]}>
          <Pressable
            onPress={onPlayAgain}
            style={({ pressed }) => [
              styles.playAgainBtn,
              {
                backgroundColor: theme.restartBtn,
                transform: [{ scale: pressed ? 0.96 : 1 }],
                opacity: pressed ? 0.88 : 1,
              },
            ]}
          >
            <Text style={[styles.playAgainText, { color: theme.restartBtnText }]}>Tekrar Oyna</Text>
          </Pressable>

          <Pressable
            onPress={handleShare}
            style={({ pressed }) => [
              styles.shareBtn,
              {
                borderColor: theme.textMuted,
                transform: [{ scale: pressed ? 0.96 : 1 }],
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            accessibilityLabel="Skoru paylaş"
            accessibilityRole="button"
          >
            <Ionicons name="share-outline" size={17} color={theme.textSecondary} />
            <Text style={[styles.shareBtnText, { color: theme.textSecondary }]}>Paylaş</Text>
          </Pressable>

          {onBackToMenu && (
            <Pressable
              onPress={onBackToMenu}
              style={({ pressed }) => [
                styles.menuBtn,
                { opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <Text style={[styles.menuBtnText, { color: theme.textMuted }]}>Ana Menü</Text>
            </Pressable>
          )}
        </Animated.View>
      </Animated.View>

      {/* Confetti for new record */}
      {isNewBest && <ConfettiExplosion />}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { backdropFilter: 'blur(6px)' } as any,
    }),
  },
  card: {
    borderRadius: 28,
    paddingTop: 32,
    paddingBottom: 28,
    paddingHorizontal: 32,
    width: '82%',
    maxWidth: 320,
    alignItems: 'center',
    gap: 12,
  },
  eyebrow: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    letterSpacing: 2,
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
    lineHeight: 72,
  },
  scoreLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 1.8,
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
    letterSpacing: 0.2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    letterSpacing: 0.1,
  },
  statDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  divider: {
    width: '100%',
    height: 1,
    marginVertical: 4,
  },
  playAgainBtn: {
    width: '100%',
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
  },
  playAgainText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
    letterSpacing: 0.2,
  },
  shareBtn: {
    width: '100%',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
  },
  shareBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  menuBtn: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  menuBtnText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    letterSpacing: 0.2,
  },
});
