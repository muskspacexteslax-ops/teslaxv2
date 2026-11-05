'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Brand } from './ui'
import { useTeslaX } from '../context/TeslaXContext'

export const Footer: React.FC = () => {
  const { settings } = useTeslaX()
  const [showMail, setShowMail] = useState(false)
  const [copied, setCopied] = useState(false)

  const email = settings?.support_email || 'muskspacex.teslax@gmail.com'
  const phone = settings?.support_phone || '+1 (937) 532-5145'
  const phoneRaw = settings?.support_phone_raw || phone.replace(/[^+\d]/g, '')

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(email)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <footer className="border-t border-line bg-ink-2 py-16 text-muted text-[13px]">
      <div className="wrap">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-1">
            <Brand />
            <p className="mt-4 text-xs text-muted leading-relaxed max-w-sm">
              {settings?.motto || 'Trade the petrol car you drive today for the electric vehicle you want. Transparent valuation, zero classifieds, full title transfer.'}
            </p>

            {/* Direct Line & Hidden Mail Concierge embedded in footer */}
            <div className="mt-6 pt-5 border-t border-line/60 space-y-2.5 text-xs">
              <a
                href={`tel:${phoneRaw}`}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors font-mono"
              >
                <svg className="w-3.5 h-3.5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>{phone}</span>
              </a>

              {!showMail ? (
                <button
                  type="button"
                  onClick={() => setShowMail(true)}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="underline decoration-dotted underline-offset-4 group-hover:text-white">
                    Contact us through mail
                  </span>
                </button>
              ) : (
                <div className="flex items-center gap-2 pt-1 text-xs">
                  <a
                    href={`mailto:${email}?subject=${encodeURIComponent(settings?.site_name || 'TeslaX')}%20Concierge%20Inquiry`}
                    className="font-mono text-white hover:text-red-400 transition-colors"
                  >
                    {email}
                  </a>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="text-[10px] uppercase font-bold text-gray-400 hover:text-white px-1.5 py-0.5 rounded bg-white/10 transition-colors"
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <h5 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">Platform</h5>
            <ul className="space-y-2.5">
              <li>
                <Link href="/lineup" className="hover:text-white transition-colors">
                  Vehicle Lineup
                </Link>
              </li>
              <li>
                <Link href="/swap" className="hover:text-white transition-colors">
                  Value My Car
                </Link>
              </li>
              <li>
                <Link href="/markets" className="hover:text-white transition-colors">
                  Markets &amp; Pricing
                </Link>
              </li>
              <li>
                <Link href="/dashboard/showroom" className="hover:text-white transition-colors">
                  Swap Showroom
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">Member Portal</h5>
            <ul className="space-y-2.5">
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/swaps" className="hover:text-white transition-colors">
                  My Swaps
                </Link>
              </li>
              <li>
                <Link href="/dashboard/wallet" className="hover:text-white transition-colors">
                  Wallet &amp; Funding
                </Link>
              </li>
              <li>
                <Link href="/dashboard/portfolio" className="hover:text-white transition-colors">
                  Investment Portfolio
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">Administration</h5>
            <ul className="space-y-2.5">
              <li>
                <Link href="/admin" className="hover:text-white transition-colors">
                  Control Room
                </Link>
              </li>
              <li>
                <Link href="/admin/swaps" className="hover:text-white transition-colors">
                  Review Swaps
                </Link>
              </li>
              <li>
                <Link href="/admin/payments" className="hover:text-white transition-colors">
                  Review Payments
                </Link>
              </li>
              <li>
                <Link href="/admin/markets" className="hover:text-white transition-colors">
                  Valuation Marks
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-line/60 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-muted-2">
            &copy; {new Date().getFullYear()} {settings?.site_name || 'TeslaX'}. All rights reserved.
          </p>
          <div className="flex gap-6 text-muted-2">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Exchange</span>
            <span className="hover:text-white cursor-pointer transition-colors">Disclosures</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

