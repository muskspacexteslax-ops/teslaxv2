'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { AdminShell } from '../../../components/AdminShell'
import { money, dateStr } from '../../../lib/db'
import { useTeslaX } from '../../../context/TeslaXContext'

export default function AdminUsersPage() {
  const { users, swaps } = useTeslaX()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const filteredUsers = users.filter((u) => {
    if (statusFilter && u.status !== statusFilter) return false
    if (query.trim()) {
      const q = query.toLowerCase()
      const matchName = (u.full_name || '').toLowerCase().includes(q)
      const matchEmail = (u.email || '').toLowerCase().includes(q)
      const matchCode = (u.referral_code || '').toLowerCase().includes(q)
      if (!matchName && !matchEmail && !matchCode) return false
    }
    return true
  })

  return (
    <AdminShell
      active="users"
      title="Accounts"
      sub="Search members, adjust balances and manage platform permissions."
      actions={
        <div className="row" style={{ gap: '6px' }}>
          <input
            className="input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, email, code"
            style={{ height: '34px', width: '190px' }}
          />
          <select
            className="input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ height: '34px', width: '130px' }}
          >
            <option value="">Any status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="unverified">Unverified</option>
          </select>
        </div>
      }
    >
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Member</th>
              <th>Balance</th>
              <th>Swaps</th>
              <th>Verified</th>
              <th>Status</th>
              <th>Joined</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => {
              const userSwaps = swaps.filter((s) => s.user_id === u.id)
              return (
                <tr key={u.id}>
                  <td>
                    <Link href={`/admin/users/${u.id}`} className="text-white hover:underline font-medium">
                      {u.full_name || '—'}
                    </Link>
                    <div className="tiny dim">{u.email}</div>
                  </td>
                  <td className="num font-mono">{money(u.balance_cents)}</td>
                  <td className="num dim font-mono">{userSwaps.length}</td>
                  <td>
                    <span className={`badge ${u.email_verified ? 'badge-ok' : 'badge-warn'}`}>
                      {u.email_verified ? 'yes' : 'no'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.status === 'active' ? 'badge-ok' : 'badge-warn'}`}>
                      {u.status}
                    </span>
                    {u.role === 'admin' && (
                      <span className="badge badge-accent ml-1.5">admin</span>
                    )}
                  </td>
                  <td className="dim tiny">{dateStr(u.created_at)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <Link className="btn btn-quiet btn-xs" href={`/admin/users/${u.id}`}>
                      Open &amp; Edit
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </AdminShell>
  )
}

