// One-off asset pipeline: rasterizes icon-source.svg into the PWA icon set.
// Run with: npm run generate-icons
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const source = path.join(dirname, 'icon-source.svg')
const outDir = path.join(dirname, '..', 'public', 'icons')

const targets = [
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180 },
]

// Maskable icons need safe-area padding so the shape survives platform masking.
const maskablePadding = 0.2

async function run() {
  await mkdir(outDir, { recursive: true })

  for (const { file, size } of targets) {
    await sharp(source).resize(size, size).png().toFile(path.join(outDir, file))
  }

  const maskableSize = 512
  const innerSize = Math.round(maskableSize * (1 - maskablePadding * 2))
  const inner = await sharp(source).resize(innerSize, innerSize).png().toBuffer()

  await sharp({
    create: {
      width: maskableSize,
      height: maskableSize,
      channels: 4,
      background: '#9CAF88',
    },
  })
    .composite([{ input: inner, gravity: 'center' }])
    .png()
    .toFile(path.join(outDir, 'icon-maskable-512.png'))

  await sharp(source).resize(32, 32).png().toFile(path.join(dirname, '..', 'public', 'favicon.png'))

  console.log('Icons generated in public/icons and public/favicon.png')
}

run()
