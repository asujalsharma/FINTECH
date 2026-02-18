// ========================================
// CENTRALIZED THEME — Pure Orange Gradient
// Orange everywhere: headers, CTAs, nav, accents
// ========================================

export const THEME_COLORS = {
  // Primary Orange (headers, nav, buttons, accents) -> Now Blue Theme
  orange: '#00a7fbff',       // Primary Blue
  orangeDark: '#2d2df3ff',   // Darker Blue
  orangeDeep: '#3636e4ff',   // Deep Blue
  orangeLight: '#42A5F5',  // Light Blue
  orangePale: '#E3F2FD',   // Pale Blue
  orangeVibrant: '#2962FF',// Vibrant Blue
  blueNav: '#4171ffff',    // Bottom Nav Blue

  // Gold accent
  gold: '#FFB300',
  goldLight: '#FFD54F',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  grey: '#9E9E9E',
  greyLight: '#F5F5F5',
  greyDark: '#424242',
  textPrimary: '#1A1A2E',
  textSecondary: '#555555',
  textMuted: '#999999',

  // Status
  warning: '#FF5252',
  pending: '#F4B400',
  success: '#28B463',
  successDark: '#2E7D32',
};

// Gradient Presets (for react-native-linear-gradient)
export const GRADIENTS = {
  // Orange header gradient (Weighted: Blue -> Green -> Orange -> Dark Orange)
  header: ['#004ffbff', '#22be63ff', '#ffa143ff', '#e67700ff'],
  // Orange CTA gradient (Weighted: Blue -> Green -> Orange -> Dark Orange)
  orangeBtn: ['#004ffbff', '#22be63ff', '#ffa143ff', '#e67700ff'],
  // Bottom nav
  nav: ['#ffffff', '#ffffff'],
  // Light orange background -> Now Light Blue
  lightBg: ['#E3F2FD', '#FFFFFF'],
  
  // Icon Gradients - using EXACT theme colors
  blue: ['#42A5F5', '#1976D2'], // low_purple -> primary
  magenta: ['#AB47BC', '#7B1FA2'], 
  
  // Blue: low_purple -> primary
  blue_grad: ['#42A5F5', '#1565C0'], 
  // Orange: orangeLight -> orangeDeep
  orange_grad: ['#FF9800', '#F57C00'],
  // Green: success -> successDark
  green_grad: ['#28B463', '#2E7D32'],
  // Yellow: gold -> pending
  yellow_grad: ['#FFD54F', '#F4B400'], 
  // Red: warning -> darker red
  red_grad: ['#FF5252', '#D32F2F'],

};

// Shadow presets
export const SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  button: {
    shadowColor: '#0040ffff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  nav: {
    shadowColor: '#0040ffff',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
};
