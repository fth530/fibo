import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { ThemeColors } from '@/constants/colors';
import type { SavedGame } from '@/hooks/useSavedGames';
import { useT } from '@/constants/i18n';

interface HomeScreenProps {
  theme: ThemeColors;
  isDark: boolean;
  bestScore: number;
  slots: (SavedGame | null)[];
  onNewGame: () => void;
  onContinueGame: (slotIndex: number) => void;
  onDeleteGame: (slotIndex: number) => void;
  onOpenSettings: () => void;
}

function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${day}.${month} ${hours}:${mins}`;
}

export function HomeScreen({
  theme,
  isDark,
  bestScore,
  slots,
  onNewGame,
  onContinueGame,
  onDeleteGame,
  onOpenSettings,
}: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const t = useT();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  const hasSavedGames = slots.some((s) => s !== null);

  const handleDelete = (idx: number) => {
    if (Platform.OS === 'web') {
      if (confirm(t.deleteConfirmMsg)) onDeleteGame(idx);
    } else {
      Alert.alert(t.deleteConfirmTitle, t.deleteConfirmMsg, [
        { text: t.cancel, style: 'cancel' },
        { text: t.delete, style: 'destructive', onPress: () => onDeleteGame(idx) },
      ]);
    }
  };

  const shadowStyle = Platform.select({
    ios: { shadowColor: theme.scoreCardShadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 16 },
    android: { elevation: 6 },
    web: { boxShadow: `0 4px 16px ${theme.scoreCardShadow}` },
  });

  return (
    <View style={[styles.container, { paddingTop: topInset + 20, paddingBottom: bottomInset + 16, backgroundColor: theme.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.logo, { color: theme.textPrimary }]}>fibo</Text>
        <Text style={[styles.tagline, { color: theme.textMuted }]}>{t.subtitle}</Text>

        {bestScore > 0 && (
          <View style={[styles.bestScoreBadge, { backgroundColor: theme.scoreCard }, shadowStyle]}>
            <Ionicons name="trophy-outline" size={14} color="#FF8C50" />
            <Text style={[styles.bestScoreText, { color: theme.textPrimary }]}>{bestScore}</Text>
          </View>
        )}
      </View>

      {/* New Game Button */}
      <Pressable
        onPress={onNewGame}
        style={({ pressed }) => [
          styles.newGameBtn,
          { backgroundColor: theme.restartBtn, opacity: pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
        ]}
      >
        <Ionicons name="add-circle-outline" size={22} color={theme.restartBtnText} />
        <Text style={[styles.newGameText, { color: theme.restartBtnText }]}>{t.newGame}</Text>
      </Pressable>

      {/* Saved Games */}
      <View style={styles.savedSection}>
        <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>{t.savedGames}</Text>

        {!hasSavedGames && (
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>{t.noSavedGames}</Text>
        )}

        {slots.map((slot, idx) => {
          if (!slot) return null;
          return (
            <Pressable
              key={idx}
              onPress={() => onContinueGame(idx)}
              style={({ pressed }) => [
                styles.slotCard,
                { backgroundColor: theme.scoreCard, opacity: pressed ? 0.85 : 1 },
                shadowStyle,
              ]}
            >
              <View style={styles.slotInfo}>
                <View style={styles.slotRow}>
                  <Text style={[styles.slotScore, { color: theme.textPrimary }]}>{slot.score}</Text>
                  <View style={[styles.slotTileBadge, { backgroundColor: theme.background }]}>
                    <Text style={[styles.slotTileText, { color: theme.textSecondary }]}>{slot.highestTile}</Text>
                  </View>
                </View>
                <Text style={[styles.slotDate, { color: theme.textMuted }]}>
                  {formatDate(slot.savedAt)} · {slot.moveCount} {t.moves.toLowerCase()}
                </Text>
              </View>

              <View style={styles.slotActions}>
                <Pressable
                  onPress={(e) => { e.stopPropagation(); handleDelete(idx); }}
                  style={styles.deleteBtn}
                  hitSlop={8}
                >
                  <Ionicons name="close-circle-outline" size={20} color={theme.textMuted} />
                </Pressable>
                <Ionicons name="play-circle" size={28} color="#FF8C50" />
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Bottom actions */}
      <View style={styles.bottomRow}>
        <Pressable
          onPress={onOpenSettings}
          style={({ pressed }) => [
            styles.bottomBtn,
            { backgroundColor: theme.scoreCard, opacity: pressed ? 0.72 : 1 },
            shadowStyle,
          ]}
        >
          <Ionicons name="settings-outline" size={20} color={theme.textSecondary} />
          <Text style={[styles.bottomBtnText, { color: theme.textSecondary }]}>{t.settingsLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 28,
  },
  logo: {
    fontFamily: 'Inter_700Bold',
    fontSize: 56,
    letterSpacing: -2.5,
  },
  tagline: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    letterSpacing: 0.3,
  },
  bestScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  bestScoreText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    letterSpacing: -0.3,
  },
  newGameBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 18,
    marginBottom: 24,
  },
  newGameText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
    letterSpacing: 0.2,
  },
  savedSection: {
    flex: 1,
    gap: 10,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 20,
  },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
  },
  slotInfo: {
    gap: 4,
    flex: 1,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  slotScore: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    letterSpacing: -0.5,
  },
  slotTileBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  slotTileText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  slotDate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    letterSpacing: 0.2,
  },
  slotActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteBtn: {
    padding: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
  },
  bottomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  bottomBtnText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
});
