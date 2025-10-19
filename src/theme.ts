'use client'

import { createTheme } from '@mui/material/styles'
import { trTR } from '@mui/material/locale'
import { trTR as dataGridTrTR } from '@mui/x-data-grid/locales'
import { trTR as datePickersTrTR } from '@mui/x-date-pickers/locales'

const theme = createTheme(
  {
    palette: {
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
    typography: {
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
        fontSize: '2.5rem',
        '@media (max-width:600px)': {
          fontSize: '2rem',
        },
      },
      h2: {
        fontSize: '2rem',
        '@media (max-width:600px)': {
          fontSize: '1.75rem',
        },
      },
      h3: {
        fontSize: '1.75rem',
        '@media (max-width:600px)': {
          fontSize: '1.5rem',
        },
      },
      h4: {
        fontSize: '1.5rem',
        '@media (max-width:600px)': {
          fontSize: '1.25rem',
        },
      },
      h5: {
        fontSize: '1.25rem',
        '@media (max-width:600px)': {
          fontSize: '1.1rem',
        },
      },
      h6: {
        fontSize: '1rem',
        '@media (max-width:600px)': {
          fontSize: '0.9rem',
        },
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
        },
      },
    },
  },
  trTR,
  dataGridTrTR,
  datePickersTrTR
)

export default theme

