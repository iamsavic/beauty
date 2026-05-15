import type { Database } from '../supabase/database.types'

type OrgSettings = Database['public']['Tables']['organization_settings']['Row']

export interface ThemeConfig {
  primaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  fontFamily: string
  buttonStyle: 'rounded' | 'sharp' | 'pill'
}

export const DEFAULT_THEME: ThemeConfig = {
  primaryColor: '#e91e8c',
  accentColor: '#f472b6',
  backgroundColor: '#ffffff',
  textColor: '#1a1a1a',
  fontFamily: 'Inter',
  buttonStyle: 'rounded',
}

export function settingsToTheme(settings: Partial<OrgSettings>): ThemeConfig {
  return {
    primaryColor: settings.primary_color ?? DEFAULT_THEME.primaryColor,
    accentColor: settings.accent_color ?? DEFAULT_THEME.accentColor,
    backgroundColor: settings.background_color ?? DEFAULT_THEME.backgroundColor,
    textColor: settings.text_color ?? DEFAULT_THEME.textColor,
    fontFamily: settings.font_family ?? DEFAULT_THEME.fontFamily,
    buttonStyle: (settings.button_style ?? DEFAULT_THEME.buttonStyle) as ThemeConfig['buttonStyle'],
  }
}

export function themeToCssVars(theme: ThemeConfig): Record<string, string> {
  return {
    '--color-primary': theme.primaryColor,
    '--color-accent': theme.accentColor,
    '--color-background': theme.backgroundColor,
    '--color-text': theme.textColor,
    '--font-family': theme.fontFamily,
  }
}

export function buttonRadiusClass(style: ThemeConfig['buttonStyle']): string {
  return {
    rounded: 'rounded-lg',
    sharp: 'rounded-none',
    pill: 'rounded-full',
  }[style]
}

export function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return '233 30 140'
  return `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`
}
