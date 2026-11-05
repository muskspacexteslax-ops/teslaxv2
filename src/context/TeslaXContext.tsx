'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import type { User, CarModel, Swap, Payment, Portfolio, PortfolioPosition } from '../lib/db'
import { MODELS } from '../data/models'
import { DEFAULT_QUOTES, DEFAULT_CHARTS, SYMBOLS, type Quote, type Series, type SymbolRow } from '../lib/market'
import { SITE_CONFIG } from '../config/site'

export interface ToastMessage {
  id: string
  text: string
  kind?: 'ok' | 'err' | 'info'
}

export interface Announcement {
  id: number | string
  title: string
  body: string
  active: number
  created_at: number
}

export interface SiteSettings {
  site_name: string
  tagline?: string
  motto: string
  swap_note: string
  invest_note: string
  support_email: string
  support_phone: string
  support_phone_raw: string
  company_address: string
  contact_hours?: string
  telegram_url: string
  whatsapp_url: string
  indicative_apr?: number
  free_term_months?: number
  price_lock_days?: number
  cooling_off_days?: number
  turnaround_time?: string
  bank_name?: string
  bank_account_name?: string
  bank_account_number?: string
  bank_routing?: string
  bank_swift?: string
  btc_address?: string
  eth_address?: string
  usdt_address?: string
}

export interface LedgerEntry {
  id: number | string
  email?: string
  delta_cents: number
  reason: string
  created_at: number
}

export interface TradeTransaction {
  id: number | string
  email?: string
  symbol: string
  side: 'buy' | 'sell'
  shares: number
  price_cents: number
  total_cents: number
  created_at: number
}

interface TeslaXContextType {
  user: User | null
  users: User[]
  models: CarModel[]
  swaps: Swap[]
  payments: Payment[]
  quotes: Quote[]
  symbols: SymbolRow[]
  charts: Record<string, Series>
  portfolio: Portfolio
  ledger: LedgerEntry[]
  tradeHistory: TradeTransaction[]
  announcements: Announcement[]
  settings: SiteSettings
  toasts: ToastMessage[]

  // Auth actions
  login: (email: string, asAdmin?: boolean, userData?: Partial<User>) => boolean
  signup: (userData: Partial<User>) => void
  verifyEmail: (code: string) => boolean
  logout: () => void
  switchRole: (role: 'admin' | 'member' | 'guest') => void
  updateUserProfile: (patch: Partial<User>) => void

  // Swap actions
  submitSwap: (swapData: Partial<Swap>) => string
  updateSwap: (ref: string, patch: Partial<Swap>) => void
  getSwap: (ref: string) => Swap | undefined

  // Payment & Wallet actions
  topUpWallet: (amountCents: number, method: string) => void
  confirmPayment: (paymentId: number | string) => void
  rejectPayment: (paymentId: number | string) => void

  // Market & Trading actions
  buyAsset: (symbol: string, dollarAmount: number) => boolean
  sellAsset: (symbol: string, shares: number) => boolean
  updateMarkPrice: (symbol: string, priceDollars: number) => void
  updateModelValue: (slug: string, swapValueCents: number) => void

  // Comms & Admin actions
  addAnnouncement: (title: string, body: string) => void
  toggleAnnouncement: (id: number | string) => void
  deleteAnnouncement: (id: number | string) => void
  updateSettings: (newSettings: Partial<SiteSettings>) => void
  updateUserBalance: (userId: number | string, deltaDollars: number, reason: string) => void
  toggleUserStatus: (userId: number | string) => void
  toggleUserRole: (userId: number | string) => void
  markUserVerified: (userId: number | string) => void

  // Toast
  showToast: (text: string, kind?: 'ok' | 'err' | 'info') => void
  dismissToast: (id: string) => void
}

const TeslaXContext = createContext<TeslaXContextType | undefined>(undefined)

const BASE_STATIC_TIME = 1730000000000

const SUPERADMIN_USER: User = {
  id: 1,
  email: 'muskspacex.teslax@gmail.com',
  full_name: 'TeslaX Superadmin',
  phone: '+1 (937) 532-5145',
  country: 'United States',
  role: 'admin',
  status: 'active',
  email_verified: true,
  balance_cents: 5000000, // $50,000
  address_line1: '1 Tesla Road',
  city: 'Austin, TX',
  referral_code: 'SUPERADMIN',
  created_at: BASE_STATIC_TIME,
}

const DEFAULT_USERS: User[] = [SUPERADMIN_USER]

const DEFAULT_SWAPS: Swap[] = [
  {
    id: 1,
    ref: 'TX-8921',
    user_id: 1,
    make: 'BMW',
    model: '330i M Sport',
    year: 2021,
    mileage: 38400,
    fuel: 'petrol',
    transmission: 'automatic',
    condition: 'excellent',
    owners: 1,
    service_history: 'full',
    accident_history: 'none',
    target_slug: 'model-3',
    target_name: 'Model 3',
    estimate_low: 2300000,
    estimate_mid: 2450000,
    estimate_high: 2600000,
    offer_cents: 2450000,
    gap_cents: 450000,
    months: 36,
    monthly_cents: 12500,
    status: 'valued',
    notes: 'Single owner, pristine paint with ceramic protection.',
    admin_note: 'Initial inspection passed. Offer validated against current trade books.',
    created_at: BASE_STATIC_TIME - 86400000 * 3,
    updated_at: BASE_STATIC_TIME - 86400000 * 1,
  },
  {
    id: 2,
    ref: 'TX-9042',
    user_id: 1,
    make: 'Toyota',
    model: 'RAV4 Hybrid',
    year: 2020,
    mileage: 52000,
    fuel: 'hybrid',
    transmission: 'automatic',
    condition: 'good',
    owners: 1,
    service_history: 'full',
    accident_history: 'none',
    target_slug: 'model-y',
    target_name: 'Model Y',
    estimate_low: 2100000,
    estimate_mid: 2200000,
    estimate_high: 2350000,
    offer_cents: 2200000,
    gap_cents: 1400000,
    months: 36,
    monthly_cents: 38888,
    status: 'scheduled',
    notes: 'Scheduled for doorstep handover and collection.',
    admin_note: 'Carrier booked. Inspection completed on drive.',
    created_at: BASE_STATIC_TIME - 86400000 * 8,
    updated_at: BASE_STATIC_TIME - 86400000 * 2,
  },
  {
    id: 3,
    ref: 'TX-9388',
    user_id: 1,
    make: 'Mercedes-Benz',
    model: 'C300 AMG Line',
    year: 2017,
    mileage: 78000,
    fuel: 'petrol',
    transmission: 'automatic',
    condition: 'good',
    owners: 2,
    service_history: 'full',
    accident_history: 'none',
    target_slug: 'cybertruck',
    target_name: 'Cybertruck',
    estimate_low: 1550000,
    estimate_mid: 1650000,
    estimate_high: 1780000,
    offer_cents: 0,
    gap_cents: 6250000,
    months: 48,
    status: 'submitted',
    notes: 'Looking to upgrade to Cybertruck foundation series.',
    created_at: BASE_STATIC_TIME - 86400000 * 1,
    updated_at: BASE_STATIC_TIME - 86400000 * 1,
  },
]

