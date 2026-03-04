import { useState, useCallback } from 'react';

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

function mergeKey(a: number, b: number): string {
  return a <= b ? `${a},${b}` : `${b},${a}`;
}

function canMerge(a: number, b: number): boolean {
  return MERGE_MAP.has(mergeKey(a, b));
}

function mergeResult(a: number, b: number): number {
  return MERGE_MAP.get(mergeKey(a, b)) ?? a + b;
}

let _tileCounter = 0;
function newId(): string {
  _tileCounter++;
  return `t${_tileCounter}-${Date.now().toString(36)}`;
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
}

function makeGrid(tiles: TileData[]): (TileData | null)[][] {
  const g: (TileData | null)[][] = Array.from({ length: 4 }, () => Array(4).fill(null));
  tiles.forEach((t) => { g[t.row][t.col] = t; });
  return g;
}

function processLine(
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
  while (padded.length < 4) padded.push(null);

  const changed = line.some((t, idx) => {
    const r = padded[idx];
    if (!t && !r) return false;
    if (!t || !r) return true;
    return t.value !== r.value;
  });

  return { result: padded, score, changed, hadMerge };
}

function slideBoard(
  tiles: TileData[],
  dir: Direction
): { newTiles: TileData[]; scoreGained: number; changed: boolean; hadMerge: boolean } {
  const grid = makeGrid(tiles);
  let totalScore = 0;
  let anyChanged = false;
  let anyMerge = false;
  const newGrid: (TileData | null)[][] = Array.from({ length: 4 }, () => Array(4).fill(null));

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

function spawnOne(tiles: TileData[]): TileData[] {
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

function isGameOver(tiles: TileData[]): boolean {
  if (tiles.length < 16) return false;
  const grid = makeGrid(tiles);
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const t = grid[r][c];
      if (!t) return false;
      if (c + 1 < GRID_SIZE && grid[r][c + 1] && canMerge(t.value, grid[r][c + 1]!.value)) return false;
      if (r + 1 < GRID_SIZE && grid[r + 1][c] && canMerge(t.value, grid[r + 1][c]!.value)) return false;
    }
  }
  return true;
}

function makeInitialTiles(): TileData[] {
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

export function useFibonacciGame() {
  const [tiles, setTiles] = useState<TileData[]>(() => makeInitialTiles());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const swipe = useCallback(
    (dir: Direction): SwipeResult => {
      if (gameOver) return { changed: false, merged: false };

      const { newTiles, scoreGained, changed, hadMerge } = slideBoard(tiles, dir);
      if (!changed) return { changed: false, merged: false };

      const cleared = newTiles.map((t) => ({ ...t, isNew: false }));
      const afterSpawn = spawnOne(cleared);

      setTiles(afterSpawn);
      if (scoreGained > 0) {
        setScore((prev) => prev + scoreGained);
      }
      if (isGameOver(afterSpawn)) {
        setGameOver(true);
      }

      return { changed: true, merged: hadMerge };
    },
    [tiles, gameOver]
  );

  const restart = useCallback(() => {
    _tileCounter = 0;
    setTiles(makeInitialTiles());
    setScore(0);
    setGameOver(false);
  }, []);

  return { tiles, score, gameOver, swipe, restart };
}
