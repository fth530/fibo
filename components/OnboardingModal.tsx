import React, { useEffect } from 'react';
import { Modal, StyleSheet, View, Text, Pressable, Platform, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ThemeColors } from '@/constants/colors';
import type { Language } from '@/hooks/useSettings';
import { LANGUAGE_LABELS } from '@/constants/i18n';

const LANGUAGES: { code: Language; flag: string }[] = [
  { code: 'en', flag: '🇺🇸' },
  { code: 'tr', flag: '🇹🇷' },
  { code: 'ja', flag: '🇯🇵' },
  { code: 'de', flag: '🇩🇪' },
  { code: 'ko', flag: '🇰🇷' },
  { code: 'fr', flag: '🇫🇷' },
  { code: 'pt', flag: '🇧🇷' },
  { code: 'es', flag: '🇪🇸' },
];

const WELCOME: Record<Language, string> = {
  en: 'Welcome!', tr: 'Hoş Geldin!', ja: 'ようこそ！', de: 'Willkommen!',
  ko: '환영합니다!', fr: 'Bienvenue !', pt: 'Bem-vindo!', es: '¡Bienvenido!',
};

const DESC: Record<Language, string> = {
  en: 'Merge consecutive Fibonacci numbers\nto reach the highest number possible.',
  tr: 'Ardışık Fibonacci sayılarını birleştirerek\nen yüksek sayıya ulaşmaya çalış.',
  ja: '連続するフィボナッチ数を合体させて\n最高の数を目指そう。',
  de: 'Verbinde aufeinanderfolgende\nFibonacci-Zahlen.',
  ko: '연속된 피보나치 수를 합쳐서\n가장 높은 숫자에 도달하세요.',
  fr: 'Fusionnez les nombres de Fibonacci\nconsécutifs.',
  pt: 'Mescle números de Fibonacci\nconsecutivos.',
  es: 'Fusiona números de Fibonacci\nconsecutivos.',
};

const START: Record<Language, string> = {
  en: 'Start Playing', tr: 'Oynamaya Başla', ja: 'ゲーム開始', de: 'Spiel starten',
  ko: '게임 시작', fr: 'Commencer', pt: 'Começar', es: 'Empezar',
};

interface OnboardingModalProps {
  visible: boolean;
  theme: ThemeColors;
  selectedLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  onComplete: () => void;
}

