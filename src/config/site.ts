/**
 * Centralized Application & Platform Configuration
 * Reads from environment variables with graceful fallbacks.
 */

export const SITE_CONFIG = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || 'TeslaX',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  tagline: 'Petrol to Electric Trade-In & Investment Platform',
  motto: 'Trade the petrol car you drive today for the electric vehicle you want. Transparent valuation, zero classifieds, full title transfer.',
  description:
    'Trade the petrol car you drive today for the electric vehicle you want. Transparent valuation, zero classifieds, full title transfer.',
  investNote:
    'A live Tesla feed alongside marked valuations for SpaceX and X. Track all three, allocate from your balance, and follow performance in one portfolio.',
  swapNote:
    'No middleman, no classified negotiations. Itemised valuation applied straight to the Tesla you want.',
  contact: {
    phone: process.env.NEXT_PUBLIC_CONCIERGE_PHONE || '+1 (937) 532-5145',
    phoneRaw: (process.env.NEXT_PUBLIC_CONCIERGE_PHONE || '+1 (937) 532-5145').replace(/[^+\d]/g, ''),
    email:
      process.env.NEXT_PUBLIC_CONCIERGE_EMAIL ||
      process.env.CUSTOMER_CARE_EMAIL ||
      'muskspacex.teslax@gmail.com',
    adminEmail: process.env.ADMIN_EMAIL || 'muskspacex.teslax@gmail.com',
    address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS || '1 Tesla Road, Austin, TX',
    hours: '24/7 Concierge & Exchange Desk',
  },
  social: {
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_URL || 'https://wa.me/19375325145',
    telegram: process.env.NEXT_PUBLIC_TELEGRAM_URL || 'https://t.me/teslax_desk',
  },
  financing: {
    defaultTerm: 36,
    minTerm: 12,
    maxTerm: 60,
    indicativeApr: 0.079, // 7.9% APR for terms > freeMonths
    freeMonths: 36,
  },
  guarantees: {
    priceLockDays: 14,
    coolingOffDays: 14,
    turnaroundTime: '< 24h',
  },
  banking: {
    bankName: 'JPMorgan Chase Bank, N.A.',
    accountName: 'TeslaX Liquidity & Settlement Desk',
    accountNumber: '883902194821',
    routingNumber: '021000021',
    swiftBic: 'CHASUS33',
  },
  crypto: {
    btcAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    ethAddress: '0x71C83709b11caC94C10a26639d67bFff4D43F9B7',
    usdtAddress: '0x71C83709b11caC94C10a26639d67bFff4D43F9B7',
  },
} as const

export type SiteConfig = typeof SITE_CONFIG
export default SITE_CONFIG
