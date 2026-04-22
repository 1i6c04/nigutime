import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MokugyoFish } from './MokugyoFish'

describe('MokugyoFish', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('renders at the given position', () => {
    const { container } = render(
      <MokugyoFish id="t1" x={30} y={50} onHit={vi.fn()} onExpire={vi.fn()} />
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveStyle({ left: '30%', top: '50%' })
  })

  it('calls onHit with the fish id when clicked', () => {
    const onHit = vi.fn()
    render(<MokugyoFish id="t1" x={30} y={50} onHit={onHit} onExpire={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /木魚/i }))
    expect(onHit).toHaveBeenCalledWith('t1')
  })

  it('calls onExpire with the fish id after 3 seconds', () => {
    const onExpire = vi.fn()
    render(<MokugyoFish id="t1" x={30} y={50} onHit={vi.fn()} onExpire={onExpire} />)
    vi.advanceTimersByTime(3000)
    expect(onExpire).toHaveBeenCalledWith('t1')
  })

  it('does not call onExpire if unmounted before timeout', () => {
    const onExpire = vi.fn()
    const { unmount } = render(
      <MokugyoFish id="t1" x={30} y={50} onHit={vi.fn()} onExpire={onExpire} />
    )
    fireEvent.click(screen.getByRole('button', { name: /木魚/i }))
    unmount()
    vi.advanceTimersByTime(3000)
    expect(onExpire).not.toHaveBeenCalled()
  })
})
