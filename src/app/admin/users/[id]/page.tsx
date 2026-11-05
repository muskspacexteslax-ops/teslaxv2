'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useParams, notFound } from 'next/navigation'
import { AdminShell } from '../../../../components/AdminShell'
import { money, dateStr, dateTimeStr, SWAP_STATUS } from '../../../../lib/db'
import { useTeslaX } from '../../../../context/TeslaXContext'

export default function AdminUserDetailPage() {
  const params = useParams()
  const idStr = params?.id as string
  const {
    users,
    swaps,
    ledger,
    updateUserBalance,
    toggleUserStatus,
    toggleUserRole,
    markUserVerified,
  } = useTeslaX()

  const target = users.find(
    (u) =>
      u.id?.toString() === idStr ||
      (u as any)._id?.toString() === idStr ||
      u.email.toLowerCase() === decodeURIComponent(idStr).toLowerCase()
  )
  if (!target) return notFound()

  const userSwaps = swaps.filter((s) => s.user_id === target.id)
  const userLedger = ledger.slice(0, 10)

  const [adjustAmount, setAdjustAmount] = useState('')
  const [adjustReason, setAdjustReason] = useState('')

  const handleAdjust = (e: React.FormEvent) => {
    e.preventDefault()
    const val = parseFloat(adjustAmount)
    if (isNaN(val) || val === 0) return
    updateUserBalance(target.id, val, adjustReason || 'Admin ledger adjustment')
    setAdjustAmount('')
    setAdjustReason('')
  }

  return (
    <AdminShell
      active="users"
      title={target.full_name || target.email}
      sub={target.email}
      actions={
        <Link className="btn btn-ghost btn-sm" href="/admin/users">
          ← Accounts
        </Link>
      }
    >
      <div className="admin-grid">
        <div>
          <div className="card">
            <div className="eyebrow no-rule" style={{ marginBottom: '14px' }}>
              Member Wallet
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 300, letterSpacing: '-0.04em' }} className="font-mono">
              {money(target.balance_cents)}
            </div>
            <form onSubmit={handleAdjust} className="mini-form flex items-center gap-2" style={{ marginTop: '16px' }}>
              <input
                className="input font-mono"
                type="number"
                step="0.01"
                placeholder="Amount (+ / -)"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                required
              />
              <input
                className="input"
                placeholder="Adjustment reason"
                style={{ width: '170px' }}
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
              />
              <button className="btn btn-quiet btn-xs" type="submit">
                Adjust Balance
              </button>
            </form>
            <p className="tiny dim" style={{ marginTop: '10px' }}>
              Positive values credit the wallet; negative values debit it. Every adjustment records an immutable ledger entry.
            </p>
          </div>

          <div className="card" style={{ marginTop: '14px' }}>
            <div className="eyebrow no-rule" style={{ marginBottom: '12px' }}>
              Ledger movements
            </div>
            {userLedger.length === 0 ? (
              <p className="tiny dim">No movements.</p>
            ) : (
              userLedger.map((t) => (
                <div className="kv" key={t.id}>
                  <span className="k">
                    {t.reason}
                    <div className="tiny dim">{dateTimeStr(t.created_at)}</div>
                  </span>
                  <span
                    className="v font-mono"
                    style={{ color: t.delta_cents >= 0 ? '#6ee7b7' : '#ff9a9e' }}
                  >
                    {t.delta_cents >= 0 ? '+' : ''}
                    {money(t.delta_cents)}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="card" style={{ marginTop: '14px' }}>
            <div className="eyebrow no-rule" style={{ marginBottom: '12px' }}>
              Associated Swaps
            </div>
            {userSwaps.length === 0 ? (
              <p className="tiny dim">No swaps.</p>
            ) : (
              userSwaps.map((sw) => (
                <Link className="kv block text-inherit" href={`/admin/swaps/${sw.ref}`} key={sw.ref}>
                  <span className="k">
                    {sw.year} {sw.make} {sw.model} → {sw.target_name || '—'}
                    <div className="tiny dim mono font-mono">{sw.ref}</div>
                  </span>
                  <span className="v font-mono">
                    {money(sw.offer_cents || sw.estimate_mid)}
                    <div className="tiny dim">{SWAP_STATUS[sw.status]?.label || sw.status}</div>
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        <aside>
          <div className="card">
            <div className="eyebrow no-rule" style={{ marginBottom: '12px' }}>
              Account controls
            </div>
            <div className="kv">
              <span className="k">Role</span>
              <span className="v capitalize">{target.role}</span>
            </div>
            <div className="kv">
              <span className="k">Status</span>
              <span className="v capitalize text-emerald-400">{target.status}</span>
            </div>
            <div className="kv">
              <span className="k">Email verified</span>
              <span className="v">{target.email_verified ? 'yes' : 'no'}</span>
            </div>
            <div className="kv">
              <span className="k">Referral code</span>
              <span className="v mono font-mono">{target.referral_code || '—'}</span>
            </div>

            <div className="pill-row flex-col gap-2" style={{ marginTop: '16px' }}>
              <button
                className="btn btn-quiet btn-xs w-full text-left"
                type="button"
                onClick={() => toggleUserStatus(target.id)}
              >
                {target.status === 'active' ? 'Suspend Account' : 'Reactivate Account'}
              </button>
              {!target.email_verified && (
                <button
                  className="btn btn-quiet btn-xs w-full text-left text-emerald-400"
                  type="button"
                  onClick={() => markUserVerified(target.id)}
                >
                  Mark email verified
                </button>
              )}
              <button
                className="btn btn-quiet btn-xs w-full text-left text-red-400"
                type="button"
                onClick={() => toggleUserRole(target.id)}
              >
                {target.role === 'admin' ? 'Demote to Member' : 'Promote to Administrator'}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </AdminShell>
  )
}

