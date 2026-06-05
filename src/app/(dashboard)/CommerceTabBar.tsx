'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Store, Palette } from 'lucide-react'

export default function CommerceTabBar() {
  const pathname = usePathname()

  const isCommerce = pathname === '/dashboard/settings'
  const isCarte = pathname.startsWith('/dashboard/ma-carte')

  if (!isCommerce && !isCarte) return null

  return (
    <div className="border-b border-[#E8E8E3] bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-1 py-2">
          <Link
            href="/dashboard/settings"
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={isCommerce
              ? { backgroundColor: '#6C47FF', color: 'white' }
              : { color: '#6B6B6B', backgroundColor: 'transparent' }
            }
          >
            <Store className="size-4 inline-block mr-1.5" strokeWidth={1.9} />Infos commerce
          </Link>
          <Link
            href="/dashboard/ma-carte"
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={isCarte
              ? { backgroundColor: '#6C47FF', color: 'white' }
              : { color: '#6B6B6B', backgroundColor: 'transparent' }
            }
          >
            <Palette className="size-4 inline-block mr-1.5" strokeWidth={1.9} />Ma carte
          </Link>
        </div>
      </div>
    </div>
  )
}
