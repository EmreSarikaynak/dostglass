import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface ClaimData {
  claim_number: string
  status: string
  policy_number: string
  vehicle_plate: string
  incident_date: string
  created_at: string
  insurance_companies: { name: string }
  incident_types: { name: string }
  damage_types: { name: string }
  insured_types: { name: string }
  license_classes: { name: string }
  vehicle_categories: { name: string }
  vehicle_brands: { name: string }
  vehicle_models: { name: string }
  vehicle_usage_types: { name: string }
  agency_code: string
  agency_name: string
  policy_start_date: string
  policy_end_date: string
  insured_name: string
  insured_id_number: string
  insured_tax_office?: string
  insured_tax_number?: string
  insured_phone: string
  insured_mobile?: string
  insured_email: string
  driver_same_as_insured?: boolean
  driver_name: string
  driver_id_number: string
  driver_tc_number?: string
  driver_phone?: string
  driver_birth_date: string
  driver_license_date?: string
  driver_license_place?: string
  driver_license_number?: string
  vehicle_year: string
  vehicle_model_year?: number
  vehicle_model_text: string
  vehicle_chassis_number: string
  incident_location: string
  incident_description: string
  notes: string
  claim_items: Array<{
    glass_positions?: { name: string }
    vehicle_glass_types?: { name: string }
    glass_operations?: { name: string }
    glass_brands?: { name: string }
    installation_methods?: { name: string }
    service_locations?: { name: string }
    glass_code: string
    unit_price: number
    quantity: number
    subtotal: number
    vat_rate: number
    vat_amount: number
    total_amount: number
    customer_contribution: boolean
    additional_material_cost?: number
    additional_material_reason?: string
    notes: string
  }>
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Taslak',
  submitted: 'Gonderildi',
  in_progress: 'Islemde',
  completed: 'Tamamlandi',
  cancelled: 'Iptal'
}

// Türkçe karakter dönüştürme
const turkishText = (text: string) => {
  if (!text) return '-'
  return text
    .replace(/İ/g, 'I')
    .replace(/ı/g, 'i')
    .replace(/Ğ/g, 'G')
    .replace(/ğ/g, 'g')
    .replace(/Ü/g, 'U')
    .replace(/ü/g, 'u')
    .replace(/Ş/g, 'S')
    .replace(/ş/g, 's')
    .replace(/Ö/g, 'O')
    .replace(/ö/g, 'o')
    .replace(/Ç/g, 'C')
    .replace(/ç/g, 'c')
}

