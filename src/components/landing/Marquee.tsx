export default function Marquee() {
  const items = ['Sans plastique', 'Sans appli', 'Sans carte perdue', 'Dans le Wallet']
  const content = (
    <span className="flex items-center gap-[46px]" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 30, letterSpacing: '-0.03em', whiteSpace: 'nowrap' }}>
      {items.map((item, i) => (
        <>
          <span key={`item-${i}`} style={{ color: i % 2 === 0 ? '#fff' : '#4a4654' }}>{item}</span>
          <i key={`dot-${i}`} className="inline-block w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--violet-light)' }} />
        </>
      ))}
    </span>
  )

  return (
    <div className="overflow-hidden" style={{ background: 'var(--ink)', padding: '34px 0' }}>
      <div className="flex gap-[46px]" style={{ animation: 'marquee-scroll 28s linear infinite', width: 'max-content' }}>
        {content}
        {content}
      </div>
    </div>
  )
}
