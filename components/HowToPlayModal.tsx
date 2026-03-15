import React, { useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  Pressable,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { getTileStyle } from '@/constants/colors';
import { useT } from '@/constants/i18n';
import type { ThemeColors } from '@/constants/colors';

interface HowToPlayModalProps {
  visible: boolean;
  onClose: () => void;
  theme: ThemeColors;
}

function ExampleTile({ value, highlight, theme }: { value: string; highlight?: boolean; theme: ThemeColors }) {
  const tileStyle = getTileStyle(parseInt(value, 10));
  return (
    <View
      style={[
        styles.exTile,
        { backgroundColor: highlight ? tileStyle.bg : theme.emptyCell },
      ]}
    >
      <Text
        style={[
          styles.exTileText,
          { color: highlight ? tileStyle.text : theme.textSecondary },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function MergeExample({ a, b, result, theme }: { a: string; b: string; result: string; theme: ThemeColors }) {
  return (
    <View style={styles.mergeRow}>
      <ExampleTile value={a} theme={theme} />
      <Text style={[styles.mathOp, { color: theme.textMuted }]}>+</Text>
      <ExampleTile value={b} theme={theme} />
      <Text style={[styles.mathOp, { color: theme.textMuted }]}>=</Text>
      <ExampleTile value={result} highlight theme={theme} />
    </View>
  );
}

export function HowToPlayModal({ visible, onClose, theme }: HowToPlayModalProps) {
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

          <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>{t.howToPlayTitle}</Text>

          <View style={styles.rulesList}>
            <View style={styles.ruleRow}>
              <View style={styles.dot} />
              <Text style={[styles.ruleText, { color: theme.textSecondary }]}>
                {t.rule1}
              </Text>
            </View>

            <View style={styles.ruleRow}>
              <View style={styles.dot} />
              <Text style={[styles.ruleText, { color: theme.textSecondary }]}>
                {t.rule2prefix}
                <Text style={[styles.emphasis, { color: theme.textPrimary }]}>{t.rule2bold}</Text>{t.rule2suffix}
              </Text>
            </View>
          </View>

          <View style={[styles.examplesBlock, { backgroundColor: theme.background }]}>
            <MergeExample a="2" b="3" result="5" theme={theme} />
            <MergeExample a="5" b="8" result="13" theme={theme} />
            <MergeExample a="8" b="13" result="21" theme={theme} />
          </View>

          <View style={styles.exceptionRow}>
            <Text style={[styles.exceptionLabel, { color: theme.textMuted }]}>{t.onlyException}</Text>
            <View style={styles.exceptionMerge}>
              <MergeExample a="1" b="1" result="2" theme={theme} />
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          <Text style={[styles.goalText, { color: theme.textMuted }]}>
            {t.goalText}
          </Text>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.closeBtn,
              {
                backgroundColor: theme.restartBtn,
                opacity: pressed ? 0.82 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              },
            ]}
          >
            <Text style={[styles.closeBtnText, { color: theme.restartBtnText }]}>{t.gotIt}</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
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
    gap: 20,
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
  rulesList: {
    gap: 10,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF8C50',
    marginTop: 6,
    flexShrink: 0,
  },
  ruleText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  emphasis: {
    fontFamily: 'Inter_600SemiBold',
  },
  examplesBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  mergeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  exTile: {
    width: 32,
    height: 32,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exTileText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
  },
  mathOp: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  exceptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  exceptionLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    letterSpacing: 0.2,
    flexShrink: 0,
  },
  exceptionMerge: {
    flex: 1,
  },
  divider: {
    height: 1,
    marginVertical: -4,
  },
  goalText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: -4,
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
