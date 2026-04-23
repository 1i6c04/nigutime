# Rotating Background Image Design

## Overview

Use `public/images/background.png` (circular bronze mokugyo plate with Buddhist text) as a semi-transparent spinning background on the Play page. Rotation speed increases continuously as the player's score rises.

## Visual Treatment

- Opacity: `opacity-20` (semi-transparent, game elements remain primary focus)
- Size: `w-[90vmin] h-[90vmin]` — large circle centered on screen
- Positioning: `fixed inset-0 m-auto` — centered, does not scroll
- Pointer events: `pointer-events-none` — never intercepts clicks on fish

## Rotation Speed

A pure function `getRotationDuration(score: number): number` returns the CSS animation duration in seconds:

```
duration = Math.max(6, 25 - (score / 60) * 19)
```

| Score | Duration |
|-------|----------|
| 0     | 25s/rev  |
| 10    | ~21.8s   |
| 30    | ~15.5s   |
| 60    | 6s/rev   |
| 60+   | 6s/rev (capped) |

Linear interpolation between score 0 and score 60, capped at 6s minimum.

## CSS / Tailwind Changes

Add to `tailwind.config.ts`:

```ts
keyframes: {
  'spin-bg': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
},
animation: {
  'spin-bg': 'spin-bg 20s linear infinite',
},
```

The `animationDuration` is overridden per-render via inline style, so the default `20s` in the config is irrelevant at runtime.

## PlayPage Changes

In `app/play/page.tsx`, add one `<img>` element as the first child of the root `<div>`:

```tsx
<img
  src="/images/background.png"
  className="fixed inset-0 m-auto w-[90vmin] h-[90vmin] object-contain
             opacity-20 pointer-events-none animate-spin-bg"
  style={{ animationDuration: `${getRotationDuration(score)}s` }}
  alt=""
/>
```

`getRotationDuration` can be defined as a module-level pure function in `app/play/page.tsx` or extracted to `lib/`.

## Files to Change

1. `tailwind.config.ts` — add `spin-bg` keyframe + animation
2. `app/play/page.tsx` — add background `<img>`, add `getRotationDuration` function

## Out of Scope

- No opacity changes tied to score
- No easing/acceleration transitions between speed steps (linear CSS animation only)
- No changes to MokugyoFish, scoring logic, or audio
