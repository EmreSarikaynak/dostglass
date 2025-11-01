'use client'

import { AppBar as MuiAppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabaseClient'

interface AppBarProps {
  userEmail?: string
  userName?: string
}

export function AppBar({ userEmail, userName }: AppBarProps) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = supabaseBrowser()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <MuiAppBar 
      position="static"
      sx={{
        background: 'linear-gradient(135deg, #025691 0%, #002C51 100%)',
        boxShadow: '0 4px 20px rgba(2, 86, 145, 0.3)',
      }}
    >
      <Toolbar>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.15)',
            mr: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'white', 
              fontWeight: 'bold',
            }}
          >
            DG
          </Typography>
        </Box>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            fontWeight: 600,
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          }}
        >
          {process.env.NEXT_PUBLIC_APP_NAME || 'DostGlass'}
        </Typography>
        {userEmail && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography 
              variant="body2"
              sx={{
                fontWeight: 500,
                display: { xs: 'none', sm: 'block' },
              }}
            >
              {userName || userEmail}
            </Typography>
            <Button 
              color="inherit" 
              onClick={handleLogout}
              sx={{
                borderRadius: 2,
                px: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Çıkış Yap
            </Button>
          </Box>
        )}
      </Toolbar>
    </MuiAppBar>
  )
}

