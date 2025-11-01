'use client'

import { useState, useEffect } from 'react'
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
  Brightness4,
  Brightness7,
  Campaign,
  AttachMoney,
  Search,
  Analytics,
  Business,
} from '@mui/icons-material'
import { useRouter, usePathname } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabaseClient'
import { useColorMode } from '@/app/providers'
import { BreakingNewsCarousel } from './BreakingNewsCarousel'
import Image from 'next/image'

const drawerWidth = 280

interface AdminLayoutProps {
  children: React.ReactNode
  userEmail?: string
  tenantName?: string
  userRole?: 'admin' | 'bayi'
}

const getMenuItems = (role?: 'admin' | 'bayi') => {
  const baseItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin' },
  ]
  
  // Fiyat modülü - hem admin hem bayi için
  const priceItems = [
    { text: 'Fiyat Sorgulama', icon: <Search />, path: role === 'admin' ? '/admin/price-query' : '/bayi/price-query' },
    { text: 'Cam Fiyat Listesi', icon: <AttachMoney />, path: '/admin/glass-prices' },
  ]
  
  // Admin-only items
  const adminItems = [
    { text: 'Kullanıcı Yönetimi', icon: <People />, path: '/admin/users' },
    { text: 'Sigorta Şirketleri', icon: <Business />, path: '/admin/insurance-companies' },
    { text: 'Sorgulama Analizi', icon: <Analytics />, path: '/admin/price-query-stats' }, // SADECE ADMIN
  ]
  
  // Bayi için Duyurular ve Anlaşmalı Sigorta Şirketleri menüsü
  const bayiItems = [
    { text: 'Anlaşmalı Sigorta Şirketleri', icon: <Business />, path: '/bayi/insurance-partners' },
    { text: 'Duyurular', icon: <Campaign />, path: '/announcements' },
  ]
  
  const commonItems = [
    { text: 'Yeni İhbar', icon: <Assignment />, path: '/admin/claims/new' },
    { text: 'İhbar Listesi', icon: <Assignment />, path: '/admin/claims' },
    { text: 'Araç Kayıtları', icon: <DirectionsCar />, path: '/admin/vehicles' },
    { text: 'Poliçeler', icon: <Description />, path: '/admin/policies' },
  ]
  
  if (role === 'admin') {
    return [...baseItems, ...priceItems, ...adminItems, ...commonItems]
  } else {
    return [...baseItems, ...priceItems, ...bayiItems, ...commonItems]
  }
}

const settingsSubMenu = [
  { text: 'Genel Ayarlar', path: '/admin/general-settings' },
  { text: 'Parametreler', path: '/admin/settings-params' },
  { text: 'Araç Yönetimi', path: '/admin/vehicle-management' },
  { text: 'Duyuru Yönetimi', path: '/admin/announcements' },
]

