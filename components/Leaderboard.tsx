'use client'

import React from 'react'
import { useLeaderboard } from '@/hooks/useLeaderboard'

type Props = {
  isOpen: boolean
  onClose: () => void
  highlightId: string | null
}

export function Leaderboard({ isOpen, onClose, highlightId }: Props) {
  const { scores, loading } = useLeaderboard()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-amber-950 border border-yellow-700 rounded-xl p-6
        w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-yellow-300">功德排行榜</h2>
          <button
            aria-label="關閉"
            onClick={onClose}
            className="text-yellow-200 hover:text-white text-xl px-2"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <p className="text-yellow-200 text-center">載入中...</p>
        ) : (
          <table className="w-full text-yellow-100 table-fixed">
            <thead>
              <tr className="text-yellow-400 border-b border-yellow-800">
                <th className="py-2 pr-3 text-left w-12 whitespace-nowrap">名次</th>
                <th className="py-2 pr-3 text-left whitespace-nowrap">法號</th>
                <th className="py-2 text-right whitespace-nowrap">功德值</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((s, i) => (
                <tr
                  key={s.id}
                  className={`border-b border-yellow-900 ${
                    s.id === highlightId ? 'bg-yellow-500/30 font-bold' : ''
                  }`}
                >
                  <td className="py-2 pr-3">{i + 1}</td>
                  <td className="py-2 pr-3 text-left break-all">{s.nickname}</td>
                  <td className="py-2 text-right">{s.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
