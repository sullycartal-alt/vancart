'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PWARedirect() {
  const router = useRouter()
  // null = unknown (SSR + pre-hydration), true = standalone, false = browser
  const [isStandalone, setIsStandalone] = useState<boolean | null>(null)

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as { standalone?: boolean }).standalone === true

    setIsStandalone(standalone)

    if (!standalone) return

    const hasCustomer = document.cookie
      .split(';')
      .some((c) => c.trim().startsWith('vancart_customer_id='))

    if (hasCustomer) router.replace('/wallet')
  }, [router])

  // Render a neutral loading screen whenever we don't know yet (null) or are
  // definitely in standalone mode (true). This covers the marketing page so the
  // user never sees it flash before landing on /wallet.
  // Once we confirm browser mode (false), unmount immediately.
  if (isStandalone === false) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#F7F6F3]">
      <div className="w-10 h-10 rounded-full border-[3px] border-[#6C47FF]/20 border-t-[#6C47FF] animate-spin" />
    </div>
  )
}
