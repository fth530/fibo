import { useReducer, useCallback } from 'react';

const GRID_SIZE = 4;

const MERGE_MAP = new Map<string, number>([
  ['1,1', 2],
  ['1,2', 3],
  ['2,3', 5],
  ['3,5', 8],
  ['5,8', 13],
  ['8,13', 21],
  ['13,21', 34],
  ['21,34', 55],
  ['34,55', 89],
  ['55,89', 144],
  ['89,144', 233],
  ['144,233', 377],
  ['233,377', 610],
  ['377,610', 987],
  ['610,987', 1597],
  ['987,1597', 2584],
]);

export function mergeKey(a: number, b: number): string {
  return a <= b ? `${a},${b}` : `${b},${a}`;
}

export function canMerge(a: number, b: number): boolean {
  return MERGE_MAP.has(mergeKey(a, b));
}

export function mergeResult(a: number, b: number): number {
  return MERGE_MAP.get(mergeKey(a, b)) ?? a + b;
}

function newId(): string {
  return `t${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export interface TileData {
  id: string;
  value: number;
  row: number;
  col: number;
  isNew: boolean;
  isMerged: boolean;
}

export type Direction = 'left' | 'right' | 'up' | 'down';

export interface SwipeResult {
  changed: boolean;
  merged: boolean;
  scoreGained: number;
}

export function makeGrid(tiles: TileData[]): (TileData | null)[][] {
  const g: (TileData | null)[][] = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(null)
  );
  tiles.forEach((t) => {
    g[t.row][t.col] = t;
  });
  return g;
}

export function processLine(
  line: (TileData | null)[]
): { result: (TileData | null)[]; score: number; changed: boolean; hadMerge: boolean } {
  const tiles = line.filter(Boolean) as TileData[];
  const out: TileData[] = [];
  let score = 0;
  let hadMerge = false;
  let i = 0;

  while (i < tiles.length) {
    if (
      i + 1 < tiles.length &&
      canMerge(tiles[i].value, tiles[i + 1].value)
    ) {
      const val = mergeResult(tiles[i].value, tiles[i + 1].value);
      score += val;
      hadMerge = true;
      out.push({ ...tiles[i], id: newId(), value: val, isMerged: true, isNew: false });
      i += 2;
    } else {
      out.push({ ...tiles[i], isMerged: false });
      i++;
    }
  }

  const padded: (TileData | null)[] = [...out];
  while (padded.length < GRID_SIZE) padded.push(null);

  const changed = line.some((t, idx) => {
    const r = padded[idx];
    if (!t && !r) return false;
    if (!t || !r) return true;
    return t.value !== r.value;
  });

  return { result: padded, score, changed, hadMerge };
}

export function slideBoard(
  tiles: TileData[],
  dir: Direction
): { newTiles: TileData[]; scoreGained: number; changed: boolean; hadMerge: boolean } {
  const grid = makeGrid(tiles);
  let totalScore = 0;
  let anyChanged = false;
  let anyMerge = false;
  const newGrid: (TileData | null)[][] = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(null)
  );

  if (dir === 'left' || dir === 'right') {
    for (let r = 0; r < GRID_SIZE; r++) {
      let line = [...grid[r]];
      if (dir === 'right') line = line.reverse();
      const { result, score, changed, hadMerge } = processLine(line);
      if (changed) anyChanged = true;
      if (hadMerge) anyMerge = true;
      totalScore += score;
      const row = dir === 'right' ? [...result].reverse() : result;
      row.forEach((t, c) => {
        if (t) newGrid[r][c] = { ...t, row: r, col: c };
      });
    }
  } else {
    for (let c = 0; c < GRID_SIZE; c++) {
      let line = grid.map((row) => row[c]);
      if (dir === 'down') line = line.reverse();
      const { result, score, changed, hadMerge } = processLine(line);
      if (changed) anyChanged = true;
      if (hadMerge) anyMerge = true;
      totalScore += score;
      const col = dir === 'down' ? [...result].reverse() : result;
      col.forEach((t, r) => {
        if (t) newGrid[r][c] = { ...t, row: r, col: c };
      });
    }
  }

  const newTiles = newGrid.flat().filter(Boolean) as TileData[];
  return { newTiles, scoreGained: totalScore, changed: anyChanged, hadMerge: anyMerge };
}

export function spawnOne(tiles: TileData[]): TileData[] {
  const occupied = new Set(tiles.map((t) => `${t.row},${t.col}`));
  const empty: { row: number; col: number }[] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (!occupied.has(`${r},${c}`)) empty.push({ row: r, col: c });
    }
  }
  if (empty.length === 0) return tiles;
  const pos = empty[Math.floor(Math.random() * empty.length)];
  return [
    ...tiles,
    { id: newId(), value: 1, row: pos.row, col: pos.col, isNew: true, isMerged: false },
  ];
}

export function isGameOver(tiles: TileData[]): boolean {
  if (tiles.length < 16) return false;
  const grid = makeGrid(tiles);
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const t = grid[r][c];
      if (!t) return false;
      if (c + 1 < GRID_SIZE && grid[r][c + 1] && canMerge(t.value, grid[r][c + 1]!.value))
        return false;
      if (r + 1 < GRID_SIZE && grid[r + 1][c] && canMerge(t.value, grid[r + 1][c]!.value))
        return false;
    }
  }
  return true;
}

export function makeInitialTiles(): TileData[] {
  const pool = Array.from({ length: 16 }, (_, i) => i);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return [pool[0], pool[1]].map((idx) => ({
    id: newId(),
    value: 1,
    row: Math.floor(idx / GRID_SIZE),
    col: idx % GRID_SIZE,
    isNew: true,
    isMerged: false,
  }));
}

// ─── Reducer Pattern ────────────────────────────────────────────

export interface GameState {
  tiles: TileData[];
  score: number;
  gameOver: boolean;
  previousState: { tiles: TileData[]; score: number } | null;
  canUndo: boolean;
  moveCount: number;
}

type GameAction =
  | { type: 'SWIPE'; dir: Direction }
  | { type: 'RESTART' }
  | { type: 'UNDO' };

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SWIPE': {
      if (state.gameOver) return state;

      const { newTiles, scoreGained, changed } = slideBoard(state.tiles, action.dir);
      if (!changed) return state;

      const cleared = newTiles.map((t) => ({ ...t, isNew: false }));
      const afterSpawn = spawnOne(cleared);
      const newScore = state.score + scoreGained;
      const over = isGameOver(afterSpawn);

      return {
        tiles: afterSpawn,
        score: newScore,
        gameOver: over,
        previousState: { tiles: state.tiles, score: state.score },
        canUndo: true,
        moveCount: state.moveCount + 1,
      };
    }

    case 'UNDO': {
      if (!state.previousState) return state;
      return {
        tiles: state.previousState.tiles,
        score: state.previousState.score,
        gameOver: false,
        previousState: null,
        canUndo: false,
        moveCount: state.moveCount - 1,
      };
    }

    case 'RESTART': {
      return { tiles: makeInitialTiles(), score: 0, gameOver: false, previousState: null, canUndo: false, moveCount: 0 };
    }

    default:
      return state;
  }
}

function createInitialState(): GameState {
  return { tiles: makeInitialTiles(), score: 0, gameOver: false, previousState: null, canUndo: false, moveCount: 0 };
}

export function useFibonacciGame() {
  const [state, dispatch] = useReducer(gameReducer, null, createInitialState);

  const swipe = useCallback(
    (dir: Direction): SwipeResult => {
      if (state.gameOver) return { changed: false, merged: false, scoreGained: 0 };

      const { changed, hadMerge, scoreGained } = slideBoard(state.tiles, dir);
      if (!changed) return { changed: false, merged: false, scoreGained: 0 };

      dispatch({ type: 'SWIPE', dir });
      return { changed: true, merged: hadMerge, scoreGained };
    },
    [state.tiles, state.gameOver]
  );

  const restart = useCallback(() => {
    dispatch({ type: 'RESTART' });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  return {
    tiles: state.tiles,
    score: state.score,
    gameOver: state.gameOver,
    canUndo: state.canUndo,
    moveCount: state.moveCount,
    swipe,
    restart,
    undo,
  };
}
