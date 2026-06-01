'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const LS_KEY = 'onboarding_nav_clicked'

interface Props {
  hasBusinessName: boolean
  variant?: 'desktop' | 'mobile'
  onNavigate?: () => void
}

export default function NavSettingsHint({ hasBusinessName, variant = 'desktop', onNavigate }: Props) {
  const [hinted, setHinted] = useState(false)

  useEffect(() => {
    // Layout redirect guarantees business_name is always set for dashboard users,
    // so base the hint purely on whether the user has ever visited settings.
    if (localStorage.getItem(LS_KEY) !== 'true') {
      setHinted(true)
    }
  }, [])

  function handleClick() {
    localStorage.setItem(LS_KEY, 'true')
    setHinted(false)
    onNavigate?.()
  }

  if (variant === 'mobile') {
    return (
      <Link
        href="/dashboard/settings"
        onClick={handleClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
          hinted
            ? 'text-[#6C47FF] bg-[#6C47FF]/10 animate-pulse ring-1 ring-[#6C47FF]/30'
            : 'text-[#1A1A1A] hover:bg-[#F7F6F3]'
        }`}
      >
        Mon commerce
      </Link>
    )
  }

  return (
    <Link
      href="/dashboard/settings"
      onClick={handleClick}
      className={`text-sm font-medium transition-all rounded-lg ${
        hinted
          ? 'text-[#6C47FF] animate-pulse bg-[#6C47FF]/10 px-2 py-1 ring-1 ring-[#6C47FF]/30'
          : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
      }`}
    >
      Mon commerce
    </Link>
  )
}
