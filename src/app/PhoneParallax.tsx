'use client'

import { useEffect, useState } from 'react'

export default function PhoneParallax({ children }: { children: React.ReactNode }) {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div style={{ transform: `translateY(${scrollY * 0.08}px)` }}>
      {children}
    </div>
  )
}
