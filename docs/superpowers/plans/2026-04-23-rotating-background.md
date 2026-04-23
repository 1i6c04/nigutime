# Rotating Background Image Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `public/images/background.png` as a semi-transparent, continuously spinning background on the Play page, with rotation speed increasing as the player's score rises.

**Architecture:** Extract a pure `getRotationDuration(score)` function into `lib/rotation.ts`, tested in isolation. Add the `spin-bg` CSS keyframe to Tailwind config. Wire the `<img>` element into the PlayPage with inline `animationDuration` driven by the score.

**Tech Stack:** Next.js 14 (App Router), Tailwind CSS, Vitest + jsdom

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `lib/rotation.ts` | `getRotationDuration(score)` pure function |
| Create | `lib/rotation.test.ts` | Unit tests for `getRotationDuration` |
| Modify | `tailwind.config.ts` | Add `spin-bg` keyframe + animation |
| Modify | `app/play/page.tsx` | Import function, add background `<img>` |

---

### Task 1: `getRotationDuration` — test then implement

**Files:**
- Create: `lib/rotation.ts`
- Create: `lib/rotation.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/rotation.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run lib/rotation.test.ts
```

Expected: FAIL with "Cannot find module './rotation'"

- [ ] **Step 3: Write minimal implementation**

Create `lib/rotation.ts`:

```ts
export function getRotationDuration(score: number): number {
  return Math.max(6, 25 - (score / 60) * 19)
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run lib/rotation.test.ts
```

Expected: all 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add lib/rotation.ts lib/rotation.test.ts
git commit -m "feat: add getRotationDuration pure function"
```

---

### Task 2: Add `spin-bg` keyframe to Tailwind

**Files:**
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Open `tailwind.config.ts` and locate the `keyframes` and `animation` blocks**

Current structure (abbreviated):
```ts
keyframes: {
  'float-up': { ... },
  'screen-shake': { ... },
},
animation: {
  'float-up': 'float-up 0.8s ease-out forwards',
  'screen-shake': 'screen-shake 0.4s ease-in-out infinite',
},
```

- [ ] **Step 2: Add `spin-bg` to both blocks**

In `keyframes`, add after `'screen-shake'`:
```ts
'spin-bg': {
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
},
```

In `animation`, add after `'screen-shake'`:
```ts
'spin-bg': 'spin-bg 20s linear infinite',
```

The `20s` default is overridden at runtime by inline style — it just needs to be a valid CSS value.

- [ ] **Step 3: Verify the dev server still compiles (no build errors)**

```bash
npx next build 2>&1 | tail -5
```

Expected: build completes without errors (or if dev server is running, no error overlay appears)

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.ts
git commit -m "feat: add spin-bg keyframe to Tailwind config"
```

---

### Task 3: Add rotating background image to PlayPage

**Files:**
- Modify: `app/play/page.tsx`

- [ ] **Step 1: Import `getRotationDuration` at the top of `app/play/page.tsx`**

Add this import after the existing imports:
```tsx
import { getRotationDuration } from '@/lib/rotation'
```

- [ ] **Step 2: Add the background `<img>` as the first child of the root `<div>`**

The root `<div>` currently starts:
```tsx
<div className="relative w-full h-screen bg-temple-bg overflow-hidden select-none">
  <ShakeOverlay active={difficulty.playbackRate >= 2} />
```

Add the `<img>` before `<ShakeOverlay>`:
```tsx
<div className="relative w-full h-screen bg-temple-bg overflow-hidden select-none">
  {/* eslint-disable-next-line @next/next/no-img-element */}
  <img
    src="/images/background.png"
    className="fixed inset-0 m-auto w-[90vmin] h-[90vmin] object-contain opacity-20 pointer-events-none animate-spin-bg"
    style={{ animationDuration: `${getRotationDuration(score)}s` }}
    alt=""
  />
  <ShakeOverlay active={difficulty.playbackRate >= 2} />
```

- [ ] **Step 3: Manually verify in the browser**

Start the dev server if not running:
```bash
npm run dev
```

Open http://localhost:3000/play and confirm:
- The background image is visible, semi-transparent, and spinning
- Clicking fish still works (pointer events not blocked)
- Hitting fish increases score; as score approaches 60 the spin noticeably speeds up
- Game elements (fish, score, button) are clearly visible on top of the background

- [ ] **Step 4: Run all tests to confirm no regressions**

```bash
npx vitest run
```

Expected: all tests PASS

- [ ] **Step 5: Commit**

```bash
git add app/play/page.tsx
git commit -m "feat: add rotating background image to play page"
```
