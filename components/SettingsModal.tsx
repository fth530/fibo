import React, { useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  Pressable,
  Switch,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useSettings } from '@/hooks/useSettings';
import { useT, LANGUAGE_LABELS } from '@/constants/i18n';
import type { Language } from '@/hooks/useSettings';

const LANG_ORDER: Language[] = ['en', 'tr', 'ja', 'de', 'ko', 'fr', 'pt', 'es'];
import type { ThemeColors } from '@/constants/colors';
import type { GameStats } from '@/hooks/useGameStats';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  theme: ThemeColors;
  stats: GameStats;
  onResetStats?: () => void;
}

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

export function SettingsModal({ visible, onClose, theme, stats, onResetStats }: SettingsModalProps) {
  const { settings, updateSettings } = useSettings();
  const t = useT();

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

  const handleResetData = () => {
    if (Platform.OS === 'web') {
      if (confirm(t.resetConfirmMsg)) onResetStats?.();
    } else {
      Alert.alert(t.resetConfirmTitle, t.resetConfirmMsg, [
        { text: t.cancel, style: 'cancel' },
        { text: t.reset, style: 'destructive', onPress: () => onResetStats?.() },
      ]);
    }
  };

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

          <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>{t.settingsTitle}</Text>

          {/* Haptic Toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="phone-portrait-outline" size={20} color={theme.textSecondary} />
              <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>{t.hapticFeedback}</Text>
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
              <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>{t.darkMode}</Text>
            </View>
            <Switch
              value={settings.theme === 'dark'}
              onValueChange={(val) => updateSettings({ theme: val ? 'dark' : 'light' })}
              trackColor={{ false: theme.emptyCell, true: '#FF8C50' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Language Selection */}
          <View style={styles.settingRowColumn}>
            <View style={styles.settingInfo}>
              <Ionicons name="language-outline" size={20} color={theme.textSecondary} />
              <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>{t.language}</Text>
            </View>
            <View style={styles.langGrid}>
              {LANG_ORDER.map((lang) => (
                <Pressable
                  key={lang}
                  onPress={() => updateSettings({ language: lang })}
                  style={[
                    styles.langChip,
                    {
                      backgroundColor: settings.language === lang ? theme.restartBtn : theme.background,
                      borderColor: settings.language === lang ? theme.restartBtn : theme.divider,
                    },
                  ]}
                >
                  <Text style={[
                    styles.langChipText,
                    { color: settings.language === lang ? theme.restartBtnText : theme.textSecondary },
                  ]}>
                    {LANGUAGE_LABELS[lang]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          {/* Stats Section */}
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>{t.statistics}</Text>

          <View style={styles.statsGrid}>
            <StatCard label={t.gamesPlayed} value={String(stats.totalGames)} theme={theme} />
            <StatCard label={t.highestTileStat} value={String(stats.highestTile)} theme={theme} />
            <StatCard
              label={t.avgScore}
              value={stats.totalGames > 0 ? String(Math.round(stats.totalScore / stats.totalGames)) : '0'}
              theme={theme}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          {/* Links */}
          <View style={styles.linksRow}>
            <Pressable
              onPress={() => Linking.openURL('https://fth530.github.io/fibo/privacy-policy.html')}
              style={({ pressed }) => [styles.linkBtn, { opacity: pressed ? 0.6 : 1 }]}
            >
              <Ionicons name="shield-checkmark-outline" size={15} color={theme.textMuted} />
              <Text style={[styles.linkBtnText, { color: theme.textMuted }]}>
                {settings.language === 'tr' ? 'Gizlilik Politikası' : 'Privacy Policy'}
              </Text>
            </Pressable>
            <Text style={[styles.linkDot, { color: theme.textMuted }]}>·</Text>
            <Pressable
              onPress={() => Linking.openURL('https://github.com/fth530/fibo')}
              style={({ pressed }) => [styles.linkBtn, { opacity: pressed ? 0.6 : 1 }]}
            >
              <Ionicons name="help-buoy-outline" size={15} color={theme.textMuted} />
              <Text style={[styles.linkBtnText, { color: theme.textMuted }]}>
                {settings.language === 'tr' ? 'Destek' : 'Support'}
              </Text>
            </Pressable>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          {/* Reset Data */}
          {onResetStats && (
            <Pressable
              onPress={handleResetData}
              style={({ pressed }) => [
                styles.resetBtn,
                { opacity: pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
              ]}
              accessibilityLabel="Verileri sıfırla"
              accessibilityRole="button"
            >
              <Ionicons name="trash-outline" size={16} color="#E85050" />
              <Text style={styles.resetBtnText}>{t.resetData}</Text>
            </Pressable>
          )}

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.closeBtn,
              { backgroundColor: theme.restartBtn, opacity: pressed ? 0.82 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
            ]}
          >
            <Text style={[styles.closeBtnText, { color: theme.restartBtnText }]}>{t.done}</Text>
          </Pressable>

          {/* App Version */}
          <Text style={[styles.versionText, { color: theme.textMuted }]}>
            Fibo v{APP_VERSION}
          </Text>
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
  settingRowColumn: {
    gap: 10,
    paddingVertical: 4,
  },
  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  langChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  langChipText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
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
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(232,80,80,0.25)',
  },
  resetBtnText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#E85050',
  },
  linksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  linkBtnText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    letterSpacing: 0.2,
  },
  linkDot: {
    fontSize: 14,
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
  versionText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    textAlign: 'center',
    letterSpacing: 0.3,
    marginTop: -8,
  },
});
