/**
 * Typography Tokens
 * Générés depuis Figma - AS Common UI Kit
 */

// Font Families
export const fontFamilies = {
  inter: "'Inter', sans-serif",
  robotoMono: "'Roboto Mono', monospace",
} as const;

// Font Weights
export const fontWeights = {
  light: 300,
  regular: 400,
  medium: 500,
  bold: 700,
} as const;

// Font Sizes (en pixels)
export const fontSizes = {
  xs: '11px',
  sm: '12px',
  md: '14px',
  lg: '16px',
  xl: '18px',
  '2xl': '20px',
  '3xl': '24px',
  '4xl': '32px',
  '5xl': '36px',
  '6xl': '48px',
  '7xl': '56px',
} as const;

// Line Heights
export const lineHeights = {
  xs: '20px',
  sm: '24px',
  md: '28px',
  lg: '32px',
  xl: '40px',
  '2xl': '48px',
  '3xl': '56px',
  '4xl': '72px',
  '5xl': '80px',
} as const;

// Text Styles - Headings
export const headings = {
  h1: {
    fontFamily: fontFamilies.inter,
    fontSize: fontSizes['7xl'], // 56px
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights['5xl'], // 80px
  },
  subheading1: {
    fontFamily: fontFamilies.inter,
    fontSize: fontSizes['7xl'], // 56px
    fontWeight: fontWeights.light,
    lineHeight: lineHeights['5xl'], // 80px
  },
  h2: {
    fontFamily: fontFamilies.inter,
    fontSize: fontSizes['6xl'], // 48px
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights['4xl'], // 72px
  },
  subheading2: {
    fontFamily: fontFamilies.inter,
    fontSize: fontSizes['6xl'], // 48px
    fontWeight: fontWeights.light,
    lineHeight: lineHeights['4xl'], // 72px
  },
  h3: {
    fontFamily: fontFamilies.inter,
    fontSize: fontSizes['5xl'], // 36px
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights['3xl'], // 56px
  },
  subheading3: {
    fontFamily: fontFamilies.inter,
    fontSize: fontSizes['5xl'], // 36px
    fontWeight: fontWeights.light,
    lineHeight: lineHeights['3xl'], // 56px
  },
  h4: {
    fontFamily: fontFamilies.inter,
    fontSize: fontSizes['4xl'], // 32px
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights['2xl'], // 48px
  },
  subheading4: {
    fontFamily: fontFamilies.inter,
    fontSize: fontSizes['4xl'], // 32px
    fontWeight: fontWeights.light,
    lineHeight: lineHeights['2xl'], // 48px
  },
  h5: {
    fontFamily: fontFamilies.inter,
    fontSize: fontSizes['3xl'], // 24px
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.xl, // 40px
  },
  subheading5: {
    fontFamily: fontFamilies.inter,
    fontSize: fontSizes['3xl'], // 24px
    fontWeight: fontWeights.light,
    lineHeight: lineHeights.xl, // 40px
  },
  h6: {
    fontFamily: fontFamilies.inter,
    fontSize: fontSizes['2xl'], // 20px
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.lg, // 32px
  },
  subheading6: {
    fontFamily: fontFamilies.inter,
    fontSize: fontSizes['2xl'], // 20px
    fontWeight: fontWeights.light,
    lineHeight: lineHeights.lg, // 32px
  },
} as const;

// Text Styles - Labels
export const labels = {
  boldL: {
    fontFamily: fontFamilies.inter,
    fontSize: fontSizes.xl, // 18px
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.lg, // 32px
  },
  mediumL: {
    fontFamily: fontFamilies.inter,
    fontSize: fontSizes.xl, // 18px
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.lg, // 32px
  },
  regularL: {
    fontFamily: fontFamilies.inter,
    fontSize: fontSizes.xl, // 18px
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights.lg, // 32px
  },
  lightL: {
    fontFamily: fontFamilies.inter,
    fontSize: fontSizes.xl, // 18px
    fontWeight: fontWeights.light,
    lineHeight: lineHeights.lg, // 32px
  },
  boldM: {
    fontFamily: fontFamilies.inter,
    fontSize: fontSizes.lg, // 16px
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.sm, // 24px
  },
  mediumM: {
    fontFamily: fontFamilies.inter,
    fontSize: fontSizes.lg, // 16px
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.sm, // 24px
  },
  regularM: {
    fontFamily: fontFamilies.inter,
    fontSize: fontSizes.lg, // 16px
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights.sm, // 24px
  },
  lightM: {
    fontFamily: fontFamilies.inter,
    fontSize: fontSizes.lg, // 16px
    fontWeight: fontWeights.light,
    lineHeight: lineHeights.sm, // 24px
  },
  boldS: {
    fontFamily: fontFamilies.inter,
    fontSize: fontSizes.md, // 14px
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.xs, // 20px
  },
  mediumS: {
    fontFamily: fontFamilies.inter,
    fontSize: fontSizes.md, // 14px
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.xs, // 20px
  },
  regularS: {
    fontFamily: fontFamilies.inter,
    fontSize: fontSizes.md, // 14px
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights.xs, // 20px
  },
  lightS: {
    fontFamily: fontFamilies.inter,
    fontSize: fontSizes.md, // 14px
    fontWeight: fontWeights.light,
    lineHeight: lineHeights.xs, // 20px
  },
  boldXS: {
    fontFamily: fontFamilies.inter,
    fontSize: fontSizes.sm, // 12px
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.xs, // 20px
  },
  mediumXS: {
    fontFamily: fontFamilies.inter,
    fontSize: fontSizes.sm, // 12px
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.xs, // 20px
  },
  regularXS: {
    fontFamily: fontFamilies.inter,
    fontSize: fontSizes.sm, // 12px
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights.xs, // 20px
  },
  lightXS: {
    fontFamily: fontFamilies.inter,
    fontSize: fontSizes.sm, // 12px
    fontWeight: fontWeights.light,
    lineHeight: lineHeights.xs, // 20px
  },
} as const;

// Text Styles - Legends
export const legends = {
  bold: {
    fontFamily: fontFamilies.inter,
    fontSize: fontSizes.xs, // 11px
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.xs, // 20px
  },
  medium: {
    fontFamily: fontFamilies.inter,
    fontSize: fontSizes.xs, // 11px
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.xs, // 20px
  },
} as const;

// Text Styles - System (Monospace)
export const system = {
  l: {
    fontFamily: fontFamilies.robotoMono,
    fontSize: fontSizes.xl, // 18px
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights.md, // 28px
  },
  m: {
    fontFamily: fontFamilies.robotoMono,
    fontSize: fontSizes.lg, // 16px
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights.sm, // 24px
  },
  s: {
    fontFamily: fontFamilies.robotoMono,
    fontSize: fontSizes.md, // 14px
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights.xs, // 20px
  },
  xs: {
    fontFamily: fontFamilies.robotoMono,
    fontSize: fontSizes.sm, // 12px
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights.xs, // 20px
  },
} as const;

// Export all typography tokens
export const typography = {
  fontFamilies,
  fontWeights,
  fontSizes,
  lineHeights,
  headings,
  labels,
  legends,
  system,
} as const;

