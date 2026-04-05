export const CATEGORIES = [
  { slug: 'utilities',     label: 'Utilities',       emoji: '🔌' },
  { slug: 'food',          label: 'Food & Staples',  emoji: '🛒' },
  { slug: 'regional',      label: 'Regional',        emoji: '🌍' },
  { slug: 'housing',       label: 'Housing',         emoji: '🏠' },
  { slug: 'rail',          label: 'Rail of Doom',    emoji: '🚆' },
  { slug: 'technology',    label: 'Technology',      emoji: '💻' },
  { slug: 'society',       label: 'Life & Society',  emoji: '🎓' },
  { slug: 'big-and-stupid', label: 'Big & Stupid',   emoji: '✈️' },
]

export const SUPERMARKET_LABELS = {
  sainsburys:       "Sainsbury's",
  tesco:            'Tesco',
  asda:             'Asda',
  morrisons:        'Morrisons',
  waitrose:         'Waitrose',
  coop:             'Co-op',
  iceland:          'Iceland',
  ocado:            'Ocado',
  national_average: 'National Average',
}

// Why: Co-op gets a permanent parenthetical — see copy & tone guide
export const SUPERMARKET_ASIDE = {
  coop:      '(of course it is)',
  morrisons: '(ew)',
  waitrose:  '',
  ocado:     '',
}
