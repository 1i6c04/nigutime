import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGameState } from './useGameState'

describe('useGameState', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('starts with score 0 and not running', () => {
    const { result } = renderHook(() => useGameState())
    expect(result.current.score).toBe(0)
    expect(result.current.isRunning).toBe(false)
    expect(result.current.fish).toHaveLength(0)
  })

  it('sets isRunning true after start()', () => {
    const { result } = renderHook(() => useGameState())
    act(() => result.current.start())
    expect(result.current.isRunning).toBe(true)
  })

  it('increments score and removes fish on hitFish()', () => {
    const { result } = renderHook(() => useGameState())
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(4001))
    expect(result.current.fish.length).toBeGreaterThan(0)
    const id = result.current.fish[0].id
    act(() => result.current.hitFish(id))
    expect(result.current.score).toBe(1)
    expect(result.current.fish.find(f => f.id === id)).toBeUndefined()
  })

  it('stops game and clears fish on stop()', () => {
    const { result } = renderHook(() => useGameState())
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(4001))
    act(() => result.current.stop())
    expect(result.current.isRunning).toBe(false)
    expect(result.current.fish).toHaveLength(0)
  })
})
