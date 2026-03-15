import React, { useEffect } from 'react';
import { Modal, StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView } from 'react-native';
import type { ThemeColors } from '@/constants/colors';
import type { Language } from '@/hooks/useSettings';
import { LANGUAGE_LABELS } from '@/constants/i18n';

const LANGUAGES: Language[] = ['en', 'tr', 'ja', 'de', 'ko', 'fr', 'pt', 'es'];

interface OnboardingModalProps {
  visible: boolean;
  theme: ThemeColors;
  selectedLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  onComplete: () => void;
}

export function OnboardingModal({ visible, theme, selectedLanguage, onSelectLanguage, onComplete }: OnboardingModalProps) {
  const cardScale = useSharedValue(0.85);
  const cardAlpha = useSharedValue(0);
  const btnAlpha = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      cardAlpha.value = withTiming(1, { duration: 400 });
      cardScale.value = withSpring(1, { damping: 16, stiffness: 200 });
      btnAlpha.value = withDelay(500, withTiming(1, { duration: 300 }));
    }
  }, [visible, cardAlpha, cardScale, btnAlpha]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardAlpha.value,
  }));

  const btnStyle = useAnimatedStyle(() => ({
    opacity: btnAlpha.value,
  }));

  const isTr = selectedLanguage === 'tr';

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <View style={[styles.backdrop, { backgroundColor: theme.background }]}>
        <Animated.View style={[styles.card, { backgroundColor: theme.modalBg }, cardStyle]}>
          <Text style={[styles.logo, { color: theme.textPrimary }]}>fibo</Text>

          <Text style={[styles.welcome, { color: theme.textPrimary }]}>
            {isTr ? 'Hoş Geldin!' : 'Welcome!'}
          </Text>

          <Text style={[styles.desc, { color: theme.textSecondary }]}>
            {isTr
              ? 'Ardışık Fibonacci sayılarını birleştirerek en yüksek sayıya ulaşmaya çalış.'
              : 'Merge consecutive Fibonacci numbers to reach the highest number possible.'}
          </Text>

          {/* Language Selection */}
          <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>
            {isTr ? 'Dil Seçin' : 'Select Language'}
          </Text>

          <ScrollView horizontal={false} style={styles.langScroll} contentContainerStyle={styles.langGrid}>
            {LANGUAGES.map((lang) => (
              <Pressable
                key={lang}
                onPress={() => onSelectLanguage(lang)}
                style={[
                  styles.langBtn,
                  {
                    backgroundColor: selectedLanguage === lang ? theme.restartBtn : theme.background,
                    borderColor: selectedLanguage === lang ? theme.restartBtn : theme.divider,
                  },
                ]}
              >
                <Text style={[
                  styles.langBtnText,
                  { color: selectedLanguage === lang ? theme.restartBtnText : theme.textPrimary },
                ]}>
                  {LANGUAGE_LABELS[lang]}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          {/* Merge preview */}
          <View style={styles.previewRow}>
            <View style={[styles.previewTile, { backgroundColor: '#FFE4B8' }]}>
              <Text style={[styles.previewNum, { color: '#8B6030' }]}>2</Text>
            </View>
            <Text style={[styles.previewOp, { color: theme.textMuted }]}>+</Text>
            <View style={[styles.previewTile, { backgroundColor: '#FFCC88' }]}>
              <Text style={[styles.previewNum, { color: '#7A4A10' }]}>3</Text>
            </View>
            <Text style={[styles.previewOp, { color: theme.textMuted }]}>=</Text>
            <View style={[styles.previewTile, { backgroundColor: '#FFB058' }]}>
              <Text style={[styles.previewNum, { color: '#FFFFFF' }]}>5</Text>
            </View>
          </View>

          <Animated.View style={[{ width: '100%' }, btnStyle]}>
            <Pressable
              onPress={onComplete}
              style={({ pressed }) => [
                styles.startBtn,
                {
                  backgroundColor: theme.restartBtn,
                  opacity: pressed ? 0.88 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
            >
              <Text style={[styles.startBtnText, { color: theme.restartBtnText }]}>
                {isTr ? 'Oynamaya Başla' : 'Start Playing'}
              </Text>
              <Ionicons name="arrow-forward" size={18} color={theme.restartBtnText} />
            </Pressable>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    gap: 16,
    ...Platform.select({
      ios: { shadowColor: 'rgba(0,0,0,0.12)', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 1, shadowRadius: 32 },
      android: { elevation: 12 },
      web: { boxShadow: '0 12px 32px rgba(0,0,0,0.12)' },
    }),
  },
  logo: {
    fontFamily: 'Inter_700Bold',
    fontSize: 48,
    letterSpacing: -2,
  },
  welcome: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    letterSpacing: -0.5,
  },
  desc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  sectionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 1.2,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  langScroll: {
    maxHeight: 140,
    width: '100%',
  },
  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  langBtn: {
    width: '47%',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  langBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
  divider: {
    width: '100%',
    height: 1,
    marginVertical: 2,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewTile: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewNum: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
  },
  previewOp: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 18,
    paddingVertical: 18,
    width: '100%',
  },
  startBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
    letterSpacing: 0.2,
  },
});
