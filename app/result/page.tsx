'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLeaderboard } from '@/hooks/useLeaderboard'

export default function ResultPage() {
  const router = useRouter()
  const { submitScore } = useLeaderboard()
  const [score, setScore] = useState(0)
  const [nickname, setNickname] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const saved = sessionStorage.getItem('nigutime_score')
    if (!saved) { router.push('/'); return }
    setScore(parseInt(saved, 10))
    if (sessionStorage.getItem('nigutime_submitted') === 'true') setSubmitted(true)
  }, [router])

  const handleSubmit = async () => {
    if (!nickname.trim()) { setError('請輸入法號'); return }
    if (nickname.length > 20) { setError('法號最多 20 字'); return }
    setSubmitting(true)
    const id = await submitScore(nickname.trim(), score)
    sessionStorage.setItem('nigutime_submitted', 'true')
    setSubmitting(false)
    router.push(`/?leaderboard=open${id ? `&highlight=${id}` : ''}`)
  }

  return (
    <div className="min-h-screen bg-temple-bg flex items-center justify-center">
      <div className="bg-amber-950 border border-yellow-800 rounded-2xl p-8
        w-full max-w-sm text-center">
        <h1 className="text-3xl font-bold text-yellow-300 mb-2">功德圓滿</h1>
        <p className="text-yellow-200 text-lg mb-6">本次累積功德值</p>
        <p className="text-6xl font-bold text-yellow-400 mb-8">{score}</p>

        {submitted ? (
          <p className="text-yellow-300">功德已上傳，阿彌陀佛🙏</p>
        ) : (
          <>
            <input
              type="text"
              value={nickname}
              onChange={e => { setNickname(e.target.value); setError('') }}
              placeholder="請輸入您的法號"
              maxLength={20}
              className="w-full bg-amber-900 border border-yellow-700 text-yellow-100
                placeholder-yellow-600 rounded-lg px-4 py-2 mb-2 text-center"
            />
            {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-yellow-700 hover:bg-yellow-600 disabled:opacity-50
                text-white font-semibold py-2 rounded-lg mt-2"
            >
              {submitting ? '上傳中...' : '上傳功德'}
            </button>
          </>
        )}

        <button
          onClick={() => router.push('/')}
          className="mt-4 text-yellow-500 hover:text-yellow-300 text-sm underline block"
        >
          回首頁
        </button>
      </div>
    </div>
  )
}
