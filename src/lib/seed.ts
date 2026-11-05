import bcrypt from 'bcryptjs'
import connectToDatabase from './mongodb'
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
} from '../models'
import { MODELS } from '../data/models'
import { DEFAULT_QUOTES } from './market'

export async function seedDatabase() {
  await connectToDatabase()

  console.log('--- Starting MongoDB Pre-Launch Seeding ---')

  // 1. Seed ONLY Superadmin User (Remove default/demo logins)
  await User.deleteMany({ email: { $in: ['ada@example.com', 'marcus.vance@company.io'] } })

  let superadmin = await User.findOne({
    $or: [{ email: 'muskspacex.teslax@gmail.com' }, { email: 'admin@teslax.com' }],
  })

  if (!superadmin) {
    const passwordHash = await bcrypt.hash('teslax2026!', 10)
    superadmin = await User.create({
      email: 'muskspacex.teslax@gmail.com',
      passwordHash,
      fullName: 'TeslaX Superadmin',
      phone: '+1 (937) 532-5145',
      country: 'United States',
      role: 'admin',
      status: 'active',
      emailVerified: true,
      balanceCents: 5000000, // $50,000
      addressLine1: '1 Tesla Road',
      city: 'Austin, TX',
      referralCode: 'SUPERADMIN',
    })
    console.log('Seeded Superadmin: muskspacex.teslax@gmail.com (Role: admin)')
  }

  // 2. Seed Tesla Models
  const carCount = await CarModel.countDocuments()
  if (carCount === 0) {
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
    console.log(`Seeded ${MODELS.length} Tesla vehicle models into MongoDB`)
  }

  // 3. Seed Market Quotes
  const quoteCount = await MarketQuote.countDocuments()
  if (quoteCount === 0) {
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
    console.log(`Seeded ${DEFAULT_QUOTES.length} market quotes (TSLA, SPCX, X)`)
  }

  // 4. Seed Swaps
  const swapCount = await Swap.countDocuments()
  if (swapCount === 0 && superadmin) {
    await Swap.create({
      ref: 'TX-8921',
      userId: superadmin._id,
      make: 'BMW',
      model: '330i M Sport',
      year: 2021,
      mileage: 38400,
      fuel: 'petrol',
      transmission: 'automatic',
      condition: 'excellent',
      owners: 1,
      serviceHistory: 'full',
      accidentHistory: 'none',
      targetSlug: 'model-3',
      targetName: 'Model 3',
      estimateLow: 2300000,
      estimateMid: 2450000,
      estimateHigh: 2600000,
      offerCents: 2450000,
      gapCents: 450000,
      months: 0, // Outright settlement
      monthlyCents: 0,
      status: 'valued',
      notes: 'Single owner, pristine paint with ceramic protection. Outright settlement chosen.',
      adminNote: 'Initial inspection passed. Offer validated against current trade books.',
      events: [
        { kind: 'submitted', note: 'Swap valuation submitted by customer', createdAt: new Date(Date.now() - 86400000 * 3) },
        { kind: 'valued', note: 'Valuation offer generated and verified', createdAt: new Date(Date.now() - 86400000 * 1) },
      ],
    })

    await Swap.create({
      ref: 'TX-9042',
      userId: superadmin._id,
      make: 'Toyota',
      model: 'RAV4 Hybrid',
      year: 2020,
      mileage: 52000,
      fuel: 'hybrid',
      transmission: 'automatic',
      condition: 'good',
      owners: 1,
      serviceHistory: 'full',
      accidentHistory: 'none',
      targetSlug: 'model-y',
      targetName: 'Model Y',
      estimateLow: 2100000,
      estimateMid: 2200000,
      estimateHigh: 2350000,
      offerCents: 2200000,
      gapCents: 1400000,
      months: 36,
      monthlyCents: 38888,
      status: 'scheduled',
      notes: 'Scheduled for doorstep handover and collection.',
      adminNote: 'Carrier booked. Inspection completed on drive.',
      events: [
        { kind: 'submitted', note: 'Submitted for valuation', createdAt: new Date(Date.now() - 86400000 * 8) },
        { kind: 'accepted', note: 'Offer accepted by member', createdAt: new Date(Date.now() - 86400000 * 4) },
        { kind: 'scheduled', note: 'Carrier collection confirmed', createdAt: new Date(Date.now() - 86400000 * 2) },
      ],
    })
    console.log('Seeded initial trade-in swap applications')
  }

  // 5. Seed Payments
  const paymentCount = await Payment.countDocuments()
  if (paymentCount === 0 && superadmin) {
    await Payment.create({
      reference: 'TXP-4011',
      userId: superadmin._id,
      fullName: superadmin.fullName,
      email: superadmin.email,
      amountCents: 500000,
      method: 'bank transfer',
      status: 'confirmed',
      reviewedAt: new Date(),
    })
    console.log('Seeded initial wallet payment for superadmin')
  }

  // 6. Seed Announcements
  const announcementCount = await Announcement.countDocuments()
  if (announcementCount === 0) {
    await Announcement.create({
      title: 'Model 3 & Model Y swap allocations replenished',
      body: 'Spring inventory arrives this week. All pending trade-in valuations submitted before midnight receive guaranteed 14-day price lock.',
      active: true,
    })
    console.log('Seeded platform announcements')
  }

  // 7. Seed Settings
  const settingsCount = await SiteSetting.countDocuments()
  if (settingsCount === 0) {
    const defaultSettings = [
      { key: 'site_name', value: 'TeslaX' },
      { key: 'motto', value: 'Trade the petrol car you drive today for the electric vehicle you want. Transparent valuation, zero classifieds, full title transfer.' },
      { key: 'swap_note', value: 'No middleman, no classified negotiations. Straight valuation applied to your Tesla.' },
      { key: 'invest_note', value: 'A live Tesla feed alongside marked valuations for SpaceX and X. Positions settle instantly from your wallet balance.' },
      { key: 'support_email', value: 'muskspacex.teslax@gmail.com' },
      { key: 'support_phone', value: '+1 (937) 532-5145' },
      { key: 'support_phone_raw', value: '+19375325145' },
      { key: 'company_address', value: '1 Tesla Road, Austin, TX' },
      { key: 'telegram_url', value: 'https://t.me/teslax_desk' },
      { key: 'whatsapp_url', value: 'https://wa.me/19375325145' },
      { key: 'indicative_apr', value: '0.079' },
      { key: 'free_term_months', value: '36' },
      { key: 'price_lock_days', value: '14' },
      { key: 'cooling_off_days', value: '14' },
      { key: 'bank_name', value: 'JPMorgan Chase Bank, N.A.' },
      { key: 'bank_account_name', value: 'TeslaX Liquidity & Settlement Desk' },
      { key: 'bank_account_number', value: '883902194821' },
      { key: 'bank_routing', value: '021000021' },
      { key: 'bank_swift', value: 'CHASUS33' },
      { key: 'btc_address', value: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' },
      { key: 'eth_address', value: '0x71C83709b11caC94C10a26639d67bFff4D43F9B7' },
      { key: 'usdt_address', value: '0x71C83709b11caC94C10a26639d67bFff4D43F9B7' },
    ]
    for (const s of defaultSettings) {
      await SiteSetting.findOneAndUpdate({ key: s.key }, s, { upsert: true, new: true })
    }
    console.log('Seeded site settings')
  }

  // 8. Seed Holdings
  const holdingCount = await Holding.countDocuments()
  if (holdingCount === 0 && superadmin) {
    await Holding.create({
      userId: superadmin._id,
      symbol: 'TSLA',
      shares: 15.0,
      costBasisCents: 350000,
    })
    await Holding.create({
      userId: superadmin._id,
      symbol: 'SPCX',
      shares: 10.0,
      costBasisCents: 180000,
    })
    console.log('Seeded portfolio holdings for superadmin')
  }

  console.log('--- MongoDB Pre-Launch Seeding Complete ---')
  return { success: true, message: 'Database seeded successfully' }
}

export default seedDatabase

