'use client'

import React, { useEffect, useRef, useState } from 'react'

type Props = {
  id: string
  x: number
  y: number
  onHit: (id: string) => void
  onExpire: (id: string) => void
}

export function MokugyoFish({ id, x, y, onHit, onExpire }: Props) {
  const [hit, setHit] = useState(false)
  const hitRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      if (!hitRef.current) onExpire(id)
    }, 3000)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [id, onExpire])

  const handleClick = () => {
    if (hitRef.current) return
    hitRef.current = true
    setHit(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    onHit(id)
  }

  return (
    <div
      className="absolute"
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
    >
      <button
        aria-label="木魚"
        onClick={handleClick}
        className={`w-20 h-20 transition-all duration-150 select-none bg-transparent
          ${hit ? 'scale-125 opacity-0' : 'hover:scale-110 active:scale-95'}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/mokugyo.png"
          alt="木魚"
          className={`w-full h-full object-contain ${hit ? 'drop-shadow-[0_0_16px_gold]' : 'drop-shadow-md'}`}
        />
      </button>
    </div>
  )
}
