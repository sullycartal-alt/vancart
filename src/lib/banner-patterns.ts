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

const STAMP_DIAMETER = 65
const STAMP_GAP = 20
const STAMP_CY = 300
const MAX_STAMPS = 12

// Transparent 1000×400 SVG overlay drawing a centered horizontal row of stamp
// circles (filled = active stamp, empty = remaining slot). Composited as a
// separate layer over the background + pattern banner.
export function stampsRowSvg(primaryColor: string, stampsCount: number, stampsRequired: number): string {
  const total = Math.min(Math.max(stampsRequired, 1), MAX_STAMPS)
  const filled = Math.min(Math.max(stampsCount, 0), total)
  const r = STAMP_DIAMETER / 2
  const rowWidth = total * STAMP_DIAMETER + (total - 1) * STAMP_GAP
  const startX = (1000 - rowWidth) / 2

  let circles = ''
  for (let i = 0; i < total; i++) {
    const cx = startX + i * (STAMP_DIAMETER + STAMP_GAP) + r
    if (i < filled) {
      circles += `<circle cx="${cx}" cy="${STAMP_CY}" r="${r}" fill="#fff" fill-opacity="0.95"/>` +
        `<circle cx="${cx}" cy="${STAMP_CY}" r="20" fill="${primaryColor}"/>`
    } else {
      circles += `<circle cx="${cx}" cy="${STAMP_CY}" r="${r - 1}" fill="none" stroke="#fff" stroke-opacity="0.3" stroke-width="2"/>`
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="400" viewBox="0 0 1000 400">${circles}</svg>`
}

// Transparent 80×80 motif tile as a data URI, used as a CSS background for the
// client-side preview tiles (rendered over a primaryColor background).
export function patternTileDataUri(pattern: BannerPattern): string {
  const motif = patternMotif(pattern)
  if (!motif) return ''
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">${motif}</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
