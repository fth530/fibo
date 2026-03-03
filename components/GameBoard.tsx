import React from 'react';
import { StyleSheet, View, useWindowDimensions, Platform } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { GameTile } from '@/components/GameTile';
import { GameColors } from '@/constants/colors';
import type { TileData, Direction } from '@/hooks/useFibonacciGame';

const GRID_SIZE = 4;
const BOARD_MARGIN = 16;
const BOARD_PADDING = 10;
const GAP = 7;
const MIN_SWIPE = 20;

interface GameBoardProps {
  tiles: TileData[];
  onSwipe: (dir: Direction) => void;
}

export function GameBoard({ tiles, onSwipe }: GameBoardProps) {
  const { width } = useWindowDimensions();
  const boardSize = Math.min(width - BOARD_MARGIN * 2, 420);
  const cellSize = (boardSize - BOARD_PADDING * 2 - GAP * (GRID_SIZE - 1)) / GRID_SIZE;

  const pan = Gesture.Pan()
    .onEnd((e) => {
      const ax = Math.abs(e.translationX);
      const ay = Math.abs(e.translationY);
      if (Math.max(ax, ay) < MIN_SWIPE) return;
      let dir: Direction;
      if (ax > ay) {
        dir = e.translationX > 0 ? 'right' : 'left';
      } else {
        dir = e.translationY > 0 ? 'down' : 'up';
      }
      onSwipe(dir);
    })
    .runOnJS(true);

  const emptyCells = Array.from({ length: GRID_SIZE * GRID_SIZE });

  return (
    <GestureDetector gesture={pan}>
      <View
        style={[
          styles.board,
          {
            width: boardSize,
            height: boardSize,
            borderRadius: boardSize * 0.06,
            padding: BOARD_PADDING,
            gap: GAP,
          },
        ]}
      >
        <View style={[styles.cellGrid, { gap: GAP }]}>
          {emptyCells.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.emptyCell,
                {
                  width: cellSize,
                  height: cellSize,
                  borderRadius: cellSize * 0.12,
                },
              ]}
            />
          ))}
        </View>

        <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
          {tiles.map((tile) => (
            <GameTile
              key={tile.id}
              tile={tile}
              cellSize={cellSize}
              gap={GAP}
              padding={BOARD_PADDING}
            />
          ))}
        </View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  board: {
    backgroundColor: GameColors.boardBg,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(44,36,32,0.12)',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 1,
        shadowRadius: 20,
      },
      android: { elevation: 6 },
      web: {
        boxShadow: '0px 8px 20px rgba(44,36,32,0.12)',
      },
    }),
  },
  cellGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emptyCell: {
    backgroundColor: GameColors.emptyCell,
  },
});
