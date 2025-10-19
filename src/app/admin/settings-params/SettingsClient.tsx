'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Typography,
  Alert,
  Snackbar,
} from '@mui/material'
import { GridColDef } from '@mui/x-data-grid'
import { ParameterTable } from '@/components/settings/ParameterTable'
import { ParameterModal, FieldConfig } from '@/components/settings/ParameterModal'
import { DeleteConfirmDialog } from '@/components/settings/DeleteConfirmDialog'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

// Parametre tanımları
const parameterConfigs = {
  insurance_companies: {
    title: 'Sigorta Şirketleri',
    columns: [
      { field: 'code', headerName: 'Kod', width: 100 },
      { field: 'name', headerName: 'Şirket Adı', flex: 1 },
    ] as GridColDef[],
    fields: [
      { name: 'code', label: 'Kod', type: 'text', required: true },
      { name: 'name', label: 'Şirket Adı', type: 'text', required: true },
      { name: 'is_active', label: 'Aktif', type: 'switch' },
    ] as FieldConfig[],
  },
  insured_types: {
    title: 'Sigortalı Tipleri',
    columns: [
      { field: 'name', headerName: 'Tip Adı', flex: 1 },
    ] as GridColDef[],
    fields: [
      { name: 'name', label: 'Tip Adı', type: 'text', required: true },
      { name: 'is_active', label: 'Aktif', type: 'switch' },
    ] as FieldConfig[],
  },
  incident_types: {
    title: 'Olay Şekilleri',
    columns: [
      { field: 'name', headerName: 'Olay Şekli', flex: 1 },
    ] as GridColDef[],
    fields: [
      { name: 'name', label: 'Olay Şekli', type: 'text', required: true },
      { name: 'is_active', label: 'Aktif', type: 'switch' },
    ] as FieldConfig[],
  },
  damage_types: {
    title: 'Hasar Şekilleri',
    columns: [
      { field: 'name', headerName: 'Hasar Şekli', flex: 1 },
    ] as GridColDef[],
    fields: [
      { name: 'name', label: 'Hasar Şekli', type: 'text', required: true },
      { name: 'is_active', label: 'Aktif', type: 'switch' },
    ] as FieldConfig[],
  },
  license_classes: {
    title: 'Ehliyet Sınıfları',
    columns: [
      { field: 'name', headerName: 'Sınıf', flex: 1 },
    ] as GridColDef[],
    fields: [
      { name: 'name', label: 'Sınıf', type: 'text', required: true },
      { name: 'is_active', label: 'Aktif', type: 'switch' },
    ] as FieldConfig[],
  },
  vehicle_usage_types: {
    title: 'Araç Kullanım Tipleri',
    columns: [
      { field: 'name', headerName: 'Kullanım Tipi', flex: 1 },
    ] as GridColDef[],
    fields: [
      { name: 'name', label: 'Kullanım Tipi', type: 'text', required: true },
      { name: 'is_active', label: 'Aktif', type: 'switch' },
    ] as FieldConfig[],
  },
  glass_brands: {
    title: 'Cam Markaları',
    columns: [
      { field: 'name', headerName: 'Marka', flex: 1 },
    ] as GridColDef[],
    fields: [
      { name: 'name', label: 'Marka', type: 'text', required: true },
      { name: 'is_active', label: 'Aktif', type: 'switch' },
    ] as FieldConfig[],
  },
  glass_positions: {
    title: 'Cam Pozisyonları',
    columns: [
      { field: 'code', headerName: 'Kod', width: 100 },
      { field: 'name', headerName: 'Pozisyon', flex: 1 },
    ] as GridColDef[],
    fields: [
      { name: 'code', label: 'Kod', type: 'text' },
      { name: 'name', label: 'Pozisyon', type: 'text', required: true },
      { name: 'is_active', label: 'Aktif', type: 'switch' },
    ] as FieldConfig[],
  },
  glass_operations: {
    title: 'Cam İşlemleri',
    columns: [
      { field: 'code', headerName: 'Kod', width: 100 },
      { field: 'name', headerName: 'İşlem', flex: 1 },
    ] as GridColDef[],
    fields: [
      { name: 'code', label: 'Kod', type: 'text' },
      { name: 'name', label: 'İşlem', type: 'text', required: true },
      { name: 'is_active', label: 'Aktif', type: 'switch' },
    ] as FieldConfig[],
  },
  glass_colors: {
    title: 'Cam Renkleri',
    columns: [
      { field: 'name', headerName: 'Renk', flex: 1 },
    ] as GridColDef[],
    fields: [
      { name: 'name', label: 'Renk', type: 'text', required: true },
      { name: 'is_active', label: 'Aktif', type: 'switch' },
    ] as FieldConfig[],
  },
  vehicle_glass_types: {
    title: 'Araç Cam Tipleri',
    columns: [
      { field: 'name', headerName: 'Tip', flex: 1 },
    ] as GridColDef[],
    fields: [
      { name: 'name', label: 'Tip', type: 'text', required: true },
      { name: 'is_active', label: 'Aktif', type: 'switch' },
    ] as FieldConfig[],
  },
  installation_methods: {
    title: 'Montaj Şekilleri',
    columns: [
      { field: 'name', headerName: 'Montaj Şekli', flex: 1 },
    ] as GridColDef[],
    fields: [
      { name: 'name', label: 'Montaj Şekli', type: 'text', required: true },
      { name: 'is_active', label: 'Aktif', type: 'switch' },
    ] as FieldConfig[],
  },
  service_locations: {
    title: 'İşlem Yerleri',
    columns: [
      { field: 'name', headerName: 'İşlem Yeri', flex: 1 },
    ] as GridColDef[],
    fields: [
      { name: 'name', label: 'İşlem Yeri', type: 'text', required: true },
      { name: 'is_active', label: 'Aktif', type: 'switch' },
    ] as FieldConfig[],
  },
}

