'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { getDifficulty, DifficultyTier } from '@/lib/difficulty'

export type Fish = {
  id: string
  x: number
  y: number
}

export function useGameState() {
  const [score, setScore] = useState(0)
  const [fish, setFish] = useState<Fish[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const spawnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scoreRef = useRef(0)

  const spawnFish = useCallback((tier: DifficultyTier) => {
    setFish(prev => {
      if (prev.length >= tier.maxFish) return prev
      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          x: Math.random() * 80 + 5,
          y: Math.random() * 65 + 10,
        },
      ]
    })
  }, [])

  const scheduleNextSpawn = useCallback((tier: DifficultyTier) => {
    const interval =
      tier.minInterval + Math.random() * (tier.maxInterval - tier.minInterval)
    spawnTimerRef.current = setTimeout(() => {
      const currentTier = getDifficulty(scoreRef.current)
      spawnFish(currentTier)
      scheduleNextSpawn(currentTier)
    }, interval)
  }, [spawnFish])

  useEffect(() => {
    if (!isRunning) return
    const tier = getDifficulty(scoreRef.current)
    scheduleNextSpawn(tier)
    return () => {
      if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current)
    }
  }, [isRunning, scheduleNextSpawn])

  const hitFish = useCallback((id: string) => {
    setFish(prev => prev.filter(f => f.id !== id))
    setScore(prev => {
      const next = prev + 1
      scoreRef.current = next
      return next
    })
  }, [])

  const expireFish = useCallback((id: string) => {
    setFish(prev => prev.filter(f => f.id !== id))
  }, [])

  const start = useCallback(() => {
    setScore(0)
    scoreRef.current = 0
    setFish([])
    setIsRunning(true)
  }, [])

  const stop = useCallback(() => {
    setIsRunning(false)
    setFish([])
    if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current)
  }, [])

  return {
    score,
    fish,
    isRunning,
    difficulty: getDifficulty(score),
    hitFish,
    expireFish,
    start,
    stop,
  }
}
