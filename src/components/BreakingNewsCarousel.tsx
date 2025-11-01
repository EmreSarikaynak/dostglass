'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Collapse,
  useTheme,
} from '@mui/material'
import {
  Campaign,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Close,
} from '@mui/icons-material'
import { supabaseBrowser } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

interface Announcement {
  id: string
  title: string
  content: string
  priority: number
}

export function BreakingNewsCarousel() {
  const theme = useTheme()
  const router = useRouter()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnnouncements()
    // Her 10 saniyede bir otomatik geçiş
    const interval = setInterval(() => {
      if (announcements.length > 1) {
        setCurrentIndex((prev) => (prev + 1) % announcements.length)
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [announcements.length])

  const loadAnnouncements = async () => {
    try {
      const supabase = supabaseBrowser()
      const now = new Date().toISOString()

      const { data, error } = await supabase
        .from('announcements')
        .select('id, title, content, priority')
        .eq('is_active', true)
        .lte('valid_from', now)
        .or(`valid_until.is.null,valid_until.gte.${now}`)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      setAnnouncements(data || [])
    } catch (error) {
      console.error('Duyurular yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % announcements.length)
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length)
  }

  const handleClick = () => {
    if (announcements[currentIndex]) {
      router.push(`/announcements/${announcements[currentIndex].id}`)
    }
  }

  if (loading || announcements.length === 0 || !visible) {
    return null
  }

  const currentAnnouncement = announcements[currentIndex]

  return (
    <Collapse in={visible}>
      <Paper
        elevation={3}
        sx={{
          mb: 1.5,
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #0C0B1B 0%, #002C51 50%, #002C50 100%)'
            : 'linear-gradient(135deg, #002C50 0%, #025691 50%, #002C51 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.9,
            },
          }}
          onClick={handleClick}
        >
          {/* Icon */}
          <Campaign sx={{ fontSize: 40, animation: 'pulse 2s infinite' }} />

          {/* Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: 1,
                opacity: 0.9,
              }}
            >
              Duyuru {announcements.length > 1 && `(${currentIndex + 1}/${announcements.length})`}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {currentAnnouncement.title}
            </Typography>
          </Box>

          {/* Navigation Arrows */}
          {announcements.length > 1 && (
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation()
                  handlePrev()
                }}
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(139,146,156,0.3)',
                  '&:hover': {
                    bgcolor: 'rgba(2,86,145,0.6)',
                  },
                }}
              >
                <KeyboardArrowLeft />
              </IconButton>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation()
                  handleNext()
                }}
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(139,146,156,0.3)',
                  '&:hover': {
                    bgcolor: 'rgba(2,86,145,0.6)',
                  },
                }}
              >
                <KeyboardArrowRight />
              </IconButton>
            </Box>
          )}

          {/* Close Button */}
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              setVisible(false)
            }}
            sx={{
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(139,146,156,0.3)',
              },
            }}
          >
            <Close />
          </IconButton>
        </Box>

        {/* Animated gradient border */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #025691 0%, #8B929C 50%, #025691 100%)',
            animation: 'shimmer 3s infinite',
            '@keyframes shimmer': {
              '0%': { backgroundPosition: '-200% 0' },
              '100%': { backgroundPosition: '200% 0' },
            },
            backgroundSize: '200% 100%',
          }}
        />
      </Paper>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }
      `}</style>
    </Collapse>
  )
}

