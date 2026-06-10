// Shared banner pattern definitions used by both the server-side PNG generator
// (sharp) and the client-side tile previews. Each motif is authored as a
// tileable 80×80 SVG fragment drawn in white at opacity 0.15 — a discrete
// texture, never a loud graphic.

export type BannerPattern = 'none' | 'hearts' | 'confetti' | 'waves' | 'dots' | 'stars'

export const BANNER_PATTERNS: { id: BannerPattern; label: string }[] = [
  { id: 'none', label: 'Aucun' },
  { id: 'hearts', label: 'Cœurs' },
  { id: 'confetti', label: 'Confettis' },
  { id: 'waves', label: 'Vagues' },
  { id: 'dots', label: 'Pois' },
  { id: 'stars', label: 'Étoiles' },
]

const PATTERN_IDS = BANNER_PATTERNS.map(p => p.id)

export function isBannerPattern(value: unknown): value is BannerPattern {
  return typeof value === 'string' && (PATTERN_IDS as string[]).includes(value)
}

const WHITE = 'fill="#fff" fill-opacity="0.15"'
const WHITE_STROKE = 'stroke="#fff" stroke-opacity="0.15" stroke-width="3" fill="none"'

// Inner SVG markup for a single tileable 80×80 tile. The caller positions it.
export function patternMotif(pattern: BannerPattern): string {
  switch (pattern) {
    case 'dots':
      return `<circle cx="20" cy="20" r="6" ${WHITE}/><circle cx="60" cy="60" r="6" ${WHITE}/>`
    case 'hearts':
      return `<path d="M40 54 C26 43 20 34 29 28 C34 24 40 28 40 33 C40 28 46 24 51 28 C60 34 54 43 40 54 Z" ${WHITE}/>`
    case 'stars':
      return `<path d="M40 24 L44.7 36.3 L57.8 37 L47.6 45.2 L51 57.9 L40 50.5 L29 57.9 L32.4 45.2 L22.2 37 L35.3 36.3 Z" ${WHITE}/>`
    case 'confetti':
      return `<g ${WHITE}>` +
        `<rect x="10" y="14" width="11" height="4" rx="1" transform="rotate(45 15.5 16)"/>` +
        `<rect x="52" y="20" width="11" height="4" rx="1" transform="rotate(45 57.5 22)"/>` +
        `<rect x="26" y="50" width="11" height="4" rx="1" transform="rotate(45 31.5 52)"/>` +
        `<rect x="60" y="58" width="11" height="4" rx="1" transform="rotate(45 65.5 60)"/>` +
        `</g>`
    case 'waves':
      return `<path d="M0 24 Q20 14 40 24 T80 24" ${WHITE_STROKE}/>` +
        `<path d="M0 56 Q20 46 40 56 T80 56" ${WHITE_STROKE}/>`
    case 'none':
    default:
      return ''
  }
}

