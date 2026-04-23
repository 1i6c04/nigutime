# Mokugyo SVG + Mallet Strike Animation Design

**Date:** 2026-04-23  
**Status:** Approved

## Goal

Replace the existing placeholder `mokugyo.svg` and `<Image>` usage in `MokugyoFish.tsx` with an inline SVG that depicts a realistic-looking (but flat/geometric) wooden fish with a mallet. Add a mallet swing animation triggered on click.

---

## Visual Design

### SVG viewBox

`0 0 120 100` — wider than current to give the mallet room to swing without clipping.

The component button size stays `w-20 h-20` (80px) but the SVG scales within it via `viewBox`.

### Mokugyo Body (centered around 55, 60)

- Outer ellipse (shadow/depth): dark brown `#5C2A08`, slightly offset
- Main body ellipse: `#7B3A10`
- Front face ellipse (slightly smaller): `#9B5523`
- Top opening (strike hole): small dark ellipse `#3D1A05` on top center
- Fish tail: triangle on the left side, same dark brown `#7B3A10`

All shapes are flat fills, no gradients, no stroke details.

### Mallet (upper right of mokugyo)

- Stick (handle): thin rounded rect, `#C8864A`
- Head (striker): small ellipse at bottom of stick, `#A06830`
- Pivot point: top of the stick (`transform-origin` set to top center of stick)
- Resting angle: `-30deg` (leaning right, head pointing toward mokugyo top-right)

---

## Component Design

### File: `components/MokugyoFish.tsx`

**Changes:**
- Remove `import Image from 'next/image'`
- Add a second `useState`: `const [isHitting, setIsHitting] = useState(false)`
- Replace `<Image src="/images/mokugyo.svg" ...>` with inline SVG
- The inline SVG contains two `<g>` groups:
  1. `<g id="mokugyo-body">` — static, always rendered as-is
  2. `<g id="mallet" className={isHitting ? 'hitting' : ''}>` — animated on hit

**Click handler update:**
```ts
const handleClick = () => {
  if (hitRef.current) return
  hitRef.current = true
  setHit(true)
  setIsHitting(true)          // trigger mallet animation
  if (timerRef.current) clearTimeout(timerRef.current)
  onHit(id)
}
```

**Animation end handler on mallet `<g>`:**
```tsx
onAnimationEnd={() => setIsHitting(false)}
```

---

## Animation

### CSS Keyframe (in `globals.css` or Tailwind plugin)

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

`transform-origin` on the mallet `<g>` must be set to the top of the stick (pivot point), using `style={{ transformOrigin: 'Xpx Ypx' }}` with exact SVG coordinates.

### Existing Hit Effect

The existing `scale-125 opacity-0` disappear animation on click is **preserved unchanged** — it's driven by the `hit` state (game logic), separate from `isHitting` (visual animation).

---

## Files to Change

| File | Change |
|------|--------|
| `components/MokugyoFish.tsx` | Replace `<Image>` with inline SVG, add `isHitting` state and animation logic |
| `app/globals.css` | Add `@keyframes mallet-strike` and `.hitting` class |
| `public/images/mokugyo.svg` | Can be deleted (no longer used) |

---

## Out of Scope

- Mokugyo body bounce/squish animation (not requested)
- Realistic wood texture or gradients
- Multiple mallet variants
