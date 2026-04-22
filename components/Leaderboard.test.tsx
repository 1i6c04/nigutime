import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Leaderboard } from './Leaderboard'
import type { Score } from '@/lib/supabase'

vi.mock('@/hooks/useLeaderboard', () => ({
  useLeaderboard: () => ({
    scores: [
      { id: 'id-1', nickname: '悟空', score: 99, created_at: '2024-01-01T00:00:00Z' },
      { id: 'id-2', nickname: '八戒', score: 50, created_at: '2024-01-01T00:00:01Z' },
    ] as Score[],
    loading: false,
    submitScore: vi.fn(),
  }),
}))

describe('Leaderboard', () => {
  it('renders the title', () => {
    render(<Leaderboard isOpen={true} onClose={vi.fn()} highlightId={null} />)
    expect(screen.getByText('功德排行榜')).toBeInTheDocument()
  })

  it('renders player nicknames and scores', () => {
    render(<Leaderboard isOpen={true} onClose={vi.fn()} highlightId={null} />)
    expect(screen.getByText('悟空')).toBeInTheDocument()
    expect(screen.getByText('99')).toBeInTheDocument()
    expect(screen.getByText('八戒')).toBeInTheDocument()
  })

  it('highlights the row matching highlightId', () => {
    render(<Leaderboard isOpen={true} onClose={vi.fn()} highlightId="id-2" />)
    const row = screen.getByText('八戒').closest('tr')
    expect(row).toHaveClass('bg-yellow-500/30')
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(<Leaderboard isOpen={true} onClose={onClose} highlightId={null} />)
    fireEvent.click(screen.getByRole('button', { name: /關閉/i }))
    expect(onClose).toHaveBeenCalled()
  })

  it('renders nothing when isOpen is false', () => {
    render(<Leaderboard isOpen={false} onClose={vi.fn()} highlightId={null} />)
    expect(screen.queryByText('功德排行榜')).not.toBeInTheDocument()
  })
})
