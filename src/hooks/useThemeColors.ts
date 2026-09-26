import { LIGHT_COLORS, DARK_COLORS, ThemeColors } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';

export function useThemeColors(): ThemeColors {
  const { isDark } = useTheme();
  return isDark ? DARK_COLORS : LIGHT_COLORS;
}
