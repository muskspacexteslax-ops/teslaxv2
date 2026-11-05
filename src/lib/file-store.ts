import fs from 'fs'
import path from 'path'
import { MODELS } from '../data/models'
import { DEFAULT_QUOTES } from './market'
import { SITE_CONFIG } from '../config/site'

const DB_FILE = path.join(process.cwd(), 'src/data/db-store.json')

export interface FileDbSchema {
  settings: Record<string, any>
  models: any[]
  quotes: any[]
  swaps: any[]
  payments: any[]
  users: any[]
  announcements: any[]
  trades: any[]
  ledger: any[]
}

const DEFAULT_SUPERADMIN = {
  id: 1,
  email: 'muskspacex.teslax@gmail.com',
  full_name: 'TeslaX Superadmin',
  phone: '+1 (937) 532-5145',
  country: 'United States',
  role: 'admin',
  status: 'active',
  email_verified: true,
  balance_cents: 250000000,
  address_line1: '1 Tesla Road',
  city: 'Austin',
  referral_code: 'SUPERADMIN',
  created_at: 1772668800000,
}

const DEFAULT_SETTINGS = {
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

function getInitialDb(): FileDbSchema {
  return {
    settings: { ...DEFAULT_SETTINGS },
    models: MODELS.map((m) => ({
      ...m,
      swap_value: m.swap_value,
      list_price: m.list_price,
    })),
    quotes: DEFAULT_QUOTES.map((q) => ({
      ...q,
      price: q.price,
      marked: Boolean(q.marked),
    })),
    swaps: [
      {
        id: 1,
        ref: 'TX-7821',
        user_id: 1,
        make: 'BMW',
        model: 'M4 Competition',
        year: 2021,
        mileage: 28400,
        fuel: 'petrol',
        transmission: 'automatic',
        condition: 'excellent',
        owners: 1,
        service_history: 'full',
        accident_history: 'none',
        target_slug: 'model-s-plaid',
        target_name: 'Model S Plaid',
        estimate_low: 4600000,
        estimate_mid: 4850000,
        estimate_high: 5100000,
        offer_cents: 4900000,
        gap_cents: 1600000,
        months: 24,
        monthly_cents: 66667,
        status: 'valued',
        notes: 'Full ceramic coating, carbon package, clean title.',
        admin_note: 'Clean CarFax verified. High trade-in demand.',
        created_at: Date.now() - 86400000 * 3,
        updated_at: Date.now() - 86400000 * 1,
      },
    ],
    payments: [
      {
        id: 101,
        reference: 'TXP-4011',
        user_id: 1,
        full_name: 'TeslaX Superadmin',
        email: 'muskspacex.teslax@gmail.com',
        amount_cents: 50000,
        method: 'bank transfer',
        status: 'pending',
        created_at: Date.now() - 3600000 * 5,
      },
    ],
    users: [DEFAULT_SUPERADMIN],
    announcements: [
      {
        id: 1,
        title: 'Model 3 & Model Y swap allocations replenished',
        body: 'Overnight delivery available across North American distribution hubs. Sizing discounts locked through month end.',
        active: 1,
        created_at: Date.now() - 86400000 * 4,
      },
    ],
    trades: [],
    ledger: [
      {
        id: 1,
        delta_cents: 250000000,
        reason: 'Initial Superadmin allocation',
        created_at: Date.now() - 86400000 * 30,
      },
    ],
  }
}

let memoryDb: FileDbSchema | null = null

export function getFileDb(): FileDbSchema {
  if (memoryDb) return memoryDb

  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8')
      const parsed = JSON.parse(raw)
      memoryDb = {
        ...getInitialDb(),
        ...parsed,
        settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
      }
      return memoryDb!
    }
  } catch (err) {
    console.warn('Failed reading db-store.json, creating initial store:', err)
  }

  const initial = getInitialDb()
  saveFileDb(initial)
  memoryDb = initial
  return memoryDb
}

export function saveFileDb(db: FileDbSchema): void {
  memoryDb = db
  try {
    const dir = path.dirname(DB_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8')
  } catch (err) {
    console.warn('Failed writing to db-store.json:', err)
  }
}

