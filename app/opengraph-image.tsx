import { ImageResponse } from 'next/og'
import { readFile } from 'fs/promises'
import { join } from 'path'

export const runtime = 'nodejs'
export const alt = '木魚功德 — 大悲咒修行遊戲'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  const imageData = await readFile(join(process.cwd(), 'public/images/mokugyo.png'))
  const src = `data:image/png;base64,${imageData.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          background: '#1a0e05',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 28,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={400} height={290} alt="" />
        <div style={{ color: '#c9a84c', fontSize: 80, fontWeight: 900, letterSpacing: 8 }}>
          木魚功德
        </div>
        <div style={{ color: '#fbbf24', fontSize: 34 }}>
          敲木魚，積功德，速速修行
        </div>
      </div>
    ),
    { ...size },
  )
}
