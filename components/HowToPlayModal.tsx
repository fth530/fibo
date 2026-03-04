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
import { GameColors, getTileStyle } from '@/constants/colors';

interface HowToPlayModalProps {
  visible: boolean;
  onClose: () => void;
}

function ExampleTile({ value, highlight }: { value: string; highlight?: boolean }) {
  const tileStyle = getTileStyle(parseInt(value, 10));
  return (
    <View
      style={[
        styles.exTile,
        { backgroundColor: highlight ? tileStyle.bg : GameColors.emptyCell },
      ]}
    >
      <Text
        style={[
          styles.exTileText,
          { color: highlight ? tileStyle.text : GameColors.textSecondary },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function MergeExample({
  a,
  b,
  result,
}: {
  a: string;
  b: string;
  result: string;
}) {
  return (
    <View style={styles.mergeRow}>
      <ExampleTile value={a} />
      <Text style={styles.mathOp}>+</Text>
      <ExampleTile value={b} />
      <Text style={styles.mathOp}>=</Text>
      <ExampleTile value={result} highlight />
    </View>
  );
}

export function HowToPlayModal({ visible, onClose }: HowToPlayModalProps) {
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
  }, [visible]);

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
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View style={[styles.card, cardStyle]}>
          <View style={styles.handle} />

          <Text style={styles.modalTitle}>how to play</Text>

          <View style={styles.rulesList}>
            <View style={styles.ruleRow}>
              <View style={styles.dot} />
              <Text style={styles.ruleText}>
                Swipe to slide all tiles in that direction.
              </Text>
            </View>

            <View style={styles.ruleRow}>
              <View style={styles.dot} />
              <Text style={styles.ruleText}>
                Two tiles merge only when they are{' '}
                <Text style={styles.emphasis}>consecutive Fibonacci numbers.</Text>
              </Text>
            </View>
          </View>

          <View style={styles.examplesBlock}>
            <MergeExample a="2" b="3" result="5" />
            <MergeExample a="5" b="8" result="13" />
            <MergeExample a="8" b="13" result="21" />
          </View>

          <View style={styles.exceptionRow}>
            <Text style={styles.exceptionLabel}>Only exception</Text>
            <View style={styles.exceptionMerge}>
              <MergeExample a="1" b="1" result="2" />
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.goalText}>
            Build the highest number possible. Good luck!
          </Text>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.closeBtn,
              {
                opacity: pressed ? 0.82 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              },
            ]}
          >
            <Text style={styles.closeBtnText}>Got it</Text>
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
    backgroundColor: 'rgba(44,36,32,0.45)',
  },
  card: {
    backgroundColor: '#FFFFFF',
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
    backgroundColor: GameColors.emptyCell,
    alignSelf: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    letterSpacing: -0.7,
    color: GameColors.textPrimary,
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
    color: GameColors.textSecondary,
    lineHeight: 20,
    flex: 1,
  },
  emphasis: {
    fontFamily: 'Inter_600SemiBold',
    color: GameColors.textPrimary,
  },
  examplesBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: GameColors.background,
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
    color: GameColors.textMuted,
  },
  exceptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  exceptionLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: GameColors.textMuted,
    letterSpacing: 0.2,
    flexShrink: 0,
  },
  exceptionMerge: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: GameColors.emptyCell,
    marginVertical: -4,
  },
  goalText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: GameColors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: -4,
  },
  closeBtn: {
    backgroundColor: GameColors.restartBtn,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  closeBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FAF7F2',
    letterSpacing: 0.2,
  },
});
