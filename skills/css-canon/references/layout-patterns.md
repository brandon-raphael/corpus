# Layout Patterns

Copy-ready structural CSS for steps 2–4. Each shows the minimum properties for the job — don't add `flex-wrap`, `flex-shrink`, `align-self`, explicit heights, etc. unless the layout actually breaks without them.

Snippets are plain CSS for clarity; the Tailwind equivalent is a direct translation (`display: flex; align-items: center` → `flex items-center`).

## Flexbox — minimal usage

```css
/* Center a single item, both axes */
.parent { display: flex; align-items: center; justify-content: center; }

/* Row, space between, vertically centered */
.parent { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }

/* Stack children vertically */
.parent { display: flex; flex-direction: column; gap: 0.5rem; }

/* One child fills remaining space */
.child { flex: 1; }
```

## CSS Grid — minimal usage

```css
/* Fixed sidebar + fluid main */
.parent { display: grid; grid-template-columns: 15rem 1fr; gap: 1rem; }

/* Responsive auto-fit columns (intrinsic — no media query needed) */
.parent { display: grid; grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr)); gap: 1rem; }

/* Named areas — only when it genuinely clarifies a page skeleton */
.parent {
  display: grid;
  grid-template-areas: "header header" "sidebar main";
  grid-template-columns: 15rem 1fr;
  grid-template-rows: auto 1fr;
}
.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
```

Don't use Grid for single-axis alignment — that's flexbox.

## Positioning — minimal usage

```css
/* Overlay a child on its parent */
.parent { position: relative; }
.child { position: absolute; top: 0; right: 0; }   /* only the edges you need */

/* Sticky header */
.header { position: sticky; top: 0; z-index: 10; }

/* Full-viewport overlay */
.modal { position: fixed; inset: 0; }   /* inset = all four edges at once */
```

Use `inset` when covering all four edges; use individual `top`/`left`/… when only some are needed.

## Common page/component patterns

```css
/* Centered page content */
.container { max-width: 75rem; margin: 0 auto; padding: 0 1rem; }

/* Sidebar + main */
.layout { display: grid; grid-template-columns: 15rem 1fr; gap: 1.5rem; }

/* Card grid */
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(17.5rem, 1fr)); gap: 1.5rem; }

/* Centered modal */
.overlay { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; }

/* Sticky sidebar, scrollable main */
.layout { display: grid; grid-template-columns: 16rem 1fr; align-items: start; }
.sidebar { position: sticky; top: 1rem; }

/* Push footer to the bottom */
body { min-height: 100vh; display: flex; flex-direction: column; }
main { flex: 1; }
```

## Responsive

Reach for intrinsic methods first:

```css
display: flex; flex-wrap: wrap; gap: 1rem;                          /* wraps when items don't fit */
grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));        /* columns shrink to fit */
```

Add a breakpoint only when intrinsic sizing can't express the change — one per layout change:

```css
@media (max-width: 48rem) { .layout { flex-direction: column; } }
```

## Anti-patterns — don't write these

```css
/* Float for layout — use flex/grid */
float: left; clear: both;

/* Fixed height + line-height to fake centering — use flex/grid */
height: 25rem; line-height: 25rem;

/* position: relative on an element with no positioned child — does nothing */
position: relative;

/* margin: auto on a flex child to center it — use justify-content on the parent */
margin: 0 auto;   /* inside a flex container */

/* width AND flex: 1 fighting each other — pick one */
flex: 1; width: 18.75rem;

/* Arbitrary magic values — use a scale step / token */
padding: 13px; gap: 14px;

/* A wrapper div whose only job is to add margin — put the space on an existing element */
```

## Why these hurt maintainability

The throughline: every anti-pattern above either fights another rule (so you need a counter-hack later) or hides a value where nobody will find it (so the next person re-invents it). The minimal, token-driven version is debuggable because what you see in the CSS is the whole story — there's no hidden interaction to reverse-engineer.
