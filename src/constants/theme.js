// ========================================
// CENTRALIZED THEME — Recharge99 Brand Theme
// Matches reference image: Blue header, Orange+Green wallet, colorful icons
// ========================================

export const THEME_COLORS = {
  // Primary Blue (headers, nav, main accent)
  primary: '#1756C5',   // Deep royal blue (header dominant)
  primaryLight: '#2979FF',   // Bright blue
  primaryDark: '#0D3A8A',   // Dark blue

  // Orange accent (buttons, wallet card 2)
  orange: '#FF7D00',
  orangeDark: '#E55A00',
  orangeLight: '#FFB347',

  // Green accent (wallet card 1, success)
  green: '#00C853',
  greenDark: '#1B8A46',
  greenLight: '#5CDB95',

  // Gold / Yellow (refer banner)
  gold: '#F5A623',
  goldLight: '#FFD95A',
  goldDark: '#D48B00',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  grey: '#9E9E9E',
  greyLight: '#F5F7FA',
  greyDark: '#424242',
  textPrimary: '#1A1A2E',
  textSecondary: '#555555',
  textMuted: '#999999',

  // Status
  warning: '#FF3D3D',
  pending: '#F5A623',
  success: '#00C853',
  successDark: '#1B8A46',

  // Nav
  blueNav: '#1756C5',
};

// Gradient Presets (for react-native-linear-gradient)
export const GRADIENTS = {
  // Blue header gradient — rich royal blue like reference image
  header: ['#1756C5', '#1E3A8A', '#0D3A8A'],

  // Orange CTA / refer-earn button
  orangeBtn: ['#FF9500', '#FF6B00'],

  // Bottom nav — clean white
  nav: ['#FFFFFF', '#F0F4FF'],

  // Light blue background for refer section
  lightBg: ['#D6E4FF', '#EEF4FF'],

  // Refer & Earn banner — gold/yellow like reference image
  referBg: ['#FFF0A0', '#FFD95A', '#F5A623'],

  // ---- Icon Gradients (4 rotating colors as seen in the image) ----
  // Blue (Mobile Recharge)
  blue_grad: ['#4285F4', '#1756C5'],
  // Orange (DTH / Bill)
  orange_grad: ['#FF9500', '#FF6B00'],
  // Green (Data Card / Wallet)
  green_grad: ['#00C853', '#1B8A46'],
  // Teal (AEPS / Offers)
  teal_grad: ['#00BCD4', '#0097A7'],
  // Purple (Reports)
  purple_grad: ['#9C27B0', '#6A1B9A'],
  // Red (Services)
  red_grad: ['#FF5252', '#D32F2F'],
};

// Shadow presets
export const SHADOWS = {
  card: {
    shadowColor: '#1756C5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  button: {
    shadowColor: '#1756C5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  nav: {
    shadowColor: '#1756C5',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
};
