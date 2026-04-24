let _started = false

export function signalGameStart() { _started = true }

export function consumeGameStart(): boolean {
  const val = _started
  _started = false
  return val
}
