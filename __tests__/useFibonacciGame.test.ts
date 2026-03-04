import {
    mergeKey,
    canMerge,
    mergeResult,
    processLine,
    slideBoard,
    isGameOver,
    makeInitialTiles,
    makeGrid,
    spawnOne,
    gameReducer,
    type TileData,
    type GameState,
} from '../hooks/useFibonacciGame';

// ─── Helper ─────────────────────────────────────────────────────

function tile(value: number, row: number, col: number, overrides?: Partial<TileData>): TileData {
    return {
        id: `test-${row}-${col}`,
        value,
        row,
        col,
        isNew: false,
        isMerged: false,
        ...overrides,
    };
}

// ─── mergeKey ───────────────────────────────────────────────────

describe('mergeKey', () => {
    it('returns sorted pair for ascending input', () => {
        expect(mergeKey(2, 3)).toBe('2,3');
    });

    it('returns sorted pair for descending input (symmetry)', () => {
        expect(mergeKey(3, 2)).toBe('2,3');
    });

    it('handles equal values', () => {
        expect(mergeKey(1, 1)).toBe('1,1');
    });

    it('handles large values', () => {
        expect(mergeKey(987, 610)).toBe('610,987');
    });
});

// ─── canMerge ───────────────────────────────────────────────────

describe('canMerge', () => {
    it.each([
        [1, 1],
        [1, 2],
        [2, 3],
        [3, 5],
        [5, 8],
        [8, 13],
        [13, 21],
        [21, 34],
        [34, 55],
        [55, 89],
        [89, 144],
        [144, 233],
        [233, 377],
        [377, 610],
        [610, 987],
        [987, 1597],
    ])('returns true for consecutive Fibonacci pair (%i, %i)', (a, b) => {
        expect(canMerge(a, b)).toBe(true);
    });

    it('is symmetric: canMerge(a,b) === canMerge(b,a)', () => {
        expect(canMerge(5, 8)).toBe(true);
        expect(canMerge(8, 5)).toBe(true);
    });

    it.each([
        [1, 3],
        [2, 5],
        [3, 8],
        [5, 13],
        [2, 2],
        [3, 3],
        [100, 200],
    ])('returns false for non-consecutive pair (%i, %i)', (a, b) => {
        expect(canMerge(a, b)).toBe(false);
    });
});

// ─── mergeResult ────────────────────────────────────────────────

describe('mergeResult', () => {
    it.each([
        [1, 1, 2],
        [1, 2, 3],
        [2, 3, 5],
        [3, 5, 8],
        [5, 8, 13],
        [8, 13, 21],
        [13, 21, 34],
        [21, 34, 55],
        [34, 55, 89],
        [55, 89, 144],
        [89, 144, 233],
        [987, 1597, 2584],
    ])('mergeResult(%i, %i) = %i', (a, b, expected) => {
        expect(mergeResult(a, b)).toBe(expected);
    });

    it('is symmetric', () => {
        expect(mergeResult(5, 8)).toBe(mergeResult(8, 5));
    });

    it('falls back to sum for unknown pairs', () => {
        expect(mergeResult(100, 200)).toBe(300);
    });
});

// ─── processLine ────────────────────────────────────────────────

describe('processLine', () => {
    it('slides tiles to the left with no merge', () => {
        const line = [null, null, tile(1, 0, 2), null];
        const { result, score, changed, hadMerge } = processLine(line);

        expect(result[0]?.value).toBe(1);
        expect(result[1]).toBeNull();
        expect(score).toBe(0);
        expect(changed).toBe(true);
        expect(hadMerge).toBe(false);
    });

    it('merges consecutive Fibonacci tiles', () => {
        const line = [tile(2, 0, 0), tile(3, 0, 1), null, null];
        const { result, score, hadMerge } = processLine(line);

        expect(result[0]?.value).toBe(5);
        expect(result[1]).toBeNull();
        expect(score).toBe(5);
        expect(hadMerge).toBe(true);
    });

    it('does NOT merge non-consecutive tiles', () => {
        const line = [tile(2, 0, 0), tile(5, 0, 1), null, null];
        const { result, score, hadMerge } = processLine(line);

        expect(result[0]?.value).toBe(2);
        expect(result[1]?.value).toBe(5);
        expect(score).toBe(0);
        expect(hadMerge).toBe(false);
    });

    it('handles multiple merges in one line', () => {
        const line = [tile(1, 0, 0), tile(1, 0, 1), tile(2, 0, 2), tile(3, 0, 3)];
        const { result, score } = processLine(line);

        // 1+1=2, 2+3=5
        expect(result[0]?.value).toBe(2);
        expect(result[1]?.value).toBe(5);
        expect(score).toBe(7); // 2 + 5
    });

    it('handles 1+1 special case', () => {
        const line = [tile(1, 0, 0), tile(1, 0, 1), null, null];
        const { result, score } = processLine(line);

        expect(result[0]?.value).toBe(2);
        expect(score).toBe(2);
    });

    it('returns changed=false when nothing moves', () => {
        const line = [tile(2, 0, 0), tile(5, 0, 1), null, null];
        const { changed } = processLine(line);

        expect(changed).toBe(false);
    });

    it('handles all-empty line', () => {
        const line = [null, null, null, null];
        const { result, score, changed, hadMerge } = processLine(line);

        expect(result.every((r) => r === null)).toBe(true);
        expect(score).toBe(0);
        expect(changed).toBe(false);
        expect(hadMerge).toBe(false);
    });

    it('handles full line with no merges', () => {
        const line = [tile(1, 0, 0), tile(3, 0, 1), tile(8, 0, 2), tile(21, 0, 3)];
        const { result, changed } = processLine(line);

        expect(result[0]?.value).toBe(1);
        expect(result[1]?.value).toBe(3);
        expect(result[2]?.value).toBe(8);
        expect(result[3]?.value).toBe(21);
        expect(changed).toBe(false);
    });
});

