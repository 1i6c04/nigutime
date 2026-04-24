'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Leaderboard } from '@/components/Leaderboard'

function HomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [leaderboardOpen, setLeaderboardOpen] = useState(false)
  const [highlightId, setHighlightId] = useState<string | null>(null)

  useEffect(() => {
    if (searchParams.get('leaderboard') === 'open') {
      setLeaderboardOpen(true)
      setHighlightId(searchParams.get('highlight'))
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-temple-bg flex flex-col items-center justify-center
      text-center px-4">
      <h1 className="text-5xl font-bold text-yellow-300 mb-2">木魚功德</h1>
      <p className="text-yellow-500 text-lg mb-2">南無大悲觀世音菩薩</p>
      <p className="text-yellow-600 text-sm mb-12">敲木魚，積功德，速速修行</p>

      <button
        onClick={() => { sessionStorage.setItem('nigutime_started', '1'); router.push('/play') }}
        className="bg-yellow-700 hover:bg-yellow-600 text-white font-bold
          text-xl px-10 py-4 rounded-2xl shadow-lg mb-4"
      >
        開始念經
      </button>

      <button
        onClick={() => setLeaderboardOpen(true)}
        className="text-yellow-500 hover:text-yellow-300 underline text-base"
      >
        功德排行榜
      </button>

      <Leaderboard
        isOpen={leaderboardOpen}
        onClose={() => { setLeaderboardOpen(false); setHighlightId(null) }}
        highlightId={highlightId}
      />
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  )
}
