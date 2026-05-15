'use client'

import { useEffect } from 'react'
import { themeToCssVars, settingsToTheme } from '@/lib/theme'
import type { Database } from '@/lib/supabase/database.types'

type OrgSettings = Database['public']['Tables']['organization_settings']['Row']

interface SalonThemeProps {
  settings: Partial<OrgSettings> | null
  children: React.ReactNode
}

export function SalonTheme({ settings, children }: SalonThemeProps) {
  const theme = settingsToTheme(settings ?? {})
  const cssVars = themeToCssVars(theme)

  useEffect(() => {
    const root = document.documentElement
    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
    return () => {
      Object.keys(cssVars).forEach((key) => root.style.removeProperty(key))
    }
  }, [cssVars])

  return (
    <div
      style={cssVars as React.CSSProperties}
      data-button-style={theme.buttonStyle}
      className="min-h-screen"
    >
      {children}
    </div>
  )
}
