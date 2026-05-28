'use client'

import { useEffect, useState } from 'react'

export default function Toast({ message, onHide }: { message: string; onHide: () => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const show = setTimeout(() => setVisible(true), 10)
    const hide = setTimeout(() => {
      setVisible(false)
      setTimeout(onHide, 310)
    }, 4000)
    return () => { clearTimeout(show); clearTimeout(hide) }
  }, [onHide])

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: `translateX(-50%) translateY(${visible ? '0px' : '16px'})`,
        opacity: visible ? 1 : 0,
        transition: 'transform 300ms ease, opacity 300ms ease',
        zIndex: 200,
        pointerEvents: 'none',
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        whiteSpace: 'nowrap',
        boxShadow: '0 4px 24px rgba(0,0,0,0.22)',
      }}
    >
      <span style={{ color: '#4ade80', fontSize: 14, fontWeight: 700, lineHeight: 1 }}>✓</span>
      <span style={{ color: 'white', fontSize: 14, fontWeight: 500 }}>{message}</span>
    </div>
  )
}
