# 🐸 The Freddo Index — Design Specification

## Design Philosophy
This site must look absolutely deranged at first glance and completely immaculate on closer inspection. That contrast is not a bug — it is the entire point.

A distinguished Royal Charter typeface. Thousands of frogs. Sharp clinical panels. Meticulously sourced economic data. All in the same place. All at the same time.

It should look like someone had a breakdown, studied data journalism, got a design degree, and then decided to do something important with a chocolate frog.

### The Two Rules That Govern Everything
1. **The chaos is the background** — frogs, green, purple, unhinged
2. **The data is immaculate** — clean panels, sharp typography, serious numbers

Neither compromises the other. They make each other funnier and more credible simultaneously.

---

## Typeface

### Rufina Alt02 — The Only Font
Used everywhere. No exceptions. No secondary font. No monospace for numbers. Full commit.

Rufina Alt02 is connected to Cadbury's Royal Charter. It carries inherited authority and a touch of whimsy. Rufina Alt02 presenting aircraft carrier data in Freddos is the funniest and most correct typographic decision ever made.

```
Import: Google Fonts — Rufina (Alt02 variant)
```

### Type Scale
| Name | Size | Weight | Usage |
|---|---|---|---|
| `display` | 48px | 700 | Hero headline conversions |
| `heading-lg` | 32px | 700 | Page titles, section headers |
| `heading` | 24px | 700 | Card titles, item names |
| `subheading` | 18px | 600 | Category labels, tab titles |
| `body` | 16px | 400 | Primary content, descriptions |
| `small` | 14px | 400 | Secondary info, snide remarks |
| `label` | 12px | 600 | Tags, badges — uppercase tracked |
| `tiny` | 11px | 400 | Timestamps, data source credits |

### Rules
- Nothing below 11px — ever
- Labels and tags: uppercase, `letter-spacing: 0.1em`
- Line height: 1.6 for body, 1.2 for display and headings
- Numbers always Rufina Alt02 — no monospace exceptions
- The Freddo conversion number is always the largest element on any card

---

## Colour Palette

### Base
| Name | Hex | Usage |
|---|---|---|
| `background` | `#0F0F0F` | Behind the frog chaos |
| `panel` | `rgba(15,15,15,0.88)` | Panel and card fill — frogs bleed through |
| `panel-raised` | `rgba(25,25,25,0.92)` | Elevated surfaces, hover states |
| `border` | `#4CAF50` | All borders — sharp, no glow |
| `border-subtle` | `rgba(76,175,80,0.3)` | Subtle dividers within panels |

### Text
| Name | Hex | Usage |
|---|---|---|
| `text-primary` | `#F2F2F2` | All primary content |
| `text-secondary` | `#A0A0A0` | Labels, metadata, snide remarks |
| `text-muted` | `#555555` | Placeholders, disabled, timestamps |

### Freddo Green — Primary
| Name | Hex | Usage |
|---|---|---|
| `green` | `#4CAF50` | Primary colour — borders, CTAs, highlights |
| `green-hover` | `#45A049` | Hover state |
| `green-subtle` | `rgba(76,175,80,0.12)` | Subtle green backgrounds |
| `green-muted` | `rgba(76,175,80,0.35)` | Inactive green elements |

### Cadbury Purple — Accent
| Name | Hex | Usage |
|---|---|---|
| `purple` | `#4A1C6E` | Accent — used sparingly and purposefully |
| `purple-light` | `#6B2FA0` | Hover states on purple elements |
| `purple-subtle` | `rgba(74,28,110,0.2)` | Subtle purple backgrounds |

### Semantic
| Name | Hex | Usage |
|---|---|---|
| `positive` | `#4CAF50` | Good news data — shares green intentionally |
| `negative` | `#E05A5A` | Bad news data — rising costs |
| `neutral` | `#A0A0A0` | Unchanged or neutral data |
| `stale` | `#E8A045` | Stale data warning — amber stands out |

### The Colour Rule
Green and purple. That is it. No other colours enter this palette unless they are semantic data indicators. No blue. No teal. No anything that didn't come from a Freddo wrapper.

---

## The Frog Background

### What It Is
A tiling illustration of frogs. Chaotic. Joyful. Looks like someone's 2009 Tumblr. Thousands of frogs visible at any screen size. The background is the same on every page — frogs are a constant.

### What It Is Not
- Not a pattern — frogs have personality, expressions, context
- Not random — each frog is drawn with intention
- Not subtle — this is aggressively frog

### The Tile
A single large illustration tile that repeats. The tile contains many frogs in different poses. Enough variety that the repeat isn't immediately obvious.

