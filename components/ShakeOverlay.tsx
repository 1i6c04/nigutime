import React from 'react'

type Props = { active: boolean }

export function ShakeOverlay({ active }: Props) {
  if (!active) return null
  return (
    <div className="fixed inset-0 pointer-events-none z-20 animate-screen-shake">
      <p className="absolute top-1/4 left-1/2 -translate-x-1/2
        text-red-400 font-bold text-lg text-center whitespace-nowrap">
        法師超度加速中⚡
      </p>
    </div>
  )
}