export function exportClaimToPDF(claim: ClaimData, companyName: string = 'Dostlar Glass') {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })
  
  let yPosition = 20
  
  // BAŞLIK
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(2, 86, 145)
  doc.text(turkishText(companyName), 105, yPosition, { align: 'center' })
  
  yPosition += 10
  doc.setFontSize(16)
  doc.text('HASAR IHBAR FORMU', 105, yPosition, { align: 'center' })
  
  yPosition += 3
  doc.setLineWidth(0.5)
  doc.setDrawColor(2, 86, 145)
  doc.line(20, yPosition, 190, yPosition)
  
  yPosition += 10
  
  // İhbar Özet (Üst)
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'bold')
  doc.text('Ihbar No:', 20, yPosition)
  doc.setFont('helvetica', 'normal')
  doc.text(claim.claim_number || '-', 50, yPosition)
  
  doc.setFont('helvetica', 'bold')
  doc.text('Durum:', 105, yPosition)
  doc.setFont('helvetica', 'normal')
  doc.text(turkishText(STATUS_LABELS[claim.status] || claim.status), 125, yPosition)
  
  yPosition += 6
  doc.setFont('helvetica', 'bold')
  doc.text('Olusturma:', 20, yPosition)
  doc.setFont('helvetica', 'normal')
  doc.text(new Date(claim.created_at).toLocaleDateString('tr-TR'), 50, yPosition)
  
  yPosition += 12
  
  // Helper: 2 Kolon
  const printTwoColumn = (leftLabel: string, leftValue: string, rightLabel: string, rightValue: string, y: number) => {
    doc.setFont('helvetica', 'bold')
    doc.text(turkishText(leftLabel), 20, y)
    doc.setFont('helvetica', 'normal')
    doc.text(turkishText(leftValue), 65, y)
    
    doc.setFont('helvetica', 'bold')
    doc.text(turkishText(rightLabel), 110, y)
    doc.setFont('helvetica', 'normal')
    doc.text(turkishText(rightValue), 155, y)
    
    return y + 6
  }
  
  const printSectionHeader = (title: string, y: number) => {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setFillColor(2, 86, 145)
    doc.setTextColor(255, 255, 255)
    doc.rect(20, y - 5, 170, 7, 'F')
    doc.text(turkishText(title), 22, y)
    doc.setFontSize(9)
    doc.setTextColor(0, 0, 0)
    return y + 8
  }
  
  // SIGORTA & POLICE
  yPosition = printSectionHeader('SIGORTA & POLICE BILGILERI', yPosition)
  yPosition = printTwoColumn('Sigorta Sirketi:', claim.insurance_companies?.name || '-', 'Acente Kodu:', claim.agency_code || '-', yPosition)
  yPosition = printTwoColumn('Acente Adi:', claim.agency_name || '-', 'Police No:', claim.policy_number || '-', yPosition)
  yPosition = printTwoColumn(
    'Police Baslangic:', claim.policy_start_date ? new Date(claim.policy_start_date).toLocaleDateString('tr-TR') : '-',
    'Police Bitis:', claim.policy_end_date ? new Date(claim.policy_end_date).toLocaleDateString('tr-TR') : '-',
    yPosition
  )
  yPosition += 5
  
  // SIGORTALI BILGILERI
  yPosition = printSectionHeader('SIGORTALI BILGILERI', yPosition)
  yPosition = printTwoColumn('Ad Soyad:', claim.insured_name || '-', 'Sigortali Tipi:', claim.insured_types?.name || '-', yPosition)
  yPosition = printTwoColumn('TC/Vergi No:', claim.insured_tax_number || claim.insured_id_number || '-', 'Vergi Dairesi:', claim.insured_tax_office || '-', yPosition)
  yPosition = printTwoColumn('Telefon:', claim.insured_phone || '-', 'Cep Telefonu:', claim.insured_mobile || '-', yPosition)
  yPosition = printTwoColumn('E-posta:', claim.insured_email || '-', 'Ehliyet Sinifi:', claim.license_classes?.name || '-', yPosition)
  yPosition += 5
  
  // SURUCU BILGILERI
  if (claim.driver_name || !claim.driver_same_as_insured) {
    yPosition = printSectionHeader('SURUCU BILGILERI', yPosition)
    if (claim.driver_same_as_insured) {
      doc.setFont('helvetica', 'italic')
      doc.text('Surucu sigortali ile aynidir', 20, yPosition)
      yPosition += 6
    } else {
      yPosition = printTwoColumn('Ad Soyad:', claim.driver_name || '-', 'TC Kimlik No:', claim.driver_tc_number || claim.driver_id_number || '-', yPosition)
      yPosition = printTwoColumn('Telefon:', claim.driver_phone || '-', 'Dogum Tarihi:', claim.driver_birth_date ? new Date(claim.driver_birth_date).toLocaleDateString('tr-TR') : '-', yPosition)
      yPosition = printTwoColumn('Ehliyet Tarihi:', claim.driver_license_date ? new Date(claim.driver_license_date).toLocaleDateString('tr-TR') : '-', 'Ehliyet Yeri:', claim.driver_license_place || '-', yPosition)
      yPosition = printTwoColumn('Ehliyet No:', claim.driver_license_number || '-', '', '', yPosition)
    }
    yPosition += 5
  }
  
  // ARAC BILGILERI
  yPosition = printSectionHeader('ARAC BILGILERI', yPosition)
  yPosition = printTwoColumn('Plaka:', claim.vehicle_plate || '-', 'Kategori:', claim.vehicle_categories?.name || '-', yPosition)
  yPosition = printTwoColumn('Marka:', claim.vehicle_brands?.name || '-', 'Model:', claim.vehicle_models?.name || '-', yPosition)
  yPosition = printTwoColumn('Model Yili:', (claim.vehicle_model_year || claim.vehicle_year || '-').toString(), 'Sasi No:', claim.vehicle_chassis_number || '-', yPosition)
  yPosition = printTwoColumn('Kullanim Sekli:', claim.vehicle_usage_types?.name || '-', 'Model Detay:', claim.vehicle_model_text || '-', yPosition)
  yPosition += 5
  
  // HASAR BILGILERI
  yPosition = printSectionHeader('HASAR BILGILERI', yPosition)
  yPosition = printTwoColumn(
    'Olay Tarihi:', claim.incident_date ? new Date(claim.incident_date).toLocaleDateString('tr-TR') : '-',
    'Olay Turu:', claim.incident_types?.name || '-',
    yPosition
  )
  yPosition = printTwoColumn('Hasar Turu:', claim.damage_types?.name || '-', 'Olay Yeri:', claim.incident_location || '-', yPosition)
  
  if (claim.incident_description) {
    yPosition += 2
    doc.setFont('helvetica', 'bold')
    doc.text('Olay Aciklamasi:', 20, yPosition)
    yPosition += 5
    doc.setFont('helvetica', 'normal')
    const splitDesc = doc.splitTextToSize(turkishText(claim.incident_description), 170)
    doc.text(splitDesc, 20, yPosition)
    yPosition += splitDesc.length * 5
  }
  
  yPosition += 5
  
  // Yeni sayfa gerekirse
  if (yPosition > 240) {
    doc.addPage()
    yPosition = 20
  }
  
  // CAM ISLEMLERI TABLOSU
  yPosition = printSectionHeader('CAM ISLEMLERI', yPosition)
  
  if (claim.claim_items && claim.claim_items.length > 0) {
    const tableData = claim.claim_items.map((item, index) => [
      (index + 1).toString(),
      turkishText(item.glass_positions?.name || '-'),
      turkishText(item.vehicle_glass_types?.name || '-'),
      turkishText(item.glass_operations?.name || '-'),
      turkishText(item.glass_brands?.name || '-'),
      turkishText(item.installation_methods?.name || '-'),
      turkishText(item.service_locations?.name || '-'),
      item.glass_code || '-',
      item.quantity.toString(),
      `${item.unit_price.toFixed(2)}`,
      `${item.total_amount.toFixed(2)}`,
    ])
    
    autoTable(doc, {
      startY: yPosition,
      head: [[
        '#',
        turkishText('Pozisyon'),
        turkishText('Tip'),
        turkishText('Islem'),
        'Marka',
        'Montaj',
        'Servis',
        'Kod',
        'Adet',
        'Birim',
        'Toplam'
      ]],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [2, 86, 145],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 7 },   // #
        1: { cellWidth: 20 },  // Pozisyon
        2: { cellWidth: 18 },  // Tip
        3: { cellWidth: 16 },  // İşlem
        4: { cellWidth: 16 },  // Marka
        5: { cellWidth: 16 },  // Montaj
        6: { cellWidth: 16 },  // Servis
        7: { cellWidth: 15 },  // Kod
        8: { cellWidth: 10 },  // Adet
        9: { cellWidth: 18 },  // Birim
        10: { cellWidth: 18 }, // Toplam
      },
    })
    
    // Toplam hesap
    const lastTable = (doc as any).lastAutoTable
    yPosition = lastTable.finalY + 10
    
    const subtotal = claim.claim_items.reduce((sum, item) => sum + (item.subtotal || 0), 0)
    const vat = claim.claim_items.reduce((sum, item) => sum + (item.vat_amount || 0), 0)
    const total = claim.claim_items.reduce((sum, item) => sum + (item.total_amount || 0), 0)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Ara Toplam:', 140, yPosition)
    doc.setFont('helvetica', 'normal')
    doc.text(`${subtotal.toFixed(2)} TL`, 170, yPosition, { align: 'right' })
    
    yPosition += 6
    doc.setFont('helvetica', 'bold')
    doc.text('KDV:', 140, yPosition)
    doc.setFont('helvetica', 'normal')
    doc.text(`${vat.toFixed(2)} TL`, 170, yPosition, { align: 'right' })
    
    yPosition += 7
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('GENEL TOPLAM:', 140, yPosition)
    doc.text(`${total.toFixed(2)} TL`, 170, yPosition, { align: 'right' })
  }
  
  // NOTLAR
  if (claim.notes) {
    yPosition += 15
    if (yPosition > 260) {
      doc.addPage()
      yPosition = 20
    }
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('NOTLAR:', 20, yPosition)
    yPosition += 6
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const splitNotes = doc.splitTextToSize(turkishText(claim.notes), 170)
    doc.text(splitNotes, 20, yPosition)
  }
  
  // FOOTER
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    doc.text(
      `Sayfa ${i} / ${pageCount} - Olusturma: ${new Date().toLocaleString('tr-TR')}`,
      105,
      285,
      { align: 'center' }
    )
  }
  
  // İndir
  doc.save(`ihbar-${claim.claim_number || 'dokuman'}.pdf`)
}
