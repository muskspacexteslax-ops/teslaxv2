import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { MODELS } from '../data/models'
import { DEFAULT_QUOTES } from './market'
import { SITE_CONFIG } from '../config/site'
import { getFileDb, saveFileDb } from './file-store'
import {
  User,
  CarModel,
  Swap,
  Payment,
  MarketQuote,
  Announcement,
  SiteSetting,
  LedgerEntry,
  Holding,
  TradeTransaction,
  Otp,
} from '../models'

export const DAY_ZERO_SETTINGS: Record<string, string> = {
  site_name: 'TeslaX',
  tagline: 'Trade the petrol car you drive today for the electric vehicle you want.',
  motto: 'Transparent valuation, zero classifieds, full title transfer.',
  swap_note: 'Instant trade-in sizing and direct gap financing applied directly to your new Tesla.',
  invest_note: 'A live Tesla feed alongside marked private valuations for SpaceX and X. Settle from your wallet.',
  support_email: 'muskspacex.teslax@gmail.com',
  support_phone: '+1 (937) 532-5145',
  support_phone_raw: '+19375325145',
  company_address: '1 Tesla Road, Austin, TX 78725',
  contact_hours: 'Monday – Sunday, 24/7 Concierge Desk',
  telegram_url: 'https://t.me/teslax_desk',
  whatsapp_url: 'https://wa.me/19375325145',
  indicative_apr: '0.079',
  free_term_months: '36',
  price_lock_days: '14',
  cooling_off_days: '14',
  turnaround_time: '24 hours',
  bank_name: 'JPMorgan Chase Bank, N.A.',
  bank_account_name: 'TeslaX Liquidity & Settlement Desk',
  bank_account_number: '883902194821',
  bank_routing: '021000021',
  bank_swift: 'CHASUS33',
  btc_address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  eth_address: '0x71C83709b11caC94C10a26639d67bFff4D43F9B7',
  usdt_address: '0x71C83709b11caC94C10a26639d67bFff4D43F9B7',
}

export const DAY_ZERO_ANNOUNCEMENT = {
  id: 1,
  title: 'Official TeslaX Platform Launch: Day 0',
  body: 'Model 3, Model Y, Model S, Model X, Cybertruck, and Roadster allocations are live. Trade in your petrol vehicle for guaranteed electric vehicle trade-in credits.',
  active: 1,
  created_at: Date.now(),
}

/**
 * Resets the local JSON file database (`src/data/db-store.json`) to a pristine Day 0 state.
 */
export async function resetLocalDayZero(): Promise<{ success: boolean; message: string; stats: any }> {
  const superadminHash = await bcrypt.hash('teslax2026!', 10)

  const superadmin = {
    id: 1,
    email: 'muskspacex.teslax@gmail.com',
    passwordHash: superadminHash,
    full_name: 'TeslaX Superadmin',
    phone: '+1 (937) 532-5145',
    country: 'United States',
    role: 'admin',
    status: 'active',
    email_verified: true,
    balance_cents: 0,
    address_line1: '1 Tesla Road',
    city: 'Austin, TX',
    referral_code: 'SUPERADMIN',
    created_at: Date.now(),
  }

  const cleanDb = {
    settings: { ...DAY_ZERO_SETTINGS },
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
    users: [superadmin],
    swaps: [],
    payments: [],
    trades: [],
    ledger: [],
    announcements: [DAY_ZERO_ANNOUNCEMENT],
  }

  saveFileDb(cleanDb)

  return {
    success: true,
    message: 'Local disk database reset to Day 0 state successfully.',
    stats: {
      users: cleanDb.users.length,
      models: cleanDb.models.length,
      quotes: cleanDb.quotes.length,
      swaps: cleanDb.swaps.length,
      payments: cleanDb.payments.length,
      trades: cleanDb.trades.length,
      ledger: cleanDb.ledger.length,
    },
  }
}

