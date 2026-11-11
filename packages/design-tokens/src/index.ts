import tokens from './tokens.json';

export const CookiiTokens = tokens;

export type ThemeMode = 'light' | 'dark';

export const getThemeColors = (mode: ThemeMode = 'light') => {
  return tokens.colors[mode];
};

export const Spacing = tokens.spacing;
export const Radii = tokens.radii;
export const Typography = tokens.typography;
export const Shadows = tokens.shadows;
export const Motion = tokens.motion;

export default tokens;

