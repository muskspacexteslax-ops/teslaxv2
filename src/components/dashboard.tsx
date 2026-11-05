'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { User } from '../lib/db'
import { SWAP_STATUS } from '../lib/db'
import { Layout } from './ui'
import { useTeslaX } from '../context/TeslaXContext'

const ICONS: Record<string, string> = {
  home: 'M2.5 8.8 9 3l6.5 5.8V16H2.5z',
  swap: 'M2.5 6.5h10.5M10.5 3.5l3 3-3 3M15.5 11.5H5M7.5 8.5l-3 3 3 3',
  car: 'M2.5 11.5h13M4 11.5V9l1.6-3.5h6.8L14 9v2.5M6 14h1.5M10.5 14H12',
  chart: 'M2.5 15.5V2.5M2.5 15.5h13M5.5 11l3-3.5 2.5 2 3-4',
  wallet: 'M2.5 5.5h13v9h-13zM11.5 10h3',
  pie: 'M9 2.5a6.5 6.5 0 1 0 6.5 6.5H9z M10.5 2.9A6.5 6.5 0 0 1 15.1 7.5h-4.6z',
  user: 'M9 9.5a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zM3 16c.6-3 3-4.5 6-4.5s5.4 1.5 6 4.5',
  bolt: 'M10.5 2 5 10h3.5L7.5 16 13 8h-3.5z',
  out: 'M7 3.5H3.5v11H7M12 9H6.5M12 9 9.5 6.5M12 9l-2.5 2.5',
  plus: 'M9 3.5v11M3.5 9h11',
  clock: 'M9 2.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM9 5.5V9l2.5 1.5',
}

export const Ico: React.FC<{ n: string; className?: string; class?: string }> = ({
  n,
  className,
  class: cls = 'ico',
}) => (
  <svg
    className={className || cls}
    viewBox="0 0 18 18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    width="16"
    height="16"
  >
    <path d={ICONS[n] || ICONS.home} />
  </svg>
)

export const SwapPill: React.FC<{ status: string }> = ({ status }) => {
  const st = SWAP_STATUS[status] || { label: status, tone: '' }
  const cls = st.tone === 'ok' ? 'badge-ok' : st.tone === 'warn' ? 'badge-warn' : st.tone === 'err' ? 'badge-warn text-rose-400 border-rose-500/30' : ''
  return <span className={`badge ${cls}`}>{st.label}</span>
}

const NAV_GROUPS = [
  {
    title: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: 'home', key: 'home' },
      { href: '/dashboard/swaps', label: 'My swap', icon: 'swap', key: 'swaps' },
      { href: '/dashboard/showroom', label: 'Showroom', icon: 'car', key: 'showroom' },
    ],
  },
  {
    title: 'Invest',
    items: [
      { href: '/dashboard/markets', label: 'Markets', icon: 'chart', key: 'markets' },
      { href: '/dashboard/portfolio', label: 'Portfolio', icon: 'pie', key: 'portfolio' },
    ],
  },
  {
    title: 'Account',
    items: [
      { href: '/dashboard/wallet', label: 'Wallet', icon: 'wallet', key: 'wallet' },
      { href: '/dashboard/profile', label: 'Profile', icon: 'user', key: 'profile' },
    ],
  },
]

export const DashShell: React.FC<{
  user?: User | null
  s?: Record<string, string>
  active: string
  title: string
  sub?: string
  actions?: React.ReactNode
  counts?: Record<string, number>
  children: React.ReactNode
}> = ({ active, title, sub, actions, counts = {}, children }) => {
  const { user: ctxUser, logout } = useTeslaX()
  const user = ctxUser
  const pathname = usePathname()

  if (!user) {
    return (
      <Layout title={title}>
        <div className="wrap py-28 text-center max-w-md mx-auto">
          <div className="card">
            <h2 className="text-xl font-bold mb-2">Member Sign In Required</h2>
            <p className="text-muted text-sm mb-6">
              Please sign in to access your swaps, portfolio and wallet.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/login" className="btn btn-primary">
                Sign in
              </Link>
              <Link href="/signup" className="btn btn-ghost">
                Register
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title={title}>
      <div className="app">
        <nav className="side" aria-label="Dashboard">
          <div className="side-group">
            <div className="side-group-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399' }} />
              MEMBER PORTAL
            </div>
          </div>

          {NAV_GROUPS.map((g) => (
            <div className="side-group" key={g.title}>
              <div className="side-group-title">{g.title}</div>
              {g.items.map((it) => {
                const isSelected = active === it.key || pathname === it.href
                return (
                  <Link
                    key={it.key}
                    className={`side-link ${isSelected ? 'on' : ''}`}
                    href={it.href}
                  >
                    <Ico n={it.icon} />
                    <span>{it.label}</span>
                    {counts[it.key] ? <span className="cnt">{counts[it.key]}</span> : null}
                  </Link>
                )
              })}
            </div>
          ))}

          <div className="side-group side-foot">
            {user.role === 'admin' && (
              <Link className="side-link text-red-400 hover:text-red-300" href="/admin">
                <Ico n="bolt" />
                <span>Control room</span>
              </Link>
            )}
            <button
              className="side-link text-left w-full cursor-pointer bg-transparent border-0 font-inherit"
              type="button"
              onClick={logout}
            >
              <Ico n="out" />
              <span>Log out</span>
            </button>
          </div>
        </nav>

        <div className="main-pad">
          <header className="page-head">
            <div className="row-between" style={{ alignItems: 'flex-start' }}>
              <div>
                <h1>{title}</h1>
                {sub && <p>{sub}</p>}
              </div>
              {actions}
            </div>
          </header>
          {children}
        </div>
      </div>
    </Layout>
  )
}