export function OnboardingModal({ visible, theme, selectedLanguage, onSelectLanguage, onComplete }: OnboardingModalProps) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const contentAlpha = useSharedValue(0);
  const logoScale = useSharedValue(0.6);
  const btnAlpha = useSharedValue(0);

  const isSmall = width < 340;
  const px = Math.max(16, width * 0.07);
  const tileSize = Math.min(48, width * 0.12);

  useEffect(() => {
    if (visible) {
      contentAlpha.value = withTiming(1, { duration: 500 });
      logoScale.value = withSpring(1, { damping: 14, stiffness: 180 });
      btnAlpha.value = withDelay(600, withTiming(1, { duration: 400 }));
    }
  }, [visible, contentAlpha, logoScale, btnAlpha]);

  const contentStyle = useAnimatedStyle(() => ({ opacity: contentAlpha.value }));
  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: contentAlpha.value,
  }));
  const btnStyle = useAnimatedStyle(() => ({ opacity: btnAlpha.value }));

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <View style={[styles.container, {
        backgroundColor: theme.background,
        paddingTop: insets.top + (isSmall ? 20 : 40),
        paddingBottom: insets.bottom + 20,
        paddingHorizontal: px,
      }]}>
        {/* Logo */}
        <Animated.View style={[styles.logoSection, logoStyle]}>
          <Text style={[styles.logo, { color: theme.textPrimary, fontSize: Math.min(52, width * 0.14) }]}>fibo</Text>
          <Text style={[styles.welcome, { color: theme.textPrimary, fontSize: Math.min(20, width * 0.055) }]}>
            {WELCOME[selectedLanguage]}
          </Text>
        </Animated.View>

        {/* Description + Preview */}
        <Animated.View style={[styles.descSection, contentStyle]}>
          <Text style={[styles.desc, { color: theme.textSecondary, fontSize: Math.min(15, width * 0.04) }]}>
            {DESC[selectedLanguage]}
          </Text>
          <View style={[styles.previewRow, { gap: Math.min(10, width * 0.025) }]}>
            <View style={[styles.previewTile, { width: tileSize, height: tileSize, borderRadius: tileSize * 0.25, backgroundColor: '#FFE4B8' }]}>
              <Text style={[styles.previewNum, { color: '#8B6030', fontSize: tileSize * 0.42 }]}>2</Text>
            </View>
            <Text style={[styles.previewOp, { color: theme.textMuted, fontSize: tileSize * 0.38 }]}>+</Text>
            <View style={[styles.previewTile, { width: tileSize, height: tileSize, borderRadius: tileSize * 0.25, backgroundColor: '#FFCC88' }]}>
              <Text style={[styles.previewNum, { color: '#7A4A10', fontSize: tileSize * 0.42 }]}>3</Text>
            </View>
            <Text style={[styles.previewOp, { color: theme.textMuted, fontSize: tileSize * 0.38 }]}>=</Text>
            <View style={[styles.previewTile, { width: tileSize, height: tileSize, borderRadius: tileSize * 0.25, backgroundColor: '#FFB058' }]}>
              <Text style={[styles.previewNum, { color: '#FFFFFF', fontSize: tileSize * 0.42 }]}>5</Text>
            </View>
          </View>
        </Animated.View>

        {/* Language Grid */}
        <Animated.View style={[styles.langSection, contentStyle]}>
          <View style={[styles.langGrid, { gap: isSmall ? 6 : 8 }]}>
            {LANGUAGES.map(({ code, flag }) => {
              const isSelected = selectedLanguage === code;
              return (
                <Pressable
                  key={code}
                  onPress={() => onSelectLanguage(code)}
                  style={({ pressed }) => [
                    styles.langBtn,
                    {
                      backgroundColor: isSelected ? theme.restartBtn : theme.scoreCard,
                      borderColor: isSelected ? theme.restartBtn : theme.divider,
                      opacity: pressed ? 0.8 : 1,
                      transform: [{ scale: pressed ? 0.95 : 1 }],
                      paddingHorizontal: isSmall ? 10 : 14,
                      paddingVertical: isSmall ? 8 : 10,
                    },
                  ]}
                >
                  <Text style={styles.langFlag}>{flag}</Text>
                  <Text style={[
                    styles.langBtnText,
                    { color: isSelected ? theme.restartBtnText : theme.textPrimary, fontSize: isSmall ? 11 : 13 },
                  ]}>
                    {LANGUAGE_LABELS[code]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        {/* Start Button */}
        <Animated.View style={[styles.btnSection, btnStyle]}>
          <Pressable
            onPress={onComplete}
            style={({ pressed }) => [
              styles.startBtn,
              {
                backgroundColor: theme.restartBtn,
                opacity: pressed ? 0.88 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
                paddingVertical: isSmall ? 14 : 18,
              },
            ]}
          >
            <Text style={[styles.startBtnText, { color: theme.restartBtnText, fontSize: isSmall ? 15 : 17 }]}>
              {START[selectedLanguage]}
            </Text>
            <Ionicons name="arrow-forward" size={isSmall ? 16 : 18} color={theme.restartBtnText} />
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between' },
  logoSection: { alignItems: 'center', gap: 6 },
  logo: { fontFamily: 'Inter_700Bold', letterSpacing: -2.5 },
  welcome: { fontFamily: 'Inter_700Bold', letterSpacing: -0.3 },
  descSection: { alignItems: 'center', gap: 20 },
  desc: { fontFamily: 'Inter_400Regular', lineHeight: 22, textAlign: 'center', letterSpacing: 0.1 },
  previewRow: { flexDirection: 'row', alignItems: 'center' },
  previewTile: { alignItems: 'center', justifyContent: 'center' },
  previewNum: { fontFamily: 'Inter_700Bold' },
  previewOp: { fontFamily: 'Inter_600SemiBold' },
  langSection: { width: '100%' },
  langGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  langBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 12, borderWidth: 1.5 },
  langFlag: { fontSize: 16 },
  langBtnText: { fontFamily: 'Inter_600SemiBold' },
  btnSection: { width: '100%' },
  startBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 18, width: '100%',
    ...Platform.select({
      ios: { shadowColor: 'rgba(0,0,0,0.15)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12 },
      android: { elevation: 6 },
      web: { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
    }),
  },
  startBtnText: { fontFamily: 'Inter_700Bold', letterSpacing: 0.2 },
});
