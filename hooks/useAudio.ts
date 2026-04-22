'use client'

import { useRef, useCallback } from 'react'

export function useAudio(src: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const init = useCallback(() => {
    if (typeof window === 'undefined') return
    if (!audioRef.current) {
      audioRef.current = new Audio(src)
      audioRef.current.loop = true
    }
  }, [src])

  const play = useCallback(() => {
    init()
    audioRef.current?.play().catch(() => {})
  }, [init])

  const stop = useCallback(() => {
    if (!audioRef.current) return
    audioRef.current.pause()
    audioRef.current.currentTime = 0
  }, [])

  const setPlaybackRate = useCallback((rate: number) => {
    init()
    if (audioRef.current) audioRef.current.playbackRate = rate
  }, [init])

  const playHitSound = useCallback((hitSrc: string) => {
    new Audio(hitSrc).play().catch(() => {})
  }, [])

  return { play, stop, setPlaybackRate, playHitSound }
}
