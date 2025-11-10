'use client'

import dynamic from 'next/dynamic'
import { useMemo, useRef, useState } from 'react'
import {
  Box,
  Button,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import 'react-quill-new/dist/quill.snow.css'

const ReactQuill = dynamic(async () => (await import('react-quill-new')).default, {
  ssr: false,
  loading: () => <LinearProgress sx={{ width: '100%' }} />,
})

interface HTMLEditorProps {
  value: string
  onChange: (value: string) => void
  label?: string
  rows?: number
  editorId?: string
  snippets?: { label: string; content: string }[]
  showPreviewToggle?: boolean
  onUpload?: (file: File) => Promise<string>
}

export function HTMLEditor({
  value,
  onChange,
  label = 'HTML İçerik',
  rows = 18,
  editorId = 'html-editor',
  snippets = [],
  showPreviewToggle = true,
  onUpload,
}: HTMLEditorProps) {
  const quillRef = useRef<ReactQuill | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [preview, setPreview] = useState(false)

  const toolbarOptions = useMemo(
    () => [
      [{ font: [] }],
      [{ size: ['small', false, 'large', 'huge'] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ script: 'sub' }, { script: 'super' }],
      [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
      [{ align: [] }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean'],
    ],
    []
  )

  const modules = useMemo(
    () => ({
      toolbar: {
        container: toolbarOptions,
        handlers: {
          image: () => fileInputRef.current?.click(),
        },
      },
    }),
    [toolbarOptions]
  )

  const insertHtmlSnippet = (html: string) => {
    const quill = quillRef.current?.getEditor()
    if (!quill) return
    const range = quill.getSelection(true)
    quill.clipboard.dangerouslyPasteHTML(range?.index ?? quill.getLength(), html, 'user')
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !onUpload) return

    try {
      const url = await onUpload(file)
      const quill = quillRef.current?.getEditor()
      if (!quill) return
      const range = quill.getSelection(true)

      if (file.type.startsWith('image/')) {
        quill.insertEmbed(range?.index ?? quill.getLength(), 'image', url, 'user')
      } else {
        quill.clipboard.dangerouslyPasteHTML(
          range?.index ?? quill.getLength(),
          `<a href="${url}" target="_blank" rel="noopener">${file.name}</a>`,
          'user'
        )
      }
    } catch (error) {
      console.error('Dosya yüklenemedi:', error)
    }
  }

  const handleTableInsert = () => {
    insertHtmlSnippet(`
      <table style="width:100%; border-collapse: collapse;">
        <tr>
          <th style="border:1px solid #d1d5db; padding:6px;">Başlık 1</th>
          <th style="border:1px solid #d1d5db; padding:6px;">Başlık 2</th>
        </tr>
        <tr>
          <td style="border:1px solid #d1d5db; padding:6px;">Satır 1 - Hücre 1</td>
          <td style="border:1px solid #d1d5db; padding:6px;">Satır 1 - Hücre 2</td>
        </tr>
      </table>
      <p></p>
    `)
  }

  return (
    <Paper
      sx={{
        p: 2,
        border: 1,
        borderColor: 'divider',
        '& .ql-toolbar': { borderRadius: 1 },
        '& .ql-container': {
          minHeight: rows * 18,
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8,
        },
        '& .ql-editor': {
          fontFamily: 'var(--font-sans, "Inter", "Roboto", sans-serif)',
          fontSize: '0.95rem',
        },
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems="center"
        justifyContent="space-between"
        spacing={1}
        mb={2}
      >
        <Typography variant="subtitle2">{label}</Typography>
        {showPreviewToggle && (
          <Button size="small" variant="outlined" onClick={() => setPreview((prev) => !prev)}>
            {preview ? 'Editöre Dön' : 'Önizleme'}
          </Button>
        )}
      </Stack>

      {!preview ? (
        <>
          <ReactQuill
            ref={quillRef}
            id={editorId}
            theme="snow"
            value={value}
            onChange={onChange}
            modules={modules}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} mt={2} flexWrap="wrap">
            <Button size="small" variant="outlined" onClick={handleTableInsert}>
              Tablo Ekle
            </Button>
            {snippets.map((snippet) => (
              <Button
                key={snippet.label}
                size="small"
                variant="outlined"
                onClick={() => insertHtmlSnippet(snippet.content)}
              >
                {snippet.label}
              </Button>
            ))}
            {onUpload && (
              <Button size="small" variant="contained" onClick={() => fileInputRef.current?.click()}>
                Dosya Yükle
              </Button>
            )}
          </Stack>

          {onUpload && (
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept="image/*,application/pdf"
              onChange={handleFileChange}
            />
          )}
        </>
      ) : (
        <Box
          sx={{
            mt: 1,
            p: 2,
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            bgcolor: 'background.default',
            minHeight: rows * 18,
          }}
          dangerouslySetInnerHTML={{
            __html:
              value ||
              '<p style="color:var(--mui-palette-text-secondary)">Henüz içerik girilmedi. Düzenle moduna dönüp yazmaya başlayabilirsiniz.</p>',
          }}
        />
      )}
    </Paper>
  )
}
