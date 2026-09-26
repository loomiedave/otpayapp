// src/constants/theme.ts
import tailwindConfig from '../../tailwind.config';

const colors = tailwindConfig.theme!.extend!.colors as Record<string, any>;

export type ThemeColors = {
  primary: string;
  danger: string;
  iconMuted: string;
  textMuted: string;
  textMain: string;
  bgCard: string;
  borderMain: string;
};

export const LIGHT_COLORS: ThemeColors = {
  primary: colors.primary.DEFAULT,
  danger: colors.danger.DEFAULT,
  iconMuted: colors.text.muted,
  textMuted: colors.text.muted,
  textMain: colors.text.main,
  bgCard: colors.background.card,
  borderMain: colors.border.main,
};

export const DARK_COLORS: ThemeColors = {
  primary: colors.primary.dark,
  danger: colors.danger.dark,
  iconMuted: colors.text['muted-dark'],
  textMuted: colors.text['muted-dark'],
  textMain: colors.text['main-dark'],
  bgCard: colors.background['card-dark'],
  borderMain: colors.border['main-dark'],
};
