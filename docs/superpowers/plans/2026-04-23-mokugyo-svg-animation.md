# Mokugyo SVG + Mallet Strike Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder `mokugyo.svg` with an inline SVG in `MokugyoFish.tsx` that shows a flat geometric wooden fish + mallet, and animate the mallet swinging down on click.

**Architecture:** Inline SVG replaces the `<Image>` tag in `MokugyoFish.tsx`. A second `isHitting` state controls a CSS class on the mallet `<g>` group. The mallet animation keyframe lives in `globals.css`. The existing `hit` state (game disappear logic) is untouched.

**Tech Stack:** React, TypeScript, Tailwind CSS, plain CSS keyframes, Vitest + Testing Library

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `components/MokugyoFish.tsx` | Modify | Replace `<Image>` with inline SVG, add `isHitting` state |
| `app/globals.css` | Modify | Add `@keyframes mallet-strike` and `.hitting` class |
| `components/MokugyoFish.test.tsx` | Modify | Add test for `isHitting` animation class |
| `public/images/mokugyo.svg` | Delete | No longer used |

---

## Task 1: Add mallet-strike CSS animation

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Add keyframes and `.hitting` class to `globals.css`**

Append to the end of `app/globals.css`:

```css
@keyframes mallet-strike {
  0%   { transform: rotate(-30deg); }
  35%  { transform: rotate(20deg); }
  55%  { transform: rotate(-10deg); }
  100% { transform: rotate(-30deg); }
}

.hitting {
  animation: mallet-strike 300ms ease-in-out forwards;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/globals.css
git commit -m "style: add mallet-strike keyframe animation"
```

---

## Task 2: Add `isHitting` test to MokugyoFish test suite

**Files:**
- Modify: `components/MokugyoFish.test.tsx`

- [ ] **Step 1: Add failing test for mallet animation class**

Add this test inside the existing `describe('MokugyoFish', ...)` block in `components/MokugyoFish.test.tsx`, after the last existing test:

```ts
it('adds hitting class to mallet on click', () => {
  render(<MokugyoFish id="t1" x={30} y={50} onHit={vi.fn()} onExpire={vi.fn()} />)
  const mallet = document.querySelector('[data-testid="mallet"]')
  expect(mallet).not.toHaveClass('hitting')
  fireEvent.click(screen.getByRole('button', { name: /木魚/i }))
  expect(mallet).toHaveClass('hitting')
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run components/MokugyoFish.test.tsx
```

Expected: FAIL — `data-testid="mallet"` element not found yet.

---

## Task 3: Replace `<Image>` with inline SVG in MokugyoFish

**Files:**
- Modify: `components/MokugyoFish.tsx`

- [ ] **Step 1: Rewrite `MokugyoFish.tsx`**

Replace the full content of `components/MokugyoFish.tsx` with:

```tsx
'use client'

import React, { useEffect, useRef, useState } from 'react'

type Props = {
  id: string
  x: number
  y: number
  onHit: (id: string) => void
  onExpire: (id: string) => void
}

export function MokugyoFish({ id, x, y, onHit, onExpire }: Props) {
  const [hit, setHit] = useState(false)
  const [isHitting, setIsHitting] = useState(false)
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
    setIsHitting(true)
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
        className={`w-24 h-20 transition-all duration-150 select-none
          ${hit ? 'scale-125 opacity-0' : 'hover:scale-110 active:scale-95'}`}
      >
        <svg viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg" width="96" height="80">
          {/* Mokugyo body */}
          <g>
            {/* Fish tail (left side) */}
            <polygon points="18,55 6,44 6,66" fill="#7B3A10" />
            {/* Body shadow/depth */}
            <ellipse cx="63" cy="63" rx="36" ry="26" fill="#5C2A08" />
            {/* Main body */}
            <ellipse cx="62" cy="60" rx="36" ry="26" fill="#7B3A10" />
            {/* Front face */}
            <ellipse cx="62" cy="58" rx="30" ry="21" fill="#9B5523" />
            {/* Strike hole (top opening) */}
            <ellipse cx="62" cy="38" rx="7" ry="4" fill="#3D1A05" />
          </g>

          {/* Mallet — pivot at top of stick (90, 10) */}
          <g
            data-testid="mallet"
            className={isHitting ? 'hitting' : ''}
            style={{ transformOrigin: '90px 10px' }}
            onAnimationEnd={() => setIsHitting(false)}
          >
            {/* Stick */}
            <rect x="87" y="10" width="6" height="42" rx="3" fill="#C8864A" />
            {/* Head */}
            <ellipse cx="90" cy="54" rx="9" ry="6" fill="#A06830" />
          </g>
        </svg>
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Run the tests**

```bash
npx vitest run components/MokugyoFish.test.tsx
```

Expected: ALL PASS (including the new `hitting class` test).

- [ ] **Step 3: Commit**

```bash
git add components/MokugyoFish.tsx components/MokugyoFish.test.tsx
git commit -m "feat: replace Image with inline SVG mokugyo + mallet, add strike animation"
```

---

## Task 4: Delete unused SVG file

**Files:**
- Delete: `public/images/mokugyo.svg`

- [ ] **Step 1: Delete the file**

```bash
git rm public/images/mokugyo.svg
```

- [ ] **Step 2: Verify no remaining references**

```bash
grep -r "mokugyo.svg" /Users/hank/Documents/side-project/nigutime --include="*.tsx" --include="*.ts" --include="*.css" --include="*.html"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git commit -m "chore: remove unused mokugyo.svg placeholder"
```

---

## Task 5: Visual verification

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Open the game in browser**

Navigate to `http://localhost:3000` and start a game session.

- [ ] **Step 3: Verify the following**

Check each item visually:
- [ ] Wooden fish body is visible (dark brown ellipse with lighter face)
- [ ] Fish tail is visible on the left side
- [ ] Strike hole visible on top of the body
- [ ] Mallet is visible to the upper right, angled at roughly -30°
- [ ] Clicking the mokugyo triggers the mallet swing animation (swings down and back in ~300ms)
- [ ] After the animation, the mallet returns to its resting angle
- [ ] The existing scale-up + fade-out disappear effect still works on click
