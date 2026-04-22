import React from 'react'

type Props = { score: number }

export function ScoreDisplay({ score }: Props) {
  return (
    <div className="text-2xl font-bold text-yellow-200 bg-black/40 px-4 py-2 rounded-lg">
      功德值：{score}
    </div>
  )
}
