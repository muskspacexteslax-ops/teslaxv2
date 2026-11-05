'use client'

import React from 'react'
import Link from 'next/link'
import { AdminShell } from '../../components/AdminShell'
import { money, dateStr, timeAgo, SWAP_STATUS } from '../../lib/db'
import { useTeslaX } from '../../context/TeslaXContext'

export default function AdminOverviewPage() {
  const { users, swaps, payments, portfolio } = useTeslaX()

  const openSwaps = swaps.filter((x) => x.status !== 'completed' && x.status !== 'declined').length
  const pendingPayments = payments.filter((x) => x.status === 'pending').length
  const confirmedVolume = payments
    .filter((x) => x.status === 'confirmed')
    .reduce((acc, p) => acc + p.amount_cents, 0)
  const walletFloat = users.reduce((acc, u) => acc + u.balance_cents, 0)

  const recentSwaps = swaps.slice(0, 5)
  const recentPayments = payments.filter((p) => p.status === 'pending').slice(0, 4)
  const recentUsers = users.slice(0, 5)

  return (
    <AdminShell active="overview" title="Overview" sub="Platform health and operations at a glance.">
      <div className="kpi">
        {[
          ['Members', String(users.length), `${openSwaps} open swaps`],
          ['Swaps', String(swaps.length), `${pendingPayments} payments pending`],
          ['Confirmed in', money(confirmedVolume), `${money(walletFloat)} wallet float`],
          ['Invest volume', money(portfolio.value), `${portfolio.positions.length} positions`],
        ].map(([k, v, m], i) => (
          <div className="stat" key={i}>
            <div className="k">{k}</div>
            <div className="v font-mono">{v}</div>
            <div className="m font-mono text-xs">{m}</div>
          </div>
        ))}
      </div>

      <div className="admin-grid">
        <div>
          <div className="card">
            <div className="row-between" style={{ marginBottom: '14px' }}>
              <div className="eyebrow no-rule">Latest swaps</div>
              <Link className="tiny dim hover:text-white" href="/admin/swaps">
                All →
              </Link>
            </div>
            {recentSwaps.length === 0 ? (
              <p className="tiny dim">No swaps yet.</p>
            ) : (
              <div className="table-wrap" style={{ border: 0 }}>
                <table className="data">
                  <thead>
                    <tr>
                      <th>Ref</th>
                      <th>Vehicle</th>
                      <th>Into</th>
                      <th>Credit</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSwaps.map((sw) => (
                      <tr key={sw.ref}>
                        <td className="num font-mono">
                          <Link href={`/admin/swaps/${sw.ref}`} className="text-white hover:underline">
                            {sw.ref}
                          </Link>
                        </td>
                        <td>
                          {sw.year} {sw.make} {sw.model}
                        </td>
                        <td className="dim">{sw.target_name || '—'}</td>
                        <td className="num font-mono">{money(sw.offer_cents || sw.estimate_mid)}</td>
                        <td>
                          <span className="badge">{SWAP_STATUS[sw.status]?.label || sw.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card" style={{ marginTop: '14px' }}>
            <div className="row-between" style={{ marginBottom: '14px' }}>
              <div className="eyebrow no-rule">Pending payments awaiting review</div>
              <Link className="tiny dim hover:text-white" href="/admin/payments">
                All →
              </Link>
            </div>
            {recentPayments.length === 0 ? (
              <p className="tiny dim">Nothing waiting.</p>
            ) : (
              recentPayments.map((p) => (
                <div className="kv" key={p.id}>
                  <span className="k">
                    {p.full_name} · <span className="mono font-mono">{p.reference}</span>
                  </span>
                  <span className="v font-mono text-xs">
                    {money(p.amount_cents)} · {p.method} · {timeAgo(p.created_at)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <aside>
          <div className="card">
            <div className="eyebrow no-rule" style={{ marginBottom: '14px' }}>
              Newest member accounts
            </div>
            {recentUsers.map((u) => (
              <Link className="kv block text-inherit" href={`/admin/users/${u.id}`} key={u.id}>
                <span className="k">
                  {u.full_name || '—'}
                  <div className="tiny dim">{u.email}</div>
                </span>
                <span className="v tiny dim">{dateStr(u.created_at)}</span>
              </Link>
            ))}
          </div>

          <div className="card" style={{ marginTop: '14px' }}>
            <div className="eyebrow no-rule" style={{ marginBottom: '10px' }}>
              Quick actions
            </div>
            <Link className="btn btn-quiet btn-sm btn-block" href="/admin/payments">
              Review payments
            </Link>
            <Link className="btn btn-quiet btn-sm btn-block" href="/admin/swaps" style={{ marginTop: '8px' }}>
              Value new swaps
            </Link>
            <Link className="btn btn-quiet btn-sm btn-block" href="/admin/comms" style={{ marginTop: '8px' }}>
              Publish announcement
            </Link>
          </div>
        </aside>
      </div>
    </AdminShell>
  )
}

