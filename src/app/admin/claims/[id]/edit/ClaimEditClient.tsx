'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Box, CircularProgress, Alert, Button } from '@mui/material'
import { ArrowBack as BackIcon } from '@mui/icons-material'
import ClaimForm from '../../new/ClaimForm'
import { ClaimFormData, ClaimItem } from '@/types/claim'

export default function ClaimEditClient({ claimId }: { claimId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initialData, setInitialData] = useState<{
    formData: ClaimFormData
    items: ClaimItem[]
  } | null>(null)

  const fetchClaim = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/claims/${claimId}`)
      const result = await response.json()

      if (response.ok) {
        const claim = result.data
        
        // Form datasını hazırla
        const formData: ClaimFormData = {
          insurance_company_id: claim.insurance_company_id || '',
          agency_code: claim.agency_code || '',
          agency_name: claim.agency_name || '',
          policy_number: claim.policy_number || '',
          policy_start_date: claim.policy_start_date || '',
          policy_end_date: claim.policy_end_date || '',
          incident_type_id: claim.incident_type_id || '',
          damage_type_id: claim.damage_type_id || '',
          incident_city_id: claim.incident_city_id || '',
          incident_district_id: claim.incident_district_id || '',
          incident_date: claim.incident_date || '',
          insured_type_id: claim.insured_type_id || '',
          insured_name: claim.insured_name || '',
          insured_tax_office: claim.insured_tax_office || '',
          insured_tax_number: claim.insured_tax_number || '',
          insured_phone: claim.insured_phone || '',
          insured_mobile: claim.insured_mobile || '',
          driver_same_as_insured: claim.driver_same_as_insured || false,
          driver_name: claim.driver_name || '',
          driver_tc_number: claim.driver_tc_number || '',
          driver_phone: claim.driver_phone || '',
          driver_birth_date: claim.driver_birth_date || '',
          driver_license_class_id: claim.driver_license_class_id || '',
          driver_license_date: claim.driver_license_date || '',
          driver_license_place: claim.driver_license_place || '',
          driver_license_number: claim.driver_license_number || '',
          vehicle_plate: claim.vehicle_plate || '',
          vehicle_model_year: claim.vehicle_model_year?.toString() || '',
          vehicle_usage_type_id: claim.vehicle_usage_type_id || '',
          vehicle_category_id: claim.vehicle_category_id || '',
          vehicle_brand_id: claim.vehicle_brand_id || '',
          vehicle_model_id: claim.vehicle_model_id || '',
          notes: claim.notes || ''
        }

        // Cam kalemlerini hazırla
        const items: ClaimItem[] = claim.claim_items?.map((item: any) => ({
          id: item.id,
          glass_position_id: item.glass_position_id || '',
          glass_type_id: item.glass_type_id || '',
          glass_brand_id: item.glass_brand_id || '',
          glass_code: item.glass_code || '',
          glass_color_id: item.glass_color_id || '',
          glass_operation_id: item.glass_operation_id || '',
          installation_method_id: item.installation_method_id || '',
          service_location_id: item.service_location_id || '',
          unit_price: item.unit_price || 0,
          quantity: item.quantity || 1,
          subtotal: item.subtotal || 0,
          vat_rate: item.vat_rate || 20,
          vat_amount: item.vat_amount || 0,
          total_amount: item.total_amount || 0,
          customer_contribution: item.customer_contribution || false,
          additional_material_cost: item.additional_material_cost,
          additional_material_reason: item.additional_material_reason,
          notes: item.notes || ''
        })) || []

        setInitialData({ formData, items })
      } else {
        setError(result.error || 'İhbar yüklenemedi')
      }
    } catch (error) {
      console.error('İhbar yükleme hatası:', error)
      setError('İhbar yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }, [claimId])

  useEffect(() => {
    fetchClaim()
  }, [fetchClaim])

  const handleSuccess = () => {
    router.push(`/admin/claims/${claimId}`)
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error || !initialData) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>{error || 'İhbar bulunamadı'}</Alert>
        <Button variant="outlined" startIcon={<BackIcon />} onClick={() => router.push('/admin/claims')}>
          Geri Dön
        </Button>
      </Box>
    )
  }

  return (
    <ClaimForm
      mode="edit"
      claimId={claimId}
      initialFormData={initialData.formData}
      initialItems={initialData.items}
      onSuccess={handleSuccess}
    />
  )
}

