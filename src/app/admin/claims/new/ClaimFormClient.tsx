'use client'

import { useRouter } from 'next/navigation'
import ClaimForm from './ClaimForm'

export function ClaimFormClient() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push('/admin/claims')
  }

  return <ClaimForm onSuccess={handleSuccess} />
}