### Hidden Easter Eggs
Baked into the illustration. Reward people who look closely. People will share screenshots of easter eggs they find.

**Easter eggs to include:**
- 🐸 Frog holding a sign: *"10p was a fair price"*
- 🐸 Frog in a suit, devastated, holding a mortgage rejection letter
- 🐸 Frog on a Southern Rail train — departure board shows DELAYED
- 🐸 Frog eating a Freddo *(cannibalism — noted)*
- 🐸 Mondelez villain frog — tiny top hat, twirling moustache
- 🐸 Co-op frog — smug expression, overpriced bag
- 🐸 PhD frog — graduation hat, drowning in debt papers
- 🐸 Frog with a single potato *(Northern Ireland solidarity)*
- 🐸 Frog reading a very tiny copy of the ONS annual report

**Flag frogs — not hidden:**
Two frogs rendered slightly larger and more prominently than the background chaos. Near the energy data section where the impact of the war on UK bills is directly tracked.
- Frog 1: holding Ukrainian national flag 🇺🇦
- Frog 2: holding Armed Forces of Ukraine flag
- These are visible. A quiet, permanent statement. Not a joke.

**EU frog — background level:**
Single frog, standard size, part of the chaos. Holding a small sign: *"35% cocoa solids minimum"*. Near the Dairy Milk section. A knowing joke for people paying attention.

### Technical Implementation
- Background applied to `body` — never to individual pages
- CSS `background-repeat: repeat`
- Illustration provided as SVG tile for crispness at all resolutions
- Fixed attachment — frogs don't scroll with the content. Panels scroll over them.

```css
body {
  background-image: url('/frog-tile.svg');
  background-repeat: repeat;
  background-attachment: fixed;
  background-size: 600px;
}
```

---

## Panels & Cards

### The Core Panel
The fundamental building block. Everything sits in one of these.

```
┌──────────────────────────────────────────┐  ← 1-2px #4CAF50 border
│                                          │
│   Content here                           │  ← rgba(15,15,15,0.88) fill
│                                          │     Frogs visible behind
│                                          │
└──────────────────────────────────────────┘
```

- Border: 1-2px solid `#4CAF50` — sharp, no glow, no shadow, no blur
- Background: `rgba(15,15,15,0.88)` — 88% opacity, frogs bleed through
- Border radius: 4px maximum — this is not a bubbly site
- Padding: 24px standard, 16px compact
- No box shadow
- No backdrop blur — ever

### Item Card
Displays a single basket item with its current Freddo conversion.

```
┌─────────────────────────────────────────────┐
│  ⛽  PETROL                          LIVE   │  ← emoji, label, status
│                                             │
│          3.2 Freddos                        │  ← display size, primary
│          per litre                          │  ← small, secondary
│                                             │
│  Or: one Freddo buys 0.31 litres            │  ← body, secondary
│                                             │
│  ████████████████░░░░  £1.44/litre today    │  ← subtle data bar
│                                             │
│  *At least it's not the 2022 price.*        │  ← snide remark, italic
│                                             │
│  [ See full history → ]                     │  ← ghost button
└─────────────────────────────────────────────┘
```

- Item name: 12px uppercase label, `text-secondary`
- Freddo number: 48px display, `text-primary` — always the biggest thing
- Unit: 16px body, `text-secondary`
- Vice versa conversion: 14px small, `text-secondary`
- Snide remark: 14px italic, `text-muted`
- Status badge: LIVE (green), WEEKLY (neutral), STALE (amber)

### Supermarket Comparison Card
Shows Freddo price across all supermarkets.

```
┌─────────────────────────────────────────────┐
│  🐸 NATIONAL FREDDO PRICE                   │
│                                             │
│          43p average                        │
│          Updated today                      │
│                                             │
│  Asda          38p  ████████████░░░░        │
│  Tesco         40p  █████████████░░░        │
│  Morrisons     42p  ██████████████░░  (ew)  │
│  Sainsbury's   45p  ███████████████░░       │
│  Iceland       45p  ███████████████░░       │
│  Ocado         48p  ████████████████░       │
│  Waitrose      50p  █████████████████       │
│  Co-op         60p  ████████████████████ ←villain│
│                                             │
│  *The Co-op price is not a typo.*           │
└─────────────────────────────────────────────┘
```

### Historical Chart Card
Full width within its category tab. Recharts line chart.

