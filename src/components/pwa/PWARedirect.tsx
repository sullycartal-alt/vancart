'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PWARedirect() {
  const router = useRouter()

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as { standalone?: boolean }).standalone === true

    if (!isStandalone) return

    const hasCustomer = document.cookie
      .split(';')
      .some((c) => c.trim().startsWith('vancart_customer_id='))

    if (hasCustomer) router.replace('/wallet')
  }, [router])

  return null
}
