export interface ValuationInput {
  make: string
  model: string
  year: number | string
  mileage: number | string
  condition?: string
  fuel?: string
  transmission?: string
  owners?: number | string
  service_history?: string
  accident_history?: string
}

export interface ValuationFactor {
  label: string
  effect: string
  kind: 'pos' | 'neg' | 'neu'
}

export interface Valuation {
  low: number // in cents
  mid: number // in cents
  high: number // in cents
  factors: ValuationFactor[]
}

export function valuate(input: ValuationInput): Valuation {
  const currentYear = new Date().getFullYear()
  const yr = Number(input.year) || 2018
  const age = Math.max(0, currentYear - yr)
  const mi = Number(input.mileage) || 60000

  // Tier multiplier based on make
  const premiumMakes = ['mercedes', 'bmw', 'audi', 'porsche', 'lexus', 'land rover', 'volvo', 'jaguar']
  const midMakes = ['toyota', 'honda', 'volkswagen', 'hyundai', 'kia', 'mazda', 'subaru']
  const makeLower = (input.make || '').toLowerCase().trim()

  let basePriceDollars = 35000
  let tierLabel = 'Standard manufacturer positioning'
  if (premiumMakes.some((m) => makeLower.includes(m))) {
    basePriceDollars = 58000
    tierLabel = 'Premium luxury tier'
  } else if (midMakes.some((m) => makeLower.includes(m))) {
    basePriceDollars = 32000
    tierLabel = 'High-liquidity mainstream tier'
  }

  // Age depreciation: ~10% per year, diminishing
  let val = basePriceDollars * Math.pow(0.89, age)

  // Mileage adjustment: standard is ~10,000 miles per year
  const expectedMileage = age * 10500
  const mileageDiff = mi - expectedMileage
  const mileagePctAdjust = Math.max(-0.45, Math.min(0.25, -(mileageDiff / 10000) * 0.04))
  val *= 1 + mileagePctAdjust

  // Condition multiplier
  const cond = (input.condition || 'good').toLowerCase()
  let condMult = 1.0
  let condEffect = 'Baseline market expectations'
  let condKind: 'pos' | 'neg' | 'neu' = 'neu'
  if (cond === 'excellent') {
    condMult = 1.15
    condEffect = '+15% showroom condition'
    condKind = 'pos'
  } else if (cond === 'good') {
    condMult = 1.0
    condEffect = 'Normal wear within tolerance'
    condKind = 'neu'
  } else if (cond === 'fair') {
    condMult = 0.82
    condEffect = '−18% reconditioning deduction'
    condKind = 'neg'
  } else {
    condMult = 0.65
    condEffect = '−35% major mechanical/body attention'
    condKind = 'neg'
  }
  val *= condMult

  // Service history
  const sh = (input.service_history || 'full').toLowerCase()
  let shEffect = 'Documented franchised records'
  let shKind: 'pos' | 'neg' | 'neu' = 'pos'
  if (sh === 'none') {
    val *= 0.88
    shEffect = '−12% missing maintenance log'
    shKind = 'neg'
  } else if (sh === 'partial') {
    val *= 0.95
    shEffect = '−5% partial service documentation'
    shKind = 'neg'
  }

  // Accident history
  const ah = (input.accident_history || 'none').toLowerCase()
  let ahEffect = 'Clean structural history'
  let ahKind: 'pos' | 'neg' | 'neu' = 'pos'
  if (ah === 'writeoff') {
    val *= 0.55
    ahEffect = '−45% prior insurance total loss'
    ahKind = 'neg'
  } else if (ah === 'major') {
    val *= 0.75
    ahEffect = '−25% structural repairs recorded'
    ahKind = 'neg'
  } else if (ah === 'minor') {
    val *= 0.93
    ahEffect = '−7% cosmetic panel record'
    ahKind = 'neg'
  }

  // Owners
  const owners = Number(input.owners) || 1
  let ownersEffect = `${owners} owner${owners === 1 ? '' : 's'}`
  let ownersKind: 'pos' | 'neg' | 'neu' = 'neu'
  if (owners === 1) {
    val *= 1.04
    ownersEffect = 'Single owner premium (+4%)'
    ownersKind = 'pos'
  } else if (owners >= 4) {
    val *= 0.92
    ownersEffect = `Multi-owner discount (${owners} keepers)`
    ownersKind = 'neg'
  }

  // Floor value
  const midDollars = Math.max(1500, Math.round(val / 100) * 100)
  const lowDollars = Math.round(midDollars * 0.92 / 100) * 100
  const highDollars = Math.round(midDollars * 1.08 / 100) * 100

  const factors: ValuationFactor[] = [
    {
      label: 'Market positioning',
      effect: tierLabel,
      kind: premiumMakes.some((m) => makeLower.includes(m)) ? 'pos' : 'neu',
    },
    {
      label: 'Age depreciation',
      effect: `${age} year${age === 1 ? '' : 's'} elapsed curve`,
      kind: age <= 3 ? 'pos' : age > 8 ? 'neg' : 'neu',
    },
    {
      label: 'Odometer delta',
      effect: `${Number(mi).toLocaleString('en-US')} miles (${mileageDiff > 0 ? '+' : ''}${Math.round(mileageDiff).toLocaleString('en-US')} vs norm)`,
      kind: mileagePctAdjust >= 0 ? 'pos' : 'neg',
    },
    {
      label: 'Physical condition',
      effect: condEffect,
      kind: condKind,
    },
    {
      label: 'Service pedigree',
      effect: shEffect,
      kind: shKind,
    },
    {
      label: 'Accident record',
      effect: ahEffect,
      kind: ahKind,
    },
    {
      label: 'Ownership history',
      effect: ownersEffect,
      kind: ownersKind,
    },
  ]

  return {
    low: lowDollars * 100,
    mid: midDollars * 100,
    high: highDollars * 100,
    factors,
  }
}