```
┌─────────────────────────────────────────────────────────┐
│  🏠 UK HOUSE PRICE — HISTORICAL                         │
│                                                         │
│  6,222,222 Freddos today                                │
│  Was 450,000 Freddos in 1995                            │
│                                                         │
│  [Chart — green line, purple milestone markers]         │
│                                                         │
│  ──────────────────────────────────────────────         │
│  Source: Land Registry HPI  ·  Updated monthly          │
│  *Good luck out there.*                                 │
└─────────────────────────────────────────────────────────┘
```

Chart styling:
- Line colour: `#4CAF50` Freddo green
- Milestone markers (policy changes, crises): `#4A1C6E` purple vertical lines
- Grid lines: `rgba(76,175,80,0.1)` — very subtle
- Axis labels: 11px Rufina Alt02, `text-muted`
- Tooltip: panel style — green border, dark fill
- No chart legend unless comparing two items (Heinz vs Branston etc)
- Rival items on same chart: green vs purple lines

---

## Hero Section

### Rotating Showcase
Full width. Top of Page 1. Cycles through the most shocking conversions automatically.

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ✈️                                                     │
│                                                         │
│       A Boeing 747 today costs                          │  ← heading
│                                                         │
│       888,888,888 Freddos                               │  ← display, huge
│                                                         │
│       If you're reading this you cannot afford one.     │  ← snide, italic
│       Neither can we.                                   │
│                                                         │
│  ○ ● ○ ○ ○ ○                    [ See all items → ]    │  ← dots + CTA
└─────────────────────────────────────────────────────────┘
```

- Background: panel style — green border, 88% opacity
- Freddo number: largest text on the site — 64px or above
- Auto-rotates every 5 seconds
- Pause on hover
- Dot indicators for manual navigation
- Transition: simple crossfade — no sliding, no bouncing

### Freddo Price Anchor
Permanently visible below the hero. The standard unit. Always there.

```
┌──────────────────────────────────────────────┐
│  🐸 Today's National Average Freddo Price    │
│                                              │
│              43p                             │
│                                              │
│  Asda 38p · Tesco 40p · Sainsbury's 45p      │
│  Co-op 60p (of course it is)                 │
│                                              │
│  Was 10p in 2000. A 330% increase.           │
│  The Bank of England targets 2% annually.    │
│  Just saying.                                │
└──────────────────────────────────────────────┘
```

---

## Loading Screen

### Layout
Full screen. Dark background `#0F0F0F`. Centred. Nothing else.

### The Frog
A single frog illustration. Sitting on a line chart. The line is the loading progress bar — as the page loads, the line draws itself left to right, going upward. The frog sits on the line and rides it upward getting progressively more horrified.

**Frog states (tied to loading progress):**
- 0–20%: Sitting comfortably. Little legs dangling. Tiny Freddo in hand.
- 20–40%: Mildly concerned. Freddo still present.
- 40–60%: Noticeably worried. Freddo gone. Gripping the line.
- 60–80%: Eyes wide. Both hands gripping. Line getting steep.
- 80–99%: Absolute chaos. Hanging on for dear life.
- 100%: Freeze frame. Then:

### Loading Text
Cycles beneath the frog. Rufina Alt02. 16px. `text-secondary`.

1. *Counting Freddos...*
2. *Consulting the Royal Charter...*
3. *Asking the frog...*
4. *Blaming Mondelez...*
5. *Checking if Southern Rail is delayed (it is)...*
6. *Converting aircraft carriers to chocolate...*
7. *Loading complete. Any mistakes are the frogs' fault. They don't have thumbs.* 🐸

Final line stays for 1 second then transitions to the site.

### Transition
Simple fade out. No slide. No bounce. The frogs appear.

---

## Navigation

### Top Bar
Minimal. Always visible. Dark panel.

```
┌────────────────────────────────────────────────────────────┐
│  🐸 The Freddo Index        Home  Full Index  Disclaimer   │
│     By Royal Appointment                                   │
└────────────────────────────────────────────────────────────┘
```

- Logo/title: Rufina Alt02, 20px, green
- Tagline: 12px, `text-muted`, italic
- Nav links: 14px, ghost style — `text-secondary` default, green on active/hover
- No hamburger menu on desktop — three links fit comfortably
- Mobile: collapse to hamburger, panel drops down

### Page 2 Category Tabs
Full width tab bar. Sticky below the top navigation.

```
[ 🔌 Utilities ][ 🛒 Food ][ 🌍 Regional ][ 🏠 Housing ][ 🚆 Rail ][ 💻 Tech ][ 🎓 Society ][ ✈️ Big & Stupid ]
```

- Active tab: green bottom border, `text-primary`
- Inactive tab: `text-secondary`, green bottom border on hover
- Scrollable on mobile — tabs don't wrap

---

