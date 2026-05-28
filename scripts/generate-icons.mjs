import sharp from 'sharp'
import { mkdir, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', 'public', 'icons')

if (!existsSync(OUT)) await mkdir(OUT, { recursive: true })

// SVG source: rounded square #6C47FF with white "V"
function makeSvg(size, padding = 0) {
  const inner = size - padding * 2
  const r = Math.round(inner * 0.22)   // corner radius
  const fontSize = Math.round(inner * 0.55)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect x="${padding}" y="${padding}" width="${inner}" height="${inner}" rx="${r}" ry="${r}" fill="#6C47FF"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
        font-family="Arial, Helvetica, sans-serif" font-weight="bold"
        font-size="${fontSize}" fill="#ffffff">V</text>
</svg>`
}

// Splash screen SVG: full #6C47FF background, centred logo
function makeSplashSvg(w, h) {
  const logoSize = Math.min(w, h) * 0.22
  const r = Math.round(logoSize * 0.22)
  const fontSize = Math.round(logoSize * 0.55)
  const lx = (w - logoSize) / 2
  const ly = (h - logoSize) / 2
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="#6C47FF"/>
  <rect x="${lx}" y="${ly}" width="${logoSize}" height="${logoSize}" rx="${r}" ry="${r}" fill="rgba(255,255,255,0.20)"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
        font-family="Arial, Helvetica, sans-serif" font-weight="bold"
        font-size="${fontSize}" fill="#ffffff">V</text>
</svg>`
}

async function pngFromSvg(svgStr, outPath) {
  await sharp(Buffer.from(svgStr)).png().toFile(outPath)
  console.log('✓', outPath.replace(join(__dirname, '..'), ''))
}

// Standard icons
const sizes = [72, 96, 128, 144, 152, 192, 384, 512]
for (const s of sizes) {
  await pngFromSvg(makeSvg(s), join(OUT, `icon-${s}.png`))
}

// Maskable icons — 20% padding on each side
for (const s of [192, 512]) {
  const pad = Math.round(s * 0.20)
  await pngFromSvg(makeSvg(s, pad), join(OUT, `icon-maskable-${s}.png`))
}

// Apple touch icon 180×180
await pngFromSvg(makeSvg(180), join(OUT, 'apple-touch-icon.png'))

// Splash screens
const splashes = [
  [2048, 2732],
  [1668, 2388],
  [1536, 2048],
  [1125, 2436],
  [1242, 2208],
  [750, 1334],
  [640, 1136],
]
for (const [w, h] of splashes) {
  await pngFromSvg(makeSplashSvg(w, h), join(OUT, `splash-${w}x${h}.png`))
}

console.log('\n✅ All PWA icons generated in public/icons/')
