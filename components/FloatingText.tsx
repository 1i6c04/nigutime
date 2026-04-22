'use client'

import React, { useEffect } from 'react'

type Props = {
  id: string
  text: string
  x: number
  y: number
  onDone: (id: string) => void
}

export function FloatingText({ id, text, x, y, onDone }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => onDone(id), 800)
    return () => clearTimeout(timer)
  }, [id, onDone])

  return (
    <span
      className="absolute pointer-events-none text-yellow-300 font-bold text-xl
        animate-float-up select-none z-10"
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
    >
      {text}
    </span>
  )
}
