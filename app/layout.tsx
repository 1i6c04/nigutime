import type { Metadata } from 'next'
import { Noto_Serif_TC } from 'next/font/google'
import './globals.css'

const notoSerifTC = Noto_Serif_TC({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://mokugyo.click'),
  title: '木魚功德',
  description: '敲木魚積功德，聆聽大悲咒，免費佛系解壓小遊戲，速速修行！',
  keywords: ['木魚', '大悲咒', '功德', '佛系遊戲', '點擊遊戲', '修行', '解壓遊戲'],
  openGraph: {
    title: '木魚功德 — 大悲咒修行遊戲',
    description: '敲木魚積功德，聆聽大悲咒',
    url: 'https://mokugyo.click',
    siteName: '木魚功德',
    locale: 'zh_TW',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '木魚功德 — 大悲咒修行遊戲',
    description: '敲木魚積功德，聆聽大悲咒',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body className={`${notoSerifTC.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}
