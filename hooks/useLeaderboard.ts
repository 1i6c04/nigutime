'use client'

import { useState, useEffect } from 'react'
import { supabase, Score } from '@/lib/supabase'

export function useLeaderboard() {
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)

  const fetchScores = async () => {
    const { data } = await supabase
      .from('scores')
      .select('*')
      .order('score', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(20)
    if (data) setScores(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchScores()

    const channel = supabase
      .channel('scores-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'scores' },
        () => fetchScores()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const submitScore = async (nickname: string, score: number): Promise<string | null> => {
    const { data, error } = await supabase
      .from('scores')
      .insert({ nickname: nickname.slice(0, 20), score })
      .select('id')
      .single()
    if (error || !data) return null
    return data.id as string
  }

  return { scores, loading, submitScore }
}
