export interface Quote {
  symbol: string
  name?: string
  label?: string
  price: number // in dollars
  change?: number
  changePct: number // e.g. 0.034 for 3.4% or 3.4
  currency?: string
  marked?: boolean
}

export interface SeriesPoint {
  t: number
  c: number
}

export interface Series {
  symbol: string
  points: SeriesPoint[]
}

export interface SymbolRow {
  symbol: string
  label: string
  blurb: string
  kind: 'public' | 'private'
}

export function fmtPrice(price: number | null | undefined, currency: string = 'USD'): string {
  if (price === null || price === undefined || isNaN(price)) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}

export function fmtPct(pct: number | null | undefined): string {
  if (pct === null || pct === undefined || isNaN(pct)) return '0.00%'
  const val = Math.abs(pct) > 1 ? pct : pct * 100
  const sign = val > 0 ? '+' : ''
  return `${sign}${val.toFixed(2)}%`
}

export function seriesPath(
  points: SeriesPoint[],
  w: number = 240,
  h: number = 60,
  strokeWidth: number = 1.5
): { line: string; area: string } {
  if (!points || points.length === 0) return { line: '', area: '' }
  if (points.length === 1) {
    const y = h / 2
    return {
      line: `M 0 ${y} L ${w} ${y}`,
      area: `M 0 ${y} L ${w} ${y} L ${w} ${h} L 0 ${h} Z`,
    }
  }

  const values = points.map((p) => p.c)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max === min ? 1 : max - min

  const padTop = strokeWidth + 4
  const padBottom = strokeWidth + 4
  const plotH = Math.max(10, h - padTop - padBottom)

  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * w
    const y = padTop + (1 - (p.c - min) / range) * plotH
    return [Math.round(x * 10) / 10, Math.round(y * 10) / 10]
  })

  const lineD = coords.reduce((acc, [x, y], i) => `${acc} ${i === 0 ? 'M' : 'L'} ${x} ${y}`, '')
  const areaD = `${lineD} L ${w} ${h} L 0 ${h} Z`

  return { line: lineD.trim(), area: areaD.trim() }
}

export const SYMBOLS: SymbolRow[] = [
  {
    symbol: 'TSLA',
    label: 'Tesla, Inc.',
    blurb: 'Publicly listed common stock. Continuous live market pricing with instant settlement.',
    kind: 'public',
  },
  {
    symbol: 'SPCX',
    label: 'SpaceX (Internal Mark)',
    blurb: 'Private valuation mark based on latest primary capital rounds and secondary market volume.',
    kind: 'private',
  },
  {
    symbol: 'X',
    label: 'X Corp. (Internal Mark)',
    blurb: 'Private valuation mark tracking social infrastructure, AI compute and enterprise data index.',
    kind: 'private',
  },
]

export const STATIC_TSLA_POINTS: SeriesPoint[] = [
  { t: 1730000000000, c: 241.25 },
  { t: 1730086400000, c: 240.04 },
  { t: 1730172800000, c: 242.31 },
  { t: 1730259200000, c: 245.14 },
  { t: 1730345600000, c: 245.2 },
  { t: 1730432000000, c: 247.25 },
  { t: 1730518400000, c: 248.8 },
  { t: 1730604800000, c: 246.5 },
  { t: 1730691200000, c: 249.12 },
  { t: 1730777600000, c: 251.4 },
  { t: 1730864000000, c: 248.9 },
  { t: 1730950400000, c: 252.1 },
  { t: 1731036800000, c: 254.3 },
  { t: 1731123200000, c: 253.8 },
  { t: 1731209600000, c: 256.4 },
  { t: 1731296000000, c: 255.1 },
  { t: 1731382400000, c: 258.9 },
  { t: 1731468800000, c: 260.4 },
  { t: 1731555200000, c: 258.2 },
  { t: 1731641600000, c: 262.1 },
  { t: 1731728000000, c: 264.5 },
  { t: 1731814400000, c: 261.8 },
  { t: 1731900800000, c: 259.4 },
  { t: 1731987200000, c: 263.2 },
  { t: 1732073600000, c: 265.8 },
  { t: 1732160000000, c: 262.7 },
  { t: 1732246400000, c: 266.3 },
  { t: 1732332800000, c: 269.1 },
  { t: 1732419200000, c: 267.4 },
  { t: 1732505600000, c: 270.8 },
  { t: 1732592000000, c: 268.5 },
  { t: 1732678400000, c: 272.1 },
  { t: 1732764800000, c: 275.4 },
  { t: 1732851200000, c: 273.2 },
  { t: 1732937600000, c: 271.9 },
  { t: 1733024000000, c: 276.5 },
  { t: 1733110400000, c: 274.2 },
  { t: 1733196800000, c: 277.8 },
  { t: 1733283200000, c: 279.4 },
  { t: 1733369600000, c: 282.1 },
]

