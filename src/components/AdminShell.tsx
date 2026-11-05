'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Layout, Alert } from './ui'
import { useTeslaX } from '../context/TeslaXContext'

const TABS = [
  { href: '/admin', label: 'Overview', key: 'overview' },
  { href: '/admin/swaps', label: 'Swaps', key: 'swaps' },
  { href: '/admin/payments', label: 'Payments', key: 'payments' },
  { href: '/admin/users', label: 'Accounts', key: 'users' },
  { href: '/admin/markets', label: 'Markets', key: 'markets' },
  { href: '/admin/comms', label: 'Settings & Comms', key: 'comms' },
]

export const AdminShell: React.FC<{
  active: string
  title: string
  sub?: string
  notice?: string
  error?: string
  actions?: React.ReactNode
  children: React.ReactNode
}> = ({ active, title, sub, notice, error, actions, children }) => {
  const { user } = useTeslaX()
  const pathname = usePathname()

  if (!user || user.role !== 'admin') {
    return (
      <Layout title="Control Room · Access Restricted">
        <div className="wrap py-28 text-center max-w-md mx-auto">
          <div className="card">
            <div className="text-red-500 font-bold mb-2">Access Restricted</div>
            <h2 className="text-xl font-bold mb-2">Administrator Access Required</h2>
            <p className="text-muted text-sm mb-6">
              You must be signed in with an authorized administrator account to access the Control Room.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/login" className="btn btn-primary">
                Sign in
              </Link>
              <Link href="/" className="btn btn-ghost">
                Return home
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title={`Control · ${title}`}>
      <div className="wrap" style={{ paddingTop: '96px', paddingBottom: '70px' }}>
        <div className="row-between" style={{ alignItems: 'flex-start', marginBottom: '6px' }}>
          <div>
            <div className="eyebrow no-rule">Control room</div>
            <h1 style={{ fontSize: 'clamp(1.7rem,3vw,2.35rem)', marginTop: '10px' }}>{title}</h1>
            {sub && <p className="dim" style={{ fontSize: '13.5px', marginTop: '6px' }}>{sub}</p>}
          </div>
          {actions}
        </div>

        <div className="admin-tabs" style={{ marginTop: '24px' }}>
          {TABS.map((t) => {
            const isSelected = active === t.key || pathname === t.href
            return (
              <Link
                key={t.key}
                className={`admin-tab ${isSelected ? 'on' : ''}`}
                href={t.href}
              >
                {t.label}
              </Link>
            )
          })}
        </div>

        {notice && <Alert kind="ok" className="mb-4">{notice}</Alert>}
        {error && <Alert kind="err" className="mb-4">{error}</Alert>}
        {children}
      </div>
    </Layout>
  )
}

