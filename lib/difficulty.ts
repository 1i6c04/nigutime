export type DifficultyTier = {
  minScore: number
  maxFish: number
  minInterval: number
  maxInterval: number
  playbackRate: number
}

export const DIFFICULTY_TIERS: DifficultyTier[] = [
  { minScore: 0,  maxFish: 1, minInterval: 2000, maxInterval: 4000, playbackRate: 1.0 },
  { minScore: 10, maxFish: 2, minInterval: 1500, maxInterval: 3000, playbackRate: 1.3 },
  { minScore: 30, maxFish: 3, minInterval: 1000, maxInterval: 2500, playbackRate: 1.6 },
  { minScore: 60, maxFish: 4, minInterval: 500,  maxInterval: 1500, playbackRate: 2.0 },
]

export function getDifficulty(score: number): DifficultyTier {
  return [...DIFFICULTY_TIERS].reverse().find(t => score >= t.minScore) ?? DIFFICULTY_TIERS[0]
}
