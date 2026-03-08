import React, { useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  Pressable,
  Switch,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '@/hooks/useSettings';
import type { ThemeColors } from '@/constants/colors';
import type { GameStats } from '@/hooks/useGameStats';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  theme: ThemeColors;
  stats: GameStats;
}

export function SettingsModal({ visible, onClose, theme, stats }: SettingsModalProps) {
  const { settings, updateSettings } = useSettings();

  const backdropAlpha = useSharedValue(0);
  const cardY = useSharedValue(600);

  useEffect(() => {
    if (visible) {
      backdropAlpha.value = withTiming(1, { duration: 260 });
      cardY.value = withSpring(0, { damping: 22, stiffness: 300 });
    } else {
      backdropAlpha.value = withTiming(0, { duration: 200 });
      cardY.value = withTiming(600, { duration: 230 });
    }
  }, [visible, backdropAlpha, cardY]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropAlpha.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cardY.value }],
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.outerWrapper}>
        <Animated.View style={[styles.backdrop, { backgroundColor: theme.modalBackdrop }, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View style={[styles.card, { backgroundColor: theme.modalBg }, cardStyle]}>
          <View style={styles.handle} />

          <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>ayarlar</Text>

          {/* Haptic Toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="phone-portrait-outline" size={20} color={theme.textSecondary} />
              <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Titreşim</Text>
            </View>
            <Switch
              value={settings.hapticEnabled}
              onValueChange={(val) => updateSettings({ hapticEnabled: val })}
              trackColor={{ false: theme.emptyCell, true: '#FF8C50' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Dark Mode Toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons
                name={settings.theme === 'dark' ? 'moon' : 'moon-outline'}
                size={20}
                color={theme.textSecondary}
              />
              <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Karanlık Mod</Text>
            </View>
            <Switch
              value={settings.theme === 'dark'}
              onValueChange={(val) => updateSettings({ theme: val ? 'dark' : 'light' })}
              trackColor={{ false: theme.emptyCell, true: '#FF8C50' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          {/* Stats Section */}
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>İSTATİSTİKLER</Text>

          <View style={styles.statsGrid}>
            <StatCard label="Oynanan" value={String(stats.totalGames)} theme={theme} />
            <StatCard label="En Yüksek Taş" value={String(stats.highestTile)} theme={theme} />
            <StatCard
              label="Ort. Skor"
              value={stats.totalGames > 0 ? String(Math.round(stats.totalScore / stats.totalGames)) : '0'}
              theme={theme}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.closeBtn,
              { backgroundColor: theme.restartBtn, opacity: pressed ? 0.82 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
            ]}
          >
            <Text style={[styles.closeBtnText, { color: theme.restartBtnText }]}>Tamam</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

function StatCard({ label, value, theme }: { label: string; value: string; theme: ThemeColors }) {
  return (
    <View style={[styles.statCard, { backgroundColor: theme.background }]}>
      <Text style={[styles.statValue, { color: theme.textPrimary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 28,
    paddingBottom: Platform.OS === 'web' ? 40 : 36,
    gap: 16,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(44,36,32,0.20)',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 1,
        shadowRadius: 24,
      },
      android: { elevation: 16 },
      web: { boxShadow: '0px -8px 24px rgba(44,36,32,0.20)' },
    }),
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D8D0C4',
    alignSelf: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    letterSpacing: -0.7,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
  },
  divider: {
    height: 1,
    marginVertical: 2,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 1.5,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  closeBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  closeBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    letterSpacing: 0.2,
  },
});
