/**
 * Paleta de cores oficial do Verde Real 🌿
 * Verde-floresta como cor primária, com variação para tema claro e escuro.
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#17241D',
    background: '#F4F7F3',
    card: '#FFFFFF',
    tint: '#2F6B4F',
    tintSoft: '#E4F1E8',
    icon: '#5C6B62',
    tabIconDefault: '#8FA097',
    tabIconSelected: '#2F6B4F',
    border: '#E1E8E3',
    danger: '#D64545',
    accent: '#F2A93B',
  },
  dark: {
    text: '#ECF3EE',
    background: '#10221A',
    card: '#16301F',
    tint: '#7FD79A',
    tintSoft: '#1D3A2A',
    icon: '#9BB3A5',
    tabIconDefault: '#6E8A79',
    tabIconSelected: '#7FD79A',
    border: '#234433',
    danger: '#FF6B6B',
    accent: '#F2C463',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
