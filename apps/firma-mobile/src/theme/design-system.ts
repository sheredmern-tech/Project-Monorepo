/**
 * 🎨 FIRMA MOBILE - B&W DESIGN SYSTEM
 * Clean, Minimalist, Professional
 */

// ============================================================================
// BLACK & WHITE COLOR PALETTE
// ============================================================================

export const Colors = {
  // Primary B&W Scale
  black: '#000000',
  white: '#FFFFFF',

  // Grayscale (50-900)
  gray: {
    50: '#FAFAFA',   // Lightest background
    100: '#F5F5F5',  // Card backgrounds
    200: '#E5E5E5',  // Borders light
    300: '#D4D4D4',  // Dividers
    400: '#A3A3A3',  // Disabled text
    500: '#737373',  // Secondary text
    600: '#525252',  // Body text
    700: '#404040',  // Headings
    800: '#262626',  // Strong emphasis
    900: '#171717',  // Near black
  },

  // Semantic Colors (B&W only)
  background: {
    primary: '#FFFFFF',
    secondary: '#FAFAFA',
    tertiary: '#F5F5F5',
  },

  text: {
    primary: '#000000',
    secondary: '#525252',
    tertiary: '#737373',
    disabled: '#A3A3A3',
    inverted: '#FFFFFF',
  },

  border: {
    light: '#E5E5E5',
    medium: '#D4D4D4',
    dark: '#A3A3A3',
  },

  // Status (B&W variants)
  status: {
    active: '#000000',      // Black for active
    pending: '#737373',     // Gray for pending
    completed: '#404040',   // Dark gray for completed
    cancelled: '#A3A3A3',   // Light gray for cancelled
  },

  // Phase Colors (B&W gradient)
  phase: {
    0: '#A3A3A3', // Phase 0: Light gray
    1: '#737373', // Phase 1: Medium gray
    2: '#525252', // Phase 2: Dark gray
    3: '#000000', // Phase 3: Black (completed)
  },
};

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const Typography = {
  // Font Sizes
  size: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 36,
  },

  // Font Weights
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },

  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// ============================================================================
// SPACING
// ============================================================================

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
};

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const Radius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

// ============================================================================
// SHADOWS (B&W optimized)
// ============================================================================

export const Shadows = {
  none: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },

  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
};

// ============================================================================
// ICON SIZES
// ============================================================================

export const IconSize = {
  xs: 16,
  sm: 20,
  base: 24,
  md: 28,
  lg: 32,
  xl: 40,
  '2xl': 48,
  '3xl': 56,
  '4xl': 64,
};

// ============================================================================
// COMPONENT STYLES
// ============================================================================

export const Components = {
  // Card Style
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.base,
    padding: Spacing.base,
    ...Shadows.base,
  },

  // Input Style
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: Radius.base,
    padding: Spacing.md,
    fontSize: Typography.size.base,
    color: Colors.text.primary,
  },

  // Button Primary (Black)
  buttonPrimary: {
    backgroundColor: Colors.black,
    borderRadius: Radius.base,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  // Button Secondary (White with border)
  buttonSecondary: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.black,
    borderRadius: Radius.base,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  // Badge
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: Colors.gray[100],
  },
};

// ============================================================================
// UTILITIES
// ============================================================================

export const Utils = {
  // Get phase color
  getPhaseColor: (phase: number): string => {
    return Colors.phase[phase as keyof typeof Colors.phase] || Colors.gray[400];
  },

  // Get status color
  getStatusColor: (status: string): string => {
    const statusMap: Record<string, string> = {
      active: Colors.status.active,
      pending: Colors.status.pending,
      completed: Colors.status.completed,
      cancelled: Colors.status.cancelled,
    };
    return statusMap[status] || Colors.gray[500];
  },

  // Get contrast text color (for backgrounds)
  getContrastColor: (bgColor: string): string => {
    // For B&W, simple rule: dark bg = white text, light bg = black text
    const darkColors = [Colors.black, Colors.gray[700], Colors.gray[800], Colors.gray[900]];
    return darkColors.includes(bgColor) ? Colors.white : Colors.black;
  },
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  Colors,
  Typography,
  Spacing,
  Radius,
  Shadows,
  IconSize,
  Components,
  Utils,
};