export function SettingsClient() {
  const [tabValue, setTabValue] = useState(0)
  const [data, setData] = useState<Record<string, Record<string, unknown>[]>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentTable, setCurrentTable] = useState('')
  const [editingItem, setEditingItem] = useState<Record<string, unknown> | null>(null)
  const [deletingItem, setDeletingItem] = useState<Record<string, unknown> | null>(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })
  const [relatedData] = useState<Record<string, Record<string, unknown>[]>>({})

  const tables = Object.keys(parameterConfigs)
  const currentTableKey = tables[tabValue]
  const config = parameterConfigs[currentTableKey as keyof typeof parameterConfigs]

  // İlişkisel verileri yükle (artık gerek yok, araç yönetimi ayrı sayfada)
  const loadRelatedData = async () => {
    // Removed: vehicle data now managed in /admin/vehicle-management
  }

  // Veri yükleme
  const loadData = async (table: string) => {
    setLoading(prev => ({ ...prev, [table]: true }))
    try {
      const response = await fetch(`/api/parameters/${table}`)
      const result = await response.json()
      setData(prev => ({ ...prev, [table]: result.data || [] }))
    } catch (error) {
      console.error('Veri yükleme hatası:', error)
      showSnackbar('Veri yüklenirken hata oluştu', 'error')
    } finally {
      setLoading(prev => ({ ...prev, [table]: false }))
    }
  }

  useEffect(() => {
    // İlişkisel verileri bir kez yükle
    loadRelatedData()
  }, [])

  useEffect(() => {
    if (currentTableKey) {
      loadData(currentTableKey)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTableKey])

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleAdd = () => {
    setEditingItem(null)
    setCurrentTable(currentTableKey)
    setModalOpen(true)
  }

  const handleEdit = (row: Record<string, unknown>) => {
    setEditingItem(row)
    setCurrentTable(currentTableKey)
    setModalOpen(true)
  }

  const handleDelete = (row: Record<string, unknown>) => {
    setDeletingItem(row)
    setDeleteDialogOpen(true)
  }

  const handleSave = async (formData: Record<string, unknown>) => {
    try {
      const method = editingItem ? 'PUT' : 'POST'
      const body = editingItem ? { ...formData, id: editingItem.id } : formData

      const response = await fetch(`/api/parameters/${currentTable}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error('İşlem başarısız')
      }

      showSnackbar(
        editingItem ? 'Kayıt güncellendi' : 'Kayıt eklendi',
        'success'
      )
      setModalOpen(false)
      loadData(currentTable)
    } catch {
      showSnackbar('İşlem sırasında hata oluştu', 'error')
    }
  }

  const confirmDelete = async () => {
    if (!deletingItem?.id) return
    
    try {
      const response = await fetch(
        `/api/parameters/${currentTableKey}?id=${deletingItem.id}`,
        { method: 'DELETE' }
      )

      if (!response.ok) {
        throw new Error('Silme başarısız')
      }

      showSnackbar('Kayıt silindi', 'success')
      setDeleteDialogOpen(false)
      loadData(currentTableKey)
    } catch {
      showSnackbar('Silme sırasında hata oluştu', 'error')
    }
  }

  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, minHeight: '70vh' }}>
        {/* Sol Taraf - Vertical Menü */}
        <Paper sx={{ width: 280, flexShrink: 0, overflow: 'auto' }}>
          <Tabs
            orientation="vertical"
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            sx={{
              borderRight: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                alignItems: 'flex-start',
                textAlign: 'left',
                px: 3,
                py: 2,
                minHeight: 48,
              },
            }}
          >
            {tables.map((table) => (
              <Tab
                key={table}
                label={parameterConfigs[table as keyof typeof parameterConfigs].title}
              />
            ))}
          </Tabs>
        </Paper>

        {/* Sağ Taraf - İçerik */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {tables.map((table, index) => (
            <TabPanel key={table} value={tabValue} index={index}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  {config.title}
                </Typography>
                <ParameterTable
                  data={data[table] || []}
                  columns={config.columns}
                  loading={loading[table] || false}
                  onAdd={handleAdd}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  title={config.title}
                />
              </Paper>
            </TabPanel>
          ))}
        </Box>
      </Box>

      <ParameterModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialData={editingItem || undefined}
        fields={config.fields}
        title={editingItem ? `${config.title} Düzenle` : `Yeni ${config.title} Ekle`}
        relatedData={relatedData}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        itemName={(deletingItem?.name || deletingItem?.code) as string | undefined}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