## Buttons

| Variant | Background | Text | Border | Usage |
|---|---|---|---|---|
| Primary | `#4CAF50` | `#0F0F0F` | — | Main CTAs |
| Secondary | `rgba(15,15,15,0.88)` | `text-primary` | `#4CAF50` | Secondary actions |
| Ghost | transparent | `text-secondary` | — | See history, subtle nav |
| Purple | `#4A1C6E` | `#F2F2F2` | — | Accent actions, used sparingly |

- Border radius: 4px — sharp, not bubbly
- Padding: 10px vertical, 20px horizontal
- Font: 14px Rufina Alt02, weight 600
- Transition: 150ms ease on background and colour
- No box shadow on buttons — ever

---

## Data Indicators

### Status Badges
Small. Top right of item cards.

| Status | Colour | Label |
|---|---|---|
| Live / daily | Green | LIVE |
| Weekly | Neutral | WEEKLY |
| Monthly | Neutral | MONTHLY |
| Annually | Neutral | ANNUAL |
| Stale | Amber | STALE |

### Price Direction Indicators
Shown next to historical comparisons.

- Price up vs last period: `↑` in `negative` red
- Price down vs last period: `↓` in `positive` green
- Unchanged: `→` in `neutral` grey
- RAM and technology: directions are often reversed — always feels good

### Rival Comparison (Heinz vs Branston, Yorkshire Tea vs PG Tips)
Same chart. Two lines.
- Line 1: `#4CAF50` Freddo green
- Line 2: `#4A1C6E` Cadbury purple
- Legend below chart — minimal, just the two names
- Whoever is cheaper highlighted with a subtle label: *"Currently cheaper"*

---

## Disclaimer Page

### Layout
Centred column. Max width 720px. Generous padding. Panel style container.

### Tone
The snidest page on the internet. Legally binding. Frog thumb clause included. See copy-tone-guide.md for full text.

### Supermarket Roast Section
Each supermarket gets one line. Accurate. Deserved.

```
Sainsbury's    — reliable until they redesign the website for no reason
Tesco          — fine, but Clubcard means nothing is the real price anymore  
Asda           — surprisingly straightforward, we respect it
Morrisons      — moves products around like they're trying to lose us (ew)
Co-op          — prices updated by someone who hates you personally
Waitrose       — works perfectly, costs us emotionally every time
Iceland        — surprisingly solid, Mums everywhere vindicated
Ocado          — flawless, but we feel judged the entire time
```

### The Frog Thumb Clause
The most important paragraph. Large. Central. Rufina Alt02.

> *Any errors, inaccuracies, or miscalculations are not the fault of the development team.*
> *Frogs do not have thumbs.*
> *We did our best.*
> *🐸*

---

## Motion & Animation

### Principles
- Animations confirm actions or guide attention — never decorative
- Nothing loops without purpose
- Fast: 150ms — hover, focus states
- Medium: 250ms — state changes, card reveals
- Slow: 400ms — page transitions, hero rotation fade

### Specific Animations
| Element | Animation | Duration |
|---|---|---|
| Hero rotation | Crossfade | 400ms ease |
| Button hover | Background colour shift | 150ms ease |
| Card hover | Border brightens slightly | 150ms ease |
| Tab switch | Content fade | 200ms ease |
| Chart render | Line draws left to right | 800ms ease |
| Loading frog | Rides line upward | Tied to load progress |
| Page load | Fade in from loading screen | 300ms ease |
| Stale badge | Amber pulse — once only | 600ms |

### No Animation On
- Text content or numbers changing
- Error states — must be immediately visible
- Anything that loops without carrying live status information

---

## Responsive Behaviour

### Desktop (1280px+)
Full layout. Hero full width. Page 1 items in 2-3 column grid. Charts full width in tabs.

### Tablet (768px–1279px)
Hero full width. Items in 2 column grid. Tabs scrollable. Charts full width.

### Mobile (below 768px)
Single column everything. Hero simplified — one conversion at a time, no dots. Nav collapses to hamburger. Tabs horizontally scrollable. Charts simplified — fewer data points shown.

---

## What Not To Do
- No glassmorphism
- No gradient backgrounds or text
- No blur effects of any kind — not even subtle
- No box shadows
- No border radius above 4px on panels and cards
- No font other than Rufina Alt02
- No font below 11px
- No colours outside the defined palette
- No animations that loop without purpose
- No design decisions that make this look like a generic AI dashboard
- No hiding the frogs — the background is always there

---

## Status: Design Spec Draft — Pending Review
*Written during planning session. To be confirmed before any UI implementation begins.*
