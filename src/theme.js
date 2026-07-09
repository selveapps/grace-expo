// Grace design tokens — the single source of truth for the RN app.
// Mirrors the HTML design boards (Grace Journey / Grace Product).

export const colors = {
  paper: '#FBF9F4',
  ivory: '#F7F3EC',
  ivoryWarm: '#FDF6E4',
  sand: '#E7DDCD',
  sandLine: '#ECE3D4',
  cardBorder: '#E0D5C2',
  brass: '#B58A3F',
  brassDeep: '#8F6A2C',
  gold: '#E6CF94',
  ochre: '#D99B4C',
  espresso: '#3A2C22',
  espressoSoft: '#4A382C',
  night: '#2B2740',
  ink: '#3A2C22',
  textMuted: '#6B5D4E',
  textFaint: '#9A8C76',
  textFaintOnDark: '#CBB98F',
  onDark: '#F7F3EC',
  onDarkMuted: '#D8CBB8',
  danger: '#B06A4A',
  sepia: '#F3E9D6',
  sepiaLine: '#E4D6BC',
  white: '#FFFDF9',
};

// Font family keys map to the names loaded via @expo-google-fonts in App.js
export const fonts = {
  serif: 'CormorantGaramond_500Medium',
  serifSemi: 'CormorantGaramond_600SemiBold',
  serifItalic: 'CormorantGaramond_500Medium_Italic',
  sans: 'HankenGrotesk_400Regular',
  sansMed: 'HankenGrotesk_500Medium',
  sansSemi: 'HankenGrotesk_600SemiBold',
  sansBold: 'HankenGrotesk_700Bold',
};

export const radius = { sm: 12, md: 18, lg: 22, xl: 26, pill: 100 };

export const spacing = { xs: 6, sm: 10, md: 16, lg: 22, xl: 32 };

export const shadow = {
  card: {
    shadowColor: '#78644696',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 4,
  },
  lift: {
    shadowColor: '#3A2C22',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.22,
    shadowRadius: 30,
    elevation: 8,
  },
};

// Type ramp helpers
export const type = {
  displayXL: { fontFamily: fonts.serif, fontSize: 46, lineHeight: 50 },
  displayL: { fontFamily: fonts.serif, fontSize: 38, lineHeight: 42 },
  displayM: { fontFamily: fonts.serif, fontSize: 30, lineHeight: 34 },
  serifBody: { fontFamily: fonts.serif, fontSize: 22, lineHeight: 32 },
  italic: { fontFamily: fonts.serifItalic, fontSize: 20, lineHeight: 27 },
  body: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 24, color: colors.textMuted },
  label: { fontFamily: fonts.sansSemi, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', color: colors.brass },
  button: { fontFamily: fonts.sansSemi, fontSize: 17 },
};
