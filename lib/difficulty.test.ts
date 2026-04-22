import { describe, it, expect } from 'vitest'
import { getDifficulty } from './difficulty'

describe('getDifficulty', () => {
  it('returns tier 0 for score 0', () => {
    const r = getDifficulty(0)
    expect(r.maxFish).toBe(1)
    expect(r.playbackRate).toBe(1.0)
  })

  it('returns tier 0 for score 9', () => {
    const r = getDifficulty(9)
    expect(r.maxFish).toBe(1)
    expect(r.playbackRate).toBe(1.0)
  })

  it('returns tier 1 for score 10', () => {
    const r = getDifficulty(10)
    expect(r.maxFish).toBe(2)
    expect(r.playbackRate).toBe(1.3)
  })

  it('returns tier 2 for score 30', () => {
    const r = getDifficulty(30)
    expect(r.maxFish).toBe(3)
    expect(r.playbackRate).toBe(1.6)
  })

  it('returns tier 3 for score 60', () => {
    const r = getDifficulty(60)
    expect(r.maxFish).toBe(4)
    expect(r.playbackRate).toBe(2.0)
  })

  it('returns tier 3 for score 100', () => {
    const r = getDifficulty(100)
    expect(r.maxFish).toBe(4)
    expect(r.playbackRate).toBe(2.0)
  })
})
