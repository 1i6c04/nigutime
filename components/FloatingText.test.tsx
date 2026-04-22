import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FloatingText } from './FloatingText'

describe('FloatingText', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('renders the text', () => {
    render(<FloatingText id="t1" text="功德+1" x={50} y={50} onDone={vi.fn()} />)
    expect(screen.getByText('功德+1')).toBeInTheDocument()
  })

  it('calls onDone with id after 800ms', () => {
    const onDone = vi.fn()
    render(<FloatingText id="t1" text="功德+1" x={50} y={50} onDone={onDone} />)
    vi.advanceTimersByTime(800)
    expect(onDone).toHaveBeenCalledWith('t1')
  })
})
