import React, { useEffect } from 'react';
import { StyleSheet, Text, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { getTileStyle } from '@/constants/colors';
import type { TileData } from '@/hooks/useFibonacciGame';

interface GameTileProps {
  tile: TileData;
  cellSize: number;
  gap: number;
  padding: number;
}

function getFontSize(value: number, cellSize: number): number {
  const digits = String(value).length;
  if (digits <= 2) return cellSize * 0.38;
  if (digits <= 3) return cellSize * 0.30;
  if (digits <= 4) return cellSize * 0.24;
  return cellSize * 0.20;
}

export function GameTile({ tile, cellSize, gap, padding }: GameTileProps) {
  const targetX = padding + tile.col * (cellSize + gap);
  const targetY = padding + tile.row * (cellSize + gap);

  const translateX = useSharedValue(targetX);
  const translateY = useSharedValue(targetY);
  const scale = useSharedValue(tile.isNew ? 0 : 1);

  useEffect(() => {
    translateX.value = withSpring(targetX, { damping: 22, stiffness: 380 });
    translateY.value = withSpring(targetY, { damping: 22, stiffness: 380 });
  }, [targetX, targetY]);

  useEffect(() => {
    if (tile.isNew) {
      scale.value = withSpring(1, { damping: 14, stiffness: 360 });
    }
  }, [tile.isNew]);

  useEffect(() => {
    if (tile.isMerged) {
      scale.value = withSequence(
        withTiming(1.18, { duration: 90 }),
        withSpring(1, { damping: 14, stiffness: 400 })
      );
    }
  }, [tile.isMerged]);

  const tileStyle = getTileStyle(tile.value);
  const fontSize = getFontSize(tile.value, cellSize);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const shadowStyle = Platform.select({
    ios: { shadowColor: tileStyle.shadow },
    android: {},
    web: { boxShadow: `0px 4px 8px ${tileStyle.shadow}` },
  });

  return (
    <Animated.View
      style={[
        styles.tile,
        {
          width: cellSize,
          height: cellSize,
          borderRadius: cellSize * 0.12,
          backgroundColor: tileStyle.bg,
        },
        shadowStyle,
        animStyle,
      ]}
    >
      <Text
        style={[
          styles.value,
          {
            color: tileStyle.text,
            fontSize,
            fontFamily: 'Inter_700Bold',
          },
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {tile.value}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tile: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  value: {
    fontWeight: '700',
    letterSpacing: -0.5,
  },
});