/**
 * Nukes and seeds the Production MongoDB Atlas database for a Day 0 launch.
 * Leaves ONLY the Superadmin user, the 10 models, the 3 market quotes, settings, and launch announcement.
 */
export async function seedProductionDayZero(prodMongoUri?: string): Promise<{ success: boolean; message: string; stats: any }> {
  const uri = prodMongoUri || process.env.PROD_MONGODB_URI || process.env.MONGODB_URI

  if (!uri || !uri.includes('mongodb')) {
    throw new Error('Valid MongoDB connection URI is required for production seeding')
  }

  console.log(`[Day 0] Connecting to production cluster for Day 0 initialization...`)
  const conn = await mongoose.connect(uri, {
    bufferCommands: false,
    serverSelectionTimeoutMS: 15000,
  })

  try {
    console.log('[Day 0] Nuking all user and transaction collections...')
    await Promise.all([
      User.deleteMany({}),
      Swap.deleteMany({}),
      Payment.deleteMany({}),
      Holding.deleteMany({}),
      TradeTransaction.deleteMany({}),
      LedgerEntry.deleteMany({}),
      Otp.deleteMany({}),
      Announcement.deleteMany({}),
      CarModel.deleteMany({}),
      MarketQuote.deleteMany({}),
      SiteSetting.deleteMany({}),
    ])

    console.log('[Day 0] Creating Superadmin account...')
    const superadminHash = await bcrypt.hash('teslax2026!', 10)
    const superadmin = await User.create({
      email: 'muskspacex.teslax@gmail.com',
      passwordHash: superadminHash,
      fullName: 'TeslaX Superadmin',
      phone: '+1 (937) 532-5145',
      country: 'United States',
      role: 'admin',
      status: 'active',
      emailVerified: true,
      balanceCents: 0,
      addressLine1: '1 Tesla Road',
      city: 'Austin, TX',
      referralCode: 'SUPERADMIN',
    })

    console.log('[Day 0] Seeding 10 vehicle models...')
    for (const m of MODELS) {
      await CarModel.create({
        slug: m.slug,
        name: m.name,
        era: m.era,
        body: m.body,
        bodyLabel: m.bodyLabel,
        tagline: m.tagline,
        blurb: m.blurb,
        swapValue: m.swap_value,
        listPrice: m.list_price,
        specs: m.specs || [],
        color: m.color,
        photo: m.photo,
        badge: m.badge,
        active: true,
      })
    }

    console.log('[Day 0] Seeding market quotes (TSLA, SPCX, X)...')
    for (const q of DEFAULT_QUOTES) {
      await MarketQuote.create({
        symbol: q.symbol,
        name: q.name || q.symbol,
        label: q.label || q.symbol,
        price: q.price,
        change: q.change || 0,
        changePct: q.changePct,
        currency: q.currency || 'USD',
        marked: q.marked || false,
      })
    }

    console.log('[Day 0] Seeding site settings...')
    for (const [key, value] of Object.entries(DAY_ZERO_SETTINGS)) {
      await SiteSetting.create({ key, value: String(value) })
    }

    console.log('[Day 0] Seeding launch announcement...')
    await Announcement.create({
      title: DAY_ZERO_ANNOUNCEMENT.title,
      body: DAY_ZERO_ANNOUNCEMENT.body,
      active: true,
    })

    const finalCounts = {
      users: await User.countDocuments(),
      models: await CarModel.countDocuments(),
      quotes: await MarketQuote.countDocuments(),
      swaps: await Swap.countDocuments(),
      payments: await Payment.countDocuments(),
      trades: await TradeTransaction.countDocuments(),
      ledger: await LedgerEntry.countDocuments(),
    }

    console.log('[Day 0] Production seeding complete:', finalCounts)

    return {
      success: true,
      message: 'Production MongoDB Atlas cluster successfully initialized for Day 0 launch.',
      stats: finalCounts,
    }
  } finally {
    // Keep connection intact if shared or disconnect if standalone
  }
}

