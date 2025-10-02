/**
 * Design System Tokens for 301st RRIBn Personnel Management System
 * Military-themed design system with Navy + Yellow color scheme
 */

export const colors = {
  // Primary Palette - Military Navy & Gold
  primary: {
    navy: {
      950: '#050B14',
      900: '#0A1628',
      800: '#1a2332',
      700: '#2a3342',
      600: '#3a4352',
    },
    yellow: {
      600: '#D97706',
      500: '#F59E0B',
      400: '#FBBF24',
      300: '#FCD34D',
      200: '#FDE68A',
    },
  },

  // Semantic Colors
  semantic: {
    success: {
      light: '#D1FAE5',
      DEFAULT: '#10B981',
      dark: '#047857',
    },
    warning: {
      light: '#FEF3C7',
      DEFAULT: '#F59E0B',
      dark: '#D97706',
    },
    error: {
      light: '#FEE2E2',
      DEFAULT: '#EF4444',
      dark: '#DC2626',
    },
    info: {
      light: '#DBEAFE',
      DEFAULT: '#3B82F6',
      dark: '#2563EB',
    },
  },

  // Neutrals
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
};

export const shadows = {
  // Standard shadows
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',

  // Military-themed shadows
  military: '0 4px 12px rgb(10 22 40 / 0.15)',
  'military-lg': '0 8px 24px rgb(10 22 40 / 0.2)',
  'military-inner': 'inset 0 2px 4px 0 rgb(10 22 40 / 0.06)',

  // Colored shadows
  'yellow-glow': '0 0 20px rgb(245 158 11 / 0.3)',
  'yellow-glow-lg': '0 0 40px rgb(245 158 11 / 0.4)',
};

export const borderRadius = {
  none: '0',
  sm: '0.25rem',    // 4px
  base: '0.5rem',   // 8px
  md: '0.75rem',    // 12px
  lg: '1rem',       // 16px
  xl: '1.5rem',     // 24px
  '2xl': '2rem',    // 32px
  full: '9999px',
};

export const spacing = {
  // 4px grid system
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
};

export const typography = {
  fontFamily: {
    sans: 'var(--font-geist-sans)',
    mono: 'var(--font-geist-mono)',
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
};

export const transitions = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  timing: {
    ease: 'ease',
    'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
    'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
    'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  'modal-backdrop': 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};

// Gradient presets
export const gradients = {
  // Navy gradients
  'navy-subtle': 'linear-gradient(135deg, #0A1628 0%, #1a2332 100%)',
  'navy-deep': 'linear-gradient(135deg, #050B14 0%, #0A1628 100%)',

  // Yellow gradients
  'yellow-warm': 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
  'yellow-gold': 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',

  // Military themed
  'military-command': 'linear-gradient(135deg, #0A1628 0%, #1a2332 50%, #2a3342 100%)',
  'military-accent': 'linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%)',

  // Background gradients
  'bg-subtle': 'linear-gradient(to bottom right, #F9FAFB 0%, #FFFFFF 50%, #F3F4F6 100%)',
  'bg-navy-overlay': 'linear-gradient(to bottom, rgba(10, 22, 40, 0.4) 0%, rgba(10, 22, 40, 0.5) 50%, rgba(10, 22, 40, 0.6) 100%)',
};

// Animation keyframes
export const animations = {
  fadeIn: {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' },
  },
  fadeOut: {
    '0%': { opacity: '1' },
    '100%': { opacity: '0' },
  },
  slideInUp: {
    '0%': { transform: 'translateY(10px)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' },
  },
  slideInDown: {
    '0%': { transform: 'translateY(-10px)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' },
  },
  scaleIn: {
    '0%': { transform: 'scale(0.95)', opacity: '0' },
    '100%': { transform: 'scale(1)', opacity: '1' },
  },
  pulse: {
    '0%, 100%': { opacity: '1' },
    '50%': { opacity: '0.5' },
  },
  shimmer: {
    '0%': { backgroundPosition: '-200% 0' },
    '100%': { backgroundPosition: '200% 0' },
  },
};