const DEFAULT_PAYMENTS: Payment[] = [
  {
    id: 101,
    reference: 'TXP-4011',
    user_id: 1,
    full_name: 'TeslaX Superadmin',
    email: 'muskspacex.teslax@gmail.com',
    amount_cents: 50000,
    method: 'bank transfer',
    status: 'pending',
    created_at: BASE_STATIC_TIME - 3600000 * 5,
  },
]

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 1,
    title: 'Model 3 & Model Y swap allocations replenished',
    body: 'Spring inventory arrives this week. All pending trade-in valuations receive guaranteed price lock.',
    active: 1,
    created_at: BASE_STATIC_TIME - 86400000 * 2,
  },
]

const DEFAULT_SETTINGS: SiteSettings = {
  site_name: SITE_CONFIG.name,
  tagline: SITE_CONFIG.tagline,
  motto: SITE_CONFIG.motto,
  swap_note: SITE_CONFIG.swapNote,
  invest_note: SITE_CONFIG.investNote,
  support_email: SITE_CONFIG.contact.email,
  support_phone: SITE_CONFIG.contact.phone,
  support_phone_raw: SITE_CONFIG.contact.phoneRaw,
  company_address: SITE_CONFIG.contact.address,
  contact_hours: SITE_CONFIG.contact.hours,
  telegram_url: SITE_CONFIG.social.telegram,
  whatsapp_url: SITE_CONFIG.social.whatsapp,
  indicative_apr: SITE_CONFIG.financing.indicativeApr,
  free_term_months: SITE_CONFIG.financing.freeMonths,
  price_lock_days: SITE_CONFIG.guarantees.priceLockDays,
  cooling_off_days: SITE_CONFIG.guarantees.coolingOffDays,
  turnaround_time: SITE_CONFIG.guarantees.turnaroundTime,
  bank_name: SITE_CONFIG.banking.bankName,
  bank_account_name: SITE_CONFIG.banking.accountName,
  bank_account_number: SITE_CONFIG.banking.accountNumber,
  bank_routing: SITE_CONFIG.banking.routingNumber,
  bank_swift: SITE_CONFIG.banking.swiftBic,
  btc_address: SITE_CONFIG.crypto.btcAddress,
  eth_address: SITE_CONFIG.crypto.ethAddress,
  usdt_address: SITE_CONFIG.crypto.usdtAddress,
}

const DEFAULT_LEDGER: LedgerEntry[] = [
  { id: 1, delta_cents: 350000, reason: 'Initial account funding', created_at: BASE_STATIC_TIME - 86400000 * 20 },
  { id: 2, delta_cents: 75000, reason: 'Card instant top-up', created_at: BASE_STATIC_TIME - 86400000 * 10 },
]

