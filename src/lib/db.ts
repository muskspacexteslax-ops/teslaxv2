export interface User {
  id: number | string
  email: string
  full_name: string
  phone?: string
  country?: string
  role: 'user' | 'member' | 'admin'
  status: 'active' | 'suspended' | 'unverified'
  email_verified: boolean
  balance_cents: number
  address_line1?: string
  city?: string
  referral_code?: string
  created_at: number
  updated_at?: number
}

export interface CarModel {
  id?: number | string
  slug: string
  name: string
  era: string
  body: 'sedan' | 'suv' | 'truck' | 'roadster' | 'semi'
  bodyLabel?: string
  tagline: string
  blurb: string
  swap_value: number // in cents e.g. 4900000 ($49,000)
  list_price: number // in cents e.g. 8999000 ($89,990)
  specs_json?: string
  specs?: { label: string; value: string }[]
  color: string
  photo?: string
  badge?: string
}

export interface Swap {
  id: number | string
  ref: string
  user_id: number | string
  email?: string
  make: string
  model: string
  year: number | string
  mileage: number | string
  fuel: string
  transmission: string
  condition: string
  owners?: number | string
  service_history?: string
  accident_history?: string
  target_slug?: string
  target_name?: string
  estimate_low: number
  estimate_mid: number
  estimate_high: number
  offer_cents?: number
  gap_cents?: number
  months?: number
  monthly_cents?: number
  photo_token?: string
  status: 'draft' | 'submitted' | 'valued' | 'accepted' | 'scheduled' | 'in_transit' | 'completed' | 'declined'
  notes?: string
  admin_note?: string
  created_at: number
  updated_at: number
}

export interface SwapEvent {
  id: number
  swap_id: number | string
  kind: string
  note: string
  created_at: number
}

export interface Payment {
  id: number
  reference: string
  user_id: number | string
  full_name?: string
  email?: string
  swap_id?: number | string
  amount_cents: number
  method: string
  status: 'pending' | 'confirmed' | 'rejected' | 'failed'
  created_at: number
  reviewed_at?: number
}

export interface Holding {
  id: number
  user_id: number | string
  symbol: string
  shares: number
  cost_basis_cents: number
  created_at: number
}

export interface PortfolioPosition {
  symbol: string
  label: string
  kind: 'public' | 'private'
  shares: number
  price_cents: number
  value_cents: number
  cost_cents: number
  pl_cents: number
  pl_pct: number
}

export interface Portfolio {
  value: number // in cents
  cost: number  // in cents
  pl: number    // in cents
  pl_pct: number
  positions: PortfolioPosition[]
}

export const SWAP_STATUS: Record<string, { label: string; tone: string }> = {
  draft: { label: 'Draft', tone: '' },
  submitted: { label: 'Submitted', tone: 'warn' },
  valued: { label: 'Valued', tone: 'ok' },
  accepted: { label: 'Accepted', tone: 'ok' },
  scheduled: { label: 'Scheduled', tone: 'ok' },
  in_transit: { label: 'In transit', tone: 'ok' },
  completed: { label: 'Completed', tone: 'ok' },
  declined: { label: 'Declined', tone: 'err' },
}

export const SWAP_FLOW = ['submitted', 'valued', 'accepted', 'scheduled', 'completed']

export function money(cents: number | undefined | null): string {
  if (cents === null || cents === undefined || isNaN(cents)) return '$0'
  const dollars = cents / 100
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(dollars)
}

export function moneyExact(cents: number | undefined | null): string {
  if (cents === null || cents === undefined || isNaN(cents)) return '$0.00'
  const dollars = cents / 100
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars)
}

export function dateStr(date: number | string | Date | undefined | null): string {
  if (!date) return '—'
  const d = typeof date === 'number' || typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function dateTimeStr(date: number | string | Date | undefined | null): string {
  if (!date) return '—'
  const d = typeof date === 'number' || typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function timeAgo(date: number | string | Date | undefined | null): string {
  if (!date) return '—'
  const d = typeof date === 'number' || typeof date === 'string' ? new Date(date).getTime() : date.getTime()
  const now = Date.now()
  const diffSec = Math.max(0, Math.floor((now - d) / 1000))
  if (diffSec < 60) return 'just now'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour}h ago`
  const diffDay = Math.floor(diffHour / 24)
  if (diffDay < 30) return `${diffDay}d ago`
  return dateStr(date)
}

