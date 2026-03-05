/**
 * Project Echo Design System — Light Glassmorphism
 *
 * Single source of truth for all visual tokens.
 * Reference this when building components or porting to native platforms.
 */

export const tokens = {
  colors: {
    // Light backgrounds
    bgPrimary: '#f0f2f5',
    bgSecondary: '#f8f9fb',
    bgTertiary: '#ffffff',

    // Glassmorphism
    glassBg: 'rgba(255, 255, 255, 0.6)',
    glassBgStrong: 'rgba(255, 255, 255, 0.8)',
    glassBorder: 'rgba(255, 255, 255, 0.7)',
    glassHighlight: 'rgba(255, 255, 255, 0.9)',
    glassShadow: 'rgba(139, 92, 246, 0.08)',

    // Brand purple
    purple50: '#f5f3ff',
    purple100: '#ede9fe',
    purple200: '#ddd6fe',
    purple300: '#c4b5fd',
    purple400: '#a78bfa',
    purple500: '#8b5cf6',
    purple600: '#7c3aed',
    purple700: '#6d28d9',
    purple800: '#5b21b6',
    purple900: '#4c1d95',

    // Text (dark on light)
    textPrimary: '#1a1a2e',
    textSecondary: '#4a4a68',
    textMuted: '#8a8aa3',
    textOnPurple: '#ffffff',

    // Semantic
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
  },

  gradients: {
    primary: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
    soft: 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
    subtle: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
  },

  typography: {
    fontFamily: "'Poppins', sans-serif",
    weights: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '2rem',
      '4xl': '2.5rem',
    },
  },

  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },

  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    full: '9999px',
  },

  shadows: {
    soft: '0 2px 8px rgba(0, 0, 0, 0.06)',
    card: '0 4px 16px rgba(0, 0, 0, 0.08)',
    elevated: '0 8px 32px rgba(0, 0, 0, 0.1)',
    glow: '0 0 20px rgba(139, 92, 246, 0.15)',
    glowStrong: '0 0 40px rgba(139, 92, 246, 0.25)',
    neumorphic: '-4px -4px 8px #ffffff, 4px 4px 8px rgba(139, 92, 246, 0.15)',
    neumorphicHover: '-6px -6px 12px #ffffff, 6px 6px 16px rgba(139, 92, 246, 0.2)',
    neumorphicPressed: 'inset -2px -2px 4px #ffffff, inset 2px 2px 4px rgba(139, 92, 246, 0.2)',
  },

  animation: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  blur: {
    glass: '12px',
    glassStrong: '20px',
  },
} as const;

export type DesignTokens = typeof tokens;
