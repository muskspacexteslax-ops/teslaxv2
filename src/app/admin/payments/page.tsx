'use client'

import React, { useState } from 'react'
import { AdminShell } from '../../../components/AdminShell'
import { money, dateTimeStr, dateStr } from '../../../lib/db'
import { useTeslaX } from '../../../context/TeslaXContext'

export default function AdminPaymentsPage() {
  const { payments, confirmPayment, rejectPayment } = useTeslaX()
  const [filter, setFilter] = useState('pending')

  const filtered = filter
    ? payments.filter((p) => p.status === filter)
    : payments

  return (
    <AdminShell
      active="payments"
      title="Payments"
      sub="Confirm or reject wallet top-ups. Confirming credits the member balance immediately."
      actions={
        <div className="pill-row">
          {['pending', 'confirmed', 'rejected', ''].map((st) => (
            <button
              key={st}
              className={`chip ${filter === st ? 'on' : ''}`}
              onClick={() => setFilter(st)}
              type="button"
            >
              {st ? st.charAt(0).toUpperCase() + st.slice(1) : 'All'}
            </button>
          ))}
        </div>
      }
    >
      {filtered.length === 0 ? (
        <div className="empty">
          <p className="empty-title">Nothing to review</p>
          <p className="dim" style={{ fontSize: '13.5px' }}>
            No payments match this filter.
          </p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Member</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Requested</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td className="num font-mono">{p.reference}</td>
                  <td>
                    {p.full_name || 'Member'}
                    <div className="tiny dim">{p.email || ''}</div>
                  </td>
                  <td className="num font-mono font-semibold">{money(p.amount_cents)}</td>
                  <td className="dim capitalize">{p.method}</td>
                  <td className="dim tiny">{dateTimeStr(p.created_at)}</td>
                  <td>
                    <span
                      className={`badge ${
                        p.status === 'confirmed'
                          ? 'badge-ok'
                          : p.status === 'pending'
                          ? 'badge-warn'
                          : 'badge-warn text-rose-400'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {p.status === 'pending' ? (
                      <div className="pill-row" style={{ justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          className="btn btn-quiet btn-xs text-emerald-400 hover:text-emerald-300"
                          type="button"
                          onClick={() => confirmPayment(p.id)}
                        >
                          Confirm &amp; Credit
                        </button>
                        <button
                          className="btn btn-danger btn-xs"
                          type="button"
                          onClick={() => rejectPayment(p.id)}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="tiny dim">{p.reviewed_at ? dateStr(p.reviewed_at) : '—'}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  )
}

