import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { getUserAndRole } from '@/lib/auth'

// Bu route Node.js runtime kullanmalı (filesystem erişimi gerekiyor)
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Admin kontrolü
    const user = await getUserAndRole()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'logo' or 'document'

    if (!file) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 })
    }

    // Dosya adını güvenli hale getir
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${timestamp}_${originalName}`

    // Upload dizini
    const uploadDir = type === 'logo' ? 'insurance-logos' : 'insurance-documents'
    const publicPath = join(process.cwd(), 'public', 'uploads', uploadDir)
    
    // Ensure directory exists (in production, use cloud storage)
    try {
      const fs = require('fs')
      if (!fs.existsSync(publicPath)) {
        fs.mkdirSync(publicPath, { recursive: true })
      }
    } catch (err) {
      console.error('Directory creation error:', err)
    }

    const filePath = join(publicPath, fileName)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    await writeFile(filePath, buffer)

    // Return public URL
    const url = `/uploads/${uploadDir}/${fileName}`

    return NextResponse.json({
      success: true,
      url,
      fileName,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload başarısız' }, { status: 500 })
  }
}
