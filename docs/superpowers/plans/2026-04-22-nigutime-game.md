# nigutime 遊戲實作計畫

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Buddhist meme web game where players click wooden fish (木魚) to accumulate merit points (功德值) while listening to 大悲咒, with difficulty scaling and a global leaderboard.

**Architecture:** Next.js 14 App Router for all pages. Game state (score, fish, difficulty) lives in a custom `useGameState` hook. Audio playback uses the HTML5 Audio API with `playbackRate` for speed scaling. Supabase handles the global leaderboard with Realtime subscriptions for live updates.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Supabase (PostgreSQL + Realtime), Vitest, React Testing Library

---

## File Map

| File | Responsibility |
|------|---------------|
| `app/layout.tsx` | Root layout — Noto Serif TC font, metadata |
| `app/globals.css` | Tailwind directives + global resets |
| `app/page.tsx` | 首頁 — title, start button, leaderboard modal |
| `app/play/page.tsx` | 遊戲畫面 — spawns fish, audio, score display |
| `app/result/page.tsx` | 結算畫面 — shows score, nickname input, submit |
| `components/MokugyoFish.tsx` | Single fish — position, click, 3s auto-expire |
| `components/FloatingText.tsx` | Floating hit text animation |
| `components/ScoreDisplay.tsx` | 「功德值：XX」display |
| `components/Leaderboard.tsx` | Modal — top 20 scores, realtime, highlight row |
| `components/ShakeOverlay.tsx` | Screen shake + text at 2x speed |
| `hooks/useGameState.ts` | Score, fish list, difficulty, start/stop, spawn loop |
| `hooks/useAudio.ts` | Audio element, play/stop/setPlaybackRate/playHitSound |
| `hooks/useLeaderboard.ts` | Fetch top 20, realtime subscription, submitScore |
| `lib/difficulty.ts` | DIFFICULTY_TIERS constant, getDifficulty(score) |
| `lib/floatingTexts.ts` | Buddhist meme texts, getRandomFloatingText() |
| `lib/supabase.ts` | Supabase client singleton + Score type |
| `supabase/schema.sql` | CREATE TABLE scores DDL |
| `public/audio/dabei-zhou.mp3` | (user provides) 大悲咒 audio |
| `public/audio/mokugyo-hit.mp3` | (user provides) 木魚 hit sound |
| `public/images/mokugyo.svg` | 木魚 SVG icon |
| `vitest.config.ts` | Vitest configuration |
| `vitest.setup.ts` | @testing-library/jest-dom setup |
| `.env.local.example` | Supabase credentials template |
| `tailwind.config.ts` | Custom colors + keyframe animations |

---

### Task 1: Bootstrap Next.js Project

**Files:**
- Create: project root (scaffold)

- [ ] **Step 1: Create the project**

```bash
cd /Users/hank/Documents/side-project
npx create-next-app@14 nigutime --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
cd nigutime
```

- [ ] **Step 2: Install additional dependencies**

```bash
npm install @supabase/supabase-js
npm install --save-dev vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

- [ ] **Step 3: Verify dev server starts**

```bash
npm run dev
```
Expected: server running at http://localhost:3000, default Next.js page visible. Stop with Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "chore: bootstrap Next.js 14 project"
```

---

### Task 2: Configure Vitest

**Files:**
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Modify: `package.json` (add test scripts)

- [ ] **Step 1: Create vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

- [ ] **Step 2: Create vitest.setup.ts**

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 3: Add test scripts to package.json**

In `package.json`, inside `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Verify Vitest runs**

```bash
npm test
```
Expected: "No test files found" — no errors.

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts vitest.setup.ts package.json package-lock.json
git commit -m "chore: configure Vitest with React Testing Library"
```

---

### Task 3: Difficulty Configuration (TDD)

**Files:**
- Create: `lib/difficulty.ts`
- Create: `lib/difficulty.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/difficulty.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```
Expected: FAIL — "Cannot find module './difficulty'"

