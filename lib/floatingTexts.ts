export const FLOATING_TEXTS = [
  '功德+1',
  '業力清除中',
  '佛祖按讚',
  '南無阿彌陀佛',
  '煩惱消散',
  '業障清淨',
  '心誠則靈',
  '功德無量',
  '善哉善哉',
  '阿彌陀佛',
]

export function getRandomFloatingText(): string {
  return FLOATING_TEXTS[Math.floor(Math.random() * FLOATING_TEXTS.length)]
}
