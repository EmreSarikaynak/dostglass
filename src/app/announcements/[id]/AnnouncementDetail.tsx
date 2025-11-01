'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Button,
  Alert,
  Skeleton,
} from '@mui/material'
import { ArrowBack, CalendarToday } from '@mui/icons-material'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabaseClient'

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

export function AnnouncementDetail({ id }: { id: string }) {
  const router = useRouter()
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadAnnouncement()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const loadAnnouncement = async () => {
    try {
      const supabase = supabaseBrowser()
      
      console.log('Loading announcement with ID:', id)
      
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('id', id)
        .single()

      console.log('Announcement data:', data)
      console.log('Announcement error:', error)

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      if (!data) {
        throw new Error('Duyuru bulunamadı')
      }
      
      setAnnouncement(data)
    } catch (err: any) {
      console.error('Duyuru yüklenirken hata:', err)
      setError(err.message || 'Duyuru bulunamadı veya erişim yetkiniz yok')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="text" width="60%" height={40} />
          <Skeleton variant="text" width="40%" />
          <Box sx={{ mt: 3 }}>
            <Skeleton variant="rectangular" height={200} />
          </Box>
        </CardContent>
      </Card>
    )
  }

  if (error || !announcement) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">{error || 'Duyuru bulunamadı'}</Alert>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.back()}
            sx={{ mt: 2 }}
          >
            Geri Dön
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.back()}
          sx={{ mb: 3 }}
        >
          Geri Dön
        </Button>

        <Stack spacing={2} sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <Chip
              label={announcement.is_active ? 'Aktif' : 'Pasif'}
              color={announcement.is_active ? 'success' : 'default'}
              size="small"
            />
            {announcement.priority > 0 && (
              <Chip
                label={`Öncelik: ${announcement.priority}`}
                color="warning"
                size="small"
              />
            )}
          </Box>

          <Typography variant="h4" fontWeight="bold">
            {announcement.title}
          </Typography>

          <Stack direction="row" spacing={3} sx={{ color: 'text.secondary' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarToday fontSize="small" />
              <Typography variant="body2">
                Başlangıç: {format(new Date(announcement.valid_from), 'dd MMMM yyyy, HH:mm', { locale: tr })}
              </Typography>
            </Box>
            {announcement.valid_until && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CalendarToday fontSize="small" />
                <Typography variant="body2">
                  Bitiş: {format(new Date(announcement.valid_until), 'dd MMMM yyyy, HH:mm', { locale: tr })}
                </Typography>
              </Box>
            )}
          </Stack>
        </Stack>

        <Box
          sx={{
            mt: 4,
            p: 3,
            bgcolor: 'background.default',
            borderRadius: 2,
            '& h1, & h2, & h3, & h4, & h5, & h6': {
              mt: 2,
              mb: 1,
              fontWeight: 'bold',
            },
            '& p': {
              mb: 1,
              lineHeight: 1.7,
            },
            '& ul, & ol': {
              pl: 3,
              mb: 2,
            },
            '& li': {
              mb: 0.5,
            },
            '& img': {
              maxWidth: '100%',
              height: 'auto',
              borderRadius: 1,
              my: 2,
            },
            '& a': {
              color: 'primary.main',
              textDecoration: 'underline',
            },
          }}
          dangerouslySetInnerHTML={{ __html: announcement.content }}
        />
      </CardContent>
    </Card>
  )
}

