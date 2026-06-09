import { StyleSheet } from 'react-native'

export const COLORS = {
  // Primary
  black: '#0A0A0A',
  darkGray: '#121212',
  cardBg: '#1A1A1A',
  elevatedBg: '#222222',
  inputBg: '#1E1E1E',

  // Accent
  blue: '#3B82F6',
  blueLight: '#60A5FA',
  blueDark: '#2563EB',

  // Status
  success: '#22C55E',
  successLight: '#4ADE80',
  warning: '#F59E0B',
  warningLight: '#FBBF24',
  error: '#EF4444',
  errorLight: '#F87171',

  // Additional colors
  purple: '#8B5CF6',
  orange: '#F97316',
  yellow: '#EAB308',
  pink: '#EC4899',

  // Neutral
  white: '#FFFFFF',
  gray100: '#F5F5F5',
  gray200: '#E5E5E5',
  gray300: '#D4D4D4',
  gray400: '#A3A3A3',
  gray500: '#737373',
  gray600: '#525252',
  gray700: '#404040',
  gray800: '#262626',
  gray900: '#171717',

  // Chart colors
  chart1: '#3B82F6',
  chart2: '#22C55E',
  chart3: '#F59E0B',
  chart4: '#EF4444',
  chart5: '#8B5CF6',
  chart6: '#EC4899'
}

export const FONTS = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold'
}

export const SPACING = {
  xs: 4,
  sm: 8,
  smd: 12,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 40
}

export const BORDER_RADIUS = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  full: 9999
}

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8
  }
}

export const TYPOGRAPHY = {
  hero: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700' as const,
    letterSpacing: -0.5
  },
  h1: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700' as const,
    letterSpacing: -0.3
  },
  h2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600' as const,
    letterSpacing: -0.2
  },
  h3: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400' as const
  },
  bodySmall: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const
  },
  caption: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500' as const,
    letterSpacing: 0.5
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.3
  },
  score: {
    fontSize: 56,
    lineHeight: 64,
    fontWeight: '800' as const,
    letterSpacing: -2
  },
  largeNumber: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700' as const,
    letterSpacing: -1
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md
  },
  text: {
    color: COLORS.white,
    fontFamily: FONTS.regular
  },
  textSecondary: {
    color: COLORS.gray400,
    fontFamily: FONTS.regular
  },
  heading1: {
    fontSize: 32,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    lineHeight: 38
  },
  heading2: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    lineHeight: 29
  },
  heading3: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
    lineHeight: 22
  },
  body: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.white,
    lineHeight: 24
  },
  caption: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.gray400,
    lineHeight: 16
  },
  button: {
    backgroundColor: COLORS.blue,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonSecondary: {
    backgroundColor: COLORS.darkGray,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray700
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    color: COLORS.white,
    fontFamily: FONTS.regular,
    fontSize: 15
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center'
  }
})

export default styles