// ─── slideBoard ─────────────────────────────────────────────────

describe('slideBoard', () => {
    it('slides tiles left', () => {
        const tiles = [tile(1, 0, 3)];
        const { newTiles, changed } = slideBoard(tiles, 'left');

        expect(changed).toBe(true);
        const movedTile = newTiles.find((t) => t.value === 1);
        expect(movedTile?.col).toBe(0);
        expect(movedTile?.row).toBe(0);
    });

    it('slides tiles right', () => {
        const tiles = [tile(1, 0, 0)];
        const { newTiles, changed } = slideBoard(tiles, 'right');

        expect(changed).toBe(true);
        const movedTile = newTiles.find((t) => t.value === 1);
        expect(movedTile?.col).toBe(3);
    });

    it('slides tiles up', () => {
        const tiles = [tile(1, 3, 0)];
        const { newTiles, changed } = slideBoard(tiles, 'up');

        expect(changed).toBe(true);
        const movedTile = newTiles.find((t) => t.value === 1);
        expect(movedTile?.row).toBe(0);
    });

    it('slides tiles down', () => {
        const tiles = [tile(1, 0, 0)];
        const { newTiles, changed } = slideBoard(tiles, 'down');

        expect(changed).toBe(true);
        const movedTile = newTiles.find((t) => t.value === 1);
        expect(movedTile?.row).toBe(3);
    });

    it('merges tiles when sliding', () => {
        const tiles = [tile(2, 0, 0), tile(3, 0, 3)];
        const { newTiles, scoreGained, hadMerge } = slideBoard(tiles, 'left');

        expect(newTiles.length).toBe(1);
        expect(newTiles[0].value).toBe(5);
        expect(scoreGained).toBe(5);
        expect(hadMerge).toBe(true);
    });

    it('returns changed=false when no movement possible', () => {
        // Tile already at leftmost position, no merge candidates
        const tiles = [tile(1, 0, 0)];
        const { changed } = slideBoard(tiles, 'left');

        expect(changed).toBe(false);
    });

    it('handles board with multiple rows correctly', () => {
        const tiles = [
            tile(1, 0, 3),
            tile(2, 1, 3),
            tile(3, 2, 3),
        ];
        const { newTiles, changed } = slideBoard(tiles, 'left');

        expect(changed).toBe(true);
        expect(newTiles.length).toBe(3);
        newTiles.forEach((t) => expect(t.col).toBe(0));
    });
});

// ─── isGameOver ─────────────────────────────────────────────────

describe('isGameOver', () => {
    it('returns false when board has empty cells', () => {
        const tiles = [tile(1, 0, 0), tile(2, 0, 1)];
        expect(isGameOver(tiles)).toBe(false);
    });

    it('returns false when board is full but has a valid merge', () => {
        // Fill 4x4 with non-mergeable values, then put one mergeable pair
        const values = [1, 3, 8, 21, 3, 8, 21, 1, 8, 21, 1, 3, 21, 1, 2, 3]; // [3][2]=2, [3][3]=3 => mergeable
        const tiles: TileData[] = [];
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                tiles.push(tile(values[r * 4 + c], r, c));
            }
        }
        expect(isGameOver(tiles)).toBe(false);
    });

    it('returns true when board is full and no merges possible', () => {
        // Pattern: no two adjacent tiles are consecutive Fibonacci numbers
        const values = [
            1, 5, 1, 5,
            13, 1, 13, 1,
            1, 5, 1, 5,
            13, 1, 13, 1,
        ];
        const tiles: TileData[] = [];
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                tiles.push(tile(values[r * 4 + c], r, c));
            }
        }
        expect(isGameOver(tiles)).toBe(true);
    });
});

