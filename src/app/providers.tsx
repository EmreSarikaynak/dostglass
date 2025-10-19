'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import { PaletteMode } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter'
import { createAppTheme } from '@/theme'

interface ColorModeContextType {
  toggleColorMode: () => void
  mode: PaletteMode
}

export const ColorModeContext = createContext<ColorModeContextType>({
  toggleColorMode: () => {},
  mode: 'light',
})

export const useColorMode = () => useContext(ColorModeContext)

export function Providers({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<PaletteMode>('light')
  const [mounted, setMounted] = useState(false)

  // Component mount olduktan sonra localStorage'dan oku
  useEffect(() => {
    setMounted(true)
    const savedMode = localStorage.getItem('themeMode') as PaletteMode | null
    
    if (savedMode) {
      setMode(savedMode)
    } else {
      // Sistem tercihini kontrol et
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setMode(prefersDark ? 'dark' : 'light')
    }
  }, [])

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light'
          localStorage.setItem('themeMode', newMode)
          return newMode
        })
      },
      mode,
    }),
    [mode]
  )

  const theme = useMemo(() => createAppTheme(mode), [mode])

  // Hydration hatalarını önlemek için mount olana kadar loading göster
  if (!mounted) {
    return null
  }

  return (
    <AppRouterCacheProvider>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </ColorModeContext.Provider>
    </AppRouterCacheProvider>
  )
}

