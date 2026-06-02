const STATS = [
  { big: '67%', label: 'de dépenses en plus pour un client fidèle vs. un nouveau' },
  { big: '5×', label: 'moins cher de fidéliser que d\'acquérir un client' },
  { big: '5 min', label: 'pour lancer votre programme, montre en main' },
  { big: '0', label: 'appli à télécharger, jamais, pour vos clients' },
]

export default function Stats() {
  return (
    <section className="relative z-[2]" style={{ padding: '110px 0' }}>
      <div className="max-w-[1200px] mx-auto px-8">
        <div
          className="reveal grid grid-cols-2 lg:grid-cols-4 gap-7 relative overflow-hidden rounded-[28px] p-[64px_48px]"
          style={{ background: 'var(--violet)', color: '#fff' }}
        >
          {/* dashed rings */}
          <div className="absolute pointer-events-none rounded-full" style={{ right: -80, top: -80, width: 360, height: 360, border: '1.5px dashed rgba(255,255,255,.25)' }} />
          <div className="absolute pointer-events-none rounded-full" style={{ right: -20, top: -20, width: 240, height: 240, border: '1.5px dotted rgba(255,255,255,.2)' }} />

          {STATS.map(({ big, label }) => (
            <div key={big} className="relative z-[1]">
              <div className="font-bold leading-[1]" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(44px, 5vw, 68px)', letterSpacing: '-0.04em' }}>{big}</div>
              <p className="mt-3 text-[14px] leading-[1.5]" style={{ color: 'rgba(255,255,255,.8)' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
