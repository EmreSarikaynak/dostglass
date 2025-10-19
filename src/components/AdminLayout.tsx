'use client'

import { useState } from 'react'
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Stack,
  Collapse,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  Assignment,
  DirectionsCar,
  Description,
  Settings,
  Logout,
  AccountCircle,
  ExpandLess,
  ExpandMore,
  Tune,
} from '@mui/icons-material'
import { useRouter, usePathname } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabaseClient'

const drawerWidth = 280

interface AdminLayoutProps {
  children: React.ReactNode
  userEmail?: string
  tenantName?: string
}

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/admin' },
  { text: 'Kullanıcı Yönetimi', icon: <People />, path: '/admin/users' },
  { text: 'Yeni İhbar', icon: <Assignment />, path: '/admin/claims/new' },
  { text: 'İhbar Listesi', icon: <Assignment />, path: '/admin/claims' },
  { text: 'Araç Kayıtları', icon: <DirectionsCar />, path: '/admin/vehicles' },
  { text: 'Poliçeler', icon: <Description />, path: '/admin/policies' },
]

const settingsSubMenu = [
  { text: 'Genel Ayarlar', path: '/admin/settings' },
  { text: 'Parametreler', path: '/admin/settings-params' },
  { text: 'Araç Yönetimi', path: '/admin/vehicle-management' },
]

export function AdminLayout({ children, userEmail, tenantName }: AdminLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [settingsOpen, setSettingsOpen] = useState(
    pathname.startsWith('/admin/settings')
  )

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    const supabase = supabaseBrowser()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const drawer = (
    <Box>
      {/* Logo ve Başlık */}
      <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
        <Box
          sx={{
            width: 50,
            height: 50,
            borderRadius: '50%',
            bgcolor: 'white',
            mx: 'auto',
            mb: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
            DG
          </Typography>
        </Box>
        <Typography variant="subtitle1" fontWeight="bold">
          DostGlass
        </Typography>
        <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
          Cam Sigorta Yönetimi
        </Typography>
      </Box>

      <Divider />

      {/* Ana Menü Items */}
      <List sx={{ px: 2, py: 2 }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.path
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => router.push(item.path)}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: isActive ? 'white' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          )
        })}

        {/* Ayarlar (Collapsible) */}
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            onClick={() => setSettingsOpen(!settingsOpen)}
            selected={pathname.startsWith('/admin/settings')}
            sx={{
              borderRadius: 2,
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
                '& .MuiListItemIcon-root': {
                  color: 'white',
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: pathname.startsWith('/admin/settings') ? 'white' : 'inherit' }}>
              <Settings />
            </ListItemIcon>
            <ListItemText primary="Ayarlar" />
            {settingsOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>

        {/* Ayarlar Alt Menüleri */}
        <Collapse in={settingsOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {settingsSubMenu.map((subItem) => {
              const isActive = pathname === subItem.path
              return (
                <ListItem key={subItem.text} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => router.push(subItem.path)}
                    selected={isActive}
                    sx={{
                      pl: 4,
                      borderRadius: 2,
                      '&.Mui-selected': {
                        bgcolor: 'rgba(25, 118, 210, 0.12)',
                        color: 'primary.dark',
                        fontWeight: 600,
                        '&:hover': {
                          bgcolor: 'rgba(25, 118, 210, 0.2)',
                        },
                      },
                      '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Tune sx={{ color: isActive ? 'primary.dark' : 'text.secondary', fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={subItem.text}
                      primaryTypographyProps={{
                        fontSize: '0.9rem',
                        color: isActive ? 'primary.dark' : 'text.primary',
                        fontWeight: isActive ? 600 : 400,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              )
            })}
          </List>
        </Collapse>
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'white',
          color: 'text.primary',
          boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {menuItems.find((item) => item.path === pathname)?.text || 
             settingsSubMenu.find((item) => item.path === pathname)?.text || 
             (pathname.startsWith('/admin/settings') ? 'Ayarlar' : 'Dashboard')}
          </Typography>

          {/* Kullanıcı Menüsü */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}>
              <Typography variant="body2" fontWeight={600}>
                {tenantName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {userEmail}
              </Typography>
            </Box>
            <IconButton onClick={handleMenuClick} size="large">
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <AccountCircle />
              </Avatar>
            </IconButton>
          </Stack>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                {userEmail}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Çıkış Yap
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: '1px solid rgba(0,0,0,0.08)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Ana İçerik */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        <Box sx={{ flexGrow: 1, p: 3 }}>
          {children}
        </Box>

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            py: 2,
            px: 3,
            mt: 'auto',
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.grey[200]
                : theme.palette.grey[800],
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="body2" color="text.secondary" align="center">
            © 2025 •{' '}
            <Box
              component="a"
              href="https://secesta.com"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: 'primary.main',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Secesta Lider Markaların Dijital Pazarlama & SEO Ajansı | Secesta Software Solutions®
            </Box>
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

