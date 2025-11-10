'use client'

import { createTheme, PaletteMode } from '@mui/material/styles'
import { trTR } from '@mui/material/locale'
import { trTR as dataGridTrTR } from '@mui/x-data-grid/locales'
import { trTR as datePickersTrTR } from '@mui/x-date-pickers/locales'

export const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,
    primary: {
      main: '#025691', // Mavi
      light: '#0373C4',
      dark: '#002C50', // Lacivert tonu
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#002C51', // Koyu lacivert
      light: '#004080',
      dark: '#001A30',
      contrastText: '#ffffff',
    },
    background: {
      default: mode === 'light' ? '#f5f7fa' : '#0C0B1B', // Koyu morumsu lacivert
      paper: mode === 'light' ? '#ffffff' : '#1a1927',
    },
    text: {
      primary: mode === 'light' ? '#000000' : '#ffffff',
      secondary: mode === 'light' ? '#8B929C' : '#B8BCC4',
    },
    divider: mode === 'light' ? 'rgba(0, 44, 80, 0.12)' : 'rgba(255, 255, 255, 0.12)',
  },
  typography: {
    fontSize: 14,
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.1rem',
      fontWeight: 600,
      '@media (max-width:600px)': {
        fontSize: '1.8rem',
      },
    },
    h2: {
      fontSize: '1.8rem',
      fontWeight: 600,
      '@media (max-width:600px)': {
        fontSize: '1.55rem',
      },
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      '@media (max-width:600px)': {
        fontSize: '1.35rem',
      },
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 500,
      '@media (max-width:600px)': {
        fontSize: '1.15rem',
      },
    },
    h6: {
      fontSize: '0.95rem',
      fontWeight: 500,
      '@media (max-width:600px)': {
        fontSize: '0.85rem',
      },
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none' as const,
        },
      },
    },
  },
})

export const createAppTheme = (mode: PaletteMode) => {
  return createTheme(
    getDesignTokens(mode),
    trTR,
    dataGridTrTR,
    datePickersTrTR
  )
}