export function AdminLayout({ children, userEmail, tenantName, userRole }: AdminLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { mode, toggleColorMode } = useColorMode()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [settingsOpen, setSettingsOpen] = useState(
    pathname.startsWith('/admin/settings') || 
    pathname.startsWith('/admin/general-settings') || 
    pathname.startsWith('/admin/vehicle-management') ||
    pathname.startsWith('/admin/announcements')
  )
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [siteTitle, setSiteTitle] = useState('DostlarGlass')
  const [userId, setUserId] = useState<string | null>(null)
  
  const menuItems = getMenuItems(userRole)

  // Sistem ayarlarını ve kullanıcı ID'sini çek
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings')
        if (response.ok) {
          const settings = await response.json()
          setLogoUrl(settings.site_logo_url)
          setSiteTitle(settings.site_title || 'DostlarGlass')
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      }
    }
    
    const fetchUserId = async () => {
      const supabase = supabaseBrowser()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      }
    }
    
    fetchSettings()
    fetchUserId()
  }, [])

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleProfileEdit = () => {
    handleMenuClose()
    if (userId) {
      router.push(`/admin/users/${userId}/edit`)
    }
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
      <Box 
        sx={{ 
          p: 2, 
          textAlign: 'center', 
          background: mode === 'dark' 
            ? 'linear-gradient(135deg, #002C51 0%, #0C0B1B 100%)' 
            : 'linear-gradient(135deg, #025691 0%, #002C51 100%)',
          color: 'white',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          position: 'relative',
        }}
      >
        {logoUrl ? (
          <Box
            sx={{
              width: '100%',
              height: 60,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 1,
            }}
          >
            {/* Beyaz Arka Plan - Logo İçin */}
            <Box
              sx={{
                position: 'absolute',
                width: '85%',
                height: '85%',
                background: 'rgba(255, 255, 255, 0.95)', // Daha opak beyaz
                borderRadius: 3,
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                border: '2px solid rgba(255, 255, 255, 1)',
              }}
            />
            <Image
              src={logoUrl}
              alt={siteTitle}
              fill
              style={{
                objectFit: 'contain',
                padding: '12px',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))', // Logo'ya gölge
              }}
              priority
            />
          </Box>
        ) : (
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '16px',
              background: mode === 'dark'
                ? 'linear-gradient(135deg, #025691 0%, #0373C4 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%)',
              mx: 'auto',
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(2, 86, 145, 0.25)',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.05)',
              },
              // Beyaz efekt
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: -4,
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '20px',
                backdropFilter: 'blur(10px)',
                zIndex: -1,
                border: '1px solid rgba(255, 255, 255, 0.2)',
              },
            }}
          >
            <Typography 
              variant="h4" 
              sx={{ 
                color: mode === 'dark' ? '#ffffff' : '#025691', 
                fontWeight: 'bold',
                background: mode === 'dark'
                  ? 'linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%)'
                  : 'linear-gradient(135deg, #025691 0%, #002C51 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              DG
            </Typography>
          </Box>
        )}
        <Typography 
          variant="subtitle1" 
          fontWeight="bold" 
          sx={{ 
            fontSize: '0.9rem',
            letterSpacing: 0.3,
            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            maxHeight: '2.4em',
            px: 1,
          }}
        >
          {siteTitle}
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
                  transition: 'all 0.2s ease-in-out',
                  '&.Mui-selected': {
                    bgcolor: mode === 'dark' ? '#025691' : '#025691',
                    color: 'white',
                    boxShadow: '0 2px 8px rgba(2, 86, 145, 0.25)',
                    '&:hover': {
                      bgcolor: mode === 'dark' ? '#0373C4' : '#002C50',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                  '&:hover': {
                    bgcolor: mode === 'dark' ? 'rgba(2, 86, 145, 0.15)' : 'rgba(2, 86, 145, 0.08)',
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
            selected={
              pathname.startsWith('/admin/settings') || 
              pathname.startsWith('/admin/general-settings') || 
              pathname.startsWith('/admin/vehicle-management') ||
              pathname.startsWith('/admin/announcements')
            }
            sx={{
              borderRadius: 2,
              transition: 'all 0.2s ease-in-out',
              '&.Mui-selected': {
                bgcolor: mode === 'dark' ? '#025691' : '#025691',
                color: 'white',
                boxShadow: '0 2px 8px rgba(2, 86, 145, 0.25)',
                '&:hover': {
                  bgcolor: mode === 'dark' ? '#0373C4' : '#002C50',
                },
                '& .MuiListItemIcon-root': {
                  color: 'white',
                },
              },
              '&:hover': {
                bgcolor: mode === 'dark' ? 'rgba(2, 86, 145, 0.15)' : 'rgba(2, 86, 145, 0.08)',
              },
            }}
          >
            <ListItemIcon sx={{ 
              minWidth: 40, 
              color: (pathname.startsWith('/admin/settings') || 
                     pathname.startsWith('/admin/general-settings') || 
                     pathname.startsWith('/admin/vehicle-management') ||
                     pathname.startsWith('/admin/announcements')) ? 'white' : 'inherit' 
            }}>
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
                      transition: 'all 0.2s ease-in-out',
                      '&.Mui-selected': {
                        bgcolor: mode === 'dark' ? 'rgba(2, 86, 145, 0.25)' : 'rgba(2, 86, 145, 0.12)',
                        color: mode === 'dark' ? '#ffffff' : '#002C50',
                        fontWeight: 600,
                        borderLeft: mode === 'dark' ? '3px solid #025691' : '3px solid #025691',
                        '&:hover': {
                          bgcolor: mode === 'dark' ? 'rgba(2, 86, 145, 0.35)' : 'rgba(2, 86, 145, 0.2)',
                        },
                      },
                      '&:hover': {
                        bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Tune sx={{ 
                        color: isActive 
                          ? (mode === 'dark' ? '#ffffff' : 'primary.dark') 
                          : 'text.secondary', 
                        fontSize: 20 
                      }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={subItem.text}
                      primaryTypographyProps={{
                        fontSize: '0.9rem',
                        color: isActive 
                          ? (mode === 'dark' ? '#ffffff' : 'primary.dark') 
                          : 'text.primary',
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
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 1,
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
             (pathname === '/admin/settings' ? 'Sistem Ayarları' : 
              pathname.startsWith('/admin/settings') ? 'Ayarlar' : 'Dashboard')}
          </Typography>

          {/* Koyu Mod Toggle ve Kullanıcı Menüsü */}
          <Stack direction="row" spacing={1} alignItems="center">
            {/* Dark Mode Toggle */}
            <IconButton onClick={toggleColorMode} color="inherit" sx={{ mr: 1 }}>
              {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>

            <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}>
              <Typography variant="body2" fontWeight={600}>
                {tenantName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {userEmail}
              </Typography>
            </Box>
            <IconButton onClick={handleMenuClick} size="large">
              <Avatar sx={{ 
                bgcolor: '#025691',
                boxShadow: '0 2px 8px rgba(2, 86, 145, 0.25)',
                '&:hover': {
                  bgcolor: '#0373C4',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease-in-out',
              }}>
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
            <MenuItem onClick={handleProfileEdit} disabled={!userId}>
              <ListItemIcon>
                <AccountCircle fontSize="small" />
              </ListItemIcon>
              Profili Güncelle
            </MenuItem>
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
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              bgcolor: mode === 'dark' ? '#1a1927' : '#ffffff',
            },
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
              borderRight: mode === 'dark' ? '1px solid rgba(2, 86, 145, 0.2)' : '1px solid rgba(0, 44, 80, 0.12)',
              bgcolor: mode === 'dark' ? '#1a1927' : '#ffffff',
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
          {/* Breaking News Carousel */}
          <BreakingNewsCarousel />
          
          {children}
        </Box>

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            py: 2,
            px: 3,
            mt: 'auto',
            backgroundColor: mode === 'light'
              ? 'rgba(2, 86, 145, 0.05)'
              : 'rgba(12, 11, 27, 0.8)',
            borderTop: '1px solid',
            borderColor: mode === 'light' ? 'rgba(2, 86, 145, 0.15)' : 'rgba(2, 86, 145, 0.3)',
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

