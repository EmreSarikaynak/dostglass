'use client'

import { useRouter } from 'next/navigation'
import ClaimForm from './ClaimForm'

interface ClaimFormClientProps {
  redirectPath?: string
}

export function ClaimFormClient({ redirectPath = '/admin/claims' }: ClaimFormClientProps) {
  const router = useRouter()

  const handleSuccess = () => {
    router.push(redirectPath)
  }

  return <ClaimForm onSuccess={handleSuccess} />
}
