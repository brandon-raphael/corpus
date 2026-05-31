# Tokens & Theming

Set these up *before* building screens. Everything downstream references them, so a raw color or a magic pixel value in a component later is a sign a token is missing.

## shadcn/ui CSS variables

shadcn keeps the palette as HSL CSS variables in `globals.css`, with a parallel set under `.dark`. Components read them through Tailwind (`bg-background`, `text-foreground`, `border-border`). To re-theme the whole app you change these values, not the components.

```css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 4%;
  --primary: 240 6% 10%;
  --primary-foreground: 0 0% 98%;
  --muted: 240 5% 96%;
  --muted-foreground: 240 4% 46%;
  --border: 240 6% 90%;
  --ring: 240 5% 65%;
  --radius: 0.5rem;
}

.dark {
  --background: 240 10% 4%;
  --foreground: 0 0% 98%;
  /* ...mirror every variable above with dark values... */
}
```

Two things that trip people up:
- Define each variable in **both** `:root` and `.dark`. A variable that exists in only one theme produces an unstyled or invisible element in the other.
- Store colors as raw HSL channels (`240 6% 10%`), not `hsl(...)`. shadcn wraps them as `hsl(var(--primary))` so it can inject opacity (`bg-primary/50`). Wrapping them yourself breaks that.

If the user has a specific palette in mind (e.g. Rosé Pine), map its named roles onto these variables rather than scattering the hex values across components — that keeps the "change the theme in one place" property intact.

## Spacing scale

Tailwind's default scale (`0.25rem` per step: `1`=0.25rem, `2`=0.5rem, `4`=1rem, …) is a good default — use its steps and don't invent in-between values. If you're in plain CSS, mirror it as variables:

```css
:root {
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
}
```

The discipline that matters: a small, fixed set of steps used everywhere beats freely chosen values. That's what makes spacing look intentional instead of accidental.

## Type scale

Use rem so it respects the user's base font size. Tailwind's `text-sm`/`text-base`/`text-lg`/… already are rem. In plain CSS, a modular scale:

```css
:root {
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
}
```

## Radii

Drive everything off one base so rounding stays consistent and re-themeable:

```css
:root { --radius: 0.5rem; }
/* shadcn convention: lg = --radius, md = --radius - 2px, sm = --radius - 4px */
```

## Wiring into Tailwind

In `tailwind.config`, point the theme at the variables so utilities resolve to tokens:

```js
theme: {
  extend: {
    colors: {
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
      primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
      muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
      border: 'hsl(var(--border))',
      ring: 'hsl(var(--ring))',
    },
    borderRadius: { lg: 'var(--radius)', md: 'calc(var(--radius) - 2px)', sm: 'calc(var(--radius) - 4px)' },
  },
}
```

With this in place, `bg-primary` / `border-border` / `rounded-lg` all flow from tokens — which is exactly what lets dark mode and re-theming work without editing components.
