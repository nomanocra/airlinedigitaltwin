/**
 * Color Tokens
 * Générés depuis Figma - AS Common UI Kit
 * 
 * Structure :
 * - Primitives : Couleurs de base (Sea Blue, Sky Blue, Cool Grey, Red, Green, Yellow, White, Black)
 * - Semantic : Couleurs sémantiques qui référencent les primitives
 */

// ============================================================================
// PRIMITIVE COLORS
// ============================================================================

export const seaBlue = {
  100: '#011333',
  90: '#00205b',
  80: '#002d80',
  70: '#063b9e',
  60: '#255fcc',
  50: '#638ee0',
  40: '#86a8e9',
  30: '#b3cbf8',
  20: '#cfddf8',
  10: '#e5ecf7',
} as const;

export const skyBlue = {
  100: '#004066',
  90: '#005587',
  80: '#0b78b8',
  70: '#219ae1',
  60: '#3cb7ff',
  50: '#5fc3ff',
  40: '#82d1ff',
  30: '#a5deff',
  20: '#c8eaff',
  10: '#ebf8ff',
} as const;

export const coolGrey = {
  100: '#14171d',
  90: '#282e3a',
  80: '#3c4657',
  70: '#505d74',
  60: '#63728a',
  50: '#919cb0',
  40: '#b3bbc8',
  30: '#ced5dd',
  20: '#e0e3e9',
  10: '#eff1f4',
} as const;

export const warmGrey = {
  100: '#1a1a1a',
  90: '#333333',
  80: '#585858',
  70: '#828282',
  60: '#a3a3a3',
  50: '#c5c5c5',
  40: '#d4d4d4',
  30: '#e6e6e6',
  20: '#f1f1f1',
  10: '#fafafa',
} as const;

export const red = {
  100: '#6a0014',
  90: '#92001c',
  80: '#bb0023',
  70: '#e4002b',
  60: '#f23346',
  50: '#f86471',
  40: '#ff8998',
  30: '#ffa2b0',
  20: '#fdbac5',
  10: '#fad1d8',
} as const;

export const green = {
  100: '#005e3e',
  90: '#036e4a',
  80: '#08875b',
  70: '#18a272',
  60: '#2cbc89',
  50: '#2fd39a',
  40: '#27e7a7',
  30: '#5ef7c4',
  20: '#9cfcda',
  10: '#d1ffef',
} as const;

export const yellow = {
  100: '#554000',
  90: '#775900',
  80: '#a27900',
  70: '#bb8e09',
  60: '#ddab17',
  50: '#ffc929',
  40: '#ffd557',
  30: '#ffe085',
  20: '#ffecb3',
  10: '#fff9e5',
} as const;

export const white = '#ffffff';
export const black = '#000000';

// ============================================================================
// SEMANTIC COLORS
// ============================================================================

/**
 * Primary Colors
 * Références : Sea Blue
 */
export const primary = {
  default: seaBlue[70], // #063b9e
  hover: seaBlue[60], // #255fcc
  active: seaBlue[80], // #002d80
  tHover: 'rgba(0, 45, 128, 0.1)', // Transparent hover (Sea Blue 80 avec 10% opacity)
  tActive: 'rgba(0, 45, 128, 0.2)', // Transparent active (Sea Blue 80 avec 20% opacity)
} as const;

/**
 * Text Colors
 * Références : Cool Grey, White, Sea Blue
 */
export const text = {
  main: coolGrey[100], // #14171d
  secondary: coolGrey[60], // #63728a
  tertiary: coolGrey[40], // #b3bbc8
  negative: white, // #ffffff
  corporate: seaBlue[90], // #00205b
} as const;

/**
 * Background Colors
 * Références : White, Warm Grey, Cool Grey
 */
export const background = {
  main: white, // #ffffff
  secondary: warmGrey[10], // #fafafa
  tertiary: coolGrey[10], // #eff1f4
  corporate: seaBlue[90], // #00205b
} as const;

/**
 * Border Colors
 * Références : Cool Grey, White
 */
export const border = {
  strong: coolGrey[70], // #505d74
  default: coolGrey[50], // #919cb0
  moderate: coolGrey[30], // #ced5dd
  minimal: coolGrey[10], // #eff1f4
  white: white, // #ffffff
} as const;

/**
 * Feedback Colors
 * Références : Green, Red, Yellow
 */

// Success - Références Green
export const feedback = {
  success: {
    default: green[80], // #08875b
    hover: green[70], // #18a272
    active: green[90], // #036e4a
    background: green[10], // #d1ffef
    tBackground: 'rgba(8, 135, 91, 0.1)', // Green 80 avec 10% opacity
  },
  // Error - Références Red
  error: {
    default: red[70], // #e4002b
    hover: red[60], // #f23346
    active: red[80], // #bb0023
    background: red[10], // #fad1d8
    tBackground: 'rgba(228, 0, 43, 0.1)', // Red 70 avec 10% opacity
  },
  // Warning - Références Yellow
  warning: {
    default: yellow[50], // #ffc929
    hover: yellow[40], // #ffd557
    active: yellow[60], // #ddab17
    background: yellow[10], // #fff9e5
    tBackground: 'rgba(255, 201, 41, 0.1)', // Yellow 50 avec 10% opacity
  },
} as const;

// ============================================================================
// EXPORT ALL COLORS
// ============================================================================

export const colors = {
  // Primitives
  seaBlue,
  skyBlue,
  coolGrey,
  warmGrey,
  red,
  green,
  yellow,
  white,
  black,
  // Semantic
  primary,
  text,
  background,
  border,
  feedback,
} as const;