- [ ] **Step 3: Implement lib/difficulty.ts**

```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```
Expected: PASS — 6 tests passing

- [ ] **Step 5: Commit**

```bash
git add lib/difficulty.ts lib/difficulty.test.ts
git commit -m "feat: add difficulty tier config with getDifficulty"
```

---

### Task 4: Floating Text Data (TDD)

**Files:**
- Create: `lib/floatingTexts.ts`
- Create: `lib/floatingTexts.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/floatingTexts.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```
Expected: FAIL — "Cannot find module './floatingTexts'"

- [ ] **Step 3: Implement lib/floatingTexts.ts**

```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```
Expected: PASS — 2 tests passing

- [ ] **Step 5: Commit**

```bash
git add lib/floatingTexts.ts lib/floatingTexts.test.ts
git commit -m "feat: add Buddhist meme floating text pool"
```

---

### Task 5: Supabase Schema + Client

**Files:**
- Create: `supabase/schema.sql`
- Create: `lib/supabase.ts`
- Create: `.env.local.example`

- [ ] **Step 1: Create supabase/schema.sql**

```sql
create table if not exists scores (
  id uuid primary key default gen_random_uuid(),
  nickname varchar(20) not null,
  score integer not null,
  created_at timestamptz not null default now()
);

create index if not exists scores_leaderboard_idx
  on scores (score desc, created_at asc);

alter table scores enable row level security;

create policy "scores_read" on scores
  for select using (true);

create policy "scores_insert" on scores
  for insert with check (
    length(nickname) between 1 and 20
    and score >= 0
  );
```

- [ ] **Step 2: Run schema in Supabase**

1. Open your Supabase project dashboard → SQL Editor
2. Paste and run the contents of `supabase/schema.sql`
3. Expected: "Success. No rows returned"

- [ ] **Step 3: Create .env.local.example**

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

- [ ] **Step 4: Create your .env.local**

Copy from Supabase dashboard → Settings → API → Project URL and anon key:
```bash
cp .env.local.example .env.local
# Edit .env.local with your real credentials
```

- [ ] **Step 5: Create lib/supabase.ts**

```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Score = {
  id: string
  nickname: string
  score: number
  created_at: string
}
```

- [ ] **Step 6: Verify .env.local is in .gitignore**

Open `.gitignore` — confirm `.env.local` is listed (Next.js adds this by default).

- [ ] **Step 7: Commit**

```bash
git add supabase/schema.sql lib/supabase.ts .env.local.example
git commit -m "feat: add Supabase schema and client"
```

---

### Task 6: useAudio Hook

**Files:**
- Create: `hooks/useAudio.ts`
- Create: `public/audio/.gitkeep`

Note: HTML5 Audio doesn't work in jsdom. This hook is verified manually in the browser.

- [ ] **Step 1: Create hooks/useAudio.ts**

```ts
'use client'

import { useRef, useCallback } from 'react'

export function useAudio(src: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const init = useCallback(() => {
    if (typeof window === 'undefined') return
    if (!audioRef.current) {
      audioRef.current = new Audio(src)
      audioRef.current.loop = true
    }
  }, [src])

  const play = useCallback(() => {
    init()
    audioRef.current?.play().catch(() => {})
  }, [init])

  const stop = useCallback(() => {
    if (!audioRef.current) return
    audioRef.current.pause()
    audioRef.current.currentTime = 0
  }, [])

  const setPlaybackRate = useCallback((rate: number) => {
    init()
    if (audioRef.current) audioRef.current.playbackRate = rate
  }, [init])

  const playHitSound = useCallback((hitSrc: string) => {
    new Audio(hitSrc).play().catch(() => {})
  }, [])

  return { play, stop, setPlaybackRate, playHitSound }
}
```

- [ ] **Step 2: Create audio placeholder files**

```bash
mkdir -p public/audio
touch public/audio/.gitkeep
```

