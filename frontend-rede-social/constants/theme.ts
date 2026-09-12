export const Colors = {
  light: {
    text: '#1e2b2b',
    background: '#faf4eb',
    card: '#ffffff',
    cardAlt: '#e4decc',
    tint: '#407a6c',
    tintSoft: '#d8e6e1',
    secondary: '#305750',
    icon: '#6f9287',
    tabIconDefault: '#B5CEC6',
    tabIconSelected: '#407a6c',
    border: 'rgba(48, 87, 80, 0.25)',
    danger: '#c62828',
    accent: '#c9a959',
    shadow: '#407a6c',
  },
  dark: {
    text: '#faf4eb',
    background: '#163a3a',
    card: '#1f4a45',
    cardAlt: '#25423c',
    tint: '#c9a959',
    tintSoft: '#25423c',
    secondary: '#d8e6e1',
    icon: '#B5CEC6',
    tabIconDefault: '#6f9287',
    tabIconSelected: '#c9a959',
    border: 'rgba(216, 230, 225, 0.2)',
    danger: '#ff6b6b',
    accent: '#c9a959',
    shadow: '#c9a959',
  },
};

// O site usa cantos 100% retos (--radius-sharp: 0px) — nada de arredondado
export const Radius = 0;

export const Fonts = {
  regular: 'Inter_400Regular',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  mono: 'SpaceMono_400Regular',
};

// Cores FIXAS da marca — não mudam com o tema claro/escuro do celular.
// Usadas em telas que replicam um trecho do site 1:1 (o site não tem modo escuro).
export const Marca = {
  heroBg: '#305750',
  heroText: '#faf4eb',
  heroTagText: '#d8e6e1',
  formBg: '#ffffff',
  formText: '#1e2b2b',
  formBorder: 'rgba(48, 87, 80, 0.25)',
  formIcon: '#6f9287',
  formSecondary: '#305750',
  tint: '#407a6c',
  accent: '#c9a959',
  danger: '#c62828',
};