import { describe, it, expect } from 'vitest'
import { getRandomFloatingText, FLOATING_TEXTS } from './floatingTexts'

describe('getRandomFloatingText', () => {
  it('returns a non-empty string', () => {
    expect(typeof getRandomFloatingText()).toBe('string')
    expect(getRandomFloatingText().length).toBeGreaterThan(0)
  })

  it('always returns a value from FLOATING_TEXTS', () => {
    for (let i = 0; i < 20; i++) {
      expect(FLOATING_TEXTS).toContain(getRandomFloatingText())
    }
  })
})