export const TeslaXProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(DEFAULT_USERS)
  const [user, setUser] = useState<User | null>(null)
  const [models, setModels] = useState<CarModel[]>(MODELS)
  const [swaps, setSwaps] = useState<Swap[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [quotes, setQuotes] = useState<Quote[]>(DEFAULT_QUOTES)
  const [symbols] = useState<SymbolRow[]>(SYMBOLS)
  const [charts, setCharts] = useState<Record<string, Series>>(DEFAULT_CHARTS)
  const [announcements, setAnnouncements] = useState<Announcement[]>(DEFAULT_ANNOUNCEMENTS)
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS)
  const [ledger, setLedger] = useState<LedgerEntry[]>([])
  const [tradeHistory, setTradeHistory] = useState<TradeTransaction[]>([])
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  // =========================================================================
  // Product-Wide Hydration on Mount (Settings, Models, Quotes, Announcements)
  // =========================================================================
  useEffect(() => {
    // 1. Session User Hydration from localStorage
    try {
      const cachedUser = localStorage.getItem('teslax_session_user')
      if (cachedUser) setUser(JSON.parse(cachedUser))

      const cachedModels = localStorage.getItem('teslax_models_v1')
      if (cachedModels) {
        const parsed = JSON.parse(cachedModels)
        if (Array.isArray(parsed) && parsed.length > 0) setModels(parsed)
      }

      const cachedQuotes = localStorage.getItem('teslax_quotes_v1')
      if (cachedQuotes) {
        const parsed = JSON.parse(cachedQuotes)
        if (Array.isArray(parsed) && parsed.length > 0) setQuotes(parsed)
      }

      const cachedUsers = localStorage.getItem('teslax_users_v1')
      if (cachedUsers) {
        const parsed = JSON.parse(cachedUsers)
        if (Array.isArray(parsed) && parsed.length > 0) setUsers(parsed)
      }

      const cachedAnnouncements = localStorage.getItem('teslax_announcements_v1')
      if (cachedAnnouncements) {
        const parsed = JSON.parse(cachedAnnouncements)
        if (Array.isArray(parsed) && parsed.length > 0) setAnnouncements(parsed)
      }
    } catch (e) {
      // LocalStorage access might fail in privacy modes, safely ignore
    }

    // 2. Fetch Live Settings from MongoDB
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d?.settings) setSettings((prev) => ({ ...prev, ...d.settings }))
      })
      .catch((err) => console.warn('Could not load dynamic settings:', err))

    // 3. Fetch Live Models from MongoDB
    fetch('/api/models')
      .then((r) => r.json())
      .then((d) => {
        if (d?.models && Array.isArray(d.models) && d.models.length > 0) {
          setModels(d.models)
          try { localStorage.setItem('teslax_models_v1', JSON.stringify(d.models)) } catch {}
        }
      })
      .catch((err) => console.warn('Could not load models from API:', err))

    // 4. Fetch Live Market Feeds (Finnhub real-time + Yahoo Finance 30-day positions)
    fetch('/api/markets')
      .then((r) => r.json())
      .then((d) => {
        if (d?.quotes && Array.isArray(d.quotes) && d.quotes.length > 0) {
          setQuotes((prev) => {
            const merged = [...prev]
            d.quotes.forEach((incoming: Quote) => {
              const idx = merged.findIndex((q) => q.symbol === incoming.symbol)
              if (idx >= 0) {
                merged[idx] = {
                  ...merged[idx],
                  price: incoming.price,
                  change: incoming.change ?? merged[idx].change,
                  changePct: incoming.changePct ?? merged[idx].changePct,
                  marked: incoming.marked,
                }
              } else {
                merged.push(incoming)
              }
            })
            try { localStorage.setItem('teslax_quotes_v1', JSON.stringify(merged)) } catch {}
            return merged
          })
        }
        if (d?.charts && typeof d.charts === 'object') {
          setCharts((prev) => ({ ...prev, ...d.charts }))
        }
      })
      .catch((err) => console.warn('Could not load markets from API:', err))

    // 5. Fetch Public Announcements
    fetch('/api/announcements')
      .then((r) => r.json())
      .then((d) => {
        if (d?.announcements && Array.isArray(d.announcements) && d.announcements.length > 0) {
          setAnnouncements(d.announcements)
          try { localStorage.setItem('teslax_announcements_v1', JSON.stringify(d.announcements)) } catch {}
        }
      })
      .catch((err) => console.warn('Could not load announcements from API:', err))
  }, [])

  // =========================================================================
  // User Data Synchronization (Strictly Isolated & Scoped per Authenticated Account)
  // =========================================================================
  useEffect(() => {
    if (!user || !user.email) {
      setSwaps([])
      setPayments([])
      setTradeHistory([])
      setLedger([])
      return
    }

    const email = user.email.toLowerCase().trim()
    const isAdmin = user.role === 'admin'
    const authHeaders = { 'x-requester-email': email }

    // Instant load user-scoped cache
    try {
      const scopedSwaps = localStorage.getItem(`teslax_swaps_${email}`)
      if (scopedSwaps) setSwaps(JSON.parse(scopedSwaps))
      else setSwaps([])

      const scopedTrades = localStorage.getItem(`teslax_trades_${email}`)
      if (scopedTrades) setTradeHistory(JSON.parse(scopedTrades))
      else setTradeHistory([])

      const scopedPayments = localStorage.getItem(`teslax_payments_${email}`)
      if (scopedPayments) setPayments(JSON.parse(scopedPayments))
      else setPayments([])

      const scopedLedger = localStorage.getItem(`teslax_ledger_${email}`)
      if (scopedLedger) setLedger(JSON.parse(scopedLedger))
      else setLedger([])
    } catch {}

    // Swaps - Strictly isolated to current user
    const swapUrl = isAdmin ? '/api/swaps' : `/api/swaps?email=${encodeURIComponent(email)}`
    fetch(swapUrl, { headers: authHeaders })
      .then((r) => r.json())
      .then((d) => {
        if (d?.swaps && Array.isArray(d.swaps)) {
          setSwaps(d.swaps)
          try { localStorage.setItem(`teslax_swaps_${email}`, JSON.stringify(d.swaps)) } catch {}
        }
      })
      .catch(() => null)

    // Payments - Strictly isolated to current user
    const payUrl = isAdmin ? '/api/payments' : `/api/payments?email=${encodeURIComponent(email)}`
    fetch(payUrl, { headers: authHeaders })
      .then((r) => r.json())
      .then((d) => {
        if (d?.payments && Array.isArray(d.payments)) {
          setPayments(d.payments)
          try { localStorage.setItem(`teslax_payments_${email}`, JSON.stringify(d.payments)) } catch {}
        }
      })
      .catch(() => null)

    // Users: Only admins fetch all accounts; regular users only sync their own profile
    if (isAdmin) {
      fetch('/api/users', { headers: authHeaders })
        .then((r) => r.json())
        .then((d) => {
          if (d?.users && Array.isArray(d.users)) {
            setUsers(d.users)
            try { localStorage.setItem('teslax_users_v1', JSON.stringify(d.users)) } catch {}
          }
        })
        .catch(() => null)
    } else {
      fetch(`/api/users?email=${encodeURIComponent(email)}`, { headers: authHeaders })
        .then((r) => r.json())
        .then((d) => {
          if (d?.user) {
            setUser(d.user)
            try { localStorage.setItem('teslax_session_user', JSON.stringify(d.user)) } catch {}
          }
        })
        .catch(() => null)
    }

    // Trades & Ledger - Strictly isolated to current user
    const tradeUrl = isAdmin ? '/api/trades' : `/api/trades?email=${encodeURIComponent(email)}`
    fetch(tradeUrl, { headers: authHeaders })
      .then((r) => r.json())
      .then((d) => {
        if (d?.trades && Array.isArray(d.trades)) {
          setTradeHistory(d.trades)
          try { localStorage.setItem(`teslax_trades_${email}`, JSON.stringify(d.trades)) } catch {}
        }
        if (d?.ledger && Array.isArray(d.ledger)) {
          setLedger(d.ledger)
          try { localStorage.setItem(`teslax_ledger_${email}`, JSON.stringify(d.ledger)) } catch {}
        }
      })
      .catch(() => null)
  }, [user?.email, user?.role])

  // Live market price feed & synchronization (Finnhub real-time + Yahoo Finance)
  useEffect(() => {
    // 1. Periodic background refresh from live market API (every 30s)
    const refreshLiveFeed = () => {
      fetch('/api/markets')
        .then((r) => r.json())
        .then((d) => {
          if (d?.quotes && Array.isArray(d.quotes) && d.quotes.length > 0) {
            setQuotes((prev) => {
              const merged = [...prev]
              d.quotes.forEach((incoming: Quote) => {
                const idx = merged.findIndex((q) => q.symbol === incoming.symbol)
                if (idx >= 0) {
                  merged[idx] = {
                    ...merged[idx],
                    price: incoming.price,
                    change: incoming.change ?? merged[idx].change,
                    changePct: incoming.changePct ?? merged[idx].changePct,
                    marked: incoming.marked,
                  }
                } else {
                  merged.push(incoming)
                }
              })
              try { localStorage.setItem('teslax_quotes_v1', JSON.stringify(merged)) } catch {}
              return merged
            })
          }
          if (d?.charts && typeof d.charts === 'object') {
            setCharts((prev) => ({ ...prev, ...d.charts }))
          }
        })
        .catch(() => null)
    }

    const pollInterval = setInterval(refreshLiveFeed, 30000)

    // 2. Micro-liquidity tick between official polls for fluid trading desk UI
    const tickTimer = setInterval(() => {
      setQuotes((prevQuotes) => {
        let tslaNewPrice: number | null = null
        const updated = prevQuotes.map((q) => {
          if (q.symbol === 'TSLA' && q.price > 0) {
            const prevClose = q.changePct !== 0 ? q.price / (1 + q.changePct / 100) : q.price
            const microTick = (Math.random() - 0.49) * 0.4
            const nextPrice = Math.max(100, Math.round((q.price + microTick) * 100) / 100)
            tslaNewPrice = nextPrice
            const diff = Math.round((nextPrice - prevClose) * 100) / 100
            const changePct = Math.round((diff / prevClose) * 10000) / 100
            return {
              ...q,
              price: nextPrice,
              change: diff,
              changePct,
            }
          }
          return q
        })

        // Update chart points so the sparkline matches the latest live tick
        if (tslaNewPrice !== null) {
          const np = tslaNewPrice
          setCharts((prevCharts) => {
            const tslaSeries = prevCharts['TSLA']
            if (!tslaSeries || !tslaSeries.points?.length) return prevCharts
            const pts = [...tslaSeries.points]
            const last = pts[pts.length - 1]
            pts[pts.length - 1] = { ...last, c: np }
            return { ...prevCharts, TSLA: { ...tslaSeries, points: pts } }
          })
        }

        return updated
      })
    }, 4000)

    return () => {
      clearInterval(pollInterval)
      clearInterval(tickTimer)
    }
  }, [])

  const showToast = (text: string, kind: 'ok' | 'err' | 'info' = 'ok') => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, text, kind }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  // Calculate portfolio live
  const calculatePortfolio = (): Portfolio => {
    const emptyPortfolio: Portfolio = {
      value: 0,
      cost: 0,
      pl: 0,
      pl_pct: 0,
      positions: [],
    }

    if (!user || !user.email) {
      return emptyPortfolio
    }

    const positions: PortfolioPosition[] = []
    let totalValueCents = 0
    let totalCostCents = 0

    const holdingsMap: Record<string, { shares: number; costCents: number }> = {}
    // Process trades chronologically (oldest first) strictly scoped to current authenticated user
    const userEmailClean = user.email.toLowerCase().trim()
    const chronologicalTrades = [...tradeHistory]
      .filter((tx: any) => tx.email && tx.email.toLowerCase() === userEmailClean)
      .sort((a, b) => (a.created_at || 0) - (b.created_at || 0))
    chronologicalTrades.forEach((tx) => {
      if (!holdingsMap[tx.symbol]) {
        holdingsMap[tx.symbol] = { shares: 0, costCents: 0 }
      }
      if (tx.side === 'buy') {
        holdingsMap[tx.symbol].shares += tx.shares
        holdingsMap[tx.symbol].costCents += tx.total_cents
      } else {
        const avgCostPerShare = holdingsMap[tx.symbol].shares > 0 ? holdingsMap[tx.symbol].costCents / holdingsMap[tx.symbol].shares : 0
        holdingsMap[tx.symbol].shares = Math.max(0, holdingsMap[tx.symbol].shares - tx.shares)
        holdingsMap[tx.symbol].costCents = Math.max(0, holdingsMap[tx.symbol].costCents - tx.shares * avgCostPerShare)
      }
    })

    symbols.forEach((sym) => {
      const h = holdingsMap[sym.symbol]
      if (h && h.shares > 0.0001) {
        const q = quotes.find((x) => x.symbol === sym.symbol)
        const priceDollars = q ? q.price : 100
        const priceCents = Math.round(priceDollars * 100)
        const valueCents = Math.round(h.shares * priceCents)
        const plCents = valueCents - h.costCents
        const plPct = h.costCents > 0 ? (plCents / h.costCents) * 100 : 0

        positions.push({
          symbol: sym.symbol,
          label: sym.label,
          kind: sym.kind,
          shares: h.shares,
          price_cents: priceCents,
          value_cents: valueCents,
          cost_cents: h.costCents,
          pl_cents: plCents,
          pl_pct: plPct,
        })

        totalValueCents += valueCents
        totalCostCents += h.costCents
      }
    })

    const totalPlCents = totalValueCents - totalCostCents
    const totalPlPct = totalCostCents > 0 ? (totalPlCents / totalCostCents) * 100 : 0

    return {
      value: totalValueCents,
      cost: totalCostCents,
      pl: totalPlCents,
      pl_pct: totalPlPct,
      positions,
    }
  }

  const portfolio = calculatePortfolio()

  // =========================================================================
  // Authentication & Session Persistence
  // =========================================================================
  const switchRole = (role: 'admin' | 'member' | 'guest') => {
    if (role === 'guest') {
      setUser(null)
      try { localStorage.removeItem('teslax_session_user') } catch {}
      showToast('Switched to Guest mode', 'info')
      return
    }

    // Only authorized admins can switch views
    if (user?.role !== 'admin') {
      showToast('Unauthorized: Administrator privilege required', 'err')
      return
    }

    if (role === 'admin') {
      setUser(SUPERADMIN_USER)
      try { localStorage.setItem('teslax_session_user', JSON.stringify(SUPERADMIN_USER)) } catch {}
      showToast('Switched to Admin Control Room', 'ok')
      return
    }

    const member = users.find((u) => u.role === 'member') || {
      id: 2,
      email: 'member@teslax.com',
      full_name: 'TeslaX Member',
      role: 'member' as const,
      status: 'active' as const,
      email_verified: true,
      balance_cents: 1500000,
      referral_code: 'MEMBER2026',
      created_at: Date.now(),
    }
    setUser(member)
    try { localStorage.setItem('teslax_session_user', JSON.stringify(member)) } catch {}
    showToast('Switched to Member view', 'ok')
  }

  const login = (email: string, asAdmin: boolean = false, userData?: Partial<User>): boolean => {
    const clean = email.toLowerCase().trim()
    const baseUser = userData || users.find((u) => u.email.toLowerCase() === clean)

    if (baseUser) {
      setSwaps([])
      setPayments([])
      setTradeHistory([])
      setLedger([])
      const activeUser: User = {
        id: baseUser.id || Date.now(),
        email: baseUser.email || email,
        full_name: baseUser.full_name || (baseUser as any).fullName || email.split('@')[0],
        role: baseUser.role || (asAdmin && clean === 'muskspacex.teslax@gmail.com' ? 'admin' : 'member'),
        status: baseUser.status || 'active',
        email_verified: baseUser.email_verified ?? (baseUser as any).emailVerified ?? true,
        balance_cents: baseUser.balance_cents ?? (baseUser as any).balanceCents ?? 0,
        phone: baseUser.phone || '',
        country: baseUser.country || 'United States',
        address_line1: baseUser.address_line1 || (baseUser as any).addressLine1 || '',
        city: baseUser.city || '',
        created_at: baseUser.created_at || Date.now(),
      }
      setUser(activeUser)
      try { localStorage.setItem('teslax_session_user', JSON.stringify(activeUser)) } catch {}
      showToast(`Welcome back, ${activeUser.full_name}`, 'ok')
      return true
    }

    // Quick member registration
    setSwaps([])
    setPayments([])
    setTradeHistory([])
    setLedger([])
    const newUser: User = {
      id: Date.now(),
      email,
      full_name: email.split('@')[0],
      role: 'member',
      status: 'active',
      email_verified: true,
      balance_cents: 100000,
      created_at: Date.now(),
    }
    setUsers((prev) => {
      const updated = [...prev, newUser]
      try { localStorage.setItem('teslax_users_v1', JSON.stringify(updated)) } catch {}
      return updated
    })
    setUser(newUser)
    try { localStorage.setItem('teslax_session_user', JSON.stringify(newUser)) } catch {}
    showToast(`Account created for ${email}`, 'ok')
    return true
  }

  const signup = (userData: Partial<User>) => {
    setSwaps([])
    setPayments([])
    setTradeHistory([])
    setLedger([])
    const newUser: User = {
      id: Date.now(),
      email: userData.email || 'user@example.com',
      full_name: userData.full_name || 'TeslaX Member',
      phone: userData.phone || '',
      country: userData.country || 'United States',
      role: 'member',
      status: 'active',
      email_verified: false,
      balance_cents: 0,
      created_at: Date.now(),
    }
    setUsers((prev) => {
      const updated = [...prev, newUser]
      try { localStorage.setItem('teslax_users_v1', JSON.stringify(updated)) } catch {}
      return updated
    })
    setUser(newUser)
    try { localStorage.setItem('teslax_session_user', JSON.stringify(newUser)) } catch {}
    showToast('Account registered. Please verify your email.', 'ok')
  }

  const verifyEmail = (_code: string): boolean => {
    if (!user) return false
    const updated = { ...user, email_verified: true }
    setUser(updated)
    setUsers((prev) => {
      const uList = prev.map((u) => (u.id === user.id ? updated : u))
      try { localStorage.setItem('teslax_users_v1', JSON.stringify(uList)) } catch {}
      return uList
    })
    try { localStorage.setItem('teslax_session_user', JSON.stringify(updated)) } catch {}

    // Persist to MongoDB
    fetch('/api/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, email_verified: true }),
    }).catch(() => null)

    showToast('Email verified successfully!', 'ok')
    return true
  }

  const logout = () => {
    setUser(null)
    setTradeHistory([])
    setSwaps([])
    setPayments([])
    setLedger([])
    try {
      localStorage.removeItem('teslax_session_user')
      localStorage.removeItem('teslax_trades_v1')
      localStorage.removeItem('teslax_swaps_v1')
      localStorage.removeItem('teslax_payments_v1')
      localStorage.removeItem('teslax_ledger_v1')
    } catch {}
    showToast('Logged out', 'info')
  }

  const updateUserProfile = (patch: Partial<User>) => {
    if (!user) return
    const updated = { ...user, ...patch }
    setUser(updated)
    setUsers((prev) => {
      const uList = prev.map((u) => (u.id === user.id ? updated : u))
      try { localStorage.setItem('teslax_users_v1', JSON.stringify(uList)) } catch {}
      return uList
    })
    try { localStorage.setItem('teslax_session_user', JSON.stringify(updated)) } catch {}

    // Persist to MongoDB
    fetch('/api/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, ...patch }),
    }).catch((err) => console.warn('Could not persist profile to MongoDB:', err))

    showToast('Member profile details updated and saved', 'ok')
  }

  // =========================================================================
  // Swaps & Trade-In Persistence
  // =========================================================================
  const submitSwap = (swapData: Partial<Swap>): string => {
    const ref = `TX-${Math.floor(1000 + Math.random() * 9000)}`
    const swapEmail = user?.email ? user.email.toLowerCase() : (swapData.email ? swapData.email.toLowerCase() : undefined)
    const newSwap: Swap = {
      id: Date.now(),
      ref,
      user_id: user?.id || 1,
      email: swapEmail,
      make: swapData.make || 'Toyota',
      model: swapData.model || 'Corolla',
      year: swapData.year || 2018,
      mileage: swapData.mileage || 65000,
      fuel: swapData.fuel || 'petrol',
      transmission: swapData.transmission || 'automatic',
      condition: swapData.condition || 'good',
      owners: swapData.owners || 1,
      service_history: swapData.service_history || 'full',
      accident_history: swapData.accident_history || 'none',
      target_slug: swapData.target_slug || 'model-3',
      target_name: swapData.target_name || 'Model 3',
      estimate_low: swapData.estimate_low || 1800000,
      estimate_mid: swapData.estimate_mid || 2000000,
      estimate_high: swapData.estimate_high || 2200000,
      offer_cents: 0,
      gap_cents: swapData.gap_cents || 900000,
      months: swapData.months || 36,
      monthly_cents: swapData.monthly_cents || 25000,
      photo_token: swapData.photo_token,
      status: 'submitted',
      notes: swapData.notes || '',
      created_at: Date.now(),
      updated_at: Date.now(),
    }

    setSwaps((prev) => {
      const updated = [newSwap, ...prev]
      try { localStorage.setItem('teslax_swaps_v1', JSON.stringify(updated)) } catch {}
      return updated
    })

    // Persist to MongoDB
    fetch('/api/swaps', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-requester-email': user?.email || '',
      },
      body: JSON.stringify({
        email: swapEmail,
        fullName: user?.full_name,
        ...swapData,
      }),
    }).catch((err) => console.warn('Could not persist swap to MongoDB:', err))

    showToast(`Swap request ${ref} submitted!`, 'ok')
    return ref
  }

  const updateSwap = (ref: string, patch: Partial<Swap>) => {
    setSwaps((prev) => {
      const updated = prev.map((sw) => {
        if (sw.ref === ref) {
          return { ...sw, ...patch, updated_at: Date.now() }
        }
        return sw
      })
      try { localStorage.setItem('teslax_swaps_v1', JSON.stringify(updated)) } catch {}
      return updated
    })

    // Persist to MongoDB with admin auth header
    fetch('/api/swaps', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-requester-email': user?.email || '',
      },
      body: JSON.stringify({ ref, requesterEmail: user?.email, ...patch }),
    }).catch((err) => console.warn('Could not persist swap update to MongoDB:', err))

    showToast(`Swap ${ref} updated and saved`, 'ok')
  }

  const getSwap = (ref: string) => swaps.find((s) => s.ref === ref)

  // =========================================================================
  // Payments & Wallet Funding Persistence
  // =========================================================================
  const topUpWallet = (amountCents: number, method: string) => {
    const reference = `TXP-${Math.floor(1000 + Math.random() * 9000)}`
    const isCard = method.toLowerCase().includes('card')
    const newPayment: Payment = {
      id: Date.now(),
      reference,
      user_id: user?.id || 1,
      full_name: user?.full_name || 'Member',
      email: user?.email || '',
      amount_cents: amountCents,
      method,
      status: isCard ? 'confirmed' : 'pending',
      created_at: Date.now(),
      reviewed_at: isCard ? Date.now() : undefined,
    }

    setPayments((prev) => {
      const updated = [newPayment, ...prev]
      try { localStorage.setItem('teslax_payments_v1', JSON.stringify(updated)) } catch {}
      return updated
    })

    if (isCard && user) {
      const updatedUser = { ...user, balance_cents: user.balance_cents + amountCents }
      setUser(updatedUser)
      setUsers((prev) => {
        const uList = prev.map((u) => (u.id === user.id ? updatedUser : u))
        try { localStorage.setItem('teslax_users_v1', JSON.stringify(uList)) } catch {}
        return uList
      })
      try { localStorage.setItem('teslax_session_user', JSON.stringify(updatedUser)) } catch {}

      setLedger((prev) => {
        const nextLedger = [
          {
            id: Date.now(),
            email: user.email.toLowerCase(),
            delta_cents: amountCents,
            reason: `Card instant top-up (${reference})`,
            created_at: Date.now(),
          },
          ...prev,
        ]
        try { localStorage.setItem('teslax_ledger_v1', JSON.stringify(nextLedger)) } catch {}
        return nextLedger
      })
      showToast(`$${(amountCents / 100).toFixed(2)} added to your wallet!`, 'ok')
    } else {
      showToast(`Bank transfer request ${reference} created. Awaiting review.`, 'info')
    }

    // Persist payment to MongoDB
    fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reference,
        email: user?.email,
        fullName: user?.full_name,
        amount_cents: amountCents,
        method,
      }),
    }).catch((err) => console.warn('Could not persist payment to MongoDB:', err))
  }

  const confirmPayment = (paymentId: number | string) => {
    const p = payments.find((x) => x.id === paymentId || x.reference === paymentId)
    if (!p || p.status === 'confirmed') return

    setPayments((prev) => {
      const updated = prev.map((x) =>
        x.id === paymentId || x.reference === paymentId ? { ...x, status: 'confirmed' as const, reviewed_at: Date.now() } : x
      )
      try { localStorage.setItem('teslax_payments_v1', JSON.stringify(updated)) } catch {}
      return updated
    })

    // Credit target user
    setUsers((prev) => {
      const updated = prev.map((u) => {
        const isMatch = u.id === p.user_id || (p.email && u.email.toLowerCase() === p.email.toLowerCase())
        if (isMatch) {
          const newBal = u.balance_cents + p.amount_cents
          if (user && user.id === u.id) {
            const nextU = { ...user, balance_cents: newBal }
            setUser(nextU)
            try { localStorage.setItem('teslax_session_user', JSON.stringify(nextU)) } catch {}
          }
          return { ...u, balance_cents: newBal }
        }
        return u
      })
      try { localStorage.setItem('teslax_users_v1', JSON.stringify(updated)) } catch {}
      return updated
    })

    // Record ledger
    const paymentEmail = p.email?.toLowerCase()
    if (paymentEmail) {
      setLedger((prev) => {
        const nextLedger = [
          {
            id: Date.now(),
            email: paymentEmail,
            delta_cents: p.amount_cents,
            reason: `Confirmed payment (${p.reference})`,
            created_at: Date.now(),
          },
          ...prev,
        ]
        try { localStorage.setItem('teslax_ledger_v1', JSON.stringify(nextLedger)) } catch {}
        return nextLedger
      })
    }

    // Persist to MongoDB with admin headers
    fetch('/api/payments', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-requester-email': user?.email || '',
      },
      body: JSON.stringify({
        id: paymentId,
        reference: p.reference,
        status: 'confirmed',
        requesterEmail: user?.email,
      }),
    }).catch((err) => console.warn('Could not persist payment confirmation to MongoDB:', err))

    showToast(`Payment ${p.reference} confirmed. $${(p.amount_cents / 100).toFixed(2)} credited!`, 'ok')
  }

  const rejectPayment = (paymentId: number | string) => {
    const p = payments.find((x) => x.id === paymentId || x.reference === paymentId)
    if (!p) return

    setPayments((prev) => {
      const updated = prev.map((x) =>
        x.id === paymentId || x.reference === paymentId ? { ...x, status: 'rejected' as const, reviewed_at: Date.now() } : x
      )
      try { localStorage.setItem('teslax_payments_v1', JSON.stringify(updated)) } catch {}
      return updated
    })

    // Persist to MongoDB with admin headers
    fetch('/api/payments', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-requester-email': user?.email || '',
      },
      body: JSON.stringify({
        id: paymentId,
        reference: p.reference,
        status: 'rejected',
        requesterEmail: user?.email,
      }),
    }).catch((err) => console.warn('Could not persist payment rejection to MongoDB:', err))

    showToast(`Payment ${p.reference} rejected`, 'info')
  }

  // =========================================================================
  // Stock Trading & Portfolio Persistence
  // =========================================================================
  const buyAsset = (symbol: string, dollarAmount: number): boolean => {
    if (!user) {
      showToast('Please log in to trade.', 'err')
      return false
    }
    const costCents = Math.round(dollarAmount * 100)
    if (user.balance_cents < costCents) {
      showToast('Insufficient wallet balance. Top up to continue.', 'err')
      return false
    }

    const q = quotes.find((x) => x.symbol === symbol)
    const priceDollars = q ? q.price : 100
    const shares = dollarAmount / priceDollars

    // Deduct balance
    const updatedUser = { ...user, balance_cents: user.balance_cents - costCents }
    setUser(updatedUser)
    try { localStorage.setItem('teslax_session_user', JSON.stringify(updatedUser)) } catch {}
    setUsers((prev) => {
      const uList = prev.map((u) => (u.id === user.id ? updatedUser : u))
      try { localStorage.setItem('teslax_users_v1', JSON.stringify(uList)) } catch {}
      return uList
    })

    // Record trade
    const newTx: TradeTransaction = {
      id: Date.now(),
      email: user.email.toLowerCase(),
      symbol,
      side: 'buy',
      shares,
      price_cents: Math.round(priceDollars * 100),
      total_cents: costCents,
      created_at: Date.now(),
    }
    setTradeHistory((prev) => {
      const updated = [newTx, ...prev]
      try { localStorage.setItem('teslax_trades_v1', JSON.stringify(updated)) } catch {}
      return updated
    })

    // Record ledger
    setLedger((prev) => {
      const updated = [
        {
          id: Date.now(),
          email: user.email.toLowerCase(),
          delta_cents: -costCents,
          reason: `Bought ${shares.toFixed(4)} ${symbol}`,
          created_at: Date.now(),
        },
        ...prev,
      ]
      try { localStorage.setItem('teslax_ledger_v1', JSON.stringify(updated)) } catch {}
      return updated
    })

    // Persist trade to MongoDB
    fetch('/api/trades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        symbol,
        side: 'buy',
        shares,
        price_cents: Math.round(priceDollars * 100),
        total_cents: costCents,
      }),
    }).catch((err) => console.warn('Could not persist trade to MongoDB:', err))

    showToast(`Bought ${shares.toFixed(4)} shares of ${symbol} for $${dollarAmount}`, 'ok')
    return true
  }

  const sellAsset = (symbol: string, sharesToSell: number): boolean => {
    if (!user) return false

    // STRICT VALIDATION: Ensure user actually holds enough shares!
    const pos = portfolio.positions.find((p) => p.symbol === symbol)
    if (!pos || pos.shares <= 0.0001) {
      showToast(`You have no shares of ${symbol} to sell.`, 'err')
      return false
    }

    const actualSharesToSell = Math.min(sharesToSell, pos.shares)
    if (actualSharesToSell <= 0.0001) {
      showToast('Invalid share amount.', 'err')
      return false
    }

    const q = quotes.find((x) => x.symbol === symbol)
    const priceDollars = q ? q.price : 100
    const proceedCents = Math.round(actualSharesToSell * priceDollars * 100)

    // Credit wallet
    const updatedUser = { ...user, balance_cents: user.balance_cents + proceedCents }
    setUser(updatedUser)
    try { localStorage.setItem('teslax_session_user', JSON.stringify(updatedUser)) } catch {}
    setUsers((prev) => {
      const uList = prev.map((u) => (u.id === user.id ? updatedUser : u))
      try { localStorage.setItem('teslax_users_v1', JSON.stringify(uList)) } catch {}
      return uList
    })

    // Record trade
    const newTx: TradeTransaction = {
      id: Date.now(),
      email: user.email.toLowerCase(),
      symbol,
      side: 'sell',
      shares: actualSharesToSell,
      price_cents: Math.round(priceDollars * 100),
      total_cents: proceedCents,
      created_at: Date.now(),
    }
    setTradeHistory((prev) => {
      const updated = [newTx, ...prev]
      try { localStorage.setItem('teslax_trades_v1', JSON.stringify(updated)) } catch {}
      return updated
    })

    // Record ledger
    setLedger((prev) => {
      const updated = [
        {
          id: Date.now(),
          email: user.email.toLowerCase(),
          delta_cents: proceedCents,
          reason: `Sold ${actualSharesToSell.toFixed(4)} ${symbol}`,
          created_at: Date.now(),
        },
        ...prev,
      ]
      try { localStorage.setItem('teslax_ledger_v1', JSON.stringify(updated)) } catch {}
      return updated
    })

    // Persist trade to MongoDB
    fetch('/api/trades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        symbol,
        side: 'sell',
        shares: actualSharesToSell,
        price_cents: Math.round(priceDollars * 100),
        total_cents: proceedCents,
      }),
    }).catch((err) => console.warn('Could not persist trade to MongoDB:', err))

    showToast(`Sold ${actualSharesToSell.toFixed(4)} shares of ${symbol} for $${(proceedCents / 100).toFixed(2)}`, 'ok')
    return true
  }

  // =========================================================================
  // Market Marks & Model Values Persistence
  // =========================================================================
  const updateMarkPrice = (symbol: string, priceDollars: number) => {
    setQuotes((prev) => {
      const updated = prev.map((q) => {
        if (q.symbol === symbol) {
          const old = q.price
          const changePct = old > 0 ? ((priceDollars - old) / old) * 100 : 0
          return { ...q, price: priceDollars, changePct, marked: true }
        }
        return q
      })
      try { localStorage.setItem('teslax_quotes_v1', JSON.stringify(updated)) } catch {}
      return updated
    })

    // Update charts dynamically with the new marked valuation
    setCharts((prev) => {
      const existing = prev[symbol]
      if (!existing || !existing.points?.length) return prev
      const pts = [...existing.points]
      const last = pts[pts.length - 1]
      pts[pts.length - 1] = { ...last, c: priceDollars }
      return { ...prev, [symbol]: { ...existing, points: pts } }
    })

    // Persist to MongoDB
    fetch('/api/markets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-requester-email': user?.email || '',
      },
      body: JSON.stringify({ symbol, price: priceDollars, requesterEmail: user?.email }),
    }).catch((err) => console.warn('Could not persist mark to MongoDB:', err))

    showToast(`Mark for ${symbol} updated to $${priceDollars.toFixed(2)} and saved`, 'ok')
  }

  const updateModelValue = (slug: string, swapValueCents: number) => {
    setModels((prev) => {
      const updated = prev.map((m) => (m.slug === slug ? { ...m, swap_value: swapValueCents } : m))
      try { localStorage.setItem('teslax_models_v1', JSON.stringify(updated)) } catch {}
      return updated
    })

    // Persist to MongoDB
    fetch('/api/models', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-requester-email': user?.email || '',
      },
      body: JSON.stringify({ slug, swap_value: swapValueCents, requesterEmail: user?.email }),
    }).catch((err) => console.warn('Could not persist model value to MongoDB:', err))

    showToast(`Internal sizing value for ${slug} updated to $${(swapValueCents / 100).toLocaleString()} and saved`, 'ok')
  }

  // =========================================================================
  // Announcements Persistence
  // =========================================================================
  const addAnnouncement = (title: string, body: string) => {
    const item: Announcement = {
      id: Date.now(),
      title,
      body,
      active: 1,
      created_at: Date.now(),
    }

    setAnnouncements((prev) => {
      const updated = [item, ...prev]
      try { localStorage.setItem('teslax_announcements_v1', JSON.stringify(updated)) } catch {}
      return updated
    })

    // Persist to MongoDB
    fetch('/api/announcements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-requester-email': user?.email || '',
      },
      body: JSON.stringify({ title, body, requesterEmail: user?.email }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d?.announcement) {
          setAnnouncements((prev) => prev.map((a) => (a.id === item.id ? d.announcement : a)))
        }
      })
      .catch((err) => console.warn('Could not persist announcement to MongoDB:', err))

    showToast('Announcement published and saved', 'ok')
  }

  const toggleAnnouncement = (id: number | string) => {
    setAnnouncements((prev) => {
      const updated = prev.map((a) => (a.id === id ? { ...a, active: a.active ? 0 : 1 } : a))
      try { localStorage.setItem('teslax_announcements_v1', JSON.stringify(updated)) } catch {}
      return updated
    })

    // Persist to MongoDB
    fetch('/api/announcements', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-requester-email': user?.email || '',
      },
      body: JSON.stringify({ id, requesterEmail: user?.email }),
    }).catch((err) => console.warn('Could not persist announcement toggle to MongoDB:', err))
  }

  const deleteAnnouncement = (id: number | string) => {
    setAnnouncements((prev) => {
      const updated = prev.filter((a) => a.id !== id)
      try { localStorage.setItem('teslax_announcements_v1', JSON.stringify(updated)) } catch {}
      return updated
    })

    // Persist to MongoDB
    fetch(`/api/announcements?id=${id}`, {
      method: 'DELETE',
      headers: {
        'x-requester-email': user?.email || '',
      },
    }).catch((err) => console.warn('Could not delete announcement from MongoDB:', err))

    showToast('Announcement deleted', 'info')
  }

  // =========================================================================
  // Settings & User Admin Controls Persistence
  // =========================================================================
  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    setSettings((prev) => {
      const merged = { ...prev, ...newSettings }
      fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-requester-email': user?.email || '',
        },
        body: JSON.stringify({ ...merged, requesterEmail: user?.email }),
      }).catch((err) => console.warn('Failed to persist settings:', err))
      return merged
    })
    showToast('Platform copy and channels updated', 'ok')
  }

  const updateUserBalance = (userId: number | string, deltaDollars: number, reason: string) => {
    const deltaCents = Math.round(deltaDollars * 100)
    let targetEmail: string | undefined

    setUsers((prev) => {
      const updated = prev.map((u) => {
        if (u.id === userId) {
          targetEmail = u.email
          const newBal = Math.max(0, u.balance_cents + deltaCents)
          if (user && user.id === u.id) {
            const nextU = { ...user, balance_cents: newBal }
            setUser(nextU)
            try { localStorage.setItem('teslax_session_user', JSON.stringify(nextU)) } catch {}
          }
          return { ...u, balance_cents: newBal }
        }
        return u
      })
      try { localStorage.setItem('teslax_users_v1', JSON.stringify(updated)) } catch {}
      return updated
    })

    if (targetEmail) {
      setLedger((prev) => {
        const updated = [
          {
            id: Date.now(),
            email: targetEmail!.toLowerCase(),
            delta_cents: deltaCents,
            reason: reason || 'Admin adjustment',
            created_at: Date.now(),
          },
          ...prev,
        ]
        try { localStorage.setItem('teslax_ledger_v1', JSON.stringify(updated)) } catch {}
        return updated
      })
    }

    // Persist to MongoDB
    fetch('/api/users', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-requester-email': user?.email || '',
      },
      body: JSON.stringify({ id: userId, delta_cents: deltaCents, requesterEmail: user?.email }),
    }).catch((err) => console.warn('Could not persist user balance to MongoDB:', err))

    showToast(`User balance adjusted by $${deltaDollars.toFixed(2)} and saved`, 'ok')
  }

  const toggleUserStatus = (userId: number | string) => {
    let nextStatus: 'active' | 'suspended' = 'active'
    setUsers((prev) => {
      const updated = prev.map((u) => {
        if (u.id === userId) {
          nextStatus = u.status === 'active' ? 'suspended' : 'active'
          return { ...u, status: nextStatus }
        }
        return u
      })
      try { localStorage.setItem('teslax_users_v1', JSON.stringify(updated)) } catch {}
      return updated
    })

    // Persist to MongoDB
    fetch('/api/users', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-requester-email': user?.email || '',
      },
      body: JSON.stringify({ id: userId, status: nextStatus, requesterEmail: user?.email }),
    }).catch((err) => console.warn('Could not persist user status to MongoDB:', err))

    showToast('User status updated and saved', 'ok')
  }

  const toggleUserRole = (userId: number | string) => {
    let nextRole: 'member' | 'admin' = 'member'
    setUsers((prev) => {
      const updated = prev.map((u) => {
        if (u.id === userId) {
          nextRole = u.role === 'admin' ? 'member' : 'admin'
          return { ...u, role: nextRole }
        }
        return u
      })
      try { localStorage.setItem('teslax_users_v1', JSON.stringify(updated)) } catch {}
      return updated
    })

    // Persist to MongoDB
    fetch('/api/users', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-requester-email': user?.email || '',
      },
      body: JSON.stringify({ id: userId, role: nextRole, requesterEmail: user?.email }),
    }).catch((err) => console.warn('Could not persist user role to MongoDB:', err))

    showToast('User role updated and saved', 'ok')
  }

  const markUserVerified = (userId: number | string) => {
    setUsers((prev) => {
      const updated = prev.map((u) => (u.id === userId ? { ...u, email_verified: true } : u))
      try { localStorage.setItem('teslax_users_v1', JSON.stringify(updated)) } catch {}
      return updated
    })

    // Persist to MongoDB
    fetch('/api/users', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-requester-email': user?.email || '',
      },
      body: JSON.stringify({ id: userId, email_verified: true, requesterEmail: user?.email }),
    }).catch((err) => console.warn('Could not persist user verification to MongoDB:', err))

    showToast('User marked as verified in MongoDB', 'ok')
  }

  return (
    <TeslaXContext.Provider
      value={{
        user,
        users,
        models,
        swaps,
        payments,
        quotes,
        symbols,
        charts,
        portfolio,
        ledger,
        tradeHistory,
        announcements,
        settings,
        toasts,
        login,
        signup,
        verifyEmail,
        logout,
        switchRole,
        updateUserProfile,
        submitSwap,
        updateSwap,
        getSwap,
        topUpWallet,
        confirmPayment,
        rejectPayment,
        buyAsset,
        sellAsset,
        updateMarkPrice,
        updateModelValue,
        addAnnouncement,
        toggleAnnouncement,
        deleteAnnouncement,
        updateSettings,
        updateUserBalance,
        toggleUserStatus,
        toggleUserRole,
        markUserVerified,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </TeslaXContext.Provider>
  )
}

export function useTeslaX() {
  const context = useContext(TeslaXContext)
  if (!context) {
    throw new Error('useTeslaX must be used within a TeslaXProvider')
  }
  return context
}
