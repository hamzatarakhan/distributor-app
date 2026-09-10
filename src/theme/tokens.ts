// Single source of truth for colors, spacing, radii, typography.
// Screens pull from useTheme() — they never re-derive the color-scheme check.

export const palette = {
  brand: '#0A6EBD',
  brandDark: '#3B9EE5',
};

const light = {
  primary: palette.brand,
  primaryTint: 'rgba(10,110,189,0.10)',
  primaryBorder: 'rgba(10,110,189,0.22)',
  background: '#F6F7F9',
  card: '#FFFFFF',
  cardAlt: '#F1F3F5',
  border: '#E3E6EA',
  text: '#11181C',
  textMuted: '#5B636B',
  textFaint: '#8A929A',
  onPrimary: '#FFFFFF',
  success: '#0F9D58',
  successTint: 'rgba(15,157,88,0.12)',
  warning: '#E8A100',
  warningTint: 'rgba(232,161,0,0.14)',
  danger: '#D7263D',
  dangerTint: 'rgba(215,38,61,0.12)',
  info: '#2F80ED',
  infoTint: 'rgba(47,128,237,0.12)',
  overlay: 'rgba(0,0,0,0.45)',
};

const dark: typeof light = {
  primary: palette.brandDark,
  primaryTint: 'rgba(59,158,229,0.16)',
  primaryBorder: 'rgba(59,158,229,0.30)',
  background: '#0E1113',
  card: '#181C1F',
  cardAlt: '#20262A',
  border: '#2A3136',
  text: '#ECEDEE',
  textMuted: '#A0A8AE',
  textFaint: '#727B81',
  onPrimary: '#0B1013',
  success: '#3DD68C',
  successTint: 'rgba(61,214,140,0.15)',
  warning: '#F2C04D',
  warningTint: 'rgba(242,192,77,0.15)',
  danger: '#FF6B7D',
  dangerTint: 'rgba(255,107,125,0.15)',
  info: '#5AA2F5',
  infoTint: 'rgba(90,162,245,0.15)',
  overlay: 'rgba(0,0,0,0.6)',
};

export const colorsByScheme = { light, dark };
export type ThemeColors = typeof light;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radii = { sm: 8, md: 12, lg: 16, pill: 999 };

export const typography = {
  h1: { fontSize: 26, fontWeight: '700' as const, lineHeight: 32 },
  h2: { fontSize: 20, fontWeight: '700' as const, lineHeight: 26 },
  title: { fontSize: 17, fontWeight: '600' as const, lineHeight: 22 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 21 },
  bodySemi: { fontSize: 15, fontWeight: '600' as const, lineHeight: 21 },
  caption: { fontSize: 13, fontWeight: '400' as const, lineHeight: 17 },
  captionSemi: { fontSize: 13, fontWeight: '600' as const, lineHeight: 17 },
};

// Badge vocabulary — fixed, from super-ht-design-system #2. Keep it small.
export type BadgeTone = 'success' | 'warning' | 'info' | 'special' | 'neutral';