Note: Add real `dabei-zhou.mp3` and `mokugyo-hit.mp3` to `public/audio/` before testing audio in browser.

- [ ] **Step 3: Commit**

```bash
git add hooks/useAudio.ts public/audio/.gitkeep
git commit -m "feat: add useAudio hook for 大悲咒 playback and speed control"
```

---

### Task 7: useGameState Hook (TDD)

**Files:**
- Create: `hooks/useGameState.ts`
- Create: `hooks/useGameState.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `hooks/useGameState.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```
Expected: FAIL — "Cannot find module './useGameState'"

- [ ] **Step 3: Implement hooks/useGameState.ts**

```ts
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { getDifficulty, DifficultyTier } from '@/lib/difficulty'

export type Fish = {
  id: string
  x: number
  y: number
}

export function useGameState() {
  const [score, setScore] = useState(0)
  const [fish, setFish] = useState<Fish[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const spawnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scoreRef = useRef(0)

  const spawnFish = useCallback((tier: DifficultyTier) => {
    setFish(prev => {
      if (prev.length >= tier.maxFish) return prev
      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          x: Math.random() * 80 + 5,
          y: Math.random() * 65 + 10,
        },
      ]
    })
  }, [])

  const scheduleNextSpawn = useCallback((tier: DifficultyTier) => {
    const interval =
      tier.minInterval + Math.random() * (tier.maxInterval - tier.minInterval)
    spawnTimerRef.current = setTimeout(() => {
      const currentTier = getDifficulty(scoreRef.current)
      spawnFish(currentTier)
      scheduleNextSpawn(currentTier)
    }, interval)
  }, [spawnFish])

  useEffect(() => {
    if (!isRunning) return
    const tier = getDifficulty(scoreRef.current)
    scheduleNextSpawn(tier)
    return () => {
      if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current)
    }
  }, [isRunning, scheduleNextSpawn])

  const hitFish = useCallback((id: string) => {
    setFish(prev => prev.filter(f => f.id !== id))
    setScore(prev => {
      const next = prev + 1
      scoreRef.current = next
      return next
    })
  }, [])

  const expireFish = useCallback((id: string) => {
    setFish(prev => prev.filter(f => f.id !== id))
  }, [])

  const start = useCallback(() => {
    setScore(0)
    scoreRef.current = 0
    setFish([])
    setIsRunning(true)
  }, [])

  const stop = useCallback(() => {
    setIsRunning(false)
    setFish([])
    if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current)
  }, [])

  return {
    score,
    fish,
    isRunning,
    difficulty: getDifficulty(score),
    hitFish,
    expireFish,
    start,
    stop,
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```
Expected: PASS — 4 tests passing

- [ ] **Step 5: Commit**

```bash
git add hooks/useGameState.ts hooks/useGameState.test.ts
git commit -m "feat: add useGameState hook with fish spawning and difficulty scaling"
```

---

### Task 8: MokugyoFish Component (TDD)

**Files:**
- Create: `components/MokugyoFish.tsx`
- Create: `components/MokugyoFish.test.tsx`
- Create: `public/images/mokugyo.svg`

- [ ] **Step 1: Create public/images/mokugyo.svg**

```bash
mkdir -p public/images
```

Create `public/images/mokugyo.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <ellipse cx="50" cy="55" rx="38" ry="30" fill="#8B4513"/>
  <ellipse cx="50" cy="52" rx="34" ry="26" fill="#A0522D"/>
  <ellipse cx="50" cy="50" rx="20" ry="16" fill="#6B3410"/>
  <rect x="44" y="20" width="12" height="22" rx="4" fill="#8B4513"/>
  <ellipse cx="50" cy="20" rx="8" ry="6" fill="#CD853F"/>
</svg>
```

- [ ] **Step 2: Write the failing tests**

Create `components/MokugyoFish.test.tsx`:

```tsx
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
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
npm test
```
Expected: FAIL — "Cannot find module './MokugyoFish'"

- [ ] **Step 4: Implement components/MokugyoFish.tsx**

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

type Props = {
  id: string
  x: number
  y: number
  onHit: (id: string) => void
  onExpire: (id: string) => void
}

export function MokugyoFish({ id, x, y, onHit, onExpire }: Props) {
  const [hit, setHit] = useState(false)
  const hitRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      if (!hitRef.current) onExpire(id)
    }, 3000)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [id, onExpire])

  const handleClick = () => {
    if (hitRef.current) return
    hitRef.current = true
    setHit(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    onHit(id)
  }

  return (
    <div
      className="absolute"
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
    >
      <button
        aria-label="木魚"
        onClick={handleClick}
        className={`w-20 h-20 transition-all duration-150 select-none
          ${hit ? 'scale-125 opacity-0' : 'hover:scale-110 active:scale-95'}`}
      >
        <Image
          src="/images/mokugyo.svg"
          alt="木魚"
          width={80}
          height={80}
          className={hit ? 'drop-shadow-[0_0_16px_gold]' : 'drop-shadow-md'}
          priority
        />
      </button>
    </div>
  )
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm test
```
Expected: PASS — 4 tests passing

- [ ] **Step 6: Commit**

```bash
git add components/MokugyoFish.tsx components/MokugyoFish.test.tsx public/images/mokugyo.svg
git commit -m "feat: add MokugyoFish component with 3s auto-expire"
```

---

### Task 9: FloatingText Component (TDD)

**Files:**
- Create: `components/FloatingText.tsx`
- Create: `components/FloatingText.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `components/FloatingText.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```
Expected: FAIL

- [ ] **Step 3: Implement components/FloatingText.tsx**

```tsx
'use client'

import { useEffect } from 'react'

type Props = {
  id: string
  text: string
  x: number
  y: number
  onDone: (id: string) => void
}

export function FloatingText({ id, text, x, y, onDone }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => onDone(id), 800)
    return () => clearTimeout(timer)
  }, [id, onDone])

  return (
    <span
      className="absolute pointer-events-none text-yellow-300 font-bold text-xl
        animate-float-up select-none z-10"
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
    >
      {text}
    </span>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/FloatingText.tsx components/FloatingText.test.tsx
git commit -m "feat: add FloatingText component for hit feedback"
```

---

### Task 10: ScoreDisplay Component (TDD)

**Files:**
- Create: `components/ScoreDisplay.tsx`
- Create: `components/ScoreDisplay.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `components/ScoreDisplay.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ScoreDisplay } from './ScoreDisplay'

describe('ScoreDisplay', () => {
  it('renders score as 功德值', () => {
    render(<ScoreDisplay score={42} />)
    expect(screen.getByText('功德值：42')).toBeInTheDocument()
  })

  it('shows 0 at game start', () => {
    render(<ScoreDisplay score={0} />)
    expect(screen.getByText('功德值：0')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```
Expected: FAIL

- [ ] **Step 3: Implement components/ScoreDisplay.tsx**

```tsx
type Props = { score: number }

export function ScoreDisplay({ score }: Props) {
  return (
    <div className="text-2xl font-bold text-yellow-200 bg-black/40 px-4 py-2 rounded-lg">
      功德值：{score}
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/ScoreDisplay.tsx components/ScoreDisplay.test.tsx
git commit -m "feat: add ScoreDisplay component"
```

---

### Task 11: useLeaderboard Hook

**Files:**
- Create: `hooks/useLeaderboard.ts`

Note: Supabase calls require real network. Verified manually in the browser.

- [ ] **Step 1: Implement hooks/useLeaderboard.ts**

```ts
'use client'

import { useState, useEffect } from 'react'
import { supabase, Score } from '@/lib/supabase'

export function useLeaderboard() {
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)

  const fetchScores = async () => {
    const { data } = await supabase
      .from('scores')
      .select('*')
      .order('score', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(20)
    if (data) setScores(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchScores()

    const channel = supabase
      .channel('scores-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'scores' },
        () => fetchScores()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const submitScore = async (nickname: string, score: number): Promise<string | null> => {
    const { data, error } = await supabase
      .from('scores')
      .insert({ nickname: nickname.slice(0, 20), score })
      .select('id')
      .single()
    if (error || !data) return null
    return data.id as string
  }

  return { scores, loading, submitScore }
}
```

- [ ] **Step 2: Commit**

```bash
git add hooks/useLeaderboard.ts
git commit -m "feat: add useLeaderboard hook with Supabase Realtime"
```

---

### Task 12: Leaderboard Component (TDD)

**Files:**
- Create: `components/Leaderboard.tsx`
- Create: `components/Leaderboard.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `components/Leaderboard.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Leaderboard } from './Leaderboard'
import type { Score } from '@/lib/supabase'