// Full 1000×400 banner SVG: solid primaryColor background with the motif tiled
// over it. Tiles are emitted manually (rather than via <pattern>) for maximal
// portability across SVG renderers.
export function bannerSvg(primaryColor: string, pattern: BannerPattern): string {
  const motif = patternMotif(pattern)
  let tiles = ''
  if (motif) {
    for (let y = 0; y < 400; y += 80) {
      for (let x = 0; x < 1000; x += 80) {
        tiles += `<g transform="translate(${x} ${y})">${motif}</g>`
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="400" viewBox="0 0 1000 400">` +
    `<rect width="1000" height="400" fill="${primaryColor}"/>${tiles}</svg>`
}

export type StampIcon = 'check' | 'star'

const CANVAS_W = 1000
const CANVAS_H = 400
const MAX_DIAMETER = 140

function computeDiameter(perRow: number): number {
  return Math.min(MAX_DIAMETER, Math.floor((CANVAS_W - 80) / perRow) - 20)
}

// Checkmark centered at (cx, cy), sized to fit within `size`.
function checkIconSvg(cx: number, cy: number, size: number, color: string): string {
  const half = size / 2
  const x1 = cx - half, y1 = cy + half * 0.05
  const x2 = cx - half * 0.2, y2 = cy + half
  const x3 = cx + half, y3 = cy - half * 0.7
  return `<path d="M${x1.toFixed(2)} ${y1.toFixed(2)} L${x2.toFixed(2)} ${y2.toFixed(2)} L${x3.toFixed(2)} ${y3.toFixed(2)}" ` +
    `fill="none" stroke="${color}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`
}

// 5-point star centered at (cx, cy), sized to fit within `size`.
function starIconSvg(cx: number, cy: number, size: number, color: string): string {
  const outerR = size / 2
  const innerR = outerR * 0.45
  const points: string[] = []
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR
    const angle = (Math.PI / 5) * i - Math.PI / 2
    points.push(`${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`)
  }
  return `<polygon points="${points.join(' ')}" fill="${color}"/>`
}

// Picks a dark or light icon color so it stays visible against the filled
// stamp circle (white icons disappear on light stamp colors like #FFFFFF).
function iconColorFor(stampColor: string): string {
  const m = /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/.exec(stampColor)
  if (!m) return '#fff'
  const [r, g, b] = m.slice(1).map(h => parseInt(h, 16))
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b
  return luminance > 180 ? '#1A1A1A' : '#fff'
}

function stampIconSvg(cx: number, cy: number, diameter: number, icon: StampIcon, stampColor: string): string {
  const color = iconColorFor(stampColor)
  return icon === 'star' ? starIconSvg(cx, cy, diameter * 0.5, color) : checkIconSvg(cx, cy, diameter * 0.45, color)
}

// Renders a single horizontal row of `count` stamp circles, evenly spaced and
// centered horizontally, sized to use the full banner width.
function stampsRow(count: number, filled: number, cy: number, diameter: number, stampColor: string, stampIcon: StampIcon): string {
  const spacing = diameter * 0.25
  const startX = (CANVAS_W - count * (diameter + spacing)) / 2 + diameter / 2
  const r = diameter / 2

  let circles = ''
  for (let i = 0; i < count; i++) {
    const cx = startX + i * (diameter + spacing)
    if (i < filled) {
      circles += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${stampColor}" fill-opacity="1"/>` +
        stampIconSvg(cx, cy, diameter, stampIcon, stampColor)
    } else {
      circles += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${stampColor}" fill-opacity="0.35"/>`
    }
  }
  return circles
}

// Transparent 1000×400 SVG overlay drawing the stamps as one or two centered
// horizontal rows (filled = active stamp with icon, empty = faded slot).
// Composited as a separate layer over the background + pattern banner.
export function stampsRowSvg(stampColor: string, stampIcon: StampIcon, stampsCount: number, stampsRequired: number): string {
  const total = Math.max(stampsRequired, 1)
  const filled = Math.min(Math.max(stampsCount, 0), total)

  let circles: string
  if (total <= 5) {
    const diameter = computeDiameter(total)
    circles = stampsRow(total, filled, CANVAS_H / 2, diameter, stampColor, stampIcon)
  } else {
    const topCount = Math.ceil(total / 2)
    const bottomCount = Math.floor(total / 2)
    const topFilled = Math.min(filled, topCount)
    const bottomFilled = Math.max(0, filled - topCount)
    const diameter = computeDiameter(topCount)
    const rowSpacing = diameter * 0.4
    const totalHeight = 2 * diameter + rowSpacing
    const topCy = (CANVAS_H - totalHeight) / 2 + diameter / 2
    const bottomCy = topCy + diameter + rowSpacing
    circles = stampsRow(topCount, topFilled, topCy, diameter, stampColor, stampIcon) +
      stampsRow(bottomCount, bottomFilled, bottomCy, diameter, stampColor, stampIcon)
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="400" viewBox="0 0 1000 400">${circles}</svg>`
}

export function isStampIcon(value: unknown): value is StampIcon {
  return value === 'check' || value === 'star'
}

// Transparent 80×80 motif tile as a data URI, used as a CSS background for the
// client-side preview tiles (rendered over a primaryColor background).
export function patternTileDataUri(pattern: BannerPattern): string {
  const motif = patternMotif(pattern)
  if (!motif) return ''
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">${motif}</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
