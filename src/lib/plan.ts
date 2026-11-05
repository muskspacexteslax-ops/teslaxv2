export const PLAN_TERMS = [0, 12, 24, 36, 48, 60] // 0 = Outright payment
export const DEFAULT_TERM = 36
export const MIN_TERM = 12
export const MAX_TERM = 60

export function clampTerm(months: number): number {
  if (months === 0) return 0 // Outright payment
  if (isNaN(months) || !months) return DEFAULT_TERM
  return Math.min(MAX_TERM, Math.max(MIN_TERM, months))
}

export interface PlanOptions {
  price: number // in cents
  credit: number // in cents
  months: number
  apr?: number // optional custom APR (e.g. 0.079)
  freeMonths?: number // terms up to this are 0% APR (default 36)
}

export interface SettlementPlan {
  principal: number
  interest: number
  total: number
  monthly: number
  interestFree: boolean
  apr: number
  isOutright: boolean
}

export function computePlan({ price, credit, months, apr: customApr, freeMonths = DEFAULT_TERM }: PlanOptions): SettlementPlan {
  const m = clampTerm(months)
  const principal = Math.max(0, price - credit)

  if (m === 0) {
    return {
      principal,
      interest: 0,
      total: principal,
      monthly: 0,
      interestFree: true,
      apr: 0,
      isOutright: true,
    }
  }

  const interestFree = m <= freeMonths
  const effectiveApr = customApr !== undefined ? customApr : 0.079
  const apr = interestFree ? 0 : effectiveApr
  const interest = interestFree ? 0 : Math.round(principal * apr * (m / 12))
  const total = principal + interest
  const monthly = m > 0 ? Math.round(total / m) : 0

  return {
    principal,
    interest,
    total,
    monthly,
    interestFree,
    apr,
    isOutright: false,
  }
}
