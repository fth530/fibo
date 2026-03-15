import { useWindowDimensions } from 'react-native';

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  // iPhone SE = 320, iPhone 14 = 390, iPhone 16 Pro Max = 430
  const isSmall = width < 340;
  const isMedium = width >= 340 && width <= 400;
  const isLarge = width > 400;

  const sp = (size: number) => Math.round(size * (width / 390));
  const fp = (size: number) => Math.round(Math.min(size, size * (width / 390)));

  return { width, height, isSmall, isMedium, isLarge, sp, fp };
}
