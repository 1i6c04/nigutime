export function getRotationDuration(score: number): number {
  return Math.max(6, 25 - (score / 60) * 19)
}