// ─── spawnOne ───────────────────────────────────────────────────

describe('spawnOne', () => {
    it('adds exactly one tile with value 1', () => {
        const initial = [tile(5, 0, 0)];
        const after = spawnOne(initial);

        expect(after.length).toBe(2);
        const spawned = after.find((t) => t.value === 1);
        expect(spawned).toBeDefined();
        expect(spawned?.isNew).toBe(true);
    });

    it('does not spawn on occupied cells', () => {
        const initial = [tile(5, 0, 0)];
        const after = spawnOne(initial);

        const spawned = after.find((t) => t.isNew);
        expect(spawned?.row !== 0 || spawned?.col !== 0).toBe(true);
    });

    it('returns same array on full board', () => {
        const fullBoard: TileData[] = [];
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                fullBoard.push(tile(1, r, c));
            }
        }
        const after = spawnOne(fullBoard);
        expect(after.length).toBe(16);
    });
});

// ─── makeInitialTiles ───────────────────────────────────────────

describe('makeInitialTiles', () => {
    it('creates exactly 2 tiles', () => {
        const tiles = makeInitialTiles();
        expect(tiles.length).toBe(2);
    });

    it('all initial tiles have value 1', () => {
        const tiles = makeInitialTiles();
        tiles.forEach((t) => expect(t.value).toBe(1));
    });

    it('tiles are in valid positions (0-3 row/col)', () => {
        const tiles = makeInitialTiles();
        tiles.forEach((t) => {
            expect(t.row).toBeGreaterThanOrEqual(0);
            expect(t.row).toBeLessThan(4);
            expect(t.col).toBeGreaterThanOrEqual(0);
            expect(t.col).toBeLessThan(4);
        });
    });

    it('tiles are not on same position', () => {
        const tiles = makeInitialTiles();
        const pos0 = `${tiles[0].row},${tiles[0].col}`;
        const pos1 = `${tiles[1].row},${tiles[1].col}`;
        expect(pos0).not.toBe(pos1);
    });

    it('tiles are marked as new', () => {
        const tiles = makeInitialTiles();
        tiles.forEach((t) => expect(t.isNew).toBe(true));
    });
});

// ─── makeGrid ───────────────────────────────────────────────────

describe('makeGrid', () => {
    it('creates 4x4 grid', () => {
        const grid = makeGrid([]);
        expect(grid.length).toBe(4);
        grid.forEach((row) => expect(row.length).toBe(4));
    });

    it('places tiles in correct positions', () => {
        const t = tile(5, 2, 3);
        const grid = makeGrid([t]);

        expect(grid[2][3]?.value).toBe(5);
        expect(grid[0][0]).toBeNull();
    });
});

// ─── gameReducer ────────────────────────────────────────────────

describe('gameReducer', () => {
    const initialState: GameState = {
        tiles: [tile(2, 0, 0), tile(3, 0, 3)],
        score: 0,
        gameOver: false,
    };

    it('SWIPE merges tiles and updates score', () => {
        const newState = gameReducer(initialState, { type: 'SWIPE', dir: 'left' });

        // 2+3=5 merge happened
        expect(newState.score).toBe(5);
        // Spawned one new tile, so total should be 2 (merged + spawned)
        expect(newState.tiles.length).toBe(2);
    });

    it('SWIPE returns same state when no movement', () => {
        const stuck: GameState = {
            tiles: [tile(1, 0, 0)],
            score: 10,
            gameOver: false,
        };
        const newState = gameReducer(stuck, { type: 'SWIPE', dir: 'left' });

        expect(newState).toBe(stuck); // Same reference, no change
    });

    it('SWIPE is a no-op when game is over', () => {
        const overState: GameState = {
            tiles: [tile(1, 0, 0)],
            score: 50,
            gameOver: true,
        };
        const newState = gameReducer(overState, { type: 'SWIPE', dir: 'right' });

        expect(newState).toBe(overState);
    });

    it('RESTART resets state completely', () => {
        const midGameState: GameState = {
            tiles: [tile(89, 0, 0), tile(144, 0, 1)],
            score: 500,
            gameOver: true,
        };
        const newState = gameReducer(midGameState, { type: 'RESTART' });

        expect(newState.score).toBe(0);
        expect(newState.gameOver).toBe(false);
        expect(newState.tiles.length).toBe(2);
        newState.tiles.forEach((t) => expect(t.value).toBe(1));
    });
});
