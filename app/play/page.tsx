'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGameState } from '@/hooks/useGameState'
import { useAudio } from '@/hooks/useAudio'
import { MokugyoFish } from '@/components/MokugyoFish'
import { FloatingText } from '@/components/FloatingText'
import { ScoreDisplay } from '@/components/ScoreDisplay'
import { ShakeOverlay } from '@/components/ShakeOverlay'
import { getRandomFloatingText } from '@/lib/floatingTexts'
import { getRotationDuration } from '@/lib/rotation'

type FloatingEntry = { id: string; text: string; x: number; y: number }

export default function PlayPage() {
  const router = useRouter()
  const { score, fish, difficulty, hitFish, expireFish, start, stop } = useGameState()
  const { play, stop: stopAudio, setPlaybackRate, playHitSound } = useAudio('/audio/dabei-zhou.mp3')
  const [floatingTexts, setFloatingTexts] = useState<FloatingEntry[]>([])

  useEffect(() => {
    start()
    play()
    return () => stopAudio()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setPlaybackRate(difficulty.playbackRate)
  }, [difficulty.playbackRate, setPlaybackRate])

  const handleHit = (id: string, x: number, y: number) => {
    playHitSound('/audio/mokugyo-hit.mp3')
    hitFish(id)
    setFloatingTexts(prev => [
      ...prev,
      { id: crypto.randomUUID(), text: getRandomFloatingText(), x, y },
    ])
  }

  const handleFinish = () => {
    stop()
    stopAudio()
    sessionStorage.setItem('nigutime_score', score.toString())
    sessionStorage.removeItem('nigutime_submitted')
    router.push('/result')
  }

  return (
    <div className="relative w-full h-screen bg-temple-bg overflow-hidden select-none">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/background.png"
        className="fixed inset-0 m-auto w-[90vmin] h-[90vmin] object-contain opacity-20 pointer-events-none animate-spin-bg"
        style={{ '--spin-duration': `${getRotationDuration(score)}s` } as React.CSSProperties}
        alt=""
      />
      <ShakeOverlay active={difficulty.playbackRate >= 2} />

      <div className="absolute top-4 right-4 z-10">
        <ScoreDisplay score={score} />
      </div>

      <button
        onClick={handleFinish}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10
          bg-amber-900 hover:bg-amber-800 text-yellow-200 border border-yellow-700
          px-6 py-3 rounded-xl text-lg font-semibold"
      >
        功德圓滿
      </button>

      {fish.map(f => (
        <MokugyoFish
          key={f.id}
          id={f.id}
          x={f.x}
          y={f.y}
          onHit={(id) => handleHit(id, f.x, f.y)}
          onExpire={expireFish}
        />
      ))}

      {floatingTexts.map(ft => (
        <FloatingText
          key={ft.id}
          id={ft.id}
          text={ft.text}
          x={ft.x}
          y={ft.y}
          onDone={(id) => setFloatingTexts(prev => prev.filter(t => t.id !== id))}
        />
      ))}
    </div>
  )
}
