import React from 'react'

export function Sk({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`animate-pulse rounded-xl bg-[#E8E8E3] ${className}`} style={style} />
}