vi.mock('@/hooks/useLeaderboard', () => ({
  useLeaderboard: () => ({
    scores: [
      { id: 'id-1', nickname: '悟空', score: 99, created_at: '2024-01-01T00:00:00Z' },
      { id: 'id-2', nickname: '八戒', score: 50, created_at: '2024-01-01T00:00:01Z' },
    ] as Score[],
    loading: false,
    submitScore: vi.fn(),
  }),
}))

describe('Leaderboard', () => {
  it('renders the title', () => {
    render(<Leaderboard isOpen={true} onClose={vi.fn()} highlightId={null} />)
    expect(screen.getByText('功德排行榜')).toBeInTheDocument()
  })

  it('renders player nicknames and scores', () => {
    render(<Leaderboard isOpen={true} onClose={vi.fn()} highlightId={null} />)
    expect(screen.getByText('悟空')).toBeInTheDocument()
    expect(screen.getByText('99')).toBeInTheDocument()
    expect(screen.getByText('八戒')).toBeInTheDocument()
  })

  it('highlights the row matching highlightId', () => {
    render(<Leaderboard isOpen={true} onClose={vi.fn()} highlightId="id-2" />)
    const row = screen.getByText('八戒').closest('tr')
    expect(row).toHaveClass('bg-yellow-500/30')
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(<Leaderboard isOpen={true} onClose={onClose} highlightId={null} />)
    fireEvent.click(screen.getByRole('button', { name: /關閉/i }))
    expect(onClose).toHaveBeenCalled()
  })

  it('renders nothing when isOpen is false', () => {
    render(<Leaderboard isOpen={false} onClose={vi.fn()} highlightId={null} />)
    expect(screen.queryByText('功德排行榜')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```
Expected: FAIL

- [ ] **Step 3: Implement components/Leaderboard.tsx**

```tsx
'use client'

import { useLeaderboard } from '@/hooks/useLeaderboard'

type Props = {
  isOpen: boolean
  onClose: () => void
  highlightId: string | null
}

export function Leaderboard({ isOpen, onClose, highlightId }: Props) {
  const { scores, loading } = useLeaderboard()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-amber-950 border border-yellow-700 rounded-xl p-6
        w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-yellow-300">功德排行榜</h2>
          <button
            aria-label="關閉"
            onClick={onClose}
            className="text-yellow-200 hover:text-white text-xl px-2"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <p className="text-yellow-200 text-center">載入中...</p>
        ) : (
          <table className="w-full text-yellow-100">
            <thead>
              <tr className="text-yellow-400 border-b border-yellow-800">
                <th className="py-1 text-left w-8">名次</th>
                <th className="py-1 text-left">法號</th>
                <th className="py-1 text-right">功德值</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((s, i) => (
                <tr
                  key={s.id}
                  className={`border-b border-yellow-900 ${
                    s.id === highlightId ? 'bg-yellow-500/30 font-bold' : ''
                  }`}
                >
                  <td className="py-2">{i + 1}</td>
                  <td className="py-2">{s.nickname}</td>
                  <td className="py-2 text-right">{s.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```
Expected: PASS — 5 tests passing

- [ ] **Step 5: Commit**

```bash
git add components/Leaderboard.tsx components/Leaderboard.test.tsx
git commit -m "feat: add Leaderboard modal with Realtime updates and highlight"
```

---

### Task 13: ShakeOverlay + Tailwind Animations

**Files:**
- Create: `components/ShakeOverlay.tsx`
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Update tailwind.config.ts with custom animations**

Replace the content of `tailwind.config.ts`:

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        temple: {
          bg: '#1a0e05',
          wood: '#3d1f0a',
          gold: '#c9a84c',
        },
      },
      keyframes: {
        'float-up': {
          '0%': { opacity: '1', transform: 'translate(-50%, -50%)' },
          '100%': { opacity: '0', transform: 'translate(-50%, -250%)' },
        },
        'screen-shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-4px)' },
          '40%': { transform: 'translateX(4px)' },
          '60%': { transform: 'translateX(-4px)' },
          '80%': { transform: 'translateX(4px)' },
        },
      },
      animation: {
        'float-up': 'float-up 0.8s ease-out forwards',
        'screen-shake': 'screen-shake 0.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 2: Create components/ShakeOverlay.tsx**

```tsx
type Props = { active: boolean }

export function ShakeOverlay({ active }: Props) {
  if (!active) return null
  return (
    <div className="fixed inset-0 pointer-events-none z-20 animate-screen-shake">
      <p className="absolute top-1/4 left-1/2 -translate-x-1/2
        text-red-400 font-bold text-lg text-center whitespace-nowrap">
        法師超度加速中⚡
      </p>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/ShakeOverlay.tsx tailwind.config.ts
git commit -m "feat: add ShakeOverlay and custom Tailwind animations"
```

---

### Task 14: Game Page (/play)

**Files:**
- Create: `app/play/page.tsx`

- [ ] **Step 1: Create app/play/page.tsx**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGameState } from '@/hooks/useGameState'
import { useAudio } from '@/hooks/useAudio'
import { MokugyoFish } from '@/components/MokugyoFish'
import { FloatingText } from '@/components/FloatingText'
import { ScoreDisplay } from '@/components/ScoreDisplay'
import { ShakeOverlay } from '@/components/ShakeOverlay'
import { getRandomFloatingText } from '@/lib/floatingTexts'

type FloatingEntry = { id: string; text: string; x: number; y: number }

export default function PlayPage() {
  const router = useRouter()
  const { score, fish, difficulty, isRunning, hitFish, expireFish, start, stop } = useGameState()
  const { play, stop: stopAudio, setPlaybackRate, playHitSound } = useAudio('/audio/dabei-zhou.mp3')
  const [floatingTexts, setFloatingTexts] = useState<FloatingEntry[]>([])

  useEffect(() => {
    start()
    play()
    return () => stopAudio()
  }, [])

  useEffect(() => {
    setPlaybackRate(difficulty.playbackRate)
  }, [difficulty.playbackRate])

  const handleHit = (id: string, x: number, y: number) => {
    playHitSound('/audio/mokugyo-hit.mp3')
    hitFish(id)
    setFloatingTexts(prev => [
      ...prev,
      { id: crypto.randomUUID(), text: getRandomFloatingText(), x, y },
    ])
  }

  const handleFinish = () => {
    stop()
    stopAudio()
    sessionStorage.setItem('nigutime_score', score.toString())
    sessionStorage.removeItem('nigutime_submitted')
    router.push('/result')
  }

  return (
    <div className="relative w-full h-screen bg-temple-bg overflow-hidden select-none">
      <ShakeOverlay active={difficulty.playbackRate >= 2} />

      <div className="absolute top-4 right-4 z-10">
        <ScoreDisplay score={score} />
      </div>

      <button
        onClick={handleFinish}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10
          bg-amber-900 hover:bg-amber-800 text-yellow-200 border border-yellow-700
          px-6 py-3 rounded-xl text-lg font-semibold"
      >
        功德圓滿
      </button>

      {fish.map(f => (
        <MokugyoFish
          key={f.id}
          id={f.id}
          x={f.x}
          y={f.y}
          onHit={(id) => handleHit(id, f.x, f.y)}
          onExpire={expireFish}
        />
      ))}

      {floatingTexts.map(ft => (
        <FloatingText
          key={ft.id}
          id={ft.id}
          text={ft.text}
          x={ft.x}
          y={ft.y}
          onDone={(id) => setFloatingTexts(prev => prev.filter(t => t.id !== id))}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Manually verify the game page**

```bash
npm run dev
```
Open http://localhost:3000/play. Verify:
- Dark background
- 功德值：0 in top right
- 功德圓滿 button at bottom
- After ~2–4 seconds, a wooden fish appears
- Clicking the fish increments the score and shows floating text
- Stop server with Ctrl+C

- [ ] **Step 3: Commit**

```bash
git add app/play/page.tsx
git commit -m "feat: implement /play game page"
```

---

### Task 15: Result Page (/result)

**Files:**
- Create: `app/result/page.tsx`

- [ ] **Step 1: Create app/result/page.tsx**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLeaderboard } from '@/hooks/useLeaderboard'

export default function ResultPage() {
  const router = useRouter()
  const { submitScore } = useLeaderboard()
  const [score, setScore] = useState(0)
  const [nickname, setNickname] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const saved = sessionStorage.getItem('nigutime_score')
    if (!saved) { router.push('/'); return }
    setScore(parseInt(saved, 10))
    if (sessionStorage.getItem('nigutime_submitted') === 'true') setSubmitted(true)
  }, [router])

  const handleSubmit = async () => {
    if (!nickname.trim()) { setError('請輸入法號'); return }
    if (nickname.length > 20) { setError('法號最多 20 字'); return }
    setSubmitting(true)
    const id = await submitScore(nickname.trim(), score)
    sessionStorage.setItem('nigutime_submitted', 'true')
    setSubmitting(false)
    router.push(`/?leaderboard=open${id ? `&highlight=${id}` : ''}`)
  }

  return (
    <div className="min-h-screen bg-temple-bg flex items-center justify-center">
      <div className="bg-amber-950 border border-yellow-800 rounded-2xl p-8
        w-full max-w-sm text-center">
        <h1 className="text-3xl font-bold text-yellow-300 mb-2">功德圓滿</h1>
        <p className="text-yellow-200 text-lg mb-6">本次累積功德值</p>
        <p className="text-6xl font-bold text-yellow-400 mb-8">{score}</p>

        {submitted ? (
          <p className="text-yellow-300">功德已上傳，阿彌陀佛🙏</p>
        ) : (
          <>
            <input
              type="text"
              value={nickname}
              onChange={e => { setNickname(e.target.value); setError('') }}
              placeholder="請輸入您的法號"
              maxLength={20}
              className="w-full bg-amber-900 border border-yellow-700 text-yellow-100
                placeholder-yellow-600 rounded-lg px-4 py-2 mb-2 text-center"
            />
            {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-yellow-700 hover:bg-yellow-600 disabled:opacity-50
                text-white font-semibold py-2 rounded-lg mt-2"
            >
              {submitting ? '上傳中...' : '上傳功德'}
            </button>
          </>
        )}

        <button
          onClick={() => router.push('/')}
          className="mt-4 text-yellow-500 hover:text-yellow-300 text-sm underline block"
        >
          回首頁
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Manually verify result page**

```bash
npm run dev
```
Navigate to /play, score some points, click 功德圓滿. Verify:
- Score is shown correctly on /result
- Nickname input has correct placeholder
- 回首頁 button works
- Stop server with Ctrl+C

- [ ] **Step 3: Commit**

```bash
git add app/result/page.tsx
git commit -m "feat: implement /result page with score upload"
```

---

### Task 16: Home Page (/)

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace app/page.tsx**

```tsx
'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { Leaderboard } from '@/components/Leaderboard'

function HomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [leaderboardOpen, setLeaderboardOpen] = useState(false)
  const [highlightId, setHighlightId] = useState<string | null>(null)

  useEffect(() => {
    if (searchParams.get('leaderboard') === 'open') {
      setLeaderboardOpen(true)
      setHighlightId(searchParams.get('highlight'))
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-temple-bg flex flex-col items-center justify-center
      text-center px-4">
      <h1 className="text-5xl font-bold text-yellow-300 mb-2">木魚功德</h1>
      <p className="text-yellow-500 text-lg mb-2">南無大悲觀世音菩薩</p>
      <p className="text-yellow-600 text-sm mb-12">敲木魚，積功德，速速修行</p>

      <button
        onClick={() => router.push('/play')}
        className="bg-yellow-700 hover:bg-yellow-600 text-white font-bold
          text-xl px-10 py-4 rounded-2xl shadow-lg mb-4"
      >
        開始念經
      </button>

      <button
        onClick={() => setLeaderboardOpen(true)}
        className="text-yellow-500 hover:text-yellow-300 underline text-base"
      >
        功德排行榜
      </button>

      <Leaderboard
        isOpen={leaderboardOpen}
        onClose={() => { setLeaderboardOpen(false); setHighlightId(null) }}
        highlightId={highlightId}
      />
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  )
}
```

- [ ] **Step 2: Manually verify home page**

```bash
npm run dev
```
Open http://localhost:3000. Verify:
- Title 木魚功德 visible
- 開始念經 navigates to /play
- 功德排行榜 opens the modal
- After completing a game, returning to / with `?leaderboard=open&highlight=<id>` opens the modal with the highlighted row
- Stop server with Ctrl+C

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: implement home page with leaderboard modal"
```

---

### Task 17: Root Layout + Global Styles

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Update app/layout.tsx**

```tsx
import type { Metadata } from 'next'
import { Noto_Serif_TC } from 'next/font/google'
import './globals.css'

const notoSerifTC = Noto_Serif_TC({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: '木魚功德 — 大悲咒修行遊戲',
  description: '敲木魚，積功德，速速修行',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body className={`${notoSerifTC.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Update app/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  -webkit-tap-highlight-color: transparent;
}

body {
  background-color: #1a0e05;
  color: #fef3c7;
}
```

- [ ] **Step 3: Verify fonts and global styles**

```bash
npm run dev
```
Open http://localhost:3000. Verify Noto Serif TC font loads and the background is dark brown. Stop server.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx app/globals.css
git commit -m "style: configure Noto Serif TC font and global temple aesthetic"
```

---

### Task 18: Vercel Deployment

- [ ] **Step 1: Add real audio files**

```bash
# Copy real audio files into the project:
# public/audio/dabei-zhou.mp3  — 大悲咒 (use a publicly licensed version)
# public/audio/mokugyo-hit.mp3 — 木魚敲擊音效
git add public/audio/
git commit -m "feat: add audio files"
```

- [ ] **Step 2: Push to GitHub**

```bash
git remote add origin https://github.com/YOUR_USERNAME/nigutime.git
git push -u origin main
```

- [ ] **Step 3: Deploy on Vercel**

1. Go to https://vercel.com/new → Import your `nigutime` repo
2. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Click Deploy
4. Expected: build passes, site is live at `*.vercel.app`

- [ ] **Step 4: Connect custom domain**

1. Vercel project → Settings → Domains → Add your domain
2. Follow Vercel's DNS instructions at your domain registrar (add CNAME or A record)
3. Wait 5–30 minutes for DNS propagation
4. Verify: your domain loads the game

---

## Full Test Run

After all tasks complete, run the full test suite one final time:

```bash
npm test
```
Expected: all tests pass with no failures.
