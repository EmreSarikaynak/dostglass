'use client'

import { useState } from 'react'
import {
  Box,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  Divider,
  Typography,
} from '@mui/material'
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatListBulleted,
  FormatListNumbered,
  Title,
  Link as LinkIcon,
  FormatColorText,
} from '@mui/icons-material'

interface HTMLEditorProps {
  value: string
  onChange: (value: string) => void
  label?: string
  rows?: number
}

export function HTMLEditor({ value, onChange, label = 'HTML İçerik', rows = 15 }: HTMLEditorProps) {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit')

  const insertHTML = (tag: string, closeTag?: string) => {
    const textarea = document.getElementById('html-editor-textarea') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const before = value.substring(0, start)
    const after = value.substring(end)

    const newText = `${before}<${tag}>${selectedText}</${closeTag || tag}>${after}`
    onChange(newText)

    // Keep focus and set cursor position
    setTimeout(() => {
      textarea.focus()
      const newPos = start + tag.length + 2 + selectedText.length
      textarea.setSelectionRange(newPos, newPos)
    }, 0)
  }

  const insertTag = (opening: string, closing?: string) => {
    const textarea = document.getElementById('html-editor-textarea') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const before = value.substring(0, start)
    const after = value.substring(end)

    const newText = `${before}${opening}${selectedText}${closing || ''}${after}`
    onChange(newText)

    setTimeout(() => {
      textarea.focus()
      const newPos = start + opening.length + selectedText.length
      textarea.setSelectionRange(newPos, newPos)
    }, 0)
  }

  const insertLink = () => {
    const url = prompt('Link URL girin:')
    if (!url) return
    
    const textarea = document.getElementById('html-editor-textarea') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end) || 'Link Metni'
    const before = value.substring(0, start)
    const after = value.substring(end)

    const newText = `${before}<a href="${url}" target="_blank">${selectedText}</a>${after}`
    onChange(newText)

    setTimeout(() => {
      textarea.focus()
    }, 0)
  }

  const insertColor = () => {
    const colors = ['#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6', '#1ABC9C']
    const selectedColor = colors[Math.floor(Math.random() * colors.length)]
    
    const textarea = document.getElementById('html-editor-textarea') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const before = value.substring(0, start)
    const after = value.substring(end)

    const newText = `${before}<span style="color: ${selectedColor};">${selectedText}</span>${after}`
    onChange(newText)

    setTimeout(() => {
      textarea.focus()
    }, 0)
  }

  return (
    <Paper sx={{ p: 2, border: 1, borderColor: 'divider' }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          {label}
        </Typography>
        
        {/* Toolbar */}
        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <ToggleButton
            value="h3"
            size="small"
            onClick={() => insertHTML('h3')}
            title="Başlık 3"
          >
            <Title />
          </ToggleButton>

          <ToggleButton
            value="bold"
            size="small"
            onClick={() => insertHTML('strong')}
            title="Kalın"
          >
            <FormatBold />
          </ToggleButton>

          <ToggleButton
            value="italic"
            size="small"
            onClick={() => insertHTML('em')}
            title="İtalik"
          >
            <FormatItalic />
          </ToggleButton>

          <ToggleButton
            value="underline"
            size="small"
            onClick={() => insertHTML('u')}
            title="Altı Çizili"
          >
            <FormatUnderlined />
          </ToggleButton>

          <Divider orientation="vertical" flexItem />

          <ToggleButton
            value="ul"
            size="small"
            onClick={() => insertTag('<ul>\n  <li>', '</li>\n</ul>')}
            title="Madde İşaretli Liste"
          >
            <FormatListBulleted />
          </ToggleButton>

          <ToggleButton
            value="ol"
            size="small"
            onClick={() => insertTag('<ol>\n  <li>', '</li>\n</ol>')}
            title="Numaralı Liste"
          >
            <FormatListNumbered />
          </ToggleButton>

          <Divider orientation="vertical" flexItem />

          <ToggleButton
            value="link"
            size="small"
            onClick={insertLink}
            title="Link Ekle"
          >
            <LinkIcon />
          </ToggleButton>

          <ToggleButton
            value="color"
            size="small"
            onClick={insertColor}
            title="Renk Ekle"
          >
            <FormatColorText />
          </ToggleButton>

          <Divider orientation="vertical" flexItem />

          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={(_, newMode) => newMode && setMode(newMode)}
            size="small"
          >
            <ToggleButton value="edit">Düzenle</ToggleButton>
            <ToggleButton value="preview">Önizleme</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Editor / Preview */}
        {mode === 'edit' ? (
          <TextField
            id="html-editor-textarea"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            multiline
            rows={rows}
            fullWidth
            placeholder="<h3>Başlık</h3>
<p>Paragraf metni buraya gelecek.</p>
<ul>
  <li>Madde 1</li>
  <li>Madde 2</li>
</ul>
<p><strong>Kalın metin</strong> ve <em>italik metin</em></p>"
            sx={{
              '& .MuiInputBase-root': {
                fontFamily: 'monospace',
                fontSize: '13px',
              },
            }}
          />
        ) : (
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              minHeight: rows * 24,
              maxHeight: rows * 24,
              overflow: 'auto',
              bgcolor: 'background.default',
              '& h1, & h2, & h3': {
                color: 'primary.main',
                mt: 2,
                mb: 1,
              },
              '& ul, & ol': {
                pl: 3,
              },
              '& p': {
                mb: 1.5,
              },
              '& strong': {
                color: 'primary.dark',
                fontWeight: 600,
              },
            }}
            dangerouslySetInnerHTML={{ __html: value || '<p style="color: #999;">Önizleme burada görünecek...</p>' }}
          />
        )}
      </Box>
    </Paper>
  )
}

