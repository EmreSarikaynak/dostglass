'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Chip,
  Stack,
  Alert,
  Skeleton,
} from '@mui/material'
import { CalendarToday, TrendingUp } from '@mui/icons-material'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabaseClient'
import type { UserRole } from '@/lib/auth'

interface Announcement {
  id: string
  title: string
  content: string
  is_active: boolean
  valid_from: string
  valid_until: string | null
  priority: number
  created_at: string
}

export function AnnouncementsListClient({ userRole }: { userRole: UserRole }) {
  const router = useRouter()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  const loadAnnouncements = useCallback(async () => {
    try {
      const supabase = supabaseBrowser()
      const now = new Date().toISOString()

      let query = supabase
        .from('announcements')
        .select('*')

      // Bayi sadece aktif ve geçerli duyuruları görebilir
      if (userRole === 'bayi') {
        query = query
          .eq('is_active', true)
          .lte('valid_from', now)
          .or(`valid_until.is.null,valid_until.gte.${now}`)
      }

      const { data, error } = await query
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      setAnnouncements(data || [])
    } catch (error) {
      console.error('Duyurular yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }, [userRole])

  useEffect(() => {
    loadAnnouncements()
  }, [loadAnnouncements])

  const stripHtml = (html: string) => {
    const tmp = document.createElement('DIV')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" fontWeight="bold" mb={3}>
          Duyurular
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 3 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rectangular" height={200} />
          ))}
        </Box>
      </Box>
    )
  }

  if (announcements.length === 0) {
    return (
      <Box>
        <Typography variant="h4" fontWeight="bold" mb={3}>
          Duyurular
        </Typography>
        <Alert severity="info">Henüz duyuru bulunmamaktadır.</Alert>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Duyurular
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 3 }}>
        {announcements.map((announcement) => (
          <Box key={announcement.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardActionArea
                onClick={() => router.push(`/announcements/${announcement.id}`)}
                sx={{ flexGrow: 1 }}
              >
                <CardContent>
                  <Stack spacing={2}>
                    {/* Badges */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {announcement.is_active ? (
                        <Chip label="Aktif" color="success" size="small" />
                      ) : (
                        <Chip label="Pasif" size="small" />
                      )}
                      {announcement.priority > 5 && (
                        <Chip
                          icon={<TrendingUp />}
                          label="Önemli"
                          color="error"
                          size="small"
                        />
                      )}
                    </Box>

                    {/* Title */}
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {announcement.title}
                    </Typography>

                    {/* Excerpt */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {stripHtml(announcement.content)}
                    </Typography>

                    {/* Date */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                      <CalendarToday fontSize="small" />
                      <Typography variant="caption">
                        {format(new Date(announcement.valid_from), 'dd MMMM yyyy', { locale: tr })}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