export const STATIC_SPCX_POINTS: SeriesPoint[] = [
  { t: 1730000000000, c: 180.0 },
  { t: 1730086400000, c: 180.5 },
  { t: 1730172800000, c: 181.2 },
  { t: 1730259200000, c: 181.0 },
  { t: 1730345600000, c: 182.4 },
  { t: 1730432000000, c: 182.1 },
  { t: 1730518400000, c: 183.0 },
  { t: 1730604800000, c: 183.5 },
  { t: 1730691200000, c: 184.2 },
  { t: 1730777600000, c: 184.0 },
  { t: 1730864000000, c: 185.0 },
  { t: 1730950400000, c: 185.2 },
  { t: 1731036800000, c: 185.0 },
  { t: 1731123200000, c: 185.5 },
  { t: 1731209600000, c: 185.0 },
  { t: 1731296000000, c: 185.0 },
  { t: 1731382400000, c: 185.0 },
  { t: 1731468800000, c: 185.0 },
  { t: 1731555200000, c: 185.0 },
  { t: 1731641600000, c: 185.0 },
  { t: 1731728000000, c: 185.0 },
  { t: 1731814400000, c: 185.0 },
  { t: 1731900800000, c: 185.0 },
  { t: 1731987200000, c: 185.0 },
  { t: 1732073600000, c: 185.0 },
  { t: 1732160000000, c: 185.0 },
  { t: 1732246400000, c: 185.0 },
  { t: 1732332800000, c: 185.0 },
  { t: 1732419200000, c: 185.0 },
  { t: 1732505600000, c: 185.0 },
  { t: 1732592000000, c: 185.0 },
  { t: 1732678400000, c: 185.0 },
  { t: 1732764800000, c: 185.0 },
  { t: 1732851200000, c: 185.0 },
  { t: 1732937600000, c: 185.0 },
  { t: 1733024000000, c: 185.0 },
  { t: 1733110400000, c: 185.0 },
  { t: 1733196800000, c: 185.0 },
  { t: 1733283200000, c: 185.0 },
  { t: 1733369600000, c: 185.0 },
]

export const STATIC_X_POINTS: SeriesPoint[] = [
  { t: 1730000000000, c: 45.0 },
  { t: 1730086400000, c: 44.8 },
  { t: 1730172800000, c: 44.5 },
  { t: 1730259200000, c: 44.2 },
  { t: 1730345600000, c: 44.6 },
  { t: 1730432000000, c: 44.3 },
  { t: 1730518400000, c: 44.2 },
  { t: 1730604800000, c: 44.0 },
  { t: 1730691200000, c: 44.2 },
  { t: 1730777600000, c: 44.2 },
  { t: 1730864000000, c: 44.2 },
  { t: 1730950400000, c: 44.2 },
  { t: 1731036800000, c: 44.2 },
  { t: 1731123200000, c: 44.2 },
  { t: 1731209600000, c: 44.2 },
  { t: 1731296000000, c: 44.2 },
  { t: 1731382400000, c: 44.2 },
  { t: 1731468800000, c: 44.2 },
  { t: 1731555200000, c: 44.2 },
  { t: 1731641600000, c: 44.2 },
  { t: 1731728000000, c: 44.2 },
  { t: 1731814400000, c: 44.2 },
  { t: 1731900800000, c: 44.2 },
  { t: 1731987200000, c: 44.2 },
  { t: 1732073600000, c: 44.2 },
  { t: 1732160000000, c: 44.2 },
  { t: 1732246400000, c: 44.2 },
  { t: 1732332800000, c: 44.2 },
  { t: 1732419200000, c: 44.2 },
  { t: 1732505600000, c: 44.2 },
  { t: 1732592000000, c: 44.2 },
  { t: 1732678400000, c: 44.2 },
  { t: 1732764800000, c: 44.2 },
  { t: 1732851200000, c: 44.2 },
  { t: 1732937600000, c: 44.2 },
  { t: 1733024000000, c: 44.2 },
  { t: 1733110400000, c: 44.2 },
  { t: 1733196800000, c: 44.2 },
  { t: 1733283200000, c: 44.2 },
  { t: 1733369600000, c: 44.2 },
]

export function generatePoints(
  base: number,
  volatility: number,
  count: number = 30,
  trend: number = 0.02
): SeriesPoint[] {
  const points: SeriesPoint[] = []
  let current = base
  const fixedBaseTime = 1730000000000
  const interval = 86400000

  for (let i = 0; i < count; i++) {
    const pseudo = Math.sin((i + 1) * 12.9898 + base * 78.233) * 43758.5453
    const frac = Math.abs(pseudo - Math.floor(pseudo))
    const change = (frac - 0.48 + trend) * volatility
    current = Math.max(10, current * (1 + change))
    points.push({
      t: fixedBaseTime + i * interval,
      c: Math.round(current * 100) / 100,
    })
  }
  return points
}

export const DEFAULT_CHARTS: Record<string, Series> = {
  TSLA: {
    symbol: 'TSLA',
    points: STATIC_TSLA_POINTS,
  },
  SPCX: {
    symbol: 'SPCX',
    points: STATIC_SPCX_POINTS,
  },
  X: {
    symbol: 'X',
    points: STATIC_X_POINTS,
  },
}

export const DEFAULT_QUOTES: Quote[] = [
  {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    label: 'Tesla, Inc. · NASDAQ',
    price: 248.50,
    change: 6.82,
    changePct: 2.82,
    currency: 'USD',
    marked: false,
  },
  {
    symbol: 'SPCX',
    name: 'SpaceX',
    label: 'SpaceX · Private mark',
    price: 185.00,
    change: 0.00,
    changePct: 0.00,
    currency: 'USD',
    marked: true,
  },
  {
    symbol: 'X',
    name: 'X Corp.',
    label: 'X Corp. · Private mark',
    price: 44.20,
    change: 0.00,
    changePct: 0.00,
    currency: 'USD',
    marked: true,
  },
]

