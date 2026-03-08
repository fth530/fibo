import type { ThemeMode } from '@/hooks/useSettings';

export interface ThemeColors {
  background: string;
  boardBg: string;
  emptyCell: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  scoreCard: string;
  scoreCardShadow: string;
  restartBtn: string;
  restartBtnText: string;
  modalBg: string;
  modalBackdrop: string;
  divider: string;
}

const LightTheme: ThemeColors = {
  background: '#FAF7F2',
  boardBg: '#EDE7DC',
  emptyCell: '#D8D0C4',
  textPrimary: '#2C2420',
  textSecondary: '#9C8E80',
  textMuted: '#BCB0A0',
  scoreCard: '#FFFFFF',
  scoreCardShadow: 'rgba(44,36,32,0.08)',
  restartBtn: '#2C2420',
  restartBtnText: '#FAF7F2',
  modalBg: '#FFFFFF',
  modalBackdrop: 'rgba(44,36,32,0.45)',
  divider: '#EDE7DC',
};

const DarkTheme: ThemeColors = {
  background: '#1A1A1A',
  boardBg: '#2A2A2A',
  emptyCell: '#3A3A3A',
  textPrimary: '#F0ECE6',
  textSecondary: '#9C9488',
  textMuted: '#6B6560',
  scoreCard: '#2A2A2A',
  scoreCardShadow: 'rgba(0,0,0,0.3)',
  restartBtn: '#F0ECE6',
  restartBtnText: '#1A1A1A',
  modalBg: '#2A2A2A',
  modalBackdrop: 'rgba(0,0,0,0.65)',
  divider: '#3A3A3A',
};

export function getTheme(mode: ThemeMode): ThemeColors {
  return mode === 'dark' ? DarkTheme : LightTheme;
}

// Keep GameColors as default light theme for backward compatibility
export const GameColors = LightTheme;

export const TileColors: Record<number, { bg: string; text: string; shadow: string }> = {
  1:   { bg: '#F2ECE2', text: '#B0A090', shadow: 'rgba(176,160,144,0.3)' },
  2:   { bg: '#FFE4B8', text: '#8B6030', shadow: 'rgba(139,96,48,0.3)' },
  3:   { bg: '#FFCC88', text: '#7A4A10', shadow: 'rgba(122,74,16,0.3)' },
  5:   { bg: '#FFB058', text: '#FFFFFF', shadow: 'rgba(255,176,88,0.5)' },
  8:   { bg: '#FF8C50', text: '#FFFFFF', shadow: 'rgba(255,140,80,0.5)' },
  13:  { bg: '#F06858', text: '#FFFFFF', shadow: 'rgba(240,104,88,0.5)' },
  21:  { bg: '#D85090', text: '#FFFFFF', shadow: 'rgba(216,80,144,0.5)' },
  34:  { bg: '#A840C8', text: '#FFFFFF', shadow: 'rgba(168,64,200,0.5)' },
  55:  { bg: '#7868D8', text: '#FFFFFF', shadow: 'rgba(120,104,216,0.5)' },
  89:  { bg: '#4888E8', text: '#FFFFFF', shadow: 'rgba(72,136,232,0.5)' },
  144: { bg: '#28B0C8', text: '#FFFFFF', shadow: 'rgba(40,176,200,0.5)' },
  233: { bg: '#28A878', text: '#FFFFFF', shadow: 'rgba(40,168,120,0.5)' },
  377: { bg: '#208858', text: '#FFFFFF', shadow: 'rgba(32,136,88,0.5)' },
  610: { bg: '#186838', text: '#FFFFFF', shadow: 'rgba(24,104,56,0.5)' },
  987: { bg: '#104820', text: '#FFFFFF', shadow: 'rgba(16,72,32,0.5)' },
};

export function getTileStyle(value: number) {
  const style = TileColors[value];
  if (style) return style;
  return { bg: '#0A2810', text: '#FFFFFF', shadow: 'rgba(10,40,16,0.5)' };
}

const tintColorLight = '#FF8C50';

export default {
  light: {
    text: '#2C2420',
    background: '#FAF7F2',
    tint: tintColorLight,
    tabIconDefault: '#BCB0A0',
    tabIconSelected: tintColorLight,
  },
};
