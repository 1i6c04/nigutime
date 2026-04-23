import { describe, it, expect } from 'vitest'
import { getRotationDuration } from './rotation'

describe('getRotationDuration', () => {
  it('returns 25 for score 0', () => {
    expect(getRotationDuration(0)).toBe(25)
  })

  it('returns 6 for score 60', () => {
    expect(getRotationDuration(60)).toBe(6)
  })

  it('returns 6 for score above 60', () => {
    expect(getRotationDuration(100)).toBe(6)
  })

  it('interpolates linearly between 0 and 60', () => {
    // score 30 → 25 - (30/60)*19 = 25 - 9.5 = 15.5
    expect(getRotationDuration(30)).toBeCloseTo(15.5)
  })
})
