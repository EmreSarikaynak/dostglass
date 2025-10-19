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
    <MuiAppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {process.env.NEXT_PUBLIC_APP_NAME || 'DostGlass'}
        </Typography>
        {userEmail && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">
              {userName || userEmail}
            </Typography>
            <Button color="inherit" onClick={handleLogout}>
              Çıkış Yap
            </Button>
          </Box>
        )}
      </Toolbar>
    </MuiAppBar>
  )
}

