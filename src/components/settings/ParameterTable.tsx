'use client'

import { useState } from 'react'
import {
  Box,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
} from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { Add, Search, Edit, Delete, Check, Close } from '@mui/icons-material'

interface ParameterTableProps {
  data: Record<string, unknown>[]
  columns: GridColDef[]
  loading: boolean
  onAdd: () => void
  onEdit: (row: Record<string, unknown>) => void
  onDelete: (row: Record<string, unknown>) => void
  title: string
  searchPlaceholder?: string
}

export function ParameterTable({
  data,
  columns,
  loading,
  onAdd,
  onEdit,
  onDelete,
  title,
  searchPlaceholder = 'Ara...',
}: ParameterTableProps) {
  const [searchText, setSearchText] = useState('')

  const filteredData = data.filter((row) => {
    const searchLower = searchText.toLowerCase()
    return Object.values(row).some((value) =>
      String(value).toLowerCase().includes(searchLower)
    )
  })

  const actionColumn: GridColDef = {
    field: 'actions',
    headerName: 'İşlemler',
    width: 120,
    sortable: false,
    renderCell: (params) => (
      <Box>
        <IconButton
          size="small"
          color="primary"
          onClick={() => onEdit(params.row)}
        >
          <Edit fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          color="error"
          onClick={() => onDelete(params.row)}
        >
          <Delete fontSize="small" />
        </IconButton>
      </Box>
    ),
  }

  const statusColumn: GridColDef = {
    field: 'is_active',
    headerName: 'Durum',
    width: 100,
    renderCell: (params) => (
      <Chip
        icon={params.value ? <Check /> : <Close />}
        label={params.value ? 'Aktif' : 'Pasif'}
        color={params.value ? 'success' : 'default'}
        size="small"
      />
    ),
  }

  const allColumns = [...columns, statusColumn, actionColumn]

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <TextField
          placeholder={searchPlaceholder}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          size="small"
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        <Button variant="contained" startIcon={<Add />} onClick={onAdd}>
          Yeni Ekle
        </Button>
      </Box>

      <DataGrid
        rows={filteredData}
        columns={allColumns}
        loading={loading}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 10 },
          },
        }}
        pageSizeOptions={[5, 10, 25, 50]}
        disableRowSelectionOnClick
        autoHeight
        sx={{
          bgcolor: 'white',
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
        }}
      />
    </Box>
  )
}

