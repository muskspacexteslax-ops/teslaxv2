'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { AdminShell } from '../../../components/AdminShell'
import { money, dateStr, SWAP_STATUS } from '../../../lib/db'
import { useTeslaX } from '../../../context/TeslaXContext'

export default function AdminSwapsPage() {
  const { swaps, users } = useTeslaX()
  const [statusFilter, setStatusFilter] = useState<string>('')

  const filteredSwaps = statusFilter
    ? swaps.filter((s) => s.status === statusFilter)
    : swaps

  return (
    <AdminShell
      active="swaps"
      title="Swaps"
      sub="Value trade-ins, set official binding offers and advance each file."
      actions={
        <div className="pill-row">
          {['', 'submitted', 'valued', 'accepted', 'scheduled', 'completed'].map((st) => (
            <button
              key={st}
              className={`chip ${statusFilter === st ? 'on' : ''}`}
              onClick={() => setStatusFilter(st)}
              type="button"
            >
              {st ? SWAP_STATUS[st]?.label || st : 'All'}
            </button>
          ))}
        </div>
      }
    >
      {filteredSwaps.length === 0 ? (
        <div className="empty">
          <p className="empty-title">Nothing here</p>
          <p className="dim" style={{ fontSize: '13.5px' }}>
            No swaps match this filter stage.
          </p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Ref</th>
                <th>Member</th>
                <th>Trade-in</th>
                <th>Into</th>
                <th>Estimate</th>
                <th>Official Offer</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filteredSwaps.map((sw) => {
                const owner = users.find((u) => u.id === sw.user_id)
                return (
                  <tr key={sw.ref}>
                    <td className="num font-mono">
                      <Link href={`/admin/swaps/${sw.ref}`} className="text-white hover:underline">
                        {sw.ref}
                      </Link>
                      <div className="tiny dim">{dateStr(sw.created_at)}</div>
                    </td>
                    <td>
                      {owner?.full_name || 'Member'}
                      <div className="tiny dim">{owner?.email || ''}</div>
                    </td>
                    <td>
                      {sw.year} {sw.make} {sw.model}
                      <div className="tiny dim">
                        {Number(sw.mileage || 0).toLocaleString('en-US')} mi · {sw.fuel}
                      </div>
                    </td>
                    <td className="dim">{sw.target_name || '—'}</td>
                    <td className="num dim font-mono">{money(sw.estimate_mid)}</td>
                    <td className="num font-mono font-semibold text-emerald-400">
                      {sw.offer_cents ? money(sw.offer_cents) : '—'}
                    </td>
                    <td>
                      <span className="badge">{SWAP_STATUS[sw.status]?.label || sw.status}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link className="btn btn-quiet btn-xs" href={`/admin/swaps/${sw.ref}`}>
                        Open &amp; Value
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  )
}

