export interface ThemeColors {
  primary: string
  secondary: string
  background: string
  cardBackground: string
  text: string
  danger: string

  secondaryBackground: string
  secondaryText: string
  border: string

  outlineBackground: string
  ghostBackground: string


  iconActive: string
  iconInactive: string
  iconHover: string
  activeBackground: string
  activeBorder: string
}

export interface ThemeSpacing {
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
  xxl: string
}

export interface ThemeTypography {
  fontFamily: string
  heading: string
  body: string
  small: string
}

export interface Theme {
  colors: ThemeColors
  spacing: ThemeSpacing
  typography: ThemeTypography
}
