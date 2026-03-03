# Fibonacci Puzzle Game

A minimalist 4x4 puzzle game built with Expo React Native, inspired by 2048 but using Fibonacci sequence merging mechanics.

## Architecture

### Frontend (Expo Router)
- **Single screen** — no tab navigation, clean full-screen game board
- `app/(tabs)/_layout.tsx` — simplified Stack layout with no header
- `app/(tabs)/index.tsx` — main game screen with header, score, and game over overlay
- `components/GameBoard.tsx` — board UI with PanGesture swipe detection
- `components/GameTile.tsx` — individual animated tile using react-native-reanimated
- `hooks/useFibonacciGame.ts` — all game logic (merging, sliding, spawning, game over)
- `constants/colors.ts` — game color palette with 15-tier tile gradient system

### Backend (Express)
- `server/index.ts` — Express server, serves landing page and static Expo build
- `server/routes.ts` — minimal routes (game is fully client-side, no persistence needed)

## Game Rules

1. **Grid**: 4x4
2. **Fibonacci sequence**: 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233...
3. **Spawning**: Two `1` tiles at start; one `1` tile after every valid swipe
4. **Merging**: Only consecutive Fibonacci pairs merge (1+1=2, 2+3=5, 3+5=8, etc.)
5. **Controls**: Swipe gestures via react-native-gesture-handler PanGesture

## Key Technical Details

- Tile IDs persist through moves for animation continuity (merged tiles get new IDs)
- `useSharedValue` initializes at correct position — spring animates on position change
- `isNew` flag triggers scale-from-0 pop-in; `isMerged` flag triggers scale pulse
- Shadow deprecation handled: `boxShadow` on web, `shadowColor/etc.` on iOS, `elevation` on Android

## Packages Used

- `react-native-reanimated` — tile animations (spring physics)
- `react-native-gesture-handler` — swipe detection (PanGesture)
- `expo-haptics` — haptic feedback on swipe and restart
- `@expo/vector-icons` — restart icon
- `@expo-google-fonts/inter` — typography

## Workflows

- **Start Backend**: `npm run server:dev` — Express on port 5000
- **Start Frontend**: `npm run expo:dev` — Expo Metro on port 8081
